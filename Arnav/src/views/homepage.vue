<template>
  <div class="locapp-container">
    <!-- Navbar -->
    <nav class="locapp-navbar">
      <div class="navbar-left">
        <img
          src="../assets/logo.png"
          alt="Demo Farm Logo"
          class="navbar-logo" />
        <span class="farm-name">Demo Farm</span>
      </div>
      <div class="navbar-actions">
        <button
          class="darkmode-btn"
          @click="toggleDarkMode"
          :aria-label="
            isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
          ">
          <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </button>
        <router-link to="/userinfo" class="user-profile-btn">
          <i class="fas fa-user-circle"></i>
        </router-link>
      </div>
    </nav>

    <!-- Full-screen Map -->
    <iframe
      class="locapp-map"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.1234567890123!2d121.12345678901234!3d13.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd4b0c0c0c0c0c%3A0x0c0c0c0c0c0c0c0c!2sProvincial%20Agriculture%20Center%2C%20PDF%2C%20Merit%20Victoria%2C%20Oriental%20Mindoro!5e0!3m2!1sen!2sph!4v1698192000000!5m2!1sen!2sph"
      allowfullscreen
      loading="lazy"
      aria-label="Google Map"></iframe>

    <!-- Floating Feedback Button (icon only) -->
    <router-link to="/help-center" class="feedback-btn" aria-label="Feedback">
      <i class="fas fa-comment-alt"></i>
    </router-link>

    <!-- Bottom Sheet -->
    <div
      class="locapp-sheet"
      :class="{ 'locapp-sheet-expanded': isExpanded }"
      :style="sheetStyle"
      @touchstart.stop="startDrag"
      @touchmove.stop="onDrag"
      @touchend.stop="endDrag"
      @mousedown.stop="startDrag"
      @mousemove.stop="onDrag"
      @mouseup.stop="endDrag"
      @mouseleave="endDrag">
      <!-- Handle -->
      <div class="locapp-handle-wrapper" @click.stop="toggleSheet">
        <div class="locapp-handle"></div>
      </div>

      <div class="locapp-content" @click.stop>
        <!-- Search -->
        <div class="locapp-search">
          <i class="fas fa-search locapp-search-icon"></i>
          <input
            type="text"
            class="locapp-search-input"
            placeholder="Search location"
            v-model="searchQuery"
            @focus="expandSheet" />
          <button
            class="locapp-search-clear"
            v-if="searchQuery"
            @click="clearSearch">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Categories -->
        <div class="locapp-section">
          <div class="locapp-section-header">
            <h2 class="locapp-title">Categories</h2>
            <button class="locapp-view-all">View All</button>
          </div>
          <div class="locapp-category-list">
            <button
              class="locapp-category-btn"
              v-for="category in categories"
              :key="category"
              @click="selectCategory(category)"
              :class="{ active: selectedCategory === category }">
              <i :class="['fas', 'fa-' + getCategoryIcon(category)]"></i>
              {{ category }}
            </button>
          </div>
        </div>

        <!-- Saved Places -->
        <div class="locapp-section">
          <div class="locapp-section-header">
            <h2 class="locapp-title">Saved Places</h2>
            <button class="locapp-view-all">View All</button>
          </div>
          <div
            class="locapp-place"
            v-for="place in savedPlaces"
            :key="place.id"
            @click="goToPlace(place)">
            <i class="fas fa-map-marker-alt locapp-icon"></i>
            <div class="locapp-place-text">
              <div class="locapp-place-name">{{ place.name }}</div>
              <div class="locapp-place-address">
                Lat: {{ place.latitude }}, Lng: {{ place.longitude }}
              </div>
              <div class="locapp-place-timestamp">
                {{ formatDate(place.timestamp) }}
              </div>
            </div>
          </div>
          <button class="locapp-add-btn" @click="showAddPlaceModal = true">
            <i class="fas fa-plus"></i>
            Add New Place
          </button>
        </div>
      </div>
    </div>

    <!-- Add New Place Modal -->
    <div v-if="showAddPlaceModal" class="add-place-modal">
      <div class="add-place-content">
        <h3>Add New Place</h3>
        <input
          v-model="newPlaceName"
          type="text"
          placeholder="Enter place name"
          class="add-place-input" />
        <div class="add-place-buttons">
          <button @click="saveNewPlace" class="save-place-btn">Save</button>
          <button @click="closeAddPlaceModal" class="cancel-place-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { auth } from "@/firebase/config";

// Sheet state
const sheetY = ref(0);
const isExpanded = ref(false);
const isDragging = ref(false);
const startY = ref(0);
const currentY = ref(0);
const sheetHeight = ref(0);
const minSheetHeight = ref(100); // Minimum height when collapsed
const maxSheetHeight = ref(0); // Will be set based on window height

// App state
const searchQuery = ref("");
const selectedCategory = ref(null);
const categories = ref([
  "Offices",
  "Parking",
  "Comfort Room",
  "Food",
  "Plants",
  "Animals",
]);
const savedPlaces = ref([]);

const isDarkMode = ref(false);

const showAddPlaceModal = ref(false);
const newPlaceName = ref("");

// Computed properties
const sheetStyle = computed(() => {
  if (isDragging.value) {
    return {
      transform: `translateY(${sheetY.value}px)`,
      transition: "none",
    };
  }
  return {
    transform: `translateY(${sheetY.value}px)`,
    transition: "transform 0.3s ease-out",
  };
});

// Lifecycle hooks
onMounted(async () => {
  updateSheetDimensions();
  window.addEventListener("resize", updateSheetDimensions);

  // Initialize sheet position
  sheetY.value = window.innerHeight * 0.6;

  // Fetch userAreas from Firestore
  const user = auth.currentUser;
  if (user) {
    const db = getFirestore();
    const userAreasRef = collection(db, "userAreas");
    const q = query(
      userAreasRef,
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    savedPlaces.value = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      savedPlaces.value.push({
        id: doc.id,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp?.toDate() || new Date(),
      });
    });
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", updateSheetDimensions);
});

// Methods
function updateSheetDimensions() {
  maxSheetHeight.value = window.innerHeight * 0.9;
  sheetHeight.value = window.innerHeight * 0.9;
}

function getCategoryIcon(category) {
  const icons = {
    Offices: "building",
    Parking: "parking",
    "Comfort Room": "toilet",
    Food: "utensils",
    Plants: "leaf",
    Animals: "paw",
  };
  return icons[category] || "map-marker-alt";
}

function toggleSheet() {
  isExpanded.value = !isExpanded.value;
  animateSheet();
}

function expandSheet() {
  if (!isExpanded.value) {
    isExpanded.value = true;
    animateSheet();
  }
}

function animateSheet() {
  const targetY = isExpanded.value ? 0 : window.innerHeight * 0.6;
  sheetY.value = targetY;
}

function startDrag(event) {
  if (
    event.target.closest(".locapp-content") &&
    !event.target.closest(".locapp-handle-wrapper")
  ) {
    return;
  }

  event.preventDefault();
  isDragging.value = true;
  startY.value = event.type.includes("mouse")
    ? event.clientY
    : event.touches[0].clientY;
}

function onDrag(event) {
  if (!isDragging.value) return;

  event.preventDefault();
  currentY.value = event.type.includes("mouse")
    ? event.clientY
    : event.touches[0].clientY;

  const diff = currentY.value - startY.value;

  // Calculate new position with constraints
  const newY = Math.min(
    Math.max(sheetY.value + diff, 0),
    window.innerHeight * 0.8
  );
  sheetY.value = newY;
  startY.value = currentY.value;
}

function endDrag() {
  if (!isDragging.value) return;
  isDragging.value = false;

  // Determine whether to snap to expanded or collapsed state
  const threshold = window.innerHeight * 0.3;
  isExpanded.value = sheetY.value < threshold;
  animateSheet();
}

function selectCategory(category) {
  selectedCategory.value =
    selectedCategory.value === category ? null : category;
}

function clearSearch() {
  searchQuery.value = "";
}

// Prompt for area name and save the area
async function addNewPlace() {
  // Prompt for area name
  const areaName = prompt("Enter a name for this place:");
  if (!areaName || !areaName.trim()) {
    alert("Please enter a name for this place.");
    return;
  }

  // Get current user
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to save a place.");
    return;
  }

  // Get current location
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Save to Firestore
      try {
        const db = getFirestore();
        const areaData = {
          userId: user.uid,
          userName: user.email || "User",
          name: areaName,
          latitude,
          longitude,
          timestamp: new Date(),
        };
        await addDoc(collection(db, "userAreas"), areaData);
        alert("Place saved successfully!");
        // Reload saved places
        await loadSavedPlaces();
      } catch (error) {
        alert("Error saving place: " + error.message);
      }
    },
    (error) => {
      alert("Error getting location: " + error.message);
    }
  );
}

// Helper to reload saved places
async function loadSavedPlaces() {
  const user = auth.currentUser;
  if (user) {
    const db = getFirestore();
    const userAreasRef = collection(db, "userAreas");
    const q = query(
      userAreasRef,
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    savedPlaces.value = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      savedPlaces.value.push({
        id: doc.id,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp?.toDate() || new Date(),
      });
    });
  }
}

function goToPlace(place) {
  // Implementation for navigating to place
  console.log("Going to place:", place.name);
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function closeAddPlaceModal() {
  showAddPlaceModal.value = false;
  newPlaceName.value = "";
}

async function saveNewPlace() {
  if (!newPlaceName.value.trim()) {
    alert("Please enter a name for this place.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to save a place.");
    return;
  }

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {
        const db = getFirestore();
        const areaData = {
          userId: user.uid,
          userName: user.email || "User",
          name: newPlaceName.value,
          latitude,
          longitude,
          timestamp: new Date(),
        };
        await addDoc(collection(db, "userAreas"), areaData);
        alert("Place saved successfully!");
        closeAddPlaceModal();
        await loadSavedPlaces();
      } catch (error) {
        alert("Error saving place: " + error.message);
      }
    },
    (error) => {
      alert("Error getting location: " + error.message);
    }
  );
}
</script>

<style scoped>
@import "@/assets/allstyle.css";

/* Additional styles for smooth sheet behavior */
.locapp-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 90vh; /* Set a fixed height */
  will-change: transform;
  touch-action: none;
}

.locapp-handle-wrapper {
  display: flex;
  justify-content: center;
  padding: 12px 0;
  cursor: grab;
}

.locapp-handle {
  width: 36px;
  height: 4px;
  background-color: #ddd;
  border-radius: 2px;
}

.locapp-content {
  height: calc(90vh - 30px);
  overflow-y: auto;
  padding: 0 16px 16px;
  -webkit-overflow-scrolling: touch;
}

/* Prevent content scrolling when dragging */
.locapp-sheet.dragging .locapp-content {
  pointer-events: none;
}

.darkmode-btn {
  background: none;
  border: none;
  color: #22c55e;
  font-size: 1.5rem;
  margin-left: 8px;
  cursor: pointer;
}

body.dark-mode {
  background: #18181b !important;
  color: #f3f4f6 !important;
}
body.dark-mode .locapp-navbar,
body.dark-mode .locapp-sheet {
  background: #23272f !important;
  color: #f3f4f6 !important;
}
body.dark-mode .locapp-handle {
  background: #444 !important;
}
body.dark-mode .locapp-content {
  background: #23272f !important;
  color: #f3f4f6 !important;
}

body.dark-mode .farm-name {
  color: #ffffff !important;
}

.add-place-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.add-place-content {
  background: #fff;
  padding: 24px 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 350px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
}
.add-place-input {
  width: 100%;
  padding: 10px;
  margin: 16px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
}
.add-place-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.save-place-btn,
.cancel-place-btn {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
}
.save-place-btn {
  background: #22c55e;
  color: #fff;
}
.cancel-place-btn {
  background: #eee;
  color: #333;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 12px; /* Adjust the space between buttons */
}
</style>
