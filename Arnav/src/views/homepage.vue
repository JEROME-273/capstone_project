<template>
  <div class="locapp-container">
    <!-- Learning Tips Modal (teleported to body so it’s outside any other modals) -->
    <teleport to="body">
      <LearningTipsModal
        :tips="newTips"
        :visible="showTipsModal"
        @close="showTipsModal = false"
        @seen="onTipsSeen" />
    </teleport>
    <!-- Weather Hero Section with integrated navbar -->
    <section class="weather-hero">
      <!-- Hero Header (replacing navbar) -->
      <div class="hero-header">
        <div class="navbar-left">
          <span class="farm-name">BULUSAN PARK</span>
        </div>

        <div class="navbar-actions">
          <!-- Learning Progress Button -->
          <button
            class="learning-progress-btn"
            @click="toggleLearningProgress"
            :class="{ active: showLearningProgress }"
            aria-label="Learning Progress">
            <div class="learning-icon">
              <i class="bx bx-brain"></i>
              <div v-if="userLearningStreak > 0" class="streak-badge">
                {{ userLearningStreak }}
              </div>
            </div>
          </button>

          <!-- Notification Bell -->
          <NotificationBell
            class="notification-bell"
            @startNavigation="handleNotificationNavigation" />

          <!-- QR Code Scanner Button -->
          <router-link
            to="/qr-scan"
            class="qr-scan-btn"
            aria-label="Scan QR Code">
            <i class="fas fa-qrcode"></i>
          </router-link>

          <!-- User Profile -->
          <router-link to="/userinfo" class="user-profile-btn">
            <i class="fas fa-user-circle user-icon"></i>
          </router-link>
        </div>
      </div>
      <!-- Floating Weather Advice Banner -->
      <div
        v-if="rainReminder.show"
        class="weather-banner"
        role="status"
        aria-live="polite">
        <div class="weather-banner-content">
          <i class="fas fa-cloud-rain"></i>
          <span class="weather-banner-text">{{ rainReminder.text }}</span>
        </div>
        <button
          class="weather-banner-close"
          @click="dismissRainReminder"
          aria-label="Dismiss weather reminder">
          ×
        </button>
      </div>
      <div class="weather-content">
        <!-- Left side -->
        <div class="weather-left">
          <div class="temp-icon">
            <span class="temp">{{
              weather.temp !== null ? weather.temp + "°" : "--"
            }}</span>
            <span class="condition-icon">
              <!-- Dynamically choose icon based on description -->
              {{
                weather.condition.toLowerCase().includes("rain")
                  ? "�️"
                  : weather.condition.toLowerCase().includes("sun") ||
                    weather.condition.toLowerCase().includes("clear")
                  ? "☀️"
                  : weather.condition.toLowerCase().includes("cloud")
                  ? "☁️"
                  : "🌡️"
              }}
            </span>
          </div>
          <div class="feels-like">
            Feels like
            {{ weather.feelsLike !== null ? weather.feelsLike + "°" : "--" }}
          </div>
        </div>

        <!-- Right side -->
        <div class="weather-right">
          <div class="condition">{{ weather.condition || "--" }}</div>
          <div class="detail">
            Precip:
            {{ weather.precip !== null ? weather.precip + " mm" : "--" }}
          </div>
          <div class="detail">
            Humidity:
            {{ weather.humidity !== null ? weather.humidity + "%" : "--" }}
          </div>
          <div class="detail">
            Wind: {{ weather.wind !== null ? weather.wind + " km/h" : "--" }}
          </div>
        </div>
      </div>

      <!-- Background weather icons -->
      <div class="weather-bg">���</div>
    </section>

    <!-- Floating Feedback Button (icon only) -->
    <router-link to="/help-center" class="feedback-btn" aria-label="Feedback">
      <i class="fas fa-comment-alt"></i>
    </router-link>

    <br />
    <div class="locapp-content" @click.stop>
      <!-- Search Container -->
      <div class="search-wrapper">
        <div class="locapp-search">
          <input
            type="text"
            class="locapp-search-input"
            placeholder="Search locations..."
            v-model="searchQuery" />

          <i class="fas fa-search locapp-search-icon"></i>

          <button
            class="locapp-search-clear"
            v-if="searchQuery"
            @click="clearSearch">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Voice Search Button (beside search bar) -->
        <button
          @click="toggleVoiceSearch"
          class="voice-search-btn"
          :class="{ hidden: searchQuery, listening: isVoiceSearchListening }"
          aria-label="Voice search">
          <span v-if="isVoiceSearchListening" class="pulse"></span>
          <i class="fas fa-microphone"></i>
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
          <span class="voice-text">
            Listening... {{ voiceSearchTranscript }}
          </span>
        </div>
      </div>
      <!-- Search Results -->
      <div
        v-if="searchQuery && searchResults.length > 0"
        class="locapp-section">
        <div class="locapp-section-header">
          <h2>Search Results</h2>
          <span class="search-count">{{ searchResults.length }} found</span>
        </div>
        <div class="locapp-locations-grid">
          <div
            class="locapp-location-card"
            v-for="location in searchResults"
            :key="location.id"
            :class="{
              'maintenance-mode': location.isUnderMaintenance === true,
            }"
            @click="
              location.isUnderMaintenance === true
                ? handleMaintenanceClick(location)
                : goToLocation(location)
            ">
            <div class="location-image">
              <img
                :src="
                  location.imageUrl || '/placeholder.svg?height=80&width=80'
                "
                :alt="location.name"
                class="location-img" />
              <div
                v-if="location.isUnderMaintenance === true"
                class="maintenance-overlay">
                <i class="fas fa-tools"></i>
                <span>Under Maintenance</span>
              </div>
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
              <div
                v-if="location.isUnderMaintenance === true"
                class="status-badge maintenance">
                <i class="fas fa-exclamation-triangle"></i>
                Under Maintenance - Navigation Disabled
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
        </div>
      </div>

      <br />

      <!-- Categories -->
      <div class="locapp-section">
        <div class="locapp-section-header">
          <h2 class="locapp-title cate">CATEGORIES</h2>
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
          <h2>{{ getCategoryDisplayName(selectedCategory) }} Locations</h2>
        </div>

        <div class="locapp-locations-grid">
          <div
            class="locapp-location-card"
            v-for="location in filteredAdminLocations"
            :key="location.id"
            :class="{
              'maintenance-mode': location.isUnderMaintenance === true,
            }"
            @click="
              location.isUnderMaintenance === true
                ? handleMaintenanceClick(location)
                : goToLocation(location)
            ">
            <div class="location-image">
              <img
                :src="
                  location.imageUrl || '/placeholder.svg?height=80&width=80'
                "
                :alt="location.name"
                class="location-img" />
              <div
                v-if="location.isUnderMaintenance === true"
                class="maintenance-overlay">
                <i class="fas fa-tools"></i>
                <span>Under Maintenance</span>
              </div>
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
              <div
                v-if="location.isUnderMaintenance === true"
                class="status-badge maintenance">
                <i class="fas fa-exclamation-triangle"></i>
                Under Maintenance - Navigation Disabled
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />

      <!-- Saved Places -->
      <section class="locapp-section">
        <header class="locapp-section-header">
          <h2 class="saveplace">SAVED PLACES</h2>
        </header>

        <!-- Show only top 3 places -->
        <div
          class="locapp-place"
          v-for="place in savedPlaces.slice(0, 3)"
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

        <!-- View All button (if more than 3 saved places) -->
        <button
          v-if="savedPlaces.length > 3"
          class="locapp-view-all-btn"
          @click="showAllPlaces = true">
          View All
        </button>

        <!-- Add New Place button -->
        <button class="locapp-add-btn" @click="showAddPlaceModal = true">
          <i class="fas fa-plus"></i>
          Add New Place
        </button>
      </section>
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
            <!-- Maintenance Status Badge in Modal -->
            <div
              v-if="selectedLocationDetails.isUnderMaintenance === true"
              class="modal-status-badge maintenance">
              <i class="fas fa-exclamation-triangle"></i>
              Under Maintenance - Navigation Disabled
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
              @click="
                selectedLocationDetails.isUnderMaintenance === true
                  ? handleMaintenanceClick(selectedLocationDetails)
                  : goToLocation(selectedLocationDetails)
              "
              class="navigate-btn"
              :class="{
                'maintenance-disabled':
                  selectedLocationDetails.isUnderMaintenance === true,
              }">
              <i class="fas fa-directions"></i>
              {{
                selectedLocationDetails.isUnderMaintenance === true
                  ? "Under Maintenance"
                  : "Navigate Here"
              }}
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

    <!-- Learning Progress Modal -->
    <!-- Use v-show so the tracker component stays mounted (for real-time listeners) but remains hidden -->
    <div v-show="showLearningProgress" class="learning-progress-modal">
      <div
        class="learning-progress-overlay"
        @click="closeLearningProgress"></div>
      <div class="learning-progress-content">
        <div class="learning-modal-header">
          <h2>
            <i class="bx bx-brain"></i>
            Learning Progress
          </h2>
          <button @click="closeLearningProgress" class="close-modal-btn">
            ×
          </button>
        </div>
        <div class="learning-modal-body">
          <LearningProgressTracker :visible="showLearningProgress" />
        </div>
      </div>
    </div>

    <!-- Tracker mounts inside the modal; real-time will re-run when opened -->

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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  limit,
} from "firebase/firestore";
import { auth } from "@/firebase/config";
import { signInAnonymously } from "firebase/auth";
import {
  getNewTipsForUser,
  markTipsAsSeen,
} from "@/services/LearningTipsService";
import ARNavigation from "@/components/ARNavigation.vue";
import NotificationBell from "@/components/NotificationBell.vue";
import LearningProgressTracker from "@/components/LearningProgressTracker.vue";
import LearningTipsModal from "@/components/LearningTipsModal.vue";
import { checkRainSoon } from "@/services/WeatherService";
import NotificationService from "@/services/NotificationService";
import VoiceService from "@/services/VoiceService";

// App state
const searchQuery = ref("");
const selectedCategory = ref(null);
const showAllCategories = ref(false);
const savedPlaces = ref([]);
const adminLocations = ref([]);
const isLoading = ref(true);
const showAddPlaceModal = ref(false);
const newPlaceName = ref("");

// Weather state
const weather = ref({
  temp: null,
  feelsLike: null,
  condition: "",
  precip: null,
  humidity: null,
  wind: null,
  date: new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
});

const showLocationModal = ref(false);
const selectedLocationDetails = ref(null);

// Voice Search state
const voiceSearchRecognition = ref(null);
const isVoiceSearchListening = ref(false);
const voiceSearchTranscript = ref("");

// AR Navigation state
const isARActive = ref(false);
const arDestination = ref(null);
const route = useRoute();
const router = useRouter();

// Learning Progress state
const showLearningProgress = ref(false);
const userLearningStreak = ref(0);

// Learning Tips modal state
const showTipsModal = ref(false);
const newTips = ref([]);
// Session guard to prevent re-opening multiple times in one visit
let tipsShownThisSession = false;

// Weather reminder state
const rainReminder = ref({ show: false, text: "" });
const DEFAULT_LAT = Number(import.meta.env.VITE_DEFAULT_LAT) || 13.1235;
const DEFAULT_LON = Number(import.meta.env.VITE_DEFAULT_LON) || 121.1235;
// Voice readiness for weather announcements
const voiceReady = ref(false);

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
  { key: "facility", name: "Facilities", icon: "map-marker-alt" },
]);

// Computed properties
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
  // Initialize voice search
  initializeVoiceSearch();

  // Initialize voice service (for spoken weather advice)
  try {
    voiceReady.value = (await VoiceService.initialize()) || false;
  } catch (e) {
    voiceReady.value = false;
  }

  // Ensure we have a user (anonymous is fine) so Firestore reads are allowed
  await ensureAuth();

  // Check ASAP so the modal can appear on the base page
  await checkNewLearningTips();

  await loadData();
  await loadUserLearningStreak();

  // After loading, check for new learning tips for this user
  await checkNewLearningTips();

  // Small delayed re-check (handles serverTimestamp delays or slow network)
  setTimeout(() => {
    // Don't reopen if already visible
    if (!showTipsModal.value) {
      checkNewLearningTips();
    }
  }, 2000);

  // Kick off a weather check after initial UI is ready
  checkWeatherReminder();

  // Load weather data
  getWeather();
});

onUnmounted(() => {
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

// Weather reminder methods
function checkWeatherReminder() {
  try {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const result = await checkRainSoon(lat, lon, 6);
        if (result.willRain && result.message) {
          rainReminder.value = { show: true, text: result.message };
        }
      },
      (err) => {
        console.warn(
          "Geolocation denied/failed, using defaults for weather reminder",
          err?.message
        );
        // Fallback using default coordinates
        checkRainSoon(DEFAULT_LAT, DEFAULT_LON, 6).then((result) => {
          if (result.willRain && result.message) {
            rainReminder.value = { show: true, text: result.message };
          }
        });
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  } catch (e) {
    console.warn("Weather reminder error", e);
  }
}
function dismissRainReminder() {
  rainReminder.value.show = false;
}

// Learning Tips methods
async function ensureAuth() {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
      // Give Firebase a moment to populate currentUser
    }
  } catch (e) {
    console.error("Anonymous sign-in failed:", e);
  }
}

async function checkNewLearningTips() {
  try {
    const user = auth.currentUser;
    if (!user) return;
    if (tipsShownThisSession) return; // don't reopen in same session
    const tips = await getNewTipsForUser(user.uid, 3);
    console.log(
      "Learning tips check: user=",
      user.uid,
      "tips=",
      tips?.length || 0
    );
    if (tips && tips.length) {
      newTips.value = tips;
      showTipsModal.value = true;
      tipsShownThisSession = true;
      console.log("Showing LearningTipsModal with", tips.length, "items");
    }
  } catch (e) {
    console.error("Error checking learning tips:", e);
  }
}

async function onTipsSeen(ids) {
  try {
    const user = auth.currentUser;
    if (!user || !ids?.length) return;
    await markTipsAsSeen(user.uid, ids);
  } catch (e) {
    console.error("Error marking tips as seen:", e);
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
        status: data.status || "active", // Add status field with default 'active'
        isUnderMaintenance: data.isUnderMaintenance || false, // Add maintenance field
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    console.log(`Loaded ${adminLocations.value.length} admin locations`);
    attemptAutoStartFromQR();
  } catch (error) {
    console.error("Error loading admin locations:", error);
  }
}

function attemptAutoStartFromQR() {
  const startId = route.query.startAr;
  if (!startId) return;
  const matched = adminLocations.value.find((l) => l.id === startId);
  if (matched && !isARActive.value) {
    goToLocation(matched);
    // Clean param to prevent repeated trigger
    const newQuery = { ...route.query };
    delete newQuery.startAr;
    router.replace({ query: newQuery });
  }
}

watch(
  () => route.query.startAr,
  (val) => {
    if (val) {
      if (adminLocations.value.length > 0) attemptAutoStartFromQR();
    }
  }
);

// Utility methods
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

function selectCategory(category) {
  selectedCategory.value =
    selectedCategory.value === category ? null : category;
}

function clearSearch() {
  searchQuery.value = "";
}

function goToPlace(place) {
  console.log("Going to saved place:", place.name);
  // Implement navigation to user saved place
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
  // Check if location is under maintenance
  if (location.isUnderMaintenance === true) {
    alert(
      `Sorry, "${location.name}" is currently under maintenance and not available for navigation.`
    );
    return;
  }

  console.log("Starting AR navigation to:", location.name);

  // Track destination selection for analytics
  trackDestinationSelection(location);

  arDestination.value = location;
  isARActive.value = true;
  closeLocationModal();

  // Weather advice for this destination (non-blocking)
  checkRainForDestination(location);
}

function handleMaintenanceClick(location) {
  // Show informative message when user clicks on maintenance waypoint
  alert(
    `"${location.name}" is currently under maintenance. Navigation is temporarily disabled for safety reasons. Please check back later.`
  );
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

  // Check if location is under maintenance
  if (waypointData.isUnderMaintenance === true) {
    alert(
      `Sorry, "${waypointData.name}" is currently under maintenance and not available for navigation.`
    );
    return;
  }

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
    status: waypointData.status,
  };

  // Track the destination selection
  trackDestinationSelection(location);

  // Start AR Navigation
  arDestination.value = location;
  isARActive.value = true;

  // Close any open modals
  closeLocationModal();

  // Weather advice for this destination (non-blocking)
  checkRainForDestination(location);
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

// Weather advice based on destination coordinates
async function checkRainForDestination(location) {
  try {
    const coords = location?.coordinates || {};
    const lat = typeof coords.x === "number" ? coords.x : DEFAULT_LAT;
    const lon = typeof coords.y === "number" ? coords.y : DEFAULT_LON;

    const result = await checkRainSoon(lat, lon, 6);
    if (result.willRain && result.message) {
      // Show banner
      rainReminder.value = { show: true, text: result.message };
      // Also push a global notification so it shows in the bell
      NotificationService.createCustomNotification(
        "weather_advice",
        "Weather Reminder",
        result.message,
        {
          priority: "medium",
          destinationId: location.id,
          destinationName: location.name,
          destinationType: location.type,
        }
      ).catch(() => {});

      // Speak advice if voice is ready
      if (voiceReady.value) {
        try {
          await VoiceService.speak(result.message);
        } catch (e) {
          // ignore speech errors
        }
      }
    }
  } catch (e) {
    console.warn("checkRainForDestination failed", e);
  }
}

// Learning Progress methods
function toggleLearningProgress() {
  showLearningProgress.value = !showLearningProgress.value;
}

function closeLearningProgress() {
  showLearningProgress.value = false;
}

// Load user learning streak on component mount
async function loadUserLearningStreak() {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const statsQuery = query(
      collection(db, "userLearningStats"),
      where("userId", "==", user.uid),
      limit(1)
    );

    const statsSnapshot = await getDocs(statsQuery);
    if (!statsSnapshot.empty) {
      const statsData = statsSnapshot.docs[0].data();
      userLearningStreak.value = statsData.currentStreak || 0;
    }
  } catch (error) {
    console.error("Error loading user learning streak:", error);
  }
}

// Weather API function
async function getWeather() {
  try {
    const apiKey = "64b4ab73cd533e2a0a33c48c9cd93ee5";
    const city = "Calapan,PH";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    if (data && data.main) {
      weather.value.temp = Math.round(data.main.temp);
      weather.value.feelsLike = Math.round(data.main.feels_like);
      weather.value.condition = data.weather[0].description;
      weather.value.humidity = data.main.humidity;
      weather.value.wind = data.wind.speed;
      weather.value.precip = data.rain ? data.rain["1h"] || 0 : 0; // rainfall in mm
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}
</script>

<style scoped>
@import "@/assets/allstyle.css";
@import "@/assets/responsive_final.css";

/* Weather Banner (floating inside weather hero) */
.weather-hero {
  position: relative;
}
.weather-banner {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 90%;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(33, 150, 243, 0.9);
  background: linear-gradient(135deg, #2196f3, #6ec6ff);
  color: #fff;
  padding: 8px 14px 8px 12px;
  border-radius: 40px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  animation: banner-slide-in 0.4s ease;
}
@keyframes banner-slide-in {
  from {
    opacity: 0;
    transform: translate(-50%, -10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
.weather-banner-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.weather-banner-content i {
  font-size: 16px;
}
.weather-banner-text {
  line-height: 1.3;
  font-weight: 500;
}
.weather-banner-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  font-size: 16px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.weather-banner-close:hover {
  background: rgba(255, 255, 255, 0.3);
}
@media (max-width: 600px) {
  .weather-banner {
    top: 6px;
    padding: 6px 12px;
  }
  .weather-banner-text {
    font-size: 12px;
  }
}
body.dark-mode .weather-banner {
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  border-color: rgba(255, 255, 255, 0.15) !important;
}

/* Learning Progress Button Styles */
.learning-progress-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #4a5568;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
  margin-right: 10px;
}

.learning-progress-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: scale(1.1);
}

.learning-progress-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.learning-icon {
  position: relative;
}

.streak-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b6b;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Learning Progress Modal */
.learning-progress-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.learning-progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.learning-progress-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  z-index: 1001;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.learning-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.learning-modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-modal-btn {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.close-modal-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.learning-modal-body {
  flex: 1;
  overflow: auto;
  padding: 0;
}

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
}

/* Maintenance Mode Styles - Improved */
.locapp-location-card.maintenance-mode {
  opacity: 0.85;
  cursor: not-allowed;
  background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
  border: 2px solid #fed7d7;
  position: relative;
  overflow: hidden;
}

.locapp-location-card.maintenance-mode::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f56565, #fc8181);
  z-index: 2;
}

.maintenance-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(220, 38, 38, 0.95);
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-weight: 600;
  font-size: 11px;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
  backdrop-filter: blur(4px);
}

.maintenance-overlay i {
  font-size: 14px;
  animation: maintenance-pulse 2s infinite;
}

@keyframes maintenance-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.maintenance {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #b91c1c;
  border: 1px solid #f87171;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
}

.status-badge i {
  font-size: 12px;
  animation: maintenance-icon-pulse 2s infinite;
}

@keyframes maintenance-icon-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.location-description {
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

/* Dark mode maintenance styles - Improved */
body.dark-mode .locapp-location-card.maintenance-mode {
  background: linear-gradient(135deg, #451a1a 0%, #3f1818 100%) !important;
  border-color: #991b1b !important;
}

body.dark-mode .locapp-location-card.maintenance-mode::before {
  background: linear-gradient(90deg, #dc2626, #ef4444) !important;
}

body.dark-mode .maintenance-overlay {
  background: rgba(185, 28, 28, 0.95) !important;
  box-shadow: 0 2px 8px rgba(185, 28, 28, 0.4) !important;
}

body.dark-mode .status-badge.maintenance {
  background: linear-gradient(135deg, #5b1f1f, #7c2d2d) !important;
  color: #fca5a5 !important;
  border-color: #991b1b !important;
}

.locapp-location-card.maintenance-mode .location-name {
  color: #7f1d1d !important;
  opacity: 0.9;
}

.locapp-location-card.maintenance-mode .location-description {
  color: #991b1b !important;
  opacity: 0.8;
}

.locapp-location-card.maintenance-mode .location-coordinates {
  color: #b91c1c !important;
  opacity: 0.7;
}

body.dark-mode .locapp-location-card.maintenance-mode .location-name {
  color: #fca5a5 !important;
  opacity: 0.9;
}

body.dark-mode .locapp-location-card.maintenance-mode .location-description {
  color: #f87171 !important;
  opacity: 0.8;
}

body.dark-mode .locapp-location-card.maintenance-mode .location-coordinates {
  color: #fca5a5 !important;
  opacity: 0.7;
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
  display: flex;
  flex-direction: column;
  padding: 0 16px 16px;
}

/* New fixed header section (inside sheet) */
.locapp-fixed-header {
  position: sticky; /* relative to scroll container parent */
  top: 0;
  z-index: 20;
  background: inherit;
  padding-top: 12px;
  padding-bottom: 8px;
  backdrop-filter: blur(6px);
}

.locapp-results-scroll {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  padding-bottom: 24px;
}

/* Compact categories header spacing when fixed */
.locapp-categories-header {
  padding-top: 8px;
  padding-bottom: 4px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

body.dark-mode .locapp-categories-header {
  border-bottom-color: rgba(255, 255, 255, 0.1) !important;
}

.qr-scan-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 1.5rem;
  margin-left: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.qr-scan-btn:hover {
  color: #2563eb;
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

.modal-status-badge.maintenance {
  position: absolute;
  top: 52px;
  right: 12px;
  background: rgba(245, 158, 11, 0.95);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
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

.navigate-btn.maintenance-disabled {
  background: #f59e0b !important;
  color: white !important;
  cursor: not-allowed !important;
  opacity: 0.8;
}

.navigate-btn.maintenance-disabled:hover {
  background: #d97706 !important;
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
