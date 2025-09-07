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

    <!-- Animal Info Modal (teleported to body) -->
    <teleport to="body">
      <AnimalInfoModal
        :animal="selectedAnimal"
        :visible="showAnimalModal"
        @close="showAnimalModal = false" />
    </teleport>

    <!-- Weather Hero Section with integrated navbar -->
    <section class="weather-hero">
      <!-- Navbar contents placed at the top -->
      <div class="hero-header">
        <div class="navbar-left">
          <span class="farm-name">BP</span>
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

          <!-- QR Code Scanner Button -->
          <router-link
            to="/qr-scan"
            class="qr-scan-btn"
            aria-label="Scan QR Code">
            <i class="fas fa-qrcode"></i>
          </router-link>

          <!-- Notification Bell -->
          <NotificationBell
            class="notification-bell"
            @startNavigation="handleNotificationNavigation" />

          <!-- User Profile -->
          <router-link to="/userinfo" class="user-profile-btn">
            <i class="fas fa-user-circle user-icon"></i>
          </router-link>
        </div>
      </div>

      <!-- Weather Content -->
      <div class="weather-content">
        <!-- Left Section -->
        <div class="weather-left">
          <div class="temp-icon">
            <span class="temp">{{
              weather.temp !== null ? weather.temp + "°" : "--"
            }}</span>
            <span class="condition-icon">
              {{
                weather.condition.toLowerCase().includes("rain")
                  ? "🌧️"
                  : weather.condition.toLowerCase().includes("sun") ||
                    weather.condition.toLowerCase().includes("clear")
                  ? "☀️"
                  : weather.condition.toLowerCase().includes("cloud")
                  ? "☁️"
                  : "🌡️"
              }}
            </span>
          </div>
          <div class="condition">{{ weather.condition || "--" }}</div>
          <div class="feels-like">
            Feels like
            {{ weather.feelsLike !== null ? weather.feelsLike + "°" : "--" }}
          </div>
        </div>

        <!-- Right Section -->
        <div class="weather-right">
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
          <h2 class="cate">CATEGORIES</h2>
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
            <!-- Location Image -->
            <div class="location-image">
              <img
                :src="
                  location.imageUrl || '/placeholder.svg?height=80&width=80'
                "
                :alt="location.name"
                class="location-img" />

              <!-- Maintenance Overlay -->
              <div
                v-if="location.isUnderMaintenance === true"
                class="maintenance-overlay">
                <i class="lucide-wrench"></i>
                <span>Under Maintenance</span>
              </div>

              <!-- Info Button -->
              <button
                @click.stop="showLocationDetails(location)"
                class="location-info-btn-image"
                aria-label="View location details">
                <i class="lucide-info"></i>
              </button>
            </div>

            <!-- Location Info -->
            <div class="location-info">
              <h3 class="location-name">{{ location.name }}</h3>
              <p class="location-description">{{ location.description }}</p>

              <div class="location-coordinates">
                <i class="lucide-map-pin"></i>
                <span>
                  {{ location.coordinates.x.toFixed(4) }},
                  {{ location.coordinates.y.toFixed(4) }}
                </span>
              </div>

              <!-- Maintenance Badge -->
              <div
                v-if="location.isUnderMaintenance === true"
                class="status-badge maintenance">
                <i class="lucide-alert-triangle"></i>
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
        <div class="locapp-add-btn-container">
          <button class="locapp-add-btn">
            <i class="fas fa-plus"></i> Add New Place
          </button>
        </div>
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
              class="modal-img clickable-image"
              @click="open360Viewer(selectedLocationDetails)"
              title="Click to view in 360°" />
            <div class="image-overlay-hint">
              <i class="fas fa-expand-arrows-alt"></i>
              <span>Click for 360° view</span>
            </div>
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
    <div
      v-if="showLearningProgress"
      class="learning-progress-modal-overlay"
      @click="closeLearningProgress">
      <div class="learning-progress-modal" @click.stop>
        <div class="learning-progress-modal-content">
          <div class="learning-modal-header">
            <h2>
              <i class="bx bx-brain"></i>
              Learning Progress
            </h2>
            <button @click="closeLearningProgress" class="close-modal-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="learning-modal-body">
            <LearningProgressTracker :visible="showLearningProgress" />
          </div>
        </div>
      </div>
    </div>

    <!-- Tracker mounts inside the modal; real-time will re-run when opened -->

    <!-- 360 Image Viewer Modal -->
    <div v-if="show360Viewer" class="image-360-modal" @click="close360Viewer">
      <div class="image-360-container" @click.stop>
        <div class="image-360-header">
          <h3>{{ current360Image?.name || 'Location 360° View' }}</h3>
          <button @click="close360Viewer" class="close-360-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="image-360-viewer" ref="viewer360">
          <canvas 
            ref="canvas360" 
            @mousedown="startDrag"
            @mousemove="drag"
            @mouseup="endDrag"
            @mouseleave="endDrag"
            @touchstart="startTouch"
            @touchmove="moveTouch"
            @touchend="endTouch"
            @wheel="zoom">
          </canvas>
          <div class="viewer-controls">
            <button @click="resetView" class="control-btn">
              <i class="fas fa-undo"></i> Reset View
            </button>
            <div class="zoom-controls">
              <button @click="zoomIn" class="control-btn">
                <i class="fas fa-plus"></i>
              </button>
              <button @click="zoomOut" class="control-btn">
                <i class="fas fa-minus"></i>
              </button>
            </div>
          </div>
          <div class="viewer-instructions">
            <p><i class="fas fa-mouse"></i> Drag to rotate • <i class="fas fa-search-plus"></i> Scroll to zoom</p>
          </div>
        </div>
      </div>
    </div>

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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
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
import AnimalInfoModal from "@/components/AnimalInfoModal.vue";
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

// 360 Image Viewer state
const show360Viewer = ref(false);
const current360Image = ref(null);

// Animal modal state
const showAnimalModal = ref(false);
const selectedAnimal = ref(null);

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
  { key: "facility", name: "Facilities", icon: "map-marker-alt" },
  { key: "landmark", name: "Landmarks", icon: "monument" },
  { key: "plant_areas", name: "Plants", icon: "leaf" },
  { key: "animal_enclosure", name: "Animals", icon: "paw" },
  { key: "cr", name: "Restroom", icon: "restroom" },
  { key: "parking", name: "Parking", icon: "parking" },
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
  
  // Add resize handler for 360 viewer
  window.addEventListener('resize', handle360Resize);
});

onUnmounted(() => {
  cleanupVoiceSearch();
  // Clean up modal event listeners and body scroll
  document.removeEventListener("keydown", handleModalKeydown);
  document.body.classList.remove("modal-open");
  // Remove resize handler
  window.removeEventListener('resize', handle360Resize);
  // Clean up 360 viewer
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
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

// 360 Image Viewer methods
const canvas360 = ref(null);
const viewer360 = ref(null);
let isDragging = false;
let lastX = 0;
let rotationX = 0;
let scale = 1;
let velocity = 0; // For momentum scrolling
let img360 = null;
let animationId = null;

function open360Viewer(location) {
  current360Image.value = location;
  show360Viewer.value = true;
  
  // Wait for the next tick to ensure the canvas is rendered
  nextTick(() => {
    init360Viewer();
  });
}

function close360Viewer() {
  show360Viewer.value = false;
  current360Image.value = null;
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  resetViewerState();
}

function resetViewerState() {
  rotationX = 0;
  // Remove rotationY since we're only doing horizontal 360
  scale = 1;
  isDragging = false;
}

function init360Viewer() {
  if (!canvas360.value) return;
  
  const canvas = canvas360.value;
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = viewer360.value.clientWidth;
  canvas.height = viewer360.value.clientHeight;
  
  // Load the image
  img360 = new Image();
  img360.crossOrigin = 'anonymous';
  img360.onload = () => {
    draw360Image();
  };
  
  // Use the location's imageUrl or a default 360 image
  // For demo purposes, we'll simulate a 360 effect with the regular image
  img360.src = current360Image.value?.imageUrl || '/placeholder.svg?height=400&width=800';
}

function draw360Image() {
  if (!canvas360.value || !img360) return;
  
  const canvas = canvas360.value;
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Save context state
  ctx.save();
  
  // Apply transformations (only horizontal movement and scale)
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(scale, scale);
  // Remove vertical rotation - only horizontal panning
  
  // Calculate image dimensions to fit canvas while maintaining aspect ratio
  const imgAspect = img360.width / img360.height;
  const canvasAspect = canvas.width / canvas.height;
  
  let drawWidth, drawHeight;
  if (imgAspect > canvasAspect) {
    drawHeight = canvas.height / scale;
    drawWidth = drawHeight * imgAspect;
  } else {
    drawWidth = canvas.width / scale;
    drawHeight = drawWidth / imgAspect;
  }
  
  // Apply horizontal rotation effect by offsetting the image
  // Make the movement smoother and more predictable
  const normalizedRotation = (rotationX % (drawWidth * 2)) / 2;
  const offsetX = normalizedRotation;
  
  // Draw the image multiple times to create seamless horizontal rotation
  // Use a wider coverage to ensure smooth transitions
  ctx.drawImage(img360, -drawWidth / 2 - offsetX, -drawHeight / 2, drawWidth, drawHeight);
  ctx.drawImage(img360, drawWidth / 2 - offsetX, -drawHeight / 2, drawWidth, drawHeight);
  ctx.drawImage(img360, -drawWidth * 1.5 - offsetX, -drawHeight / 2, drawWidth, drawHeight);
  ctx.drawImage(img360, drawWidth * 1.5 - offsetX, -drawHeight / 2, drawWidth, drawHeight);
  
  // Restore context state
  ctx.restore();
}

// Mouse event handlers
function startDrag(event) {
  isDragging = true;
  lastX = event.clientX;
  velocity = 0; // Reset velocity when starting new drag
  
  // Stop any ongoing momentum animation
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  event.preventDefault();
}

function drag(event) {
  if (!isDragging) return;
  
  const deltaX = event.clientX - lastX;
  // Only allow horizontal rotation (no vertical)
  
  const movement = deltaX * 1.5; // Increased sensitivity for faster movement
  rotationX += movement;
  velocity = movement * 0.15; // Store velocity for momentum
  
  lastX = event.clientX;
  
  draw360Image();
  event.preventDefault();
}

function endDrag() {
  isDragging = false;
  // Start momentum if there's velocity (lowered threshold for better responsiveness)
  if (Math.abs(velocity) > 0.05) {
    startMomentum();
  }
}

function startMomentum() {
  function animate() {
    if (Math.abs(velocity) < 0.05) {
      velocity = 0;
      return;
    }
    
    rotationX += velocity;
    velocity *= 0.92; // Reduced friction for longer momentum
    
    draw360Image();
    animationId = requestAnimationFrame(animate);
  }
  
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  animationId = requestAnimationFrame(animate);
}

// Touch event handlers
function startTouch(event) {
  if (event.touches.length === 1) {
    const touch = event.touches[0];
    isDragging = true;
    lastX = touch.clientX;
    velocity = 0; // Reset velocity when starting new touch
    
    // Stop any ongoing momentum animation
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }
  event.preventDefault();
}

function moveTouch(event) {
  if (!isDragging || event.touches.length !== 1) return;
  
  const touch = event.touches[0];
  const deltaX = touch.clientX - lastX;
  // Only allow horizontal rotation (no vertical)
  
  const movement = deltaX * 1.5; // Increased sensitivity for faster movement
  rotationX += movement;
  velocity = movement * 0.15; // Store velocity for momentum
  
  lastX = touch.clientX;
  
  draw360Image();
  event.preventDefault();
}

function endTouch() {
  isDragging = false;
  // Start momentum if there's velocity (lowered threshold for better responsiveness)
  if (Math.abs(velocity) > 0.05) {
    startMomentum();
  }
}

// Zoom handlers
function zoom(event) {
  const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
  scale *= zoomFactor;
  scale = Math.max(0.5, Math.min(3, scale)); // Limit zoom range
  
  draw360Image();
  event.preventDefault();
}

function zoomIn() {
  scale *= 1.2;
  scale = Math.min(3, scale);
  draw360Image();
}

function zoomOut() {
  scale *= 0.8;
  scale = Math.max(0.5, scale);
  draw360Image();
}

function resetView() {
  resetViewerState();
  draw360Image();
}

function handle360Resize() {
  if (show360Viewer.value && canvas360.value && viewer360.value) {
    canvas360.value.width = viewer360.value.clientWidth;
    canvas360.value.height = viewer360.value.clientHeight;
    draw360Image();
  }
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
  if (showLearningProgress.value) {
    // Add keyboard event listener when modal opens
    document.addEventListener("keydown", handleModalKeydown);
    // Prevent body scroll when modal is open
    document.body.classList.add("modal-open");
  } else {
    // Remove keyboard event listener when modal closes
    document.removeEventListener("keydown", handleModalKeydown);
    // Restore body scroll
    document.body.classList.remove("modal-open");
  }
}

function closeLearningProgress() {
  showLearningProgress.value = false;
  // Remove keyboard event listener when modal closes
  document.removeEventListener("keydown", handleModalKeydown);
  // Restore body scroll
  document.body.classList.remove("modal-open");
}

// Handle keyboard events for modal
function handleModalKeydown(event) {
  if (event.key === "Escape" && showLearningProgress.value) {
    closeLearningProgress();
  }
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

/* Image Clickable Hint */
.location-modal-image {
  position: relative;
}

.clickable-image {
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.clickable-image:hover {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.image-overlay-hint {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.location-modal-image:hover .image-overlay-hint {
  opacity: 1;
}

/* 360 Image Viewer Modal */
.image-360-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.image-360-container {
  width: 95%;
  height: 95%;
  max-width: 1200px;
  max-height: 800px;
  background: #1a1a1a;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.image-360-header {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-360-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.close-360-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
}

.close-360-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.image-360-viewer {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

canvas {
  flex: 1;
  cursor: grab;
  user-select: none;
  width: 100%;
  height: 100%;
  touch-action: none; /* Prevent default touch behaviors */
}

canvas:active {
  cursor: grabbing;
}

.viewer-controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.zoom-controls {
  display: flex;
  gap: 5px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.viewer-instructions {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
}

.viewer-instructions p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.viewer-instructions i {
  color: #3498db;
}

/* Clickable image styling */
.modal-img {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.modal-img:hover {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.location-modal-image {
  position: relative;
}

.location-modal-image::after {
  content: "🔄 Click for 360° View";
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.location-modal-image:hover::after {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .image-360-container {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
  
  .image-360-header {
    padding: 15px;
  }
  
  .image-360-header h3 {
    font-size: 1.2rem;
  }
  
  .viewer-controls {
    bottom: 15px;
    left: 15px;
    flex-wrap: wrap;
  }
  
  .control-btn {
    padding: 8px;
    font-size: 12px;
  }
  
  .viewer-instructions {
    bottom: 15px;
    right: 15px;
    padding: 8px 12px;
    font-size: 11px;
  }
  
  .image-overlay-hint {
    font-size: 10px;
    padding: 6px 8px;
    bottom: 5px;
    right: 5px;
  }
}

@media (max-width: 480px) {
  .viewer-controls {
    position: static;
    background: rgba(0, 0, 0, 0.8);
    padding: 10px;
    justify-content: center;
  }
  
  .viewer-instructions {
    position: static;
    background: rgba(0, 0, 0, 0.8);
    padding: 8px;
    text-align: center;
    border-radius: 0;
  }
}
</style>
