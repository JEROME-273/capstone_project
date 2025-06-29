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
        <!-- Notification Bell -->
        <NotificationBell @startNavigation="handleNotificationNavigation" />
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
            placeholder="Search locations, categories, descriptions..."
            v-model="searchQuery"
            @focus="expandSheet" />

          <!-- Voice Search Button -->
          <button
            @click="toggleVoiceSearch"
            class="voice-search-btn"
            :class="{ listening: isVoiceSearchListening }"
            aria-label="Voice search">
            <span v-if="isVoiceSearchListening" class="pulse"></span>
            <i class="fas fa-microphone"></i>
          </button>

          <button
            class="locapp-search-clear"
            v-if="searchQuery"
            @click="clearSearch">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Voice Search Status -->
        <div v-if="isVoiceSearchListening" class="voice-search-status">
          <div class="voice-indicator">
            <div class="voice-animation">
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
            </div>
            <span class="voice-text"
              >Listening... {{ voiceSearchTranscript }}</span
            >
          </div>
        </div>

        <!-- Search Results -->
        <div
          v-if="searchQuery && searchResults.length > 0"
          class="locapp-section">
          <div class="locapp-section-header">
            <h2 class="locapp-title">Search Results</h2>
            <span class="search-count">{{ searchResults.length }} found</span>
          </div>
          <div class="locapp-locations-grid">
            <div
              class="locapp-location-card"
              v-for="location in searchResults"
              :key="location.id"
              @click="goToLocation(location)">
              <div class="location-image">
                <img
                  :src="
                    location.imageUrl || '/placeholder.svg?height=80&width=80'
                  "
                  :alt="location.name"
                  class="location-img" />
                <button
                  @click.stop="showLocationDetails(location)"
                  class="location-info-btn-image"
                  aria-label="View location details">
                  <i class="fas fa-info-circle"></i>
                </button>
              </div>
              <div class="location-info">
                <h3 class="location-name">{{ location.name }}</h3>
                <p class="location-description">{{ location.description }}</p>
                <div class="location-coordinates">
                  <i class="fas fa-map-marker-alt"></i>
                  <span
                    >{{ location.coordinates.x.toFixed(4) }},
                    {{ location.coordinates.y.toFixed(4) }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Search Results -->
        <div
          v-if="searchQuery && searchResults.length === 0"
          class="locapp-section">
          <div class="empty-search-state">
            <i class="fas fa-search"></i>
            <h3>No locations found</h3>
            <p>Try searching with different keywords or check the spelling</p>
            <button @click="clearSearch" class="clear-search-btn">
              <i class="fas fa-times"></i>
              Clear Search
            </button>
          </div>
        </div>

        <!-- Categories -->
        <div class="locapp-section">
          <div class="locapp-section-header">
            <h2 class="locapp-title">Categories</h2>
            <button
              class="locapp-view-all"
              @click="showAllCategories = !showAllCategories">
              {{ showAllCategories ? "Show Less" : "View All" }}
            </button>
          </div>
          <div class="locapp-category-list">
            <button
              class="locapp-category-btn"
              v-for="category in categories"
              :key="category.key"
              @click="selectCategory(category.key)"
              :class="{ active: selectedCategory === category.key }">
              <i :class="['fas', 'fa-' + category.icon]"></i>
              {{ category.name }}
            </button>
          </div>
        </div>

        <!-- Admin Locations by Category -->
        <div
          v-if="selectedCategory && filteredAdminLocations.length > 0"
          class="locapp-section">
          <div class="locapp-section-header">
            <h2 class="locapp-title">
              {{ getCategoryDisplayName(selectedCategory) }} Locations
            </h2>
            <button class="locapp-view-all" @click="selectedCategory = null">
              Show All Categories
            </button>
          </div>
          <div class="locapp-locations-grid">
            <div
              class="locapp-location-card"
              v-for="location in filteredAdminLocations"
              :key="location.id"
              @click="goToLocation(location)">
              <div class="location-image">
                <img
                  :src="
                    location.imageUrl || '/placeholder.svg?height=80&width=80'
                  "
                  :alt="location.name"
                  class="location-img" />
                <button
                  @click.stop="showLocationDetails(location)"
                  class="location-info-btn-image"
                  aria-label="View location details">
                  <i class="fas fa-info-circle"></i>
                </button>
              </div>
              <div class="location-info">
                <h3 class="location-name">{{ location.name }}</h3>
                <p class="location-description">{{ location.description }}</p>
                <div class="location-coordinates">
                  <i class="fas fa-map-marker-alt"></i>
                  <span
                    >{{ location.coordinates.x.toFixed(4) }},
                    {{ location.coordinates.y.toFixed(4) }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Saved Places -->
        <div class="locapp-section">
          <div class="locapp-section-header">
            <h2 class="locapp-title">My Saved Places</h2>
            <button class="locapp-view-all">View All</button>
          </div>
          <div
            class="locapp-place"
            v-for="place in savedPlaces"
            :key="place.id"
            @click="goToPlace(place)">
            <i class="fas fa-bookmark locapp-icon"></i>
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

    <!-- Location Details Modal -->
    <div
      v-if="showLocationModal && selectedLocationDetails"
      class="location-modal">
      <div class="location-modal-content">
        <div class="location-modal-header">
          <h2>{{ selectedLocationDetails.name }}</h2>
          <button @click="closeLocationModal" class="close-modal-btn">×</button>
        </div>

        <div class="location-modal-body">
          <div class="location-modal-image">
            <img
              :src="
                selectedLocationDetails.imageUrl ||
                '/placeholder.svg?height=200&width=400'
              "
              :alt="selectedLocationDetails.name"
              class="modal-img" />
            <div class="modal-type-badge">
              {{ formatCategoryName(selectedLocationDetails.type) }}
            </div>
          </div>

          <div class="location-details">
            <div class="detail-section">
              <h3>Description</h3>
              <p>
                {{
                  selectedLocationDetails.description ||
                  "No description available."
                }}
              </p>
            </div>
          </div>

          <div class="location-modal-actions">
            <button
              @click="goToLocation(selectedLocationDetails)"
              class="navigate-btn">
              <i class="fas fa-directions"></i>
              Navigate Here
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- AR Navigation Component -->
    <ARNavigation
      :destination="arDestination"
      :is-active="isARActive"
      @stop-navigation="handleStopNavigation"
      @start-new-navigation="handleStartNewNavigation" />

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading locations...</p>
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
import ARNavigation from "@/components/ARNavigation.vue";
import NotificationBell from "@/components/NotificationBell.vue";

// Sheet state
const sheetY = ref(0);
const isExpanded = ref(false);
const isDragging = ref(false);
const startY = ref(0);
const currentY = ref(0);
const sheetHeight = ref(0);
const minSheetHeight = ref(100);
const maxSheetHeight = ref(0);

// App state
const searchQuery = ref("");
const selectedCategory = ref(null);
const showAllCategories = ref(false);
const savedPlaces = ref([]);
const adminLocations = ref([]);
const isLoading = ref(true);
const isDarkMode = ref(false);
const showAddPlaceModal = ref(false);
const newPlaceName = ref("");

const showLocationModal = ref(false);
const selectedLocationDetails = ref(null);

// Voice Search state
const voiceSearchRecognition = ref(null);
const isVoiceSearchListening = ref(false);
const voiceSearchTranscript = ref("");

// AR Navigation state
const isARActive = ref(false);
const arDestination = ref(null);

// Categories with enhanced mapping
const categories = ref([
  { key: "office", name: "Offices", icon: "building" },
  { key: "parking", name: "Parking", icon: "parking" },
  { key: "cr", name: "Comfort Room", icon: "restroom" },
  { key: "food_production", name: "Food", icon: "utensils" },
  { key: "plant_areas", name: "Plants", icon: "leaf" },
  { key: "animal_enclosure", name: "Animals", icon: "paw" },
  { key: "entrance", name: "Entrance", icon: "door-open" },
  { key: "exit", name: "Exit", icon: "door-closed" },
  { key: "landmark", name: "Landmarks", icon: "monument" },
  { key: "junction", name: "Junctions", icon: "map-signs" },
  { key: "destination", name: "Destinations", icon: "map-marker-alt" },
]);

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

const filteredAdminLocations = computed(() => {
  if (!selectedCategory.value) return [];

  let filtered = adminLocations.value.filter(
    (location) => location.type === selectedCategory.value
  );

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (location) =>
        location.name.toLowerCase().includes(query) ||
        location.description.toLowerCase().includes(query)
    );
  }

  return filtered;
});

const searchFilteredLocations = computed(() => {
  if (!searchQuery.value) return adminLocations.value;

  const query = searchQuery.value.toLowerCase();
  return adminLocations.value.filter(
    (location) =>
      location.name.toLowerCase().includes(query) ||
      location.description.toLowerCase().includes(query) ||
      location.type.toLowerCase().includes(query)
  );
});

const searchResults = computed(() => {
  if (!searchQuery.value) return [];

  const query = searchQuery.value.toLowerCase();
  return adminLocations.value.filter(
    (location) =>
      location.name.toLowerCase().includes(query) ||
      location.description.toLowerCase().includes(query) ||
      formatCategoryName(location.type).toLowerCase().includes(query)
  );
});

// Lifecycle hooks
onMounted(async () => {
  updateSheetDimensions();
  window.addEventListener("resize", updateSheetDimensions);
  sheetY.value = window.innerHeight * 0.6;

  // Initialize voice search
  initializeVoiceSearch();

  await loadData();
});

onUnmounted(() => {
  window.removeEventListener("resize", updateSheetDimensions);
  cleanupVoiceSearch();
});

// Voice Search methods
function initializeVoiceSearch() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    voiceSearchRecognition.value = new SpeechRecognition();
    setupVoiceSearchRecognition();
  } else {
    console.warn("Speech recognition not supported in this browser");
  }
}

function setupVoiceSearchRecognition() {
  if (!voiceSearchRecognition.value) return;

  voiceSearchRecognition.value.continuous = false;
  voiceSearchRecognition.value.interimResults = true;
  voiceSearchRecognition.value.lang = "en-US";

  voiceSearchRecognition.value.onstart = () => {
    isVoiceSearchListening.value = true;
    voiceSearchTranscript.value = "";
    expandSheet(); // Expand sheet when voice search starts
  };

  voiceSearchRecognition.value.onresult = (event) => {
    const result = event.results[0];
    voiceSearchTranscript.value = result[0].transcript;

    if (result.isFinal) {
      handleVoiceSearchResult(voiceSearchTranscript.value);
      stopVoiceSearch();
    }
  };

  voiceSearchRecognition.value.onerror = (event) => {
    console.error("Voice search error:", event.error);
    stopVoiceSearch();
  };

  voiceSearchRecognition.value.onend = () => {
    isVoiceSearchListening.value = false;
  };
}

function toggleVoiceSearch() {
  if (isVoiceSearchListening.value) {
    stopVoiceSearch();
  } else {
    startVoiceSearch();
  }
}

function startVoiceSearch() {
  if (voiceSearchRecognition.value) {
    try {
      voiceSearchRecognition.value.start();
    } catch (error) {
      console.error("Error starting voice search:", error);
    }
  }
}

function stopVoiceSearch() {
  if (voiceSearchRecognition.value && isVoiceSearchListening.value) {
    try {
      voiceSearchRecognition.value.stop();
    } catch (error) {
      console.error("Error stopping voice search:", error);
    }
  }
}

function handleVoiceSearchResult(text) {
  console.log("Voice search result:", text);
  searchQuery.value = text;

  // If we have results, show them
  if (searchResults.value.length > 0) {
    // Optional: Auto-select first result if only one match
    if (searchResults.value.length === 1) {
      setTimeout(() => {
        showLocationDetails(searchResults.value[0]);
      }, 500);
    }
  }
}

function cleanupVoiceSearch() {
  if (voiceSearchRecognition.value) {
    voiceSearchRecognition.value.abort();
  }
}

// Data loading methods
async function loadData() {
  isLoading.value = true;
  try {
    await Promise.all([loadUserSavedPlaces(), loadAdminLocations()]);
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    isLoading.value = false;
  }
}

async function loadUserSavedPlaces() {
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

async function loadAdminLocations() {
  try {
    const db = getFirestore();
    const waypointsRef = collection(db, "waypoints");
    const q = query(waypointsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    adminLocations.value = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      adminLocations.value.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        type: data.type,
        coordinates: data.coordinates,
        altitude: data.altitude,
        imageUrl: data.imageUrl,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    console.log(`Loaded ${adminLocations.value.length} admin locations`);
  } catch (error) {
    console.error("Error loading admin locations:", error);
  }
}

// Utility methods
function updateSheetDimensions() {
  maxSheetHeight.value = window.innerHeight * 0.9;
  sheetHeight.value = window.innerHeight * 0.9;
}

function getCategoryIcon(categoryKey) {
  const category = categories.value.find((cat) => cat.key === categoryKey);
  return category ? category.icon : "map-marker-alt";
}

function getCategoryDisplayName(categoryKey) {
  const category = categories.value.find((cat) => cat.key === categoryKey);
  return category ? category.name : formatCategoryName(categoryKey);
}

function formatCategoryName(categoryKey) {
  return categoryKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getCategoryCount(categoryKey) {
  return adminLocations.value.filter(
    (location) => location.type === categoryKey
  ).length;
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

  const threshold = window.innerHeight * 0.3;
  isExpanded.value = sheetY.value < threshold;
  animateSheet();
}

function selectCategory(category) {
  selectedCategory.value =
    selectedCategory.value === category ? null : category;
  if (selectedCategory.value) {
    expandSheet();
  }
}

function clearSearch() {
  searchQuery.value = "";
}

function goToPlace(place) {
  console.log("Going to saved place:", place.name);
  // Implement navigation to user saved place
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
        await loadUserSavedPlaces();
      } catch (error) {
        alert("Error saving place: " + error.message);
      }
    },
    (error) => {
      alert("Error getting location: " + error.message);
    }
  );
}

function showLocationDetails(location) {
  selectedLocationDetails.value = location;
  showLocationModal.value = true;
}

function closeLocationModal() {
  showLocationModal.value = false;
  selectedLocationDetails.value = null;
}

// AR Navigation methods
function goToLocation(location) {
  console.log("Starting AR navigation to:", location.name);

  // Track destination selection for analytics
  trackDestinationSelection(location);

  arDestination.value = location;
  isARActive.value = true;
  closeLocationModal();
}

// Function to track destination selection for analytics
async function trackDestinationSelection(location) {
  try {
    const db = getFirestore();
    const user = auth.currentUser;

    if (user) {
      await addDoc(collection(db, "recentDestinations"), {
        userId: user.uid,
        destination: location.name,
        destinationId: location.id,
        destinationType: location.type || location.category,
        coordinates: location.coordinates,
        timestamp: new Date(),
        userEmail: user.email,
      });

      console.log("Destination selection tracked:", location.name);
    }
  } catch (error) {
    console.error("Error tracking destination selection:", error);
  }
}

// Handle navigation from notification
function handleNotificationNavigation(waypointData) {
  console.log(
    "Starting AR navigation from notification to:",
    waypointData.name
  );

  // Validate coordinates before starting navigation
  if (
    !waypointData.coordinates ||
    waypointData.coordinates.x === undefined ||
    waypointData.coordinates.y === undefined ||
    waypointData.coordinates.x === null ||
    waypointData.coordinates.y === null
  ) {
    console.error(
      "Cannot start navigation: waypoint has invalid coordinates",
      waypointData
    );

    // Show an error message to the user
    alert(
      `Sorry, the location "${waypointData.name}" doesn't have valid coordinates for navigation.`
    );
    return;
  }

  // Convert waypoint data to location format expected by AR Navigation
  const location = {
    id: waypointData.id,
    name: waypointData.name,
    type: waypointData.type,
    coordinates: waypointData.coordinates,
  };

  // Track the destination selection
  trackDestinationSelection(location);

  // Start AR Navigation
  arDestination.value = location;
  isARActive.value = true;

  // Close any open modals
  closeLocationModal();
}

function handleStopNavigation() {
  isARActive.value = false;
  arDestination.value = null;
}

function handleStartNewNavigation() {
  // Stop current navigation
  isARActive.value = false;
  arDestination.value = null;

  // Show location selection by expanding the bottom sheet
  isExpanded.value = true;

  // Optionally scroll to top of locations
  if (selectedCategory.value !== null) {
    selectedCategory.value = null; // Reset to show all locations
  }
}
</script>

<style scoped>
@import "@/assets/allstyle.css";

/* Voice Search Styles */
.voice-search-btn {
  background: none;
  border: none;
  color: #22c55e;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-left: 8px;
}

.voice-search-btn:hover {
  background: rgba(34, 197, 94, 0.1);
}

.voice-search-btn.listening {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.voice-search-btn .pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(34, 197, 94, 0.3);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.4;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

.voice-search-status {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  margin: 12px 0;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.voice-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.voice-animation {
  display: flex;
  align-items: flex-end;
  height: 20px;
  gap: 2px;
}

.voice-bar {
  background-color: #22c55e;
  width: 3px;
  border-radius: 2px;
  animation: voice-wave 0.5s infinite alternate;
}

.voice-bar:nth-child(1) {
  height: 8px;
  animation-duration: 0.4s;
}

.voice-bar:nth-child(2) {
  height: 12px;
  animation-duration: 0.3s;
}

.voice-bar:nth-child(3) {
  height: 16px;
  animation-duration: 0.5s;
}

.voice-bar:nth-child(4) {
  height: 10px;
  animation-duration: 0.2s;
}

@keyframes voice-wave {
  0% {
    transform: scaleY(0.5);
  }
  100% {
    transform: scaleY(1);
  }
}

.voice-text {
  color: #16a34a;
  font-size: 14px;
  font-weight: 500;
}

/* Dark mode voice search styles */
body.dark-mode .voice-search-btn {
  color: #34d399 !important;
}

body.dark-mode .voice-search-btn:hover {
  background: rgba(52, 211, 153, 0.1) !important;
}

body.dark-mode .voice-search-btn.listening {
  background: rgba(52, 211, 153, 0.1) !important;
  color: #10b981 !important;
}

body.dark-mode .voice-search-status {
  background: rgba(52, 211, 153, 0.1) !important;
  border-color: rgba(52, 211, 153, 0.3) !important;
}

body.dark-mode .voice-bar {
  background-color: #34d399 !important;
}

body.dark-mode .voice-text {
  color: #10b981 !important;
}

/* Enhanced search bar layout */
.locapp-search {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.locapp-search:focus-within {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.locapp-search-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 16px;
  margin-left: 8px;
}

.locapp-search-clear {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
  margin-left: 8px;
}

.locapp-search-clear:hover {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
}

/* Dark mode search styles */
body.dark-mode .locapp-search {
  background: #374151 !important;
  border-color: #4b5563 !important;
}

body.dark-mode .locapp-search-input {
  color: #f9fafb !important;
}

body.dark-mode .locapp-search-input::placeholder {
  color: #9ca3af !important;
}

body.dark-mode .locapp-search:focus-within {
  border-color: #34d399 !important;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1) !important;
}

/* Enhanced styles for location display */
.locapp-locations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.locapp-location-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #f0f0f0;
}

.locapp-location-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.location-image {
  position: relative;
  margin-bottom: 12px;
}

.location-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
}

.location-info-btn-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(34, 197, 94, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
  font-size: 14px;
}

.location-info-btn-image:hover {
  background: rgba(34, 197, 94, 1);
  transform: scale(1.1);
}

.location-info {
  text-align: left;
}

.location-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.location-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.location-coordinates {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.location-coordinates i {
  color: #22c55e;
}

.locapp-locations-list {
  margin-top: 12px;
}

.location-icon-wrapper {
  background: #f0fdf4;
  border-radius: 8px;
  padding: 8px;
  margin-right: 12px;
}

.location-icon-wrapper .locapp-icon {
  color: #22c55e;
  font-size: 18px;
}

.locapp-place-category {
  font-size: 12px;
  color: #22c55e;
  font-weight: 500;
  margin-bottom: 4px;
}

.locapp-place-coordinates {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.category-count {
  background: #22c55e;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  font-weight: 500;
}

.location-count {
  font-size: 14px;
  color: #6b7280;
  font-weight: normal;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  font-size: 2rem;
  color: #22c55e;
  margin-bottom: 16px;
}

.loading-overlay p {
  color: #6b7280;
  font-size: 16px;
}

/* Dark mode enhancements */
body.dark-mode .locapp-location-card {
  background: #374151 !important;
  border-color: #4b5563 !important;
}

body.dark-mode .location-name {
  color: #f9fafb !important;
}

body.dark-mode .location-description {
  color: #d1d5db !important;
}

body.dark-mode .location-coordinates {
  color: #9ca3af !important;
}

body.dark-mode .locapp-place-category {
  color: #34d399 !important;
}

body.dark-mode .loading-overlay {
  background: rgba(31, 41, 55, 0.9) !important;
}

body.dark-mode .loading-overlay p {
  color: #d1d5db !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .locapp-locations-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .locapp-location-card {
    padding: 12px;
  }

  .location-img {
    height: 100px;
  }

  .voice-search-btn {
    font-size: 16px;
    padding: 6px;
  }
}

/* Additional sheet styles */
.locapp-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 90vh;
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
  gap: 12px;
}

.search-count {
  font-size: 14px;
  color: #22c55e;
  font-weight: 500;
}

.empty-search-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-search-state i {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-search-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-search-state p {
  margin: 0 0 20px 0;
  font-size: 14px;
}

.clear-search-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: #e5e7eb;
}

.clear-search-btn i {
  margin-right: 6px;
}

/* Dark mode for search elements */
body.dark-mode .search-count {
  color: #34d399 !important;
}

body.dark-mode .empty-search-state h3 {
  color: #f9fafb !important;
}

body.dark-mode .empty-search-state p {
  color: #d1d5db !important;
}

body.dark-mode .clear-search-btn {
  background: #4b5563 !important;
  border-color: #6b7280 !important;
  color: #f9fafb !important;
}

body.dark-mode .clear-search-btn:hover {
  background: #374151 !important;
}

.location-info-btn-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(34, 197, 94, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
  font-size: 14px;
}

.location-info-btn-image:hover {
  background: rgba(34, 197, 94, 1);
  transform: scale(1.1);
}

body.dark-mode .location-info-btn-image {
  background: rgba(34, 197, 94, 0.9) !important;
}

body.dark-mode .location-info-btn-image:hover {
  background: rgba(34, 197, 94, 1) !important;
}

.location-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}

.location-modal-content {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.location-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.location-modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-modal-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.location-modal-body {
  padding: 24px;
}

.location-modal-image {
  position: relative;
  margin-bottom: 24px;
}

.modal-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
}

.modal-type-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(34, 197, 94, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.detail-section p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #374151;
}

.detail-value {
  color: #6b7280;
  text-align: right;
}

.location-modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.navigate-btn,
.copy-coords-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.navigate-btn {
  background: #22c55e;
  color: white;
}

.navigate-btn:hover {
  background: #16a34a;
}

.copy-coords-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.copy-coords-btn:hover {
  background: #e5e7eb;
}

/* Dark mode styles for modal */
body.dark-mode .location-modal-content {
  background: #374151 !important;
}

body.dark-mode .location-modal-header {
  border-bottom-color: #4b5563 !important;
}

body.dark-mode .location-modal-header h2 {
  color: #f9fafb !important;
}

body.dark-mode .close-modal-btn {
  color: #d1d5db !important;
}

body.dark-mode .close-modal-btn:hover {
  background: #4b5563 !important;
  color: #f9fafb !important;
}

body.dark-mode .detail-section h3 {
  color: #f9fafb !important;
}

body.dark-mode .detail-section p {
  color: #d1d5db !important;
}

body.dark-mode .detail-label {
  color: #e5e7eb !important;
}

body.dark-mode .detail-value {
  color: #d1d5db !important;
}

body.dark-mode .detail-item {
  border-bottom-color: #4b5563 !important;
}

body.dark-mode .copy-coords-btn {
  background: #4b5563 !important;
  color: #e5e7eb !important;
  border-color: #6b7280 !important;
}

body.dark-mode .copy-coords-btn:hover {
  background: #374151 !important;
}

body.dark-mode .location-info-btn {
  background: rgba(55, 65, 81, 0.9) !important;
}

body.dark-mode .location-info-btn:hover {
  background: rgba(55, 65, 81, 1) !important;
}

/* Responsive modal */
@media (max-width: 768px) {
  .location-modal {
    padding: 10px;
  }

  .location-modal-content {
    max-height: 95vh;
  }

  .location-modal-header {
    padding: 16px 20px;
  }

  .location-modal-body {
    padding: 20px;
  }

  .location-modal-actions {
    flex-direction: column;
  }

  .modal-img {
    height: 150px;
  }
}
</style>
