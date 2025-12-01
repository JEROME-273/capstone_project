<template>
  <div class="locapp-container">
    <!-- Tama Modal (teleported to body) -->
    <teleport to="body">
      <div v-if="showTama" class="tama-overlay" @click="showTama = false">
        <div class="tama-container" @click.stop>
          <div class="speech-bubble">
            iNavPark is an innovative system that blends nature and technology
            by providing smart navigation, QR-based animal information, and
            interactive learning experiences inside the park.
            <div class="speech-arrow"></div>
          </div>
          <img src="@/assets/tama.png" alt="Tama" class="tama-character" />
        </div>
      </div>
    </teleport>

    <!-- Learning Tips Modal (teleported to body so it's outside any other modals) -->
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

    <!-- Feedback Modal (teleported to body) -->
    <teleport to="body">
      <FeedbackModal
        :visible="showFeedbackModal"
        @close="showFeedbackModal = false" />
    </teleport>

    <!-- Weather Hero Section with integrated navbar -->
    <section class="weather-hero" :class="weatherClass">
      <!-- Navbar contents placed at the top -->
      <div class="hero-header">
        <div class="navbar-left">
          <!-- Logo as button that shows Tama -->
          <button
            class="logo-btn"
            @click="showTama = true"
            aria-label="Show Tama welcome">
            <img
              src="@/assets/inavparklogo1.png"
              alt="iNavPark"
              class="farm-logo" />
          </button>
        </div>

        <div class="navbar-actions">
          <!-- Top header actions moved to bottom nav for mobile-style layout -->
        </div>
      </div>

      <!-- Animated Weather Effects -->
      <div class="weather-animation">
        <!-- ☁️ Clouds -->
        <div
          v-if="
            ['cloudy-weather', 'rainy-weather', 'windy-weather'].includes(
              weatherClass
            )
          "
          class="cloud cloud-1"></div>

        <div
          v-if="
            ['cloudy-weather', 'rainy-weather', 'windy-weather'].includes(
              weatherClass
            )
          "
          class="cloud cloud-2"></div>

        <div
          v-if="
            ['cloudy-weather', 'rainy-weather', 'windy-weather'].includes(
              weatherClass
            )
          "
          class="cloud cloud-3"></div>

        <div
          v-if="
            ['cloudy-weather', 'rainy-weather', 'windy-weather'].includes(
              weatherClass
            )
          "
          class="cloud cloud-4"></div>

        <div
          v-if="
            ['cloudy-weather', 'rainy-weather', 'windy-weather'].includes(
              weatherClass
            )
          "
          class="cloud cloud-5"></div>

        <div
          v-if="
            ['cloudy-weather', 'rainy-weather', 'windy-weather'].includes(
              weatherClass
            )
          "
          class="cloud cloud-6"></div>

        <!-- 🌧️ Rain -->
        <div v-if="weatherClass === 'rainy-weather'" class="rain">
          <span v-for="n in 40" :key="n" class="raindrop"></span>
        </div>

        <!-- 💨 Wind -->
        <div
          v-if="weatherClass === 'windy-weather'"
          class="wind-lines"
          :style="{ '--windspeed': weather.wind || 10 }">
          <span v-for="n in 10" :key="n"></span>
        </div>

        <!-- ☀️ Sun -->
        <div v-if="weatherClass === 'sunny-weather'" class="sun"></div>
      </div>

      <!-- Weather Content -->
      <div class="weather-content">
        <!-- Left Section -->
        <div class="weather-left">
          <div class="temp-icon">
            <span class="temp">{{
              weather.temp !== null ? weather.temp + "°" : "--"
            }}</span>
            <!-- BACK TO NORMAL WEATHER ICON -->
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
        </div>

        <!-- Right Section -->
        <div class="weather-right">
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

    <!-- Local Tip Section (short tips based on weather / outdoors) -->
    <section class="local-tip" aria-label="Local tip" v-if="currentLocalTip">
      <div
        class="local-tip-card"
        @click="refreshLocalTip"
        role="button"
        tabindex="0">
        <div class="tip-icon">{{ getTipIcon() }}</div>
        <div class="tip-body">
          <div class="tip-title">Local Tip</div>
          <div class="tip-text">{{ currentLocalTip }}</div>
        </div>
      </div>
    </section>

    <!-- Floating Feedback Button (icon only) -->
    <button
      @click="openFeedbackModal"
      class="feedback-btn"
      aria-label="Feedback">
      <i class="fas fa-comment-alt"></i>
    </button>

    <!-- Hidden audio element for background music -->
    <audio ref="backgroundMusic" loop preload="auto" autoplay>
      <source src="@/assets/Bluewave_Achievement.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>

    <br />
    <div class="locapp-content" @click.stop>
      <!-- Greeting card: shows personalized greeting based on time and weather -->
      <div
        class="greeting-card simple"
        v-if="
          greetingText &&
          showGreeting &&
          auth.currentUser &&
          !auth.currentUser.isAnonymous
        "
        @click="hideGreeting">
        <div class="greeting-backdrop"></div>
        <div class="greeting-content">
          <div class="greeting-bubble">
            <div class="greeting-main">{{ greetingText }}</div>
          </div>
          <img
            src="@/assets/tamawelcome.png"
            alt="Welcome character"
            class="greeting-character" />
        </div>
      </div>

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

      <!-- Featured Spots Carousel (top 3 most visited) -->
      <section
        class="featured-spots"
        v-if="featuredSpots.length && !searchQuery">
        <div class="featured-header">
          <h3>LOCAL FAVORITE</h3>
        </div>

        <div class="featured-carousel">
          <div class="featured-track" ref="featuredTrack">
            <div
              class="featured-slide"
              v-for="(item, idx) in featuredSpots"
              :key="item.location.id"
              :class="{ active: idx === currentFeaturedIndex }">
              <div
                class="locapp-location-card"
                @click="goToLocation(item.location)">
                <div class="location-image">
                  <img
                    :src="
                      item.location.imageUrl ||
                      '/placeholder.svg?height=160&width=240'
                    "
                    :alt="item.location.name"
                    class="location-img" />
                  <button
                    @click.stop="showLocationDetails(item.location)"
                    class="location-info-btn-image"
                    aria-label="View location details">
                    <i class="fas fa-info-circle"></i>
                  </button>
                </div>
                <div class="location-info">
                  <h3 class="location-name">{{ item.location.name }}</h3>
                  <p class="location-description">
                    {{ item.location.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <!-- Contact / Reservation Section removed — now available via Contact modal -->
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

    <!-- Bottom navigation (device-style) -->
    <nav
      v-if="!isARActive"
      class="bottom-nav"
      role="navigation"
      aria-label="Bottom navigation">
      <button
        class="nav-item learning-btn"
        @click="toggleLearningProgress"
        title="Learning"
        aria-label="Open learning progress">
        <div class="learning-icon">
          <i class="bx bx-brain"></i>
          <div v-if="userLearningStreak > 0" class="streak-badge">
            {{ userLearningStreak }}
          </div>
        </div>
      </button>

      <router-link to="/qr-scan-aw" class="nav-item scan-btn" aria-label="Scan">
        <i class="fas fa-qrcode"></i>
      </router-link>

      <router-link
        to="/userinfo"
        class="nav-item profile-btn"
        aria-label="Profile">
        <i class="fas fa-user-circle"></i>
      </router-link>

      <!-- Notifications modal trigger icon -->
      <button
        class="nav-item notifications-modal-btn"
        @click="openNotificationsModal"
        aria-label="Notifications Modal"
        title="Notifications">
        <i class="fas fa-bell"></i>
      </button>

      <button
        class="nav-item contact-btn"
        @click="openContactModal"
        aria-label="Contact"
        title="Contact">
        <i class="fas fa-phone"></i>
      </button>
    </nav>

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

    <!-- Notification Fullscreen Modal -->
    <NotificationModal
      :visible="showNotificationModal"
      @close="closeNotificationsModal"
      @startNavigation="handleNotificationNavigation" />

    <!-- Contact Modal -->
    <div
      v-if="showContactModal"
      class="contact-modal-overlay"
      @click="closeContactModal">
      <div class="contact-modal" @click.stop>
        <div class="contact-modal-header">
          <h3>Contact & Reservations</h3>
          <button
            class="close-modal-btn"
            @click="closeContactModal"
            aria-label="Close contact modal">
            ×
          </button>
        </div>

        <div class="contact-modal-body">
          <p class="section-subtitle">
            Reserve the venue for your event — reach us by phone, Facebook, or
            email. We'll get back to you quickly.
          </p>

          <div class="contact-cards modal-cards">
            <a
              class="contact-card phone"
              href="tel:+639123456789"
              aria-label="Call or WhatsApp">
              <div class="info">
                <div class="icon-text">
                  <i class="fas fa-phone"></i>
                  <div class="label">Call / WhatsApp</div>
                </div>
                <div class="value">+63 912 345 6789</div>
              </div>
            </a>

            <a
              class="contact-card fb"
              href="https://facebook.com/YourPage"
              target="_blank"
              rel="noopener"
              aria-label="Facebook page">
              <div class="info">
                <div class="icon-text">
                  <i class="fab fa-facebook-f"></i>
                  <div class="label">Facebook</div>
                </div>
                <div class="value">@InavParkOfficial</div>
              </div>
            </a>

            <a
              class="contact-card email"
              href="mailto:reservations@inavpark.ph"
              aria-label="Send email">
              <div class="info">
                <div class="icon-text">
                  <i class="fas fa-envelope"></i>
                  <div class="label">Email</div>
                </div>
                <div class="value">reservations@inavpark.ph</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Tracker mounts inside the modal; real-time will re-run when opened -->

    <!-- 360 Image Viewer Modal -->
    <div v-if="show360Viewer" class="image-360-modal" @click="close360Viewer">
      <div class="image-360-container" @click.stop>
        <div class="image-360-header">
          <h3>{{ current360Image?.name || "Location 360° View" }}</h3>
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
            <p>
              <i class="fas fa-mouse"></i> Drag to rotate •
              <i class="fas fa-search-plus"></i> Scroll to zoom
            </p>
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
import { fetchRemoteTips } from "@/services/LocalTipsService";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  limit,
  doc,
  getDoc,
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
import FeedbackModal from "@/components/FeedbackModal.vue";
import NotificationModal from "@/components/NotificationModal.vue";
import { checkRainSoon } from "@/services/WeatherService";
import NotificationService from "@/services/NotificationService";
import VoiceService from "@/services/VoiceService";

// App state
const searchQuery = ref("");
const selectedCategory = ref(null);
const showAllCategories = ref(false);
const adminLocations = ref([]);
const isLoading = ref(true);

// Weather state
const weather = ref({
  temp: null,
  condition: "",
  humidity: null,
  wind: null,
  date: new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
});

// Local tips (short actionable tips with support for pin/dismiss and remote fetch)
const tipPool = ref([
  {
    text: "Stay hydrated! Bring water bottles, especially on warm days.",
    tags: ["default", "health"],
  },
  {
    text: "Wear comfortable walking shoes - you'll be exploring trails.",
    tags: ["default"],
  },
  {
    text: "Apply sunscreen before your visit to protect from UV rays.",
    tags: ["sunny", "health"],
  },
  {
    text: "Check weather conditions and dress in layers for comfort.",
    tags: ["default", "weather"],
  },
  {
    text: "Keep a safe distance from animals - observe, don't disturb.",
    tags: ["wildlife", "safety"],
  },
  {
    text: "Follow marked trails to protect natural habitats.",
    tags: ["conservation", "safety"],
  },
  {
    text: "Bring reusable bags for trash - help keep the park clean.",
    tags: ["conservation"],
  },
  {
    text: "Plan your visit during early morning for the best experience.",
    tags: ["default", "planning"],
  },
  {
    text: "Supervise children near water features and animal areas.",
    tags: ["family", "safety"],
  },
  {
    text: "Take only photos, leave only footprints - preserve nature.",
    tags: ["conservation"],
  },
]);

const currentLocalTip = ref("");
const pinnedTip = ref(null); // persisted in localStorage if user pins a tip
const dismissedTips = ref([]); // session dismissed tips (texts)

// Rotation state: keep a short history to avoid repeating similar tips
const recentTipsShown = ref([]);
const tipRotateIntervalId = ref(null);
const tipCountdownIntervalId = ref(null);
const TIP_ROTATION_MS = 20000; // 20 seconds
const tipCountdown = ref(Math.floor(TIP_ROTATION_MS / 1000));

function loadTipPreferences() {
  try {
    const p = localStorage.getItem("inav_local_tip_pinned");
    if (p) pinnedTip.value = JSON.parse(p);
  } catch (e) {
    pinnedTip.value = null;
  }
}

function savePinnedTip() {
  try {
    if (pinnedTip.value)
      localStorage.setItem(
        "inav_local_tip_pinned",
        JSON.stringify(pinnedTip.value)
      );
    else localStorage.removeItem("inav_local_tip_pinned");
  } catch (e) {}
}

function pickLocalTip() {
  try {
    // If user pinned a tip, show it
    if (
      pinnedTip.value &&
      pinnedTip.value.text &&
      !dismissedTips.value.includes(pinnedTip.value.text)
    ) {
      currentLocalTip.value = pinnedTip.value.text;
      return;
    }

    const cond = (weather.value.condition || "").toLowerCase();
    // prefer tips matching weather tag; keep defaults too
    const matching = tipPool.value.filter(
      (t) =>
        !dismissedTips.value.includes(t.text) &&
        t.tags.some((tag) => tag === "default" || cond.includes(tag))
    );
    const pool = matching.length
      ? matching
      : tipPool.value.filter((t) => !dismissedTips.value.includes(t.text));
    if (!pool || pool.length === 0) {
      currentLocalTip.value = "";
      return;
    }
    const idx = Math.floor(Math.random() * pool.length);
    currentLocalTip.value = pool[idx].text;
  } catch (e) {
    currentLocalTip.value = tipPool.value[0]?.text || "";
  }
}

function refreshLocalTip() {
  pickDistinctTip();
  // reset countdown when user manually refreshes
  try {
    tipCountdown.value = Math.floor(TIP_ROTATION_MS / 1000);
  } catch (e) {}
}

// Pick a tip that is meaningfully different from recently shown ones
function pickDistinctTip() {
  try {
    // Respect pinned tip (show pinned tip continuously)
    if (
      pinnedTip.value &&
      pinnedTip.value.text &&
      !dismissedTips.value.includes(pinnedTip.value.text)
    ) {
      currentLocalTip.value = pinnedTip.value.text;
      return;
    }

    const pool = tipPool.value.filter(
      (t) => !dismissedTips.value.includes(t.text)
    );
    if (!pool || pool.length === 0) {
      currentLocalTip.value = "";
      return;
    }

    const lastText = currentLocalTip.value || null;
    const lastTip = tipPool.value.find((t) => t.text === lastText) || null;
    const lastTag = lastTip?.tags?.[0] || null;

    const recentSet = new Set(recentTipsShown.value);

    // Exclude exact recent texts and the current text first
    let candidates = pool.filter(
      (t) => t.text !== lastText && !recentSet.has(t.text)
    );
    if (candidates.length === 0) {
      // fallback: allow candidates that are not the immediate last
      candidates = pool.filter((t) => t.text !== lastText);
    }

    // Prefer candidates with a different primary tag for variety
    let diffTagCandidates = candidates.filter((t) => {
      const tag = t.tags?.[0] || "";
      return lastTag ? tag !== lastTag : true;
    });

    const finalPool = diffTagCandidates.length ? diffTagCandidates : candidates;
    const idx = Math.floor(Math.random() * finalPool.length);
    const choice = finalPool[idx];

    currentLocalTip.value = choice.text;

    // reset countdown whenever we pick a new tip
    try {
      tipCountdown.value = Math.floor(TIP_ROTATION_MS / 1000);
    } catch (e) {}

    // push to recent history (keep only last 8 shown)
    recentTipsShown.value.push(choice.text);
    if (recentTipsShown.value.length > 8) recentTipsShown.value.shift();
  } catch (e) {
    // fallback to original picker on error
    pickLocalTip();
  }
}

function dismissCurrentTip() {
  if (!currentLocalTip.value) return;
  dismissedTips.value.push(currentLocalTip.value);
  currentLocalTip.value = "";
}

function togglePinTip() {
  if (!currentLocalTip.value) return;
  if (pinnedTip.value && pinnedTip.value.text === currentLocalTip.value) {
    pinnedTip.value = null;
  } else {
    pinnedTip.value = { text: currentLocalTip.value };
  }
  savePinnedTip();
}

// Remote tips: try to fetch from configured endpoint and merge
async function tryLoadRemoteTips() {
  const endpoint = import.meta.env.VITE_TIPS_ENDPOINT || "";

  // Try custom endpoint first
  if (endpoint) {
    try {
      const remote = await fetchRemoteTips(endpoint);
      if (Array.isArray(remote) && remote.length) {
        const existing = new Set(tipPool.value.map((t) => t.text));
        remote.forEach((t) => {
          if (!existing.has(t.text)) tipPool.value.push(t);
        });
      }
    } catch (e) {
      console.warn("Custom tips endpoint failed:", e.message || e);
    }
  }

  // Fetch additional tips from online API as fallback/supplement
  try {
    const response = await fetch("https://api.adviceslip.com/advice");
    if (response.ok) {
      const data = await response.json();
      if (data?.slip?.advice) {
        const existing = new Set(tipPool.value.map((t) => t.text));
        const newTip = {
          text: data.slip.advice,
          tags: ["default", "general"],
        };
        if (!existing.has(newTip.text)) {
          tipPool.value.push(newTip);
        }
      }
    }
  } catch (e) {
    console.warn("Online tips API failed:", e.message || e);
  }

  // Fetch a few more tips
  try {
    const parkTips = [
      "Stay on marked paths to protect wildlife habitats.",
      "Bring reusable water bottles to reduce plastic waste.",
      "Check weather conditions before your visit.",
      "Take only photos, leave only footprints.",
      "Report any wildlife emergencies to park staff immediately.",
    ];
    const existing = new Set(tipPool.value.map((t) => t.text));
    parkTips.forEach((text) => {
      if (!existing.has(text)) {
        tipPool.value.push({ text, tags: ["default", "conservation"] });
      }
    });
  } catch (e) {
    // ignore
  }
}

// Initialize tip and refresh when weather updates
onMounted(async () => {
  loadTipPreferences();
  await tryLoadRemoteTips();
  // pick an initial distinct tip
  pickDistinctTip();

  // Start automatic rotation every TIP_ROTATION_MS
  try {
    if (tipRotateIntervalId.value) clearInterval(tipRotateIntervalId.value);
    tipRotateIntervalId.value = setInterval(() => {
      pickDistinctTip();
    }, TIP_ROTATION_MS);

    // start per-second countdown so users see time left
    if (tipCountdownIntervalId.value)
      clearInterval(tipCountdownIntervalId.value);
    tipCountdown.value = Math.floor(TIP_ROTATION_MS / 1000);
    tipCountdownIntervalId.value = setInterval(() => {
      try {
        tipCountdown.value = Math.max(0, tipCountdown.value - 1);
        if (tipCountdown.value === 0) {
          // reset display seconds (the rotation will run on its own schedule)
          tipCountdown.value = Math.floor(TIP_ROTATION_MS / 1000);
        }
      } catch (e) {
        // ignore
      }
    }, 1000);
  } catch (e) {
    console.warn("Tip rotation setup failed", e);
  }
});
watch(
  () => weather.value.condition,
  () => {
    // When weather changes, pick a tip that matches the new context but stays distinct
    pickDistinctTip();
  }
);

function getTipIcon() {
  try {
    const txt = currentLocalTip.value || "";
    const found =
      tipPool.value.find((t) => t.text === txt) ||
      tipPool.value.find((t) => t.tags && t.tags.includes("default"));
    const tag = found?.tags?.[0] || "default";
    if (tag.includes("rain")) return "🌧️";
    if (tag.includes("sun")) return "☀️";
    if (tag.includes("wind")) return "💨";
    return "💡";
  } catch (e) {
    return "💡";
  }
}

const showLocationModal = ref(false);
const selectedLocationDetails = ref(null);

// 360 Image Viewer state
const show360Viewer = ref(false);
const current360Image = ref(null);

// Animal modal state
const showAnimalModal = ref(false);
const selectedAnimal = ref(null);

// Feedback modal state
const showFeedbackModal = ref(false);
// Notifications fullscreen modal state
const showNotificationModal = ref(false);

// Contact modal state
const showContactModal = ref(false);

// Background Music state
const backgroundMusic = ref(null);
const isMusicPlaying = ref(false);
const musicVolume = ref(50);
const showVolumeControl = ref(false);

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

// Featured spots (top 3 most visited)
const featuredSpots = ref([]); // array of { location, count }
const currentFeaturedIndex = ref(0);
const featuredTrack = ref(null);

// Auto-advance featured carousel (no visible controls)
const FEATURED_ROTATE_MS = 10000; // rotate every 10s
const featuredRotateIntervalId = ref(null);

function startFeaturedAutoRotate() {
  try {
    stopFeaturedAutoRotate();
    if (!featuredSpots.value || featuredSpots.value.length <= 1) return;
    featuredRotateIntervalId.value = setInterval(() => {
      if (!featuredSpots.value || featuredSpots.value.length <= 1) return;
      currentFeaturedIndex.value =
        (currentFeaturedIndex.value + 1) % featuredSpots.value.length;
    }, FEATURED_ROTATE_MS);
  } catch (e) {
    console.warn("startFeaturedAutoRotate failed", e);
  }
}

function stopFeaturedAutoRotate() {
  try {
    if (featuredRotateIntervalId.value) {
      clearInterval(featuredRotateIntervalId.value);
      featuredRotateIntervalId.value = null;
    }
  } catch (e) {
    // ignore
  }
}

// When the featured index changes, bring the slide into view
watch(currentFeaturedIndex, (idx) => {
  nextTick(() => scrollToFeatured(idx));
});

// Start/stop auto-rotation when the list changes
watch(
  () => featuredSpots.value && featuredSpots.value.length,
  (len) => {
    if (len && len > 1) startFeaturedAutoRotate();
    else stopFeaturedAutoRotate();
  },
  { immediate: true }
);

async function computeFeaturedSpots() {
  try {
    const db = getFirestore();
    // Fetch recentDestinations entries to compute popularity
    const recentRef = collection(db, "recentDestinations");
    const recentSnap = await getDocs(recentRef);
    const counts = new Map();
    recentSnap.forEach((doc) => {
      const d = doc.data();
      const id = d.destinationId || d.destination || d.destinationId;
      if (!id) return;
      counts.set(id, (counts.get(id) || 0) + 1);
    });

    // Map adminLocations to include counts
    const mapped = adminLocations.value.map((loc) => {
      const id = loc.id;
      return {
        location: loc,
        count: counts.get(id) || loc.visitors || loc.visitCount || 0,
      };
    });

    // If recentDestinations is empty (counts.size === 0), fall back to visitors field or createdAt recency
    if (counts.size === 0) {
      // sort by visitors/visitCount if present, otherwise by createdAt
      mapped.sort((a, b) => {
        const av = a.location.visitors || a.location.visitCount || 0;
        const bv = b.location.visitors || b.location.visitCount || 0;
        if (av !== bv) return bv - av;
        const ad = a.location.createdAt
          ? new Date(a.location.createdAt).getTime()
          : 0;
        const bd = b.location.createdAt
          ? new Date(b.location.createdAt).getTime()
          : 0;
        return bd - ad;
      });
    } else {
      // sort by aggregated counts
      mapped.sort((a, b) => (b.count || 0) - (a.count || 0));
    }

    featuredSpots.value = mapped.slice(0, 3);
    currentFeaturedIndex.value = 0;
  } catch (e) {
    console.warn("computeFeaturedSpots failed", e);
    // fallback: pick first 3 locations
    featuredSpots.value = adminLocations.value
      .slice(0, 3)
      .map((l) => ({ location: l, count: 0 }));
  }
}

function prevFeatured() {
  if (!featuredSpots.value.length) return;
  currentFeaturedIndex.value =
    (currentFeaturedIndex.value - 1 + featuredSpots.value.length) %
    featuredSpots.value.length;
}

function nextFeatured() {
  if (!featuredSpots.value.length) return;
  currentFeaturedIndex.value =
    (currentFeaturedIndex.value + 1) % featuredSpots.value.length;
}

function scrollToFeatured(index) {
  try {
    const track = featuredTrack.value;
    if (!track) return;
    const child = track.children[index];
    if (!child) return;
    // Smooth scroll the container so the selected card is visible
    const container = track.parentElement; // .featured-carousel
    const left = child.offsetLeft - 12; // small padding
    container.scrollTo({ left, behavior: "smooth" });
  } catch (e) {
    // ignore
  }
}

function goToSlide(index) {
  currentFeaturedIndex.value = index;
}

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

// User greeting state
const firstName = ref("Guest");

// Cloud animation speed
const cloudSpeed = ref(25); // Default cloud animation speed

// Tama character state
const showTama = ref(false);

// Greeting visibility state (auto-hide with 6-hour timer)
const showGreeting = ref(false);
let greetingTimeout = null;
const GREETING_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

async function loadUserFirstName() {
  try {
    const user = auth.currentUser;
    if (!user) return;

    // First, try to get firstName from Firestore users collection
    try {
      const db = getFirestore();
      const udoc = await getDoc(doc(db, "users", user.uid));
      if (udoc.exists()) {
        const data = udoc.data();
        if (data.firstName) {
          firstName.value = data.firstName;
          return;
        }
        if (data.name) {
          firstName.value = data.name.split(" ")[0];
          return;
        }
      }
    } catch (e) {
      // ignore and continue to fallbacks
    }

    // Fallback to displayName if available
    if (user.displayName) {
      firstName.value = user.displayName.split(" ")[0];
      return;
    }

    // Last resort: use email local-part
    if (user.email) {
      firstName.value = user.email.split("@")[0];
      return;
    }
  } catch (e) {
    console.warn("loadUserFirstName failed", e);
  }
}

// Check if greeting should be shown based on 6-hour cooldown
function shouldShowGreeting() {
  try {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) return false;

    const storageKey = `greeting_last_shown_${user.uid}`;
    const lastShown = localStorage.getItem(storageKey);

    if (!lastShown) {
      // First time or no record - show greeting
      return true;
    }

    const lastShownTime = parseInt(lastShown, 10);
    const now = Date.now();
    const timeSinceLastShown = now - lastShownTime;

    // Show greeting if more than 6 hours have passed
    return timeSinceLastShown >= GREETING_COOLDOWN_MS;
  } catch (e) {
    console.warn("shouldShowGreeting check failed", e);
    return false;
  }
}

// Save the timestamp when greeting is shown
function saveGreetingTimestamp() {
  try {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) return;

    const storageKey = `greeting_last_shown_${user.uid}`;
    localStorage.setItem(storageKey, Date.now().toString());
  } catch (e) {
    console.warn("saveGreetingTimestamp failed", e);
  }
}

// Initialize greeting visibility on mount
function initializeGreeting() {
  if (shouldShowGreeting()) {
    showGreeting.value = true;
    saveGreetingTimestamp();

    // Auto-hide greeting after 10 seconds
    greetingTimeout = setTimeout(() => {
      hideGreeting();
    }, 10000);
  } else {
    showGreeting.value = false;
  }
}

const timeOfDay = computed(() => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
});

const weatherPhrase = computed(() => {
  const cond = (weather.value.condition || "").toLowerCase();
  if (
    cond.includes("rain") ||
    cond.includes("drizzle") ||
    cond.includes("shower")
  )
    return "cozy and rainy";
  if (cond.includes("sun") || cond.includes("clear")) return "bright and sunny";
  if (cond.includes("cloud") || cond.includes("overcast"))
    return "calm and cloudy";
  if (cond.includes("wind")) return "windy and fresh";
  return "pleasant";
});

const weatherIcon = computed(() => {
  const cond = (weather.value.condition || "").toLowerCase();
  if (
    cond.includes("rain") ||
    cond.includes("drizzle") ||
    cond.includes("shower")
  )
    return "🌧️";
  if (cond.includes("sun") || cond.includes("clear")) return "☀️";
  if (cond.includes("cloud") || cond.includes("overcast")) return "☁️";
  if (cond.includes("wind")) return "💨";
  return "🌡️";
});

const greetingText = computed(() => {
  // Build a short, vibe-forward greeting using time and weather
  const time = timeOfDay.value;
  const vibe = weatherPhrase.value;
  // Examples: "Good morning Gelo — the park feels bright and sunny. Perfect for a stroll."
  if (time === "morning")
    return `Good morning ${firstName.value} — it's ${vibe} this morning. Perfect for a stroll.`;
  if (time === "afternoon")
    return `Good afternoon ${firstName.value} — the day feels ${vibe}. A nice time to explore.`;
  if (time === "evening")
    return `Good evening ${firstName.value} — it's ${vibe} this evening. Enjoy the calm.`;
  return `Hello ${firstName.value} — hope you're having a ${vibe} time.`;
});

// Categories with enhanced mapping
const categories = ref([
  { key: "landmark", name: "Landmarks", icon: "monument" },
  { key: "plant_areas", name: "Plants", icon: "leaf" },
  { key: "animal_enclosure", name: "Animals", icon: "paw" },
  { key: "cr", name: "Restroom", icon: "restroom" },
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

// Weather class computed property
const weatherClass = computed(() => {
  if (!weather.value.condition) return "cloudy-weather";

  const condition = weather.value.condition.toLowerCase();
  console.log("Current weather condition:", condition);

  if (
    condition.includes("rain") ||
    condition.includes("drizzle") ||
    condition.includes("shower") ||
    condition.includes("thunderstorm")
  ) {
    return "rainy-weather";
  } else if (condition.includes("sun") || condition.includes("clear")) {
    return "sunny-weather";
  } else if (
    condition.includes("cloud") ||
    condition.includes("overcast") ||
    condition.includes("broken") ||
    condition.includes("scattered")
  ) {
    return "cloudy-weather";
  } else if (condition.includes("wind") || condition.includes("breeze")) {
    return "windy-weather";
  } else {
    return "cloudy-weather";
  }
});

// Weather animation SVG computed property (keeping for potential future use)
const weatherSVG = computed(() => {
  const w = weatherClass.value;

  // ☀️ Sunny
  if (w === "sunny-weather") {
    return `
      <svg width="70" height="70" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="22" fill="#FFD93D">
          <animate attributeName="r" values="20;22;20" dur="3s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
  }

  // 🌧️ Rainy
  if (w === "rainy-weather") {
    return `
      <svg width="70" height="70" viewBox="0 0 100 100">
        <ellipse cx="50" cy="40" rx="25" ry="18" fill="#A0AFC4"/>
        <line x1="40" y1="60" x2="40" y2="80" stroke="#4DA3FF" stroke-width="4">
          <animate attributeName="y2" values="80;90;80" dur="0.7s" repeatCount="indefinite"/>
        </line>
        <line x1="60" y1="60" x2="60" y2="80" stroke="#4DA3FF" stroke-width="4">
          <animate attributeName="y2" values="80;90;80" dur="0.6s" repeatCount="indefinite"/>
        </line>
      </svg>
    `;
  }

  // ☁️ Cloudy
  if (w === "cloudy-weather") {
    return `
      <svg width="70" height="70" viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="30" ry="20" fill="#BFC9D9">
          <animate attributeName="cx" values="48;52;48" dur="4s" repeatCount="indefinite"/>
        </ellipse>
      </svg>
    `;
  }

  // 💨 Windy
  if (w === "windy-weather") {
    return `
      <svg width="70" height="70" viewBox="0 0 100 100">
        <path d="M20 50 Q40 40 60 50 T90 50"
              stroke="#A3C1D9"
              stroke-width="6"
              fill="none">
          <animate attributeName="d"
                   values="
                     M20 50 Q40 40 60 50 T90 50;
                     M20 50 Q40 60 60 50 T90 50;
                     M20 50 Q40 40 60 50 T90 50"
                   dur="2s"
                   repeatCount="indefinite"/>
        </path>
      </svg>
    `;
  }

  return "";
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
  // Load the user's first name for the greeting
  await loadUserFirstName();

  // Initialize greeting based on 6-hour cooldown
  initializeGreeting();

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

  // Auto-play background music with user interaction fallback
  if (backgroundMusic.value) {
    // Check if there's saved music state
    const savedVolume = localStorage.getItem("backgroundMusicVolume");
    const savedTime = localStorage.getItem("backgroundMusicTime");

    if (savedVolume) {
      musicVolume.value = parseInt(savedVolume);
    }

    backgroundMusic.value.volume = musicVolume.value / 100;

    if (savedTime) {
      backgroundMusic.value.currentTime = parseFloat(savedTime);
    }

    backgroundMusic.value
      .play()
      .then(() => {
        isMusicPlaying.value = true;
        localStorage.setItem("backgroundMusicPlaying", "true");
      })
      .catch((err) => {
        console.log("Auto-play prevented, waiting for user interaction:", err);
        // Try playing on first user interaction
        const playOnInteraction = () => {
          if (backgroundMusic.value) {
            backgroundMusic.value
              .play()
              .then(() => {
                isMusicPlaying.value = true;
                localStorage.setItem("backgroundMusicPlaying", "true");
              })
              .catch(() => {});
          }
          document.removeEventListener("click", playOnInteraction);
          document.removeEventListener("touchstart", playOnInteraction);
        };
        document.addEventListener("click", playOnInteraction, { once: true });
        document.addEventListener("touchstart", playOnInteraction, {
          once: true,
        });
      });

    // Save state periodically
    setInterval(() => {
      if (backgroundMusic.value) {
        localStorage.setItem("backgroundMusicPlaying", isMusicPlaying.value);
        localStorage.setItem("backgroundMusicVolume", musicVolume.value);
        localStorage.setItem(
          "backgroundMusicTime",
          backgroundMusic.value.currentTime
        );
      }
    }, 1000);
  }

  // Add resize handler for 360 viewer
  window.addEventListener("resize", handle360Resize);

  // Add keyboard event listener for global shortcuts
  document.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
  cleanupVoiceSearch();
  // Clean up modal event listeners and body scroll
  document.removeEventListener("keydown", handleModalKeydown);
  document.removeEventListener("keydown", handleGlobalKeydown);
  document.body.classList.remove("modal-open");
  // Remove resize handler
  window.removeEventListener("resize", handle360Resize);
  // Clear greeting timeout if still active
  if (greetingTimeout) {
    clearTimeout(greetingTimeout);
    greetingTimeout = null;
  }
  // Clean up 360 viewer
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  // Clear tip rotation interval if set
  try {
    if (tipRotateIntervalId.value) {
      clearInterval(tipRotateIntervalId.value);
      tipRotateIntervalId.value = null;
    }
  } catch (e) {
    // ignore
  }
  // Clear countdown interval
  try {
    if (tipCountdownIntervalId.value) {
      clearInterval(tipCountdownIntervalId.value);
      tipCountdownIntervalId.value = null;
    }
  } catch (e) {
    // ignore
  }
  // Clear featured rotation interval
  try {
    if (featuredRotateIntervalId.value) {
      clearInterval(featuredRotateIntervalId.value);
      featuredRotateIntervalId.value = null;
    }
  } catch (e) {
    // ignore
  }
  // Don't stop background music - let it continue playing across pages
});

// Background music is managed globally through localStorage
// Music state persists across page navigation

// Watch for Tama state changes to auto-hide after 5 seconds
watch(showTama, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      showTama.value = false;
    }, 5000);
  }
});

// Global keyboard shortcuts
function handleGlobalKeydown(event) {
  // Escape key to close modals
  if (event.key === "Escape") {
    if (showLearningProgress.value) {
      closeLearningProgress();
    }
    if (showLocationModal.value) {
      closeLocationModal();
    }
    if (show360Viewer.value) {
      close360Viewer();
    }
    if (showTipsModal.value) {
      showTipsModal.value = false;
    }
    if (showTama.value) {
      showTama.value = false;
    }
  }

  // Ctrl+K or Cmd+K for search focus (common shortcut)
  if ((event.ctrlKey || event.metaKey) && event.key === "k") {
    event.preventDefault();
    const searchInput = document.querySelector(".locapp-search-input");
    if (searchInput) {
      searchInput.focus();
    }
  }
}

// Hide the greeting and clear the auto-hide timeout
function hideGreeting() {
  showGreeting.value = false;
  if (greetingTimeout) {
    clearTimeout(greetingTimeout);
    greetingTimeout = null;
  }
}

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

    // Show user-friendly error message
    if (event.error === "not-allowed") {
      alert(
        "Microphone access denied. Please allow microphone access to use voice search."
      );
    }
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
    await loadAdminLocations();
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    isLoading.value = false;
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
        visitors: data.visitors || data.visitCount || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    console.log(`Loaded ${adminLocations.value.length} admin locations`);
    attemptAutoStartFromQR();
    // compute featured spots after locations loaded
    computeFeaturedSpots();
  } catch (error) {
    console.error("Error loading admin locations:", error);
    // Show user-friendly error message
    alert(
      "Failed to load locations. Please check your internet connection and try again."
    );
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

function showLocationDetails(location) {
  selectedLocationDetails.value = location;
  showLocationModal.value = true;
}

function closeLocationModal() {
  showLocationModal.value = false;
  selectedLocationDetails.value = null;
}

function openFeedbackModal() {
  showFeedbackModal.value = true;
}

function openNotificationsModal() {
  showNotificationModal.value = true;
  document.body.classList.add("modal-open");
}

function closeNotificationsModal() {
  showNotificationModal.value = false;
  document.body.classList.remove("modal-open");
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
  const ctx = canvas.getContext("2d");

  // Set canvas size to full viewport dimensions at normal pixels
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  // Load the image
  img360 = new Image();
  img360.crossOrigin = "anonymous";
  img360.onload = () => {
    draw360Image();
  };
  img360.onerror = () => {
    console.error("Failed to load 360 image");
    // Fallback to placeholder
    img360.src = "/placeholder.svg?height=400&width=800";
  };

  // Use the location's imageUrl or a default 360 image
  img360.src =
    current360Image.value?.imageUrl || "/placeholder.svg?height=400&width=800";
}

function draw360Image() {
  if (!canvas360.value || !img360) return;

  const canvas = canvas360.value;
  const ctx = canvas.getContext("2d");

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
  ctx.drawImage(
    img360,
    -drawWidth / 2 - offsetX,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );
  ctx.drawImage(
    img360,
    drawWidth / 2 - offsetX,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );
  ctx.drawImage(
    img360,
    -drawWidth * 1.5 - offsetX,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );
  ctx.drawImage(
    img360,
    drawWidth * 1.5 - offsetX,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );

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
  if (show360Viewer.value && canvas360.value) {
    const canvas = canvas360.value;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = "100%";
    canvas.style.height = "100%";

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

  // Log navigation start (funnel event)
  (async () => {
    try {
      const { logNavigationStart } = await import(
        "@/services/AnalyticsService.js"
      );
      await logNavigationStart(location);
    } catch (e) {
      console.warn("Navigation start logging failed", e);
    }
  })();

  // Track destination selection for analytics
  trackDestinationSelection(location);

  // Stop background music when AR navigation starts
  if (backgroundMusic.value && !backgroundMusic.value.paused) {
    backgroundMusic.value.pause();
    isMusicPlaying.value = false;
    localStorage.setItem("backgroundMusicPlaying", "false");
  }

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
    const { logDestinationSelection } = await import(
      "@/services/AnalyticsService.js"
    );
    await logDestinationSelection(location);
    console.log(
      "Destination selection tracked via AnalyticsService:",
      location.name
    );
  } catch (error) {
    console.warn("AnalyticsService failed, using inline fallback:", error);
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
      }
    } catch (fallbackErr) {
      console.error("Fallback destination logging also failed:", fallbackErr);
    }
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

  // Resume background music when navigation stops
  if (backgroundMusic.value && backgroundMusic.value.paused) {
    backgroundMusic.value
      .play()
      .then(() => {
        isMusicPlaying.value = true;
        localStorage.setItem("backgroundMusicPlaying", "true");
      })
      .catch((err) => {
        console.warn("Failed to resume music:", err);
      });
  }
}

function handleStartNewNavigation() {
  // Stop current navigation
  isARActive.value = false;
  arDestination.value = null;

  // Resume background music when stopping to start new navigation
  if (backgroundMusic.value && backgroundMusic.value.paused) {
    backgroundMusic.value
      .play()
      .then(() => {
        isMusicPlaying.value = true;
        localStorage.setItem("backgroundMusicPlaying", "true");
      })
      .catch((err) => {
        console.warn("Failed to resume music:", err);
      });
  }

  // Show location selection by expanding the bottom sheet
  // Note: isExpanded is not defined in this component, might need to be added
  // isExpanded.value = true;

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
      weather.value.condition = data.weather[0].description;
      weather.value.humidity = data.main.humidity;
      weather.value.wind = data.wind.speed;
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
    // Set default values if API fails
    weather.value.temp = 25;
    weather.value.condition = "Partly cloudy";
    weather.value.humidity = 65;
    weather.value.wind = 5;
  }
}

// Scroll to contact/reservation section on page
function scrollToContact() {
  try {
    const el = document.querySelector(".contact-reserve-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    // fallback: try to navigate to /userinfo or top if element not found
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  } catch (e) {
    console.warn("scrollToContact failed", e);
  }
}

function openContactModal() {
  showContactModal.value = true;
  // prevent background scroll
  document.body.classList.add("modal-open");
}

function closeContactModal() {
  showContactModal.value = false;
  document.body.classList.remove("modal-open");
}
</script>

<style scoped>
@import "@/assets/allstyle.css";
</style>
