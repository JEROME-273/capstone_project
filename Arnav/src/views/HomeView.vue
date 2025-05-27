<template>
  <!-- Keep your existing template code -->
  <div class="app">
    <!-- Add the Navbar component -->
    <Navbar />

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-message">{{ loadingMessage }}</div>
      </div>
    </div>

    <!-- Main content -->
    <div class="app-container">
      <!-- Map container - hide when AR is started -->
      <div id="map" class="map-container" :class="{ hidden: arStarted }"></div>

      <!-- Search bar - hide when AR is started -->
      <div class="search-container" :class="{ hidden: arStarted }">
        <div class="search-bar">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search for a destination..."
            class="search-input" />
          <VoiceSearch
            @result="handleVoiceSearchResult"
            @error="handleVoiceError"
            class="voice-search" />
        </div>

        <!-- Search results -->
        <div
          v-if="showSearchResults && searchResults.length > 0"
          class="search-results">
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="search-result-item"
            @click="selectDestination(result)">
            <div class="result-name">{{ result.name }}</div>
            <div class="result-address">{{ result.address }}</div>
          </div>
        </div>

        <!-- Show Recent Destinations button (when hidden) -->
        <button
          v-if="
            !showSearchResults &&
            recentDestinations.length > 0 &&
            !selectedDestination &&
            !showRecentDestinations
          "
          @click="toggleRecentDestinations"
          class="show-recent-btn">
          Show Recent Destinations
        </button>

        <!-- Recent destinations -->
        <div
          v-if="
            !showSearchResults &&
            recentDestinations.length > 0 &&
            !selectedDestination &&
            showRecentDestinations
          "
          class="recent-destinations">
          <div class="recent-destinations-header">
            <h3>Recent Destinations</h3>
            <button @click="toggleRecentDestinations" class="toggle-recent-btn">
              Hide
            </button>
          </div>
          <div
            v-for="destination in recentDestinations"
            :key="destination.id"
            class="recent-destination-item"
            @click="selectSavedDestination(destination)">
            <div class="destination-name">{{ destination.name }}</div>
            <div class="destination-address">{{ destination.address }}</div>
          </div>
        </div>
      </div>

      <!-- Navigation info panel (shown when destination is selected) - hide when AR is started -->
      <div
        v-if="selectedDestination && !arStarted"
        class="navigation-info-panel">
        <div class="destination-info">
          <h3>{{ selectedDestination.name }}</h3>
          <p>{{ selectedDestination.address }}</p>
          <div class="route-info" v-if="routeData">
            <div class="info-item">
              <span class="info-label">Distance:</span>
              <span class="info-value">{{
                formatDistance(distanceToDestination)
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ETA:</span>
              <span class="info-value">{{ estimatedTimeOfArrival }}</span>
            </div>
          </div>
        </div>
        <button @click="startNavigation" class="start-navigation-btn">
          Start AR Navigation
        </button>
      </div>

      <!-- AR Navigation view (shown when navigation is started) -->
      <div v-if="arStarted" class="ar-navigation-view">
        <ARNavigation
          :navigationPath="navigationPath"
          :currentLocation="currentLocation"
          :selectedDestination="selectedDestination"
          :currentInstruction="currentInstruction"
          :nextManeuverDistance="nextManeuverDistance"
          :compassHeading="compassHeading"
          :deviceOrientation="deviceOrientation"
          :showArrows="showArrows" />

        <!-- Navigation controls -->
        <div class="navigation-controls">
          <div class="navigation-info">
            <div class="info-item">
              <span class="info-label">Distance:</span>
              <span class="info-value">{{
                formatDistance(distanceToDestination)
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ETA:</span>
              <span class="info-value">{{ estimatedTimeOfArrival }}</span>
            </div>
          </div>

          <div class="control-buttons">
            <VoiceGuidanceStatus
              :is-speaking="isSpeaking"
              :enabled="voiceGuidanceEnabled" />
            <VoiceCommands
              @command="handleVoiceCommand"
              @error="handleVoiceError" />
            <NavigationSettings
              :initial-settings="{
                voiceGuidanceEnabled,
                voiceVolume,
                showArrows,
                distanceUnit,
              }"
              @update:settings="updateSettings" />
            <button @click="endNavigation" class="end-navigation-btn">
              End
            </button>
          </div>
        </div>
      </div>

      <!-- Area Selection Modal -->
      <div v-if="showAreaSelectionModal" class="area-selection-modal">
        <div class="area-selection-content">
          <h3>Save Selected Area</h3>
          <p>Do you want to save this area for future reference?</p>
          <div class="area-selection-form">
            <div class="form-group">
              <label for="areaName">Area Name:</label>
              <input
                type="text"
                id="areaName"
                v-model="areaName"
                placeholder="Enter a name for this area"
                class="area-name-input" />
            </div>
            <div class="area-selection-buttons">
              <button @click="saveSelectedArea" class="save-area-btn">
                Save Area
              </button>
              <button @click="cancelAreaSelection" class="cancel-area-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- User Areas Button -->
      <button
        v-if="!arStarted && isUserAuthenticated"
        @click="showUserAreas"
        class="user-areas-btn">
        My Saved Areas
      </button>

      <!-- User Areas Modal -->
      <div v-if="showUserAreasModal" class="user-areas-modal">
        <div class="user-areas-content">
          <div class="user-areas-header">
            <h3>My Saved Areas</h3>
            <button @click="closeUserAreas" class="close-areas-btn">×</button>
          </div>
          <div class="user-areas-list">
            <div v-if="userAreas.length === 0" class="no-areas">
              You haven't saved any areas yet.
            </div>
            <div
              v-for="area in userAreas"
              :key="area.id"
              class="user-area-item"
              @click="selectUserArea(area)">
              <div class="area-name">{{ area.name }}</div>
              <div class="area-coords">
                {{ formatCoordinates(area.latitude, area.longitude) }}
              </div>
              <div class="area-date">{{ formatDate(area.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import VoiceSearch from "@/components/VoiceSearch.vue";
import VoiceCommands from "@/components/VoiceCommands.vue";
import VoiceService from "@/services/VoiceService.js";
import NavigationSettings from "@/components/NavigationSettings.vue";
import NavigationVoiceService from "@/services/NavigationVoiceService.js";
import VoiceGuidanceStatus from "@/components/VoiceGuidanceStatus.vue";
import MapService from "@/services/MapService.js";
import ARNavigation from "@/components/ARNavigation.vue";
import maplibregl from "maplibre-gl"; // Import maplibregl
import Navbar from "@/components/Navbar.vue";

export default {
  name: "App",
  components: {
    Navbar,
    VoiceSearch,
    VoiceCommands,
    NavigationSettings,
    VoiceGuidanceStatus,
    ARNavigation,
  },
  data() {
    return {
      loading: true,
      loadingMessage: "Initializing AR Navigation...",
      arStarted: false,
      searchQuery: "",
      showSearchResults: false,
      searchResults: [],
      selectedDestination: null,
      currentLocation: null,
      navigationPath: [],
      distanceToDestination: 0,
      estimatedTimeOfArrival: "0 min",
      currentInstruction: "",
      nextManeuverDistance: "",
      watchId: null,
      recentDestinations: [],
      firebaseApp: null,
      db: null,
      auth: null,
      user: null,
      voiceEnabled: false,
      voiceGuidanceEnabled: true,
      voiceVolume: 1,
      isSpeaking: false,
      map: null,
      currentLocationMarker: null,
      destinationMarker: null,
      routeData: null,
      routeInstructions: [],
      showArrows: true,
      distanceUnit: "metric",
      deviceOrientation: { alpha: 0, beta: 0, gamma: 0 },
      compassHeading: 0,
      showRecentDestinations: false,

      // New properties for area selection
      showAreaSelectionModal: false,
      areaName: "",
      selectedArea: null,
      isUserAuthenticated: false,
      userProfile: null,
      userAreas: [],
      showUserAreasModal: false,
      isAdmin: false,
    };
  },
  async mounted() {
    // Initialize Firebase with real config
    const firebaseConfig = {
      apiKey: "AIzaSyBTylfFz4_JcbvSlDof4YTf-yDVHPY_swk",
      authDomain: "ar-path-3eb94.firebaseapp.com",
      projectId: "ar-path-3eb94",
      storageBucket: "ar-path-3eb94.appspot.com",
      messagingSenderId: "314906875610",
      appId: "1:314906875610:web:02edf761141fa1aa8677e3",
      measurementId: "G-V7PCV8YV9P",
    };

    this.firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(this.firebaseApp);
    this.auth = getAuth(this.firebaseApp);

    // Set up authentication state listener
    this.setupAuthListener();

    // Get current location with high accuracy
    this.loadingMessage = "Getting your location...";
    await this.getCurrentLocation();

    // Initialize map
    this.loadingMessage = "Initializing map...";
    this.initMap();

    // Load device orientation and compass
    this.initDeviceOrientation();

    // Initialize voice service
    this.loadingMessage = "Setting up voice guidance...";
    await this.initializeVoice();

    this.loading = false;
  },
  methods: {
    // New method to set up authentication state listener
    setupAuthListener() {
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          // User is signed in
          this.user = user;
          this.isUserAuthenticated = true;
          console.log("User is signed in:", user.uid);

          // Check if user exists in Firestore, if not create a new user document
          await this.ensureUserExists(user);

          // Load user data
          await this.loadUserProfile();
          await this.loadUserAreas();
          await this.loadRecentDestinations();
        } else {
          // User is signed out
          this.user = null;
          this.isUserAuthenticated = false;
          this.userProfile = null;
          this.userAreas = [];
          this.isAdmin = false;
          console.log("User is signed out");
        }
      });
    },

    // Ensure user exists in Firestore
    async ensureUserExists(user) {
      try {
        const userDocRef = doc(this.db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // Create a new user document if it doesn't exist
          await setDoc(userDocRef, {
            userId: user.uid,
            email: user.email || "",
            displayName: user.displayName || "User",
            role: "user", // Default role
            createdAt: new Date(),
          });
          console.log("Created new user document");
        }
      } catch (error) {
        console.error("Error ensuring user exists:", error);
      }
    },

    // Load user profile from Firestore
    async loadUserProfile() {
      if (!this.user) return;

      try {
        const userDocRef = doc(this.db, "users", this.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          this.userProfile = userDoc.data();
          this.isAdmin = this.userProfile.role === "admin";
          console.log("User profile loaded:", this.userProfile);
        } else {
          console.log("No user profile found");
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    },

    // New method to handle area selection
    selectArea() {
      if (!this.currentLocation) return;

      this.selectedArea = {
        latitude: this.currentLocation.latitude,
        longitude: this.currentLocation.longitude,
      };

      this.showAreaSelectionModal = true;
    },

    // New method to save selected area
    async saveSelectedArea() {
      if (!this.user || !this.selectedArea || !this.areaName.trim()) {
        alert("Please enter a name for this area");
        return;
      }

      try {
        this.loading = true;
        this.loadingMessage = "Saving area...";

        // Get user's name from profile or use default
        const userName = this.userProfile
          ? this.userProfile.displayName || this.userProfile.email
          : "User";

        // Save area to Firestore
        const areaData = {
          userId: this.user.uid,
          userName: userName,
          name: this.areaName,
          latitude: this.selectedArea.latitude,
          longitude: this.selectedArea.longitude,
          timestamp: new Date(),
        };

        const areaRef = await addDoc(
          collection(this.db, "userAreas"),
          areaData
        );

        console.log("Area saved with ID:", areaRef.id);

        // Add marker to map
        if (this.map) {
          MapService.addMarker(
            this.map,
            [this.selectedArea.longitude, this.selectedArea.latitude],
            {
              color: "#4CAF50",
            }
          );
        }

        // Reset area selection
        this.showAreaSelectionModal = false;
        this.areaName = "";
        this.selectedArea = null;

        // Reload user areas
        this.loadUserAreas();

        // Show success message
        alert("Area saved successfully!");
      } catch (error) {
        console.error("Error saving area:", error);
        alert("Error saving area. Please try again.");
      } finally {
        this.loading = false;
      }
    },

    // Cancel area selection
    cancelAreaSelection() {
      this.showAreaSelectionModal = false;
      this.areaName = "";
      this.selectedArea = null;
    },

    // Load user's saved areas
    async loadUserAreas() {
      if (!this.user) return;

      try {
        const q = query(
          collection(this.db, "userAreas"),
          where("userId", "==", this.user.uid),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const areas = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          areas.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          });
        });

        this.userAreas = areas;
        console.log("User areas loaded:", this.userAreas.length);
      } catch (error) {
        console.error("Error loading user areas:", error);
      }
    },

    // Show user areas modal
    showUserAreas() {
      this.loadUserAreas();
      this.showUserAreasModal = true;
    },

    // Close user areas modal
    closeUserAreas() {
      this.showUserAreasModal = false;
    },

    // Select a user area
    selectUserArea(area) {
      if (!this.map) return;

      // Center map on the selected area
      this.map.setCenter([area.longitude, area.latitude]);
      this.map.setZoom(15);

      // Add marker for the area
      if (this.destinationMarker) {
        this.destinationMarker.remove();
      }

      this.destinationMarker = MapService.addMarker(
        this.map,
        [area.longitude, area.latitude],
        {
          color: "#4CAF50",
        }
      );

      MapService.addPopup(
        this.destinationMarker,
        `<strong>${area.name}</strong><br>Saved on ${this.formatDate(
          area.timestamp
        )}`
      );

      // Close the modal
      this.closeUserAreas();
    },

    // Format coordinates for display
    formatCoordinates(lat, lng) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    },

    // Format date for display
    formatDate(date) {
      if (!date) return "Unknown date";
      return new Date(date).toLocaleDateString();
    },

    // Add a right-click handler to the map for area selection
    initMap() {
      // Initialize map with default center (will be updated when location is available)
      this.map = MapService.initMap("map", {
        center: [0, 0],
        zoom: 2,
      });

      // When map is loaded, update to current location
      this.map.on("load", () => {
        if (this.currentLocation) {
          this.map.setCenter([
            this.currentLocation.longitude,
            this.currentLocation.latitude,
          ]);
          this.map.setZoom(15);
          this.updateCurrentLocationMarker();
        }

        // Add right-click handler for area selection
        this.map.on("contextmenu", (e) => {
          if (!this.isUserAuthenticated) {
            alert("Please sign in to save areas");
            return;
          }

          this.selectedArea = {
            latitude: e.lngLat.lat,
            longitude: e.lngLat.lng,
          };

          this.showAreaSelectionModal = true;
        });

        // Add a button to save current location
        const saveLocationControl = document.createElement("div");
        saveLocationControl.className = "maplibregl-ctrl maplibregl-ctrl-group";
        saveLocationControl.innerHTML = `
          <button class="save-location-btn" title="Save Current Location">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </button>
        `;

        saveLocationControl.addEventListener("click", () => {
          if (this.isUserAuthenticated && this.currentLocation) {
            this.selectArea();
          } else if (!this.isUserAuthenticated) {
            alert("Please sign in to save areas");
          }
        });

        this.map.addControl({
          onAdd: () => saveLocationControl,
          onRemove: () => {},
        });
      });
    },

    // Keep all your existing methods
    initDeviceOrientation() {
      if (window.DeviceOrientationEvent) {
        window.addEventListener(
          "deviceorientation",
          this.handleOrientation,
          false
        );
      }

      if (
        window.DeviceOrientationEvent &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        // iOS 13+ requires permission
        document.body.addEventListener(
          "click",
          async () => {
            try {
              const permission =
                await DeviceOrientationEvent.requestPermission();
              if (permission === "granted") {
                window.addEventListener(
                  "deviceorientation",
                  this.handleOrientation,
                  false
                );
              }
            } catch (error) {
              console.error(
                "Error requesting device orientation permission:",
                error
              );
            }
          },
          { once: true }
        );
      }
    },

    handleOrientation(event) {
      this.deviceOrientation = {
        alpha: event.alpha || 0, // compass direction (0-360)
        beta: event.beta || 0, // front-to-back tilt (-180 to 180)
        gamma: event.gamma || 0, // left-to-right tilt (-90 to 90)
      };

      // Calculate compass heading
      if (event.webkitCompassHeading) {
        // iOS devices
        this.compassHeading = event.webkitCompassHeading;
      } else {
        // Android devices
        this.compassHeading = 360 - this.deviceOrientation.alpha;
      }
    },

    async getCurrentLocation() {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          const options = {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000,
          };

          this.watchId = navigator.geolocation.watchPosition(
            (position) => {
              this.currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                altitude: position.coords.altitude || 0,
                accuracy: position.coords.accuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
              };

              // Update current location marker on map
              if (this.map && this.currentLocation) {
                this.updateCurrentLocationMarker();
              }

              // If navigation started, update path
              if (this.arStarted && this.selectedDestination) {
                this.updateNavigationPath();
              }

              resolve(this.currentLocation);
            },
            (error) => {
              let errorMessage = "Unable to get your location. ";

              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage +=
                    "Please enable location access in your browser settings.";
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage += "Location information is unavailable.";
                  break;
                case error.TIMEOUT:
                  errorMessage += "Location request timed out.";
                  break;
                default:
                  errorMessage += "An unknown error occurred.";
              }

              // Show error to user
              this.loadingMessage = errorMessage;
              console.error("Geolocation error:", error);

              // If we're in a secure context (HTTPS), try to request permission
              if (window.isSecureContext) {
                navigator.permissions
                  .query({ name: "geolocation" })
                  .then((permissionStatus) => {
                    if (permissionStatus.state === "denied") {
                      this.loadingMessage +=
                        " Please enable location access in your browser settings.";
                    }
                  });
              }

              reject(error);
            },
            options
          );
        } else {
          const error = new Error(
            "Geolocation is not supported by this browser."
          );
          this.loadingMessage = error.message;
          reject(error);
        }
      });
    },

    updateCurrentLocationMarker() {
      if (!this.map || !this.currentLocation) return;

      const lngLat = [
        this.currentLocation.longitude,
        this.currentLocation.latitude,
      ];

      if (!this.currentLocationMarker) {
        // Create marker if it doesn't exist
        this.currentLocationMarker = MapService.addMarker(this.map, lngLat, {
          color: "#4285F4",
        });

        // Add popup
        MapService.addPopup(
          this.currentLocationMarker,
          "<strong>Your location</strong>"
        );
      } else {
        // Update existing marker
        this.currentLocationMarker.setLngLat(lngLat);
      }
    },

    async initializeVoice() {
      try {
        const initialized = await VoiceService.initialize();
        this.voiceEnabled = initialized;

        // Speak welcome message if voice is enabled
        if (this.voiceEnabled && this.voiceGuidanceEnabled) {
          this.isSpeaking = true;
          await VoiceService.speak(
            "Welcome to AR Navigation. Where would you like to go?"
          );
          this.isSpeaking = false;
        }
      } catch (error) {
        console.error("Error initializing voice service:", error);
        this.voiceEnabled = false;
      }
    },

    async searchDestinations() {
      if (!this.searchQuery || this.searchQuery.length < 3) {
        this.searchResults = [];
        return;
      }

      try {
        let proximity = null;

        if (this.currentLocation) {
          proximity = [
            this.currentLocation.longitude,
            this.currentLocation.latitude,
          ];
        }

        // Use MapService to search for places
        const results = await MapService.searchPlaces(
          this.searchQuery,
          proximity
        );
        this.searchResults = results;
        this.showSearchResults = true;
      } catch (error) {
        console.error("Error searching for destinations:", error);
        this.searchResults = [];
      }
    },

    selectDestination(destination) {
      this.selectedDestination = destination;
      this.searchQuery = destination.name;
      this.showSearchResults = false;

      // Add destination marker to map
      if (this.map) {
        if (this.destinationMarker) {
          this.destinationMarker.remove();
        }

        this.destinationMarker = MapService.addMarker(
          this.map,
          [destination.longitude, destination.latitude],
          {
            color: "#FF5733",
          }
        );

        MapService.addPopup(
          this.destinationMarker,
          `<strong>${destination.name}</strong><br>${destination.address}`
        );

        // Get route to destination
        this.getRouteToDestination();
      }
    },

    selectSavedDestination(destination) {
      this.selectDestination(destination);
    },

    async getRouteToDestination() {
      if (!this.currentLocation || !this.selectedDestination) return;

      try {
        this.loading = true;
        this.loadingMessage = "Calculating route...";

        // Get route using MapService
        const start = [
          this.currentLocation.longitude,
          this.currentLocation.latitude,
        ];
        const end = [
          this.selectedDestination.longitude,
          this.selectedDestination.latitude,
        ];

        console.log("Getting route from", start, "to", end);

        try {
          this.routeData = await MapService.getRoute(start, end);
          console.log("Route data received:", this.routeData);
        } catch (routeError) {
          console.error("Failed to get route:", routeError);

          // Show a more user-friendly error message
          alert(
            "Could not calculate a detailed walking route to this destination. A direct line will be shown instead."
          );

          // Create a simple direct route as fallback
          const distance = MapService.calculateDistance(start, end);
          const duration = distance / 1.4; // Assuming 1.4 m/s walking speed

          this.routeData = {
            routes: [
              {
                summary: {
                  distance: distance,
                  duration: duration,
                },
                geometry: {
                  type: "LineString",
                  coordinates: [start, end],
                },
                segments: [
                  {
                    distance: distance,
                    duration: duration,
                    steps: [
                      {
                        distance: distance,
                        duration: duration,
                        instruction: "Go to your destination",
                        way_points: [0, 1],
                      },
                    ],
                  },
                ],
              },
            ],
          };
        }

        // Process route instructions
        this.routeInstructions = MapService.processRouteInstructions(
          this.routeData
        );

        // Add route to map
        try {
          MapService.addRouteToMap(this.map, this.routeData);
        } catch (routeError) {
          console.error("Error adding route to map:", routeError);
          alert(
            "Error displaying route on map. A direct line will be shown instead."
          );

          // Try again with a simple direct route
          const directRoute = {
            routes: [
              {
                geometry: {
                  type: "LineString",
                  coordinates: [start, end],
                },
              },
            ],
          };

          try {
            MapService.addRouteToMap(this.map, directRoute);
          } catch (directRouteError) {
            console.error(
              "Error adding direct route to map:",
              directRouteError
            );
            this.loading = false;
            return;
          }
        }

        // Fit map to show the entire route
        try {
          MapService.fitMapToRoute(this.map, this.routeData);
        } catch (fitError) {
          console.error("Error fitting map to route:", fitError);
          // Not critical, continue with the function

          // Try to fit to a simple bounds instead
          if (this.map) {
            const bounds = new maplibregl.LngLatBounds(start, start);
            bounds.extend(end);
            this.map.fitBounds(bounds, {
              padding: 50,
              maxZoom: 15,
              duration: 1000,
            });
          }
        }

        // Calculate distance and ETA
        if (this.routeData.routes && this.routeData.routes.length > 0) {
          const route = this.routeData.routes[0];
          if (route.summary) {
            this.distanceToDestination = route.summary.distance;
            this.estimatedTimeOfArrival = this.calculateETA(
              route.summary.duration
            );
          } else {
            console.warn(
              "Route summary is missing, using straight-line distance"
            );
            const distance = MapService.calculateDistance(start, end);
            this.distanceToDestination = distance;
            this.estimatedTimeOfArrival = this.calculateETA(distance / 1.4);
          }
        }

        this.loading = false;
      } catch (error) {
        console.error("Error getting route:", error);
        this.loading = false;
        alert(
          "Error calculating route. Please try again or choose a different destination."
        );
      }
    },

    async startNavigation() {
      if (!this.selectedDestination) {
        alert("Please select a destination");
        return;
      }

      this.loading = true;
      this.loadingMessage = "Preparing AR navigation...";

      try {
        // Save this destination to recent destinations in Firebase
        if (this.db && this.user) {
          await addDoc(collection(this.db, "recentDestinations"), {
            userId: this.user.uid,
            name: this.selectedDestination.name,
            address: this.selectedDestination.address,
            latitude: this.selectedDestination.latitude,
            longitude: this.selectedDestination.longitude,
            timestamp: new Date(),
          });
        }

        // Make sure we have a route
        if (!this.routeData) {
          await this.getRouteToDestination();
        }

        // Generate navigation path for AR
        this.generateARNavigationPath();

        // Announce start of navigation
        if (this.voiceEnabled && this.voiceGuidanceEnabled) {
          this.isSpeaking = true;
          await NavigationVoiceService.announceNavigationStart(
            this.selectedDestination.name
          );
          this.isSpeaking = false;
        }

        // Start AR experience
        this.arStarted = true;
      } catch (error) {
        console.error("Error starting navigation:", error);
        alert("Error starting navigation. Please try again.");
      } finally {
        this.loading = false;
      }
    },

    generateARNavigationPath() {
      if (
        !this.routeData ||
        !this.routeData.routes ||
        !this.routeData.routes.length
      )
        return;

      const route = this.routeData.routes[0];
      const path = [];

      // Process each segment and step in the route
      if (route.segments) {
        route.segments.forEach((segment) => {
          segment.steps.forEach((step) => {
            // Get coordinates for this step
            const stepCoords = step.way_points.map(
              (index) => route.geometry.coordinates[index]
            );

            // Add maneuver point
            const maneuverPoint = stepCoords[stepCoords.length - 1];

            // Calculate bearing to the next point (if available)
            let bearing = 0;
            if (stepCoords.length > 1) {
              const startPoint = stepCoords[0];
              const endPoint = stepCoords[stepCoords.length - 1];

              // Calculate bearing between points
              const y =
                Math.sin(endPoint[0] - startPoint[0]) * Math.cos(endPoint[1]);
              const x =
                Math.cos(startPoint[1]) * Math.sin(endPoint[1]) -
                Math.sin(startPoint[1]) *
                  Math.cos(endPoint[1]) *
                  Math.cos(endPoint[0] - startPoint[0]);
              bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
            }

            path.push({
              latitude: maneuverPoint[1],
              longitude: maneuverPoint[0],
              instruction: step.instruction,
              isManeuver: true,
              distance: step.distance,
              bearing: bearing,
            });

            // Add intermediate points for long segments
            if (stepCoords.length > 2) {
              // Skip first and last coordinates as they're already included as maneuvers
              const intermediateCoords = stepCoords.slice(1, -1);

              // Add intermediate points every ~20 meters for visual guidance
              for (
                let i = 0;
                i < intermediateCoords.length;
                i += Math.max(1, Math.floor(intermediateCoords.length / 5))
              ) {
                const coord = intermediateCoords[i];

                path.push({
                  latitude: coord[1],
                  longitude: coord[0],
                  instruction: "",
                  isManeuver: false,
                  distance: 0,
                  bearing: bearing,
                });
              }
            }
          });
        });
      }

      this.navigationPath = path;

      // Set initial instruction
      if (this.routeInstructions.length > 0) {
        this.currentInstruction = this.routeInstructions[0].text;
        this.nextManeuverDistance = this.formatDistance(
          this.routeInstructions[0].distance
        );
      }
    },

    updateNavigationPath() {
      if (
        !this.currentLocation ||
        !this.selectedDestination ||
        !this.navigationPath.length
      )
        return;

      // Find the closest point on the path to the current location
      let closestPointIndex = 0;
      let minDistance = Infinity;

      this.navigationPath.forEach((point, index) => {
        const distance = MapService.calculateDistance(
          [this.currentLocation.longitude, this.currentLocation.latitude],
          [point.longitude, point.latitude]
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestPointIndex = index;
        }
      });

      // Update current instruction based on the closest point
      if (closestPointIndex < this.navigationPath.length - 1) {
        const nextManeuverIndex = this.navigationPath.findIndex(
          (point, index) => index > closestPointIndex && point.isManeuver
        );

        if (nextManeuverIndex !== -1) {
          const nextManeuver = this.navigationPath[nextManeuverIndex];
          this.currentInstruction = nextManeuver.instruction;

          // Calculate distance to next maneuver
          const distanceToManeuver = MapService.calculateDistance(
            [this.currentLocation.longitude, this.currentLocation.latitude],
            [nextManeuver.longitude, nextManeuver.latitude]
          );

          this.nextManeuverDistance = this.formatDistance(distanceToManeuver);

          // Handle turn-by-turn voice guidance
          this.handleTurnByTurnGuidance(
            this.currentInstruction,
            distanceToManeuver,
            this.getManeuverType(this.currentInstruction)
          );

          // Calculate remaining distance to destination
          let remainingDistance = distanceToManeuver;
          for (
            let i = nextManeuverIndex;
            i < this.navigationPath.length - 1;
            i++
          ) {
            if (
              this.navigationPath[i].isManeuver &&
              this.navigationPath[i + 1].isManeuver
            ) {
              remainingDistance += MapService.calculateDistance(
                [
                  this.navigationPath[i].longitude,
                  this.navigationPath[i].latitude,
                ],
                [
                  this.navigationPath[i + 1].longitude,
                  this.navigationPath[i + 1].latitude,
                ]
              );
            }
          }

          this.distanceToDestination = remainingDistance;
          this.estimatedTimeOfArrival = this.calculateETA(
            remainingDistance / 1.4
          ); // Assuming 1.4 m/s walking speed
        }
      }

      // Check if we've reached the destination (within 15 meters)
      const distanceToDestination = MapService.calculateDistance(
        [this.currentLocation.longitude, this.currentLocation.latitude],
        [this.selectedDestination.longitude, this.selectedDestination.latitude]
      );

      if (distanceToDestination < 15) {
        this.currentInstruction = "You have arrived at your destination!";
        this.nextManeuverDistance = "";

        // Announce arrival
        if (this.voiceEnabled && this.voiceGuidanceEnabled) {
          this.isSpeaking = true;
          NavigationVoiceService.announceArrival();
          this.isSpeaking = false;
        }
      }
    },

    async handleTurnByTurnGuidance(instruction, distance, maneuverType) {
      if (!this.voiceGuidanceEnabled) return;

      // Announce the upcoming maneuver with distance
      if (distance > 0) {
        this.isSpeaking = true;
        await NavigationVoiceService.announceDistance(
          distance,
          "maneuver",
          maneuverType
        );
        this.isSpeaking = false;
      }

      // Announce the turn instruction when very close
      if (distance < 30) {
        this.isSpeaking = true;
        await NavigationVoiceService.announceTurn(instruction);
        this.isSpeaking = false;
      }
    },

    getManeuverType(instruction) {
      if (!instruction) return "unknown";

      const lowerInstruction = instruction.toLowerCase();

      if (lowerInstruction.includes("turn left")) {
        return "turn-left";
      } else if (lowerInstruction.includes("turn right")) {
        return "turn-right";
      } else if (lowerInstruction.includes("slight left")) {
        return "turn-slight-left";
      } else if (lowerInstruction.includes("slight right")) {
        return "turn-slight-right";
      } else if (lowerInstruction.includes("sharp left")) {
        return "turn-sharp-left";
      } else if (lowerInstruction.includes("sharp right")) {
        return "turn-sharp-right";
      } else if (lowerInstruction.includes("u-turn")) {
        return "u-turn";
      } else if (lowerInstruction.includes("roundabout")) {
        return "roundabout";
      } else if (lowerInstruction.includes("continue")) {
        return "continue";
      } else if (lowerInstruction.includes("arrive")) {
        return "arrive";
      } else {
        return "unknown";
      }
    },

    calculateETA(totalTimeInSeconds) {
      const now = new Date();
      const arrivalTime = new Date(now.getTime() + totalTimeInSeconds * 1000);
      const hours = arrivalTime.getHours().toString().padStart(2, "0");
      const minutes = arrivalTime.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    },

    formatDistance(distance) {
      if (this.distanceUnit === "metric") {
        if (distance < 1000) {
          return `${Math.round(distance)} m`;
        } else {
          return `${(distance / 1000).toFixed(1)} km`;
        }
      } else {
        // Imperial units
        const feet = distance * 3.28084;
        if (feet < 1000) {
          return `${Math.round(feet)} ft`;
        } else {
          const miles = feet / 5280;
          return `${miles.toFixed(1)} mi`;
        }
      }
    },

    async loadRecentDestinations() {
      if (!this.db || !this.user) return;

      try {
        const q = query(
          collection(this.db, "recentDestinations"),
          where("userId", "==", this.user.uid),
          orderBy("timestamp", "desc"),
          limit(5)
        );

        const querySnapshot = await getDocs(q);
        const destinations = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          destinations.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          });
        });

        this.recentDestinations = destinations;
      } catch (error) {
        console.error("Error loading recent destinations:", error);
      }
    },

    handleVoiceSearchResult(text) {
      this.searchQuery = text;
      this.searchDestinations();
    },

    handleVoiceError(error) {
      console.error("Voice recognition error:", error);
    },

    async handleVoiceCommand(command, text) {
      if (!this.voiceEnabled) return;

      switch (command) {
        case "whereAmI":
          if (this.currentLocation) {
            const message = `You are currently at ${this.currentLocation.latitude.toFixed(
              6
            )}, ${this.currentLocation.longitude.toFixed(6)}`;
            this.isSpeaking = true;
            await VoiceService.speak(message);
            this.isSpeaking = false;
          }
          break;

        case "distance":
          if (this.distanceToDestination) {
            const distance = this.formatDistance(this.distanceToDestination);
            const message = `You are ${distance} from your destination. Estimated arrival time: ${this.estimatedTimeOfArrival}`;
            this.isSpeaking = true;
            await VoiceService.speak(message);
            this.isSpeaking = false;
          }
          break;

        case "nextInstruction":
          if (this.currentInstruction) {
            this.isSpeaking = true;
            await VoiceService.speak(this.currentInstruction);
            this.isSpeaking = false;
          }
          break;

        case "endNavigation":
          this.isSpeaking = true;
          await VoiceService.speak("Ending navigation");
          this.isSpeaking = false;
          this.endNavigation();
          break;

        case "repeat":
          if (this.currentInstruction) {
            this.isSpeaking = true;
            await VoiceService.speak(this.currentInstruction);
            this.isSpeaking = false;
          }
          break;

        case "unknown":
          this.isSpeaking = true;
          await VoiceService.speak(
            `I'm sorry, I didn't understand "${text}". Please try again.`
          );
          this.isSpeaking = false;
          break;
      }
    },

    updateSettings(settings) {
      this.voiceGuidanceEnabled = settings.voiceGuidanceEnabled;
      this.voiceVolume = settings.voiceVolume;
      this.showArrows = settings.showArrows;
      this.distanceUnit = settings.distanceUnit;

      // Update voice service volume
      VoiceService.setDefaultSettings({ volume: this.voiceVolume });
    },

    endNavigation() {
      this.arStarted = false;
      this.navigationPath = [];

      // Reset navigation voice service
      NavigationVoiceService.reset();

      // Return to map view
      if (this.map && this.currentLocation) {
        this.map.setCenter([
          this.currentLocation.longitude,
          this.currentLocation.latitude,
        ]);
        this.map.setZoom(15);
      }
    },

    toggleRecentDestinations() {
      this.showRecentDestinations = !this.showRecentDestinations;
    },

    beforeUnmount() {
      // Clean up location watcher
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
      }

      // Clean up device orientation listener
      window.removeEventListener("deviceorientation", this.handleOrientation);
    },
  },
  watch: {
    searchQuery() {
      this.searchDestinations();
    },
  },
};
</script>

<style>
.app {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  padding-top: 60px; /* Add padding to account for fixed navbar */
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-message {
  font-size: 18px;
}

.app-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.search-container {
  position: absolute;
  top: 80px; /* Increased from 20px to account for navbar */
  left: 20px;
  right: 20px;
  z-index: 10;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: 16px;
  outline: none;
}

.voice-search {
  margin-right: 8px;
}

.search-results {
  margin-top: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f9f9f9;
}

.result-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.result-address {
  font-size: 14px;
  color: #666;
}

.recent-destinations {
  margin-top: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.recent-destinations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.recent-destinations-header h3 {
  margin: 0;
}

.toggle-recent-btn,
.show-recent-btn {
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  color: #666;
}

.toggle-recent-btn:hover,
.show-recent-btn:hover {
  background-color: #e0e0e0;
}

.show-recent-btn {
  margin-top: 10px;
  width: 100%;
  padding: 8px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
}

.recent-destinations h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
}

.recent-destination-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.recent-destination-item:last-child {
  border-bottom: none;
}

.destination-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.destination-address {
  font-size: 14px;
  color: #666;
}

.navigation-info-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 10;
}

.destination-info h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
}

.destination-info p {
  margin-top: 0;
  margin-bottom: 12px;
  color: #666;
}

.route-info {
  display: flex;
  margin-bottom: 16px;
}

.info-item {
  margin-right: 20px;
}

.info-label {
  font-weight: bold;
  margin-right: 5px;
}

.info-value {
  font-size: 16px;
  color: #666;
}

.start-navigation-btn {
  width: 100%;
  padding: 12px;
  background-color: #ff5733;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.start-navigation-btn:hover {
  background-color: #e64a2e;
}

.ar-navigation-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
}

.ar-canvas {
  width: 100%;
  height: calc(100% - 100px);
  position: relative;
}

.ar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
}

.navigation-instructions {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.instruction-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.distance-text {
  font-size: 16px;
  color: #666;
}

.navigation-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background-color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.control-buttons {
  display: flex;
  align-items: center;
}

.control-buttons > * {
  margin-left: 10px;
}

.end-navigation-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.end-navigation-btn:hover {
  background-color: #d32f2f;
}

/* Area Selection Styles */
.area-selection-modal,
.user-areas-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.area-selection-content,
.user-areas-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.area-selection-content h3,
.user-areas-content h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

.area-selection-form {
  margin-top: 20px;
}

.area-name-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
}

.area-selection-buttons {
  display: flex;
  justify-content: space-between;
}

.save-area-btn,
.cancel-area-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.save-area-btn {
  background-color: #4caf50;
  color: white;
}

.cancel-area-btn {
  background-color: #f0f0f0;
  color: #333;
}

.user-areas-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  cursor: pointer;
  z-index: 10;
}

.user-areas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.close-areas-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.user-areas-list {
  max-height: 300px;
  overflow-y: auto;
}

.user-area-item {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.user-area-item:hover {
  background-color: #f9f9f9;
}

.user-area-item:last-child {
  border-bottom: none;
}

.area-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.area-coords {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.area-date {
  font-size: 12px;
  color: #999;
}

.no-areas {
  padding: 20px;
  text-align: center;
  color: #666;
}

.save-location-btn {
  width: 30px;
  height: 30px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Responsive styles for area selection */
@media (max-width: 768px) {
  .area-selection-content,
  .user-areas-content {
    width: 95%;
    padding: 15px;
  }

  .user-areas-btn {
    bottom: 15px;
    right: 15px;
    padding: 8px 12px;
    font-size: 13px;
  }
}

/* Ensure the hidden class works properly */
.hidden {
  display: none !important;
}

/* Make buttons easier to tap on mobile */
button {
  min-height: 36px;
  min-width: 36px;
}

.help-center-link {
  display: block;
  margin-bottom: 12px;
  text-align: right;
}

.help-center-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1em;
  transition: background 0.2s;
}

.help-center-btn:hover {
  background: #1251a3;
}
</style>
