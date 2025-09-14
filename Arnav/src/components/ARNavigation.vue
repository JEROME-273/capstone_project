<template>
  <div v-if="isARNavigationActive" class="ar-navigation-container">
    <video ref="arVideoRef" class="ar-video" autoplay playsinline muted></video>

    <!-- Three.js Canvas for 3D AR elements -->
    <div ref="threeContainerRef" class="ar-three-container"></div>

    <!-- Navigation Controls Bar -->
    <div class="ar-controls-bar">
      <!-- Settings Button -->
      <div class="navigation-settings">
        <button
          @click="toggleSettings"
          class="control-button settings-button"
          aria-label="Navigation settings">
          <span class="icon">⚙️</span>
        </button>

        <div v-if="showSettings" class="settings-panel">
          <h3>Navigation Settings</h3>

          <div class="setting-item">
            <label for="voice-guidance">Voice Guidance</label>
            <div class="toggle-switch">
              <input
                type="checkbox"
                id="voice-guidance"
                v-model="settings.voiceGuidanceEnabled"
                @change="updateSettings" />
              <span class="slider"></span>
            </div>
          </div>

          <div class="setting-item">
            <label for="voice-volume">Voice Volume</label>
            <input
              type="range"
              id="voice-volume"
              min="0"
              max="1"
              step="0.1"
              v-model.number="settings.voiceVolume"
              @change="updateSettings"
              :disabled="!settings.voiceGuidanceEnabled" />
            <span class="volume-value"
              >{{ Math.round(settings.voiceVolume * 100) }}%</span
            >
          </div>

          <div class="setting-item">
            <label for="show-arrows">Show AR Arrows</label>
            <div class="toggle-switch">
              <input
                type="checkbox"
                id="show-arrows"
                v-model="settings.showArrows"
                @change="updateSettings" />
              <span class="slider"></span>
            </div>
          </div>

          <div class="setting-item">
            <label for="distance-unit">Distance Unit</label>
            <select
              id="distance-unit"
              v-model="settings.distanceUnit"
              @change="updateSettings">
              <option value="metric">Metric (m/km)</option>
              <option value="imperial">Imperial (ft/mi)</option>
            </select>
          </div>

          <button @click="closeSettings" class="close-settings">Close</button>
        </div>
      </div>

      <!-- Voice Commands -->
      <div class="voice-commands">
        <button
          @click="toggleVoiceCommands"
          class="control-button command-button"
          :class="{ listening: isVoiceCommandsListening }"
          aria-label="Voice commands">
          <span v-if="isVoiceCommandsListening" class="pulse"></span>
          <span class="icon">🗣️</span>
        </button>
        <div v-if="isVoiceCommandsListening" class="listening-indicator">
          Listening for commands... {{ voiceCommandsTranscript }}
        </div>

        <div v-if="showCommandsHelp" class="commands-help">
          <h3>Available Voice Commands</h3>
          <ul>
            <li><strong>"Where am I"</strong> - Get your current location</li>
            <li><strong>"How far"</strong> - Distance to destination</li>
            <li>
              <strong>"Next instruction"</strong> - Hear the next navigation
              instruction
            </li>
            <li>
              <strong>"End navigation"</strong> - Stop the current navigation
            </li>
            <li><strong>"Repeat"</strong> - Repeat the last instruction</li>
          </ul>
          <button @click="showCommandsHelp = false" class="close-help">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Voice Guidance Status -->
    <div class="voice-guidance-status" :class="{ 'is-speaking': isSpeaking }">
      <div class="status-icon">
        <span v-if="isSpeaking" class="speaking-animation">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </span>
        <span v-else class="icon">🔊</span>
      </div>
      <div class="status-text">
        {{ voiceStatusText }}
      </div>
    </div>

    <div class="ar-controls">
      <button @click="stopARNavigation" class="ar-stop-btn">
        <i class="fas fa-times"></i>
        Stop Navigation
      </button>
    </div>

    <div class="ar-info-overlay">
      <div class="ar-destination-info">
        <h3>{{ destinationLocation?.name }}</h3>
        <p>{{ arInstructions }}</p>
        <div class="ar-distance">
          {{ formatDistance(distanceToDestination) }}
        </div>
        <div v-if="distanceToDestination <= 10" class="ar-precision-info">
          <small>📍 Marker positioned at exact coordinates</small>
        </div>
      </div>
    </div>

    <!-- Arrival Options Dialog -->
    <div v-if="showArrivalOptions" class="arrival-options-overlay">
      <div class="arrival-options-dialog">
        <div class="arrival-header">
          <i class="fas fa-check-circle arrival-icon"></i>
          <h3>🎉 You've Arrived!</h3>
          <p>
            You have successfully reached
            <strong>{{ destinationLocation?.name }}</strong>
          </p>
        </div>

        <div class="arrival-actions">
          <button @click="startNewNavigation" class="action-btn primary-btn">
            <i class="fas fa-map-marker-alt"></i>
            Navigate to Another Location
          </button>

          <button @click="continueExploring" class="action-btn secondary-btn">
            <i class="fas fa-compass"></i>
            Continue Exploring
          </button>

          <button @click="finishNavigation" class="action-btn finish-btn">
            <i class="fas fa-home"></i>
            Finish & Go Home
          </button>
        </div>

        <div class="arrival-info">
          <small>🕐 Navigation completed in {{ formatNavigationTime() }}</small>
        </div>
      </div>
    </div>

    <div class="ar-status" v-if="!currentLocation">
      <div class="ar-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Getting your location...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Props
const props = defineProps({
  destination: {
    type: Object,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["stop-navigation", "start-new-navigation"]);

// AR Navigation state
const isARNavigationActive = ref(false);
const arVideoRef = ref(null);
const threeContainerRef = ref(null);
const currentLocation = ref(null);
const destinationLocation = ref(null);
const userHeading = ref(0);
const distanceToDestination = ref(0);
const directionToDestination = ref(0);
const arInstructions = ref("");
const isLocationTracking = ref(false);
const canvasWidth = ref(375);
const canvasHeight = ref(667);

// Enhanced navigation stabilization
const locationHistory = ref([]);
const headingHistory = ref([]);
const stabilizedHeading = ref(0);
const stabilizedLocation = ref(null);
const lastUpdateTime = ref(0);
const STABILIZATION_FACTOR = 0.15; // Lower = more stable, higher = more responsive
const MIN_UPDATE_INTERVAL = 100; // Minimum milliseconds between updates
const HEADING_THRESHOLD = 2; // Degrees - ignore small heading changes
const LOCATION_THRESHOLD = 0.5; // Meters - ignore small location changes

// Settings state
const showSettings = ref(false);
const settings = ref({
  voiceGuidanceEnabled: true,
  voiceVolume: 1,
  showArrows: true,
  distanceUnit: "metric",
});

// Voice Commands state
const voiceCommandsRecognition = ref(null);
const isVoiceCommandsListening = ref(false);
const voiceCommandsTranscript = ref("");
const showCommandsHelp = ref(false);

// Voice Service state
const isSpeaking = ref(false);
const speechSynthesis = ref(null);
const availableVoices = ref([]);
const announcementQueue = ref([]);
const isProcessingQueue = ref(false);
const lastInstruction = ref("");

// Voice command patterns
const commandPatterns = [
  { pattern: /where am i/i, command: "whereAmI" },
  { pattern: /(how far|distance|eta)/i, command: "distance" },
  {
    pattern: /(next instruction|what next|next direction)/i,
    command: "nextInstruction",
  },
  { pattern: /(end|stop|cancel) navigation/i, command: "endNavigation" },
  { pattern: /(repeat|say again|what was that)/i, command: "repeat" },
];

// Three.js objects
let scene, camera, renderer, arrowModel, markerModel;
let animationId = null;
const loader = new GLTFLoader();

// Navigation tracking
const navigationStartTime = ref(null);
const hasLoggedArrival = ref(false);
const showArrivalOptions = ref(false);
const hasArrived = ref(false);

// Computed properties
const voiceStatusText = computed(() => {
  if (!settings.value.voiceGuidanceEnabled) {
    return "Voice guidance is disabled";
  }
  return isSpeaking.value ? "Speaking..." : "Voice guidance ready";
});

// Watch for prop changes
watch(
  () => props.isActive,
  (newValue) => {
    if (newValue && props.destination) {
      startARNavigation();
    } else {
      stopARNavigation();
    }
  }
);

watch(
  () => props.destination,
  (newDestination) => {
    if (newDestination && props.isActive) {
      destinationLocation.value = {
        lat: newDestination.coordinates.x,
        lng: newDestination.coordinates.y,
        name: newDestination.name,
      };
    }
  }
);

// Lifecycle hooks
onMounted(() => {
  updateCanvasDimensions();
  window.addEventListener("resize", updateCanvasDimensions);
  initializeVoiceServices();
});

onUnmounted(() => {
  stopARNavigation();
  window.removeEventListener("resize", updateCanvasDimensions);
  cleanupVoiceServices();
});

// Voice Services initialization
async function initializeVoiceServices() {
  // Initialize speech synthesis
  if ("speechSynthesis" in window) {
    speechSynthesis.value = window.speechSynthesis;

    const getVoices = () => {
      availableVoices.value = speechSynthesis.value.getVoices();
    };

    if (speechSynthesis.value.onvoiceschanged !== undefined) {
      speechSynthesis.value.onvoiceschanged = getVoices;
    }
    getVoices();
  }

  // Initialize speech recognition
  initializeSpeechRecognition();
}

function initializeSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    // Voice Commands Recognition
    voiceCommandsRecognition.value = new SpeechRecognition();
    setupVoiceCommandsRecognition();
  }
}

function setupVoiceCommandsRecognition() {
  if (!voiceCommandsRecognition.value) return;

  voiceCommandsRecognition.value.continuous = false;
  voiceCommandsRecognition.value.interimResults = true;
  voiceCommandsRecognition.value.lang = "en-US";

  voiceCommandsRecognition.value.onstart = () => {
    isVoiceCommandsListening.value = true;
    voiceCommandsTranscript.value = "";
  };

  voiceCommandsRecognition.value.onresult = (event) => {
    const result = event.results[0];
    voiceCommandsTranscript.value = result[0].transcript;

    if (result.isFinal) {
      processVoiceCommand(voiceCommandsTranscript.value);
      stopVoiceCommands();
    }
  };

  voiceCommandsRecognition.value.onerror = (event) => {
    console.error("Voice commands error:", event.error);
    stopVoiceCommands();
  };

  voiceCommandsRecognition.value.onend = () => {
    isVoiceCommandsListening.value = false;
  };
}

// Voice Services methods
async function speak(text, options = {}) {
  if (!speechSynthesis.value || !settings.value.voiceGuidanceEnabled) return;

  return new Promise((resolve, reject) => {
    speechSynthesis.value.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.volume = settings.value.voiceVolume;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      isSpeaking.value = true;
    };

    utterance.onend = () => {
      isSpeaking.value = false;
      resolve();
    };

    utterance.onerror = (event) => {
      isSpeaking.value = false;
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    speechSynthesis.value.speak(utterance);
  });
}

async function processAnnouncementQueue() {
  if (isProcessingQueue.value || announcementQueue.value.length === 0) return;

  isProcessingQueue.value = true;

  while (announcementQueue.value.length > 0) {
    const announcement = announcementQueue.value.shift();
    try {
      await speak(announcement.text, announcement.options);
    } catch (error) {
      console.error("Error speaking announcement:", error);
    }
  }

  isProcessingQueue.value = false;
}

function queueAnnouncement(text, options = {}) {
  announcementQueue.value.push({ text, options });
  processAnnouncementQueue();
}

function announceNavigationStart(destinationName) {
  lastInstruction.value = `Starting navigation to ${destinationName}. Please follow the route on your screen.`;
  queueAnnouncement(lastInstruction.value);
}

function announceDistance(distance, type = "destination") {
  let announcement = "";
  let formattedDistance = formatDistance(distance);

  if (type === "destination") {
    announcement = `You are ${formattedDistance} from your destination.`;
  }

  if (announcement) {
    lastInstruction.value = announcement;
    queueAnnouncement(announcement);
  }
}

function announceArrival() {
  lastInstruction.value = "You have arrived at your destination.";
  queueAnnouncement(lastInstruction.value);

  // Log successful arrival
  if (!hasLoggedArrival.value) {
    logSuccessfulArrival();
    hasLoggedArrival.value = true;
  }
}

// Log successful arrival to Firebase for analytics
async function logSuccessfulArrival() {
  console.log("🚀 logSuccessfulArrival() called!");

  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const db = getFirestore();

    console.log("🔍 Debug checks:", {
      hasAuth: !!auth,
      hasCurrentUser: !!currentUser,
      userUID: currentUser?.uid,
      hasDestination: !!destinationLocation.value,
      destinationName: destinationLocation.value?.name,
      hasStartTime: !!navigationStartTime.value,
      startTime: navigationStartTime.value,
    });

    if (!currentUser) {
      console.error("❌ No current user authenticated!");
      return;
    }

    if (!destinationLocation.value) {
      console.error("❌ No destination location!");
      return;
    }

    if (!navigationStartTime.value) {
      console.error("❌ No navigation start time!");
      return;
    }

    const arrivalTime = new Date();
    const navigationDuration =
      arrivalTime.getTime() - navigationStartTime.value.getTime();

    const arrivalData = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      destinationName: destinationLocation.value.name,
      destinationCoordinates: {
        lat: destinationLocation.value.lat,
        lng: destinationLocation.value.lng,
      },
      startTime: navigationStartTime.value,
      arrivalTime: arrivalTime,
      navigationDuration: navigationDuration, // in milliseconds
      successful: true,
      finalDistance: distanceToDestination.value,
      timestamp: arrivalTime,
    };

    console.log("📊 Logging arrival data:", arrivalData);

    console.log("🔄 Attempting to save to Firebase...");

    // Add timeout for Firebase operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () =>
          reject(new Error("Firebase operation timed out after 10 seconds")),
        10000
      );
    });

    const savePromise = addDoc(collection(db, "arrivalAnalytics"), arrivalData);

    await Promise.race([savePromise, timeoutPromise]);

    console.log("✅ SUCCESS! Arrival data saved to Firebase!");
  } catch (error) {
    console.error("❌ ERROR logging arrival:", error);
    console.error("Error details:", error.message);
    console.error("Error code:", error.code);
  }
}

// Settings methods
function toggleSettings() {
  showSettings.value = !showSettings.value;
}

function closeSettings() {
  showSettings.value = false;
}

function updateSettings() {
  // Settings are automatically updated via v-model
  console.log("Settings updated:", settings.value);
}

// Test function for manual arrival logging
function testArrivalLogging() {
  console.log("🧪 Manual test arrival logging triggered!");

  // Set required data if missing
  if (!navigationStartTime.value) {
    navigationStartTime.value = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    console.log("⚙️ Set navigation start time for testing");
  }

  if (!destinationLocation.value && props.destination) {
    destinationLocation.value = {
      lat: props.destination.coordinates.x,
      lng: props.destination.coordinates.y,
      name: props.destination.name,
      address: props.destination.address,
    };
    console.log("⚙️ Set destination location for testing");
  }

  // Force trigger arrival
  hasLoggedArrival.value = false;
  logSuccessfulArrival();
}

// Voice Commands methods
function toggleVoiceCommands() {
  if (isVoiceCommandsListening.value) {
    stopVoiceCommands();
  } else {
    startVoiceCommands();
  }
}

function startVoiceCommands() {
  if (voiceCommandsRecognition.value) {
    try {
      voiceCommandsRecognition.value.start();
    } catch (error) {
      console.error("Error starting voice commands:", error);
    }
  }
}

function stopVoiceCommands() {
  if (voiceCommandsRecognition.value && isVoiceCommandsListening.value) {
    try {
      voiceCommandsRecognition.value.stop();
    } catch (error) {
      console.error("Error stopping voice commands:", error);
    }
  }
}

function processVoiceCommand(text) {
  // Check if help was requested
  if (/help|commands|what can (i|you) say/i.test(text)) {
    showCommandsHelp.value = true;
    return;
  }

  // Match command patterns
  let matchedCommand = "unknown";
  let matchFound = false;

  for (const { pattern, command } of commandPatterns) {
    if (pattern.test(text)) {
      matchedCommand = command;
      matchFound = true;
      break;
    }
  }

  handleVoiceCommand(matchedCommand, text);
}

function handleVoiceCommand(command, originalText) {
  switch (command) {
    case "whereAmI":
      if (currentLocation.value) {
        queueAnnouncement(
          `You are currently at latitude ${currentLocation.value.lat.toFixed(
            4
          )}, longitude ${currentLocation.value.lng.toFixed(4)}`
        );
      } else {
        queueAnnouncement(
          "I'm still getting your location. Please wait a moment."
        );
      }
      break;

    case "distance":
      if (distanceToDestination.value > 0) {
        announceDistance(distanceToDestination.value);
      } else {
        queueAnnouncement("Distance information is not available.");
      }
      break;

    case "nextInstruction":
      if (arInstructions.value) {
        queueAnnouncement(arInstructions.value);
      } else {
        queueAnnouncement("No navigation instructions available.");
      }
      break;

    case "endNavigation":
      queueAnnouncement("Ending navigation.");
      setTimeout(() => stopARNavigation(), 1000);
      break;

    case "repeat":
      if (lastInstruction.value) {
        queueAnnouncement(lastInstruction.value);
      } else {
        queueAnnouncement("No previous instruction to repeat.");
      }
      break;

    default:
      queueAnnouncement(
        "I didn't understand that command. Say 'help' to hear available commands."
      );
      break;
  }
}

function cleanupVoiceServices() {
  if (voiceCommandsRecognition.value) {
    voiceCommandsRecognition.value.abort();
  }
  if (speechSynthesis.value) {
    speechSynthesis.value.cancel();
  }
}

// AR Navigation methods (existing functionality preserved)
async function startARNavigation() {
  try {
    if (!props.destination) return;

    destinationLocation.value = {
      lat: props.destination.coordinates.x,
      lng: props.destination.coordinates.y,
      name: props.destination.name,
    };

    // Reset tracking variables
    navigationStartTime.value = new Date();
    hasLoggedArrival.value = false;

    isARNavigationActive.value = true;

    // Wait for DOM to update
    await nextTick();

    // Initialize Three.js scene
    await initializeThreeJS();

    // Start camera
    await initializeCamera();

    // Start location tracking
    startLocationTracking();

    // Start orientation tracking
    startOrientationTracking();

    // Start AR rendering loop
    startARRendering();

    // Announce navigation start
    announceNavigationStart(destinationLocation.value.name);
  } catch (error) {
    console.error("Error starting AR navigation:", error);
    alert(
      "Unable to start AR navigation. Please check camera and location permissions."
    );
    stopARNavigation();
  }
}

async function initializeThreeJS() {
  if (!threeContainerRef.value) return;

  // Create scene
  scene = new THREE.Scene();

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  threeContainerRef.value.appendChild(renderer.domElement);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Load 3D models
  await loadModels();

  // Handle window resize
  window.addEventListener("resize", onWindowResize);
}

async function loadModels() {
  try {
    // Load direction arrow
    const arrowGLTF = await loader.loadAsync("/models/direction_arrow.glb");
    arrowModel = arrowGLTF.scene;
    arrowModel.scale.set(0.5, 0.5, 0.5);
    arrowModel.position.set(0, -2, -5);
    arrowModel.castShadow = true;
    arrowModel.receiveShadow = true;
    scene.add(arrowModel);

    // Load destination marker
    const markerGLTF = await loader.loadAsync(
      "/models/map_pointer_3d_icon.glb"
    );
    markerModel = markerGLTF.scene;
    markerModel.scale.set(0.4, 0.4, 0.4);
    markerModel.castShadow = true;
    markerModel.receiveShadow = true;

    // Initially hide the marker (will show when close to destination)
    markerModel.visible = false;
    scene.add(markerModel);

    console.log("3D models loaded successfully");
  } catch (error) {
    console.error("Error loading 3D models:", error);
    // Fallback to basic geometry if models fail to load
    createFallbackModels();
  }
}

function createFallbackModels() {
  // Fallback arrow (cone + cylinder)
  const arrowGeometry = new THREE.ConeGeometry(0.3, 1, 8);
  const arrowMaterial = new THREE.MeshLambertMaterial({ color: 0x22c55e });
  arrowModel = new THREE.Mesh(arrowGeometry, arrowMaterial);
  arrowModel.position.set(0, -2, -5);
  arrowModel.rotation.x = Math.PI;
  scene.add(arrowModel);

  // Fallback marker (sphere + cone)
  const markerGroup = new THREE.Group();

  const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.y = 0.5;

  const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
  const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);

  markerGroup.add(sphere);
  markerGroup.add(pole);
  markerGroup.visible = false;

  markerModel = markerGroup;
  scene.add(markerModel);
}

function onWindowResize() {
  if (!camera || !renderer) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

async function initializeCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    if (arVideoRef.value) {
      arVideoRef.value.srcObject = stream;
      arVideoRef.value.play();
    }
  } catch (error) {
    throw new Error("Camera access denied or not available");
  }
}

function startLocationTracking() {
  if (!navigator.geolocation) {
    throw new Error("Geolocation not supported");
  }

  isLocationTracking.value = true;

  // Enhanced GPS options for maximum precision
  const highPrecisionOptions = {
    enableHighAccuracy: true,
    timeout: 15000, // Longer timeout for better accuracy
    maximumAge: 500, // Use recent readings only
  };

  // Get initial position with high precision
  navigator.geolocation.getCurrentPosition(
    updateCurrentLocation,
    handleLocationError,
    highPrecisionOptions
  );

  // Watch position changes with enhanced precision settings
  const watchId = navigator.geolocation.watchPosition(
    updateCurrentLocation,
    handleLocationError,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 200, // Use very recent readings for continuous updates
    }
  );

  // Store watch ID for cleanup
  if (!window.arNavigationWatchId) {
    window.arNavigationWatchId = watchId;
  }
}

function updateCurrentLocation(position) {
  // Create location object with enhanced precision data
  const newLocation = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
    heading: position.coords.heading, // GPS-based heading if available
    speed: position.coords.speed,
    timestamp: Date.now(),
  };

  // Apply stabilization before updating current location
  currentLocation.value = stabilizeLocation(newLocation);

  // Update navigation calculations if destination exists
  if (destinationLocation.value) {
    calculateNavigationData();
  }

  // Log accuracy for debugging (remove in production)
  console.log(`GPS Update: Accuracy ±${position.coords.accuracy.toFixed(1)}m`);
}

function handleLocationError(error) {
  console.error("Location error:", error);
  arInstructions.value =
    "Unable to get your location. Please check GPS settings.";
}

function startOrientationTracking() {
  if (window.DeviceOrientationEvent) {
    // Request permission for iOS devices
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            window.addEventListener(
              "deviceorientation",
              handleOrientationChange,
              true
            );
          }
        })
        .catch(console.error);
    } else {
      // For Android and other devices
      window.addEventListener(
        "deviceorientation",
        handleOrientationChange,
        true
      );
    }
  }
}

function handleOrientationChange(event) {
  // Get compass heading with enhanced precision
  let rawHeading = event.alpha;

  // Use webkitCompassHeading on iOS for better accuracy
  if (event.webkitCompassHeading) {
    rawHeading = event.webkitCompassHeading;
  }

  if (rawHeading !== null && rawHeading !== undefined) {
    // Apply heading stabilization
    const stabilizedHeadingValue = stabilizeHeading(rawHeading);
    userHeading.value = stabilizedHeadingValue;

    // Update navigation if we have location and destination
    if (currentLocation.value && destinationLocation.value) {
      calculateNavigationData();
    }
  }
}

function calculateNavigationData() {
  if (!currentLocation.value || !destinationLocation.value) return;

  const current = currentLocation.value;
  const destination = destinationLocation.value;

  // Calculate distance using Haversine formula
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (current.lat * Math.PI) / 180;
  const φ2 = (destination.lat * Math.PI) / 180;
  const Δφ = ((destination.lat - current.lat) * Math.PI) / 180;
  const Δλ = ((destination.lng - current.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const previousDistance = distanceToDestination.value;
  distanceToDestination.value = R * c;

  // Calculate bearing (direction to destination)
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;

  directionToDestination.value = (bearing + 360) % 360;

  updateARInstructions();
  update3DElements();

  // Check for arrival - improved logic
  if (distanceToDestination.value < 3 && !hasLoggedArrival.value) {
    console.log("🎉 ARRIVAL DETECTED! Logging to Firebase...");
    announceArrival();
  }
}

function updateARInstructions() {
  const distance = distanceToDestination.value;
  const destination = destinationLocation.value;

  if (distance < 3) {
    arInstructions.value = `You have arrived at ${destination.name}!`;
    // Show arrival options
    if (!hasArrived.value) {
      hasArrived.value = true;
      showArrivalOptions.value = true;
    }
  } else if (distance <= 10) {
    arInstructions.value = `${destination.name} is very close - ${Math.round(
      distance
    )}m away`;
  } else if (distance < 20) {
    arInstructions.value = `${destination.name} is ${Math.round(
      distance
    )}m ahead`;
  } else if (distance < 100) {
    arInstructions.value = `${destination.name} is ${Math.round(
      distance
    )}m away`;
  } else if (distance < 1000) {
    arInstructions.value = `${destination.name} is ${Math.round(
      distance
    )}m away`;
  } else {
    arInstructions.value = `${destination.name} is ${(distance / 1000).toFixed(
      1
    )}km away`;
  }
}

// Convert GPS coordinates to 3D world position
function gpsToWorldPosition(userLat, userLng, targetLat, targetLng) {
  // Earth's radius in meters
  const R = 6371000;

  // Convert to radians
  const userLatRad = (userLat * Math.PI) / 180;
  const userLngRad = (userLng * Math.PI) / 180;
  const targetLatRad = (targetLat * Math.PI) / 180;
  const targetLngRad = (targetLng * Math.PI) / 180;

  // Calculate differences
  const dLat = targetLatRad - userLatRad;
  const dLng = targetLngRad - userLngRad;

  // Calculate distance components in meters
  const x = dLng * Math.cos((userLatRad + targetLatRad) / 2) * R;
  const z = -dLat * R; // Negative because in 3D space, forward is negative Z

  return { x, z };
}

// Enhanced high-precision distance calculation using Haversine formula
function calculatePreciseDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

// Enhanced bearing calculation with stabilization
function calculatePreciseBearing(lat1, lng1, lat2, lng2) {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360; // Normalize to 0-360 degrees
}

// Stabilize location data to reduce GPS jitter
function stabilizeLocation(newLocation) {
  const now = Date.now();

  // Rate limiting
  if (now - lastUpdateTime.value < MIN_UPDATE_INTERVAL) {
    return stabilizedLocation.value || newLocation;
  }

  lastUpdateTime.value = now;

  // Add to history
  locationHistory.value.push({
    ...newLocation,
    timestamp: now,
  });

  // Keep only recent history (last 5 readings)
  if (locationHistory.value.length > 5) {
    locationHistory.value.shift();
  }

  // If this is the first reading, use it directly
  if (!stabilizedLocation.value) {
    stabilizedLocation.value = newLocation;
    return newLocation;
  }

  // Check if change is significant enough
  const distance = calculatePreciseDistance(
    stabilizedLocation.value.lat,
    stabilizedLocation.value.lng,
    newLocation.lat,
    newLocation.lng
  );

  if (distance < LOCATION_THRESHOLD) {
    return stabilizedLocation.value; // Ignore small changes
  }

  // Apply exponential smoothing for gradual updates
  const smoothedLat =
    stabilizedLocation.value.lat +
    (newLocation.lat - stabilizedLocation.value.lat) * STABILIZATION_FACTOR;
  const smoothedLng =
    stabilizedLocation.value.lng +
    (newLocation.lng - stabilizedLocation.value.lng) * STABILIZATION_FACTOR;

  stabilizedLocation.value = {
    lat: smoothedLat,
    lng: smoothedLng,
    accuracy: newLocation.accuracy,
  };

  return stabilizedLocation.value;
}

// Stabilize heading data to reduce compass jitter
function stabilizeHeading(newHeading) {
  if (!newHeading && newHeading !== 0) return stabilizedHeading.value;

  // Add to history
  headingHistory.value.push(newHeading);
  if (headingHistory.value.length > 3) {
    headingHistory.value.shift();
  }

  // If this is the first reading, use it directly
  if (stabilizedHeading.value === 0) {
    stabilizedHeading.value = newHeading;
    return newHeading;
  }

  // Calculate difference considering circular nature of degrees
  let diff = newHeading - stabilizedHeading.value;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  // Ignore small changes
  if (Math.abs(diff) < HEADING_THRESHOLD) {
    return stabilizedHeading.value;
  }

  // Apply smoothing
  stabilizedHeading.value =
    (stabilizedHeading.value + diff * STABILIZATION_FACTOR + 360) % 360;

  return stabilizedHeading.value;
}

function update3DElements() {
  if (
    !arrowModel ||
    !markerModel ||
    !currentLocation.value ||
    !destinationLocation.value ||
    !settings.value.showArrows
  )
    return;

  // Use stabilized location for calculations
  const stableLocation = stabilizeLocation(currentLocation.value);

  // Calculate precise distance and bearing
  const distance = calculatePreciseDistance(
    stableLocation.lat,
    stableLocation.lng,
    destinationLocation.value.lat,
    destinationLocation.value.lng
  );

  const bearing = calculatePreciseBearing(
    stableLocation.lat,
    stableLocation.lng,
    destinationLocation.value.lat,
    destinationLocation.value.lng
  );

  // Use stabilized heading
  const stableHeading = stabilizeHeading(userHeading.value);

  // Calculate relative direction with enhanced precision
  let relativeDirection = bearing - stableHeading;
  if (relativeDirection > 180) relativeDirection -= 360;
  if (relativeDirection < -180) relativeDirection += 360;

  // Update distance for other components
  distanceToDestination.value = distance;
  directionToDestination.value = bearing;

  // Show arrow only when distance is greater than 10 meters
  if (distance > 10) {
    arrowModel.visible = settings.value.showArrows;
    markerModel.visible = false;

    // Update arrow rotation with smooth interpolation
    const targetRotationY = (relativeDirection * Math.PI) / 180;

    // Smooth rotation interpolation to prevent jerky movements
    let currentRotationY = arrowModel.rotation.y;
    let rotationDiff = targetRotationY - currentRotationY;

    // Handle circular interpolation (shortest path)
    if (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
    if (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;

    // Apply smooth rotation with higher precision
    arrowModel.rotation.y = currentRotationY + rotationDiff * 0.08; // Smooth interpolation factor

    // Enhanced floating animation with distance-based amplitude
    const time = Date.now() * 0.001;
    const floatAmplitude = Math.max(0.05, Math.min(0.15, distance / 200));
    arrowModel.position.y = -2 + Math.sin(time) * floatAmplitude;

    // Dynamic arrow scaling based on distance with smoother transitions
    const targetScale = Math.max(0.25, Math.min(0.9, distance / 80));
    const currentScale = arrowModel.scale.x;
    const scaleDiff = (targetScale - currentScale) * 0.05; // Smooth scaling

    const newScale = currentScale + scaleDiff;
    arrowModel.scale.set(newScale, newScale, newScale);
  }
  // Show marker only when within 10 meters, positioned at exact GPS coordinates
  else {
    arrowModel.visible = false;
    markerModel.visible = true;

    // Calculate exact world position with enhanced precision
    const worldPos = gpsToWorldPosition(
      stableLocation.lat,
      stableLocation.lng,
      destinationLocation.value.lat,
      destinationLocation.value.lng
    );

    // Apply device heading rotation to world coordinates with stabilization
    const headingRad = (stableHeading * Math.PI) / 180;
    const rotatedX =
      worldPos.x * Math.cos(headingRad) - worldPos.z * Math.sin(headingRad);
    const rotatedZ =
      worldPos.x * Math.sin(headingRad) + worldPos.z * Math.cos(headingRad);

    // Smooth position interpolation for marker to prevent jitter
    const currentX = markerModel.position.x;
    const currentZ = markerModel.position.z;

    const positionDampening = 0.12; // Smooth position updates
    const targetX = rotatedX;
    const targetZ = rotatedZ;

    markerModel.position.set(
      currentX + (targetX - currentX) * positionDampening,
      0,
      currentZ + (targetZ - currentZ) * positionDampening
    );

    // Enhanced pulsing animation with distance-based intensity
    const time = Date.now() * 0.002;
    const pulseIntensity = Math.max(
      0.02,
      Math.min(0.08, ((10 - distance) / 10) * 0.05)
    );
    const pulseScale = 0.4 + Math.sin(time * 2) * pulseIntensity;
    markerModel.scale.set(pulseScale, pulseScale, pulseScale);

    // Gentle rotation for visibility without distraction
    markerModel.rotation.y += 0.005; // Slower, smoother rotation
  }
}

function startARRendering() {
  function renderFrame() {
    if (!isARNavigationActive.value || !renderer || !scene || !camera) {
      return;
    }

    // Update 3D elements if we have location data
    if (currentLocation.value && destinationLocation.value) {
      update3DElements();
    }

    // Render the scene
    renderer.render(scene, camera);

    animationId = requestAnimationFrame(renderFrame);
  }

  animationId = requestAnimationFrame(renderFrame);
}

function formatDistance(distance) {
  if (settings.value.distanceUnit === "imperial") {
    // Convert to feet/miles
    if (distance < 304.8) {
      // Less than 1000 feet
      return `${Math.round(distance * 3.28084)}ft`;
    } else {
      return `${(distance * 0.000621371).toFixed(1)}mi`;
    }
  } else {
    // Metric
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }
}

function updateCanvasDimensions() {
  canvasWidth.value = window.innerWidth;
  canvasHeight.value = window.innerHeight;
}

function stopARNavigation() {
  isARNavigationActive.value = false;
  isLocationTracking.value = false;

  // Stop animation loop
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  // Stop camera
  if (arVideoRef.value && arVideoRef.value.srcObject) {
    const tracks = arVideoRef.value.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    arVideoRef.value.srcObject = null;
  }

  // Clean up Three.js
  if (renderer) {
    renderer.dispose();
    if (threeContainerRef.value && renderer.domElement) {
      threeContainerRef.value.removeChild(renderer.domElement);
    }
  }

  if (scene) {
    // Dispose of geometries and materials
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }

  // Remove event listeners
  window.removeEventListener("deviceorientation", handleOrientationChange);
  window.removeEventListener("resize", onWindowResize);

  // Clean up voice services
  cleanupVoiceServices();

  // Reset variables
  scene = null;
  camera = null;
  renderer = null;
  arrowModel = null;
  markerModel = null;

  // Reset values
  currentLocation.value = null;
  destinationLocation.value = null;
  userHeading.value = 0;
  distanceToDestination.value = 0;
  directionToDestination.value = 0;
  arInstructions.value = "";
  showSettings.value = false;
  showCommandsHelp.value = false;
  announcementQueue.value = [];
  isProcessingQueue.value = false;
  lastInstruction.value = "";
  navigationStartTime.value = null;
  hasLoggedArrival.value = false;
  showArrivalOptions.value = false;
  hasArrived.value = false;

  // Emit stop event to parent
  emit("stop-navigation");
}

// Arrival completion methods
function startNewNavigation() {
  showArrivalOptions.value = false;
  hasArrived.value = false;
  hasLoggedArrival.value = false;

  // Emit event to parent to show location selection
  emit("startNewNavigation");
}

function continueExploring() {
  showArrivalOptions.value = false;
  hasArrived.value = false;
  hasLoggedArrival.value = false;

  // Just hide the dialog and let user continue with AR view active
  // They can manually select a new destination or explore
}

function finishNavigation() {
  showArrivalOptions.value = false;
  stopARNavigation();
}

function formatNavigationTime() {
  if (!navigationStartTime.value) return "0 min";

  const now = new Date();
  const durationMs = now.getTime() - navigationStartTime.value.getTime();
  const minutes = Math.floor(durationMs / (1000 * 60));
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}
</script>

<style scoped>
/* AR Navigation Styles */
.ar-navigation-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: #000;
}

.ar-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ar-three-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10000;
}

/* Controls Bar */
.ar-controls-bar {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10001;
}

.control-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.control-button:hover {
  background-color: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

.control-button.listening {
  background-color: rgba(66, 133, 244, 0.9);
  border-color: rgba(66, 133, 244, 0.3);
  color: white;
}

.control-button .icon {
  font-size: 24px;
  z-index: 2;
}

.pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(66, 133, 244, 0.7);
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

/* Settings Panel */
.navigation-settings {
  position: relative;
}

.settings-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 300px;
  z-index: 20;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.settings-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}

.setting-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-item label {
  font-size: 14px;
  margin-right: 10px;
  color: #333;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4285f4;
}

input:focus + .slider {
  box-shadow: 0 0 1px #4285f4;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

input[type="range"] {
  width: 150px;
}

.volume-value {
  font-size: 14px;
  width: 40px;
  text-align: right;
  color: #333;
}

select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #fff;
  font-size: 14px;
}

.close-settings {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
}

.close-settings:hover {
  background-color: #e5e5e5;
}

/* Voice Components */
.listening-indicator {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  font-size: 12px;
  color: #333;
  z-index: 10;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.commands-help {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 300px;
  z-index: 20;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.commands-help h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
}

.commands-help ul {
  margin: 0;
  padding-left: 20px;
}

.commands-help li {
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.close-help {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.close-help:hover {
  background-color: #e5e5e5;
}

/* Voice Guidance Status */
.voice-guidance-status {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 200px;
  transition: all 0.3s ease;
  z-index: 10001;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.voice-guidance-status.is-speaking {
  background-color: rgba(66, 133, 244, 0.1);
}

.status-icon {
  margin-right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon .icon {
  font-size: 18px;
}

.status-text {
  font-size: 14px;
  color: #333;
}

.speaking-animation {
  display: flex;
  align-items: flex-end;
  height: 16px;
  width: 18px;
}

.bar {
  background-color: #4285f4;
  width: 3px;
  margin: 0 1px;
  height: 3px;
  border-radius: 1px;
  animation: sound 0.5s 0s infinite alternate;
}

.bar:nth-child(1) {
  animation-duration: 0.2s;
}

.bar:nth-child(2) {
  animation-duration: 0.15s;
}

.bar:nth-child(3) {
  animation-duration: 0.25s;
}

.bar:nth-child(4) {
  animation-duration: 0.3s;
}

@keyframes sound {
  0% {
    height: 3px;
  }
  100% {
    height: 15px;
  }
}

/* Existing AR styles */
.ar-controls {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
}

.ar-stop-btn {
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.ar-stop-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.05);
}

.ar-info-overlay {
  position: absolute;
  top: 80px;
  left: 20px;
  right: 80px; /* Add more space on the right for voice commands */
  z-index: 10001;
  max-width: 280px; /* Limit the maximum width */
}

.ar-destination-info {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 16px; /* Reduce padding */
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ar-destination-info h3 {
  margin: 0 0 6px 0; /* Reduce margin */
  font-size: 18px; /* Slightly smaller font */
  font-weight: 600;
  color: #22c55e;
}

.ar-destination-info p {
  margin: 0 0 6px 0; /* Reduce margin */
  font-size: 14px; /* Smaller font */
  opacity: 0.9;
}

.ar-distance {
  font-size: 20px; /* Smaller distance font */
  font-weight: bold;
  color: #22c55e;
  text-align: center;
  margin-top: 6px; /* Reduce margin */
}

.ar-precision-info {
  margin-top: 8px;
  text-align: center;
  opacity: 0.8;
}

.ar-precision-info small {
  font-size: 12px;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.ar-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10001;
}

.ar-loading {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.ar-loading i {
  font-size: 2rem;
  margin-bottom: 12px;
  color: #22c55e;
}

.ar-loading p {
  margin: 0;
  font-size: 16px;
}

/* Responsive AR styles */
@media (max-width: 768px) {
  .ar-info-overlay {
    top: 70px;
    left: 10px;
    right: 70px; /* Leave space for voice commands */
    max-width: 250px;
  }

  .ar-destination-info {
    padding: 10px 12px; /* Even more compact on mobile */
  }

  .ar-destination-info h3 {
    font-size: 16px;
  }

  .ar-destination-info p {
    font-size: 13px;
  }

  .ar-distance {
    font-size: 18px;
  }

  .ar-controls-bar {
    top: 10px;
    right: 10px;
    gap: 8px;
  }

  .control-button {
    width: 45px;
    height: 45px;
  }

  .control-button .icon {
    font-size: 20px;
  }

  .settings-panel,
  .commands-help {
    width: 280px;
  }

  .ar-controls {
    bottom: 20px;
  }

  .ar-stop-btn {
    padding: 10px 20px;
    font-size: 14px;
  }

  .ar-info-overlay {
    bottom: 80px;
    left: 10px;
    right: 10px;
  }

  .ar-destination-info {
    padding: 12px 16px;
  }

  .ar-destination-info h3 {
    font-size: 18px;
  }

  .ar-destination-info p {
    font-size: 14px;
  }

  .ar-distance {
    font-size: 20px;
  }

  .voice-guidance-status {
    left: 10px;
    top: 10px;
  }
}

/* Glassmorphism effects */
.ar-destination-info,
.ar-loading,
.ar-stop-btn,
.settings-panel,
.commands-help,
.voice-guidance-status,
.listening-indicator {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Arrival Options Styles */
.arrival-options-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.arrival-options-dialog {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.arrival-header {
  margin-bottom: 25px;
}

.arrival-icon {
  font-size: 3rem;
  color: #22c55e;
  margin-bottom: 15px;
}

.arrival-header h3 {
  margin: 10px 0;
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: 600;
}

.arrival-header p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.arrival-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.primary-btn {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  transform: translateY(-2px);
}

.secondary-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.secondary-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
}

.finish-btn {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
}

.finish-btn:hover {
  background: linear-gradient(135deg, #4b5563, #374151);
  transform: translateY(-2px);
}

.arrival-info {
  color: #666;
  font-style: italic;
  margin-top: 15px;
}

.arrival-info small {
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .arrival-options-dialog {
    margin: 10px;
    padding: 20px;
  }

  .arrival-header h3 {
    font-size: 1.3rem;
  }

  .action-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}

/* ===========================
   ENHANCED RESPONSIVE STYLES
   =========================== */

/* Large screens */
@media (min-width: 1200px) {
  .ar-controls-bar {
    padding: 15px 30px;
    max-width: 1200px;
    margin: 0 auto;
    left: 50%;
    transform: translateX(-50%);
  }

  .settings-panel {
    min-width: 350px;
  }

  .arrival-notification {
    max-width: 500px;
  }
}

/* Desktop */
@media (max-width: 1199px) and (min-width: 992px) {
  .ar-controls-bar {
    padding: 12px 25px;
  }

  .control-button {
    min-width: 50px;
    height: 50px;
    font-size: 18px;
  }

  .settings-panel {
    min-width: 320px;
  }
}

/* Tablet */
@media (max-width: 991px) and (min-width: 768px) {
  .ar-controls-bar {
    padding: 10px 20px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .navigation-info {
    order: 1;
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
  }

  .navigation-settings {
    order: 2;
  }

  .voice-controls {
    order: 3;
  }

  .stop-navigation {
    order: 4;
  }

  .control-button {
    min-width: 45px;
    height: 45px;
    font-size: 16px;
  }

  .settings-panel {
    min-width: 280px;
    right: 10px;
  }

  .distance-display {
    font-size: 16px;
  }

  .instruction-text {
    font-size: 13px;
  }

  .arrival-notification {
    max-width: 90%;
    margin: 15px;
    padding: 20px;
  }
}

/* Mobile large */
@media (max-width: 767px) and (min-width: 480px) {
  .ar-navigation-container {
    position: relative;
  }

  .ar-video,
  .ar-three-container {
    width: 100vw;
    height: 100vh;
  }

  .ar-controls-bar {
    bottom: 20px;
    left: 10px;
    right: 10px;
    padding: 8px 15px;
    border-radius: 25px;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .navigation-info {
    order: 1;
    width: 100%;
    text-align: center;
    margin-bottom: 8px;
  }

  .distance-display {
    font-size: 14px;
    font-weight: 600;
  }

  .instruction-text {
    font-size: 12px;
    margin-top: 2px;
  }

  .control-button {
    min-width: 40px;
    height: 40px;
    font-size: 14px;
    padding: 8px;
    border-radius: 20px;
    margin: 0;
  }

  .settings-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 350px;
    max-height: 70vh;
    overflow-y: auto;
    z-index: 1001;
  }

  .setting-item {
    margin-bottom: 15px;
  }

  .setting-item label {
    font-size: 14px;
  }

  .volume-value {
    font-size: 12px;
  }

  .arrival-notification {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 400px;
    margin: 0;
    z-index: 1002;
  }

  .arrival-header h3 {
    font-size: 18px;
  }

  .arrival-content p {
    font-size: 14px;
  }

  .arrival-actions {
    flex-direction: column;
    gap: 10px;
  }

  .action-btn {
    width: 100%;
    padding: 12px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 44px; /* Touch target size */
  }
}

/* Mobile small */
@media (max-width: 479px) {
  .ar-controls-bar {
    bottom: 15px;
    left: 5px;
    right: 5px;
    padding: 6px 12px;
    border-radius: 20px;
  }

  .navigation-info {
    margin-bottom: 6px;
  }

  .distance-display {
    font-size: 13px;
  }

  .instruction-text {
    font-size: 11px;
  }

  .control-button {
    min-width: 36px;
    height: 36px;
    font-size: 12px;
    padding: 6px;
    border-radius: 18px;
  }

  .control-button .icon {
    font-size: 14px;
  }

  .settings-panel {
    width: 95vw;
    max-height: 80vh;
    padding: 15px;
  }

  .settings-panel h3 {
    font-size: 16px;
    margin-bottom: 15px;
  }

  .setting-item {
    margin-bottom: 12px;
  }

  .setting-item label {
    font-size: 13px;
  }

  .toggle-switch {
    transform: scale(0.8);
  }

  input[type="range"] {
    height: 30px;
  }

  .arrival-notification {
    width: 95vw;
    padding: 15px;
  }

  .arrival-header h3 {
    font-size: 16px;
  }

  .arrival-content p {
    font-size: 13px;
  }

  .action-btn {
    padding: 10px;
    font-size: 15px;
  }
}

/* Extra small mobile */
@media (max-width: 360px) {
  .ar-controls-bar {
    bottom: 10px;
    left: 3px;
    right: 3px;
    padding: 4px 8px;
  }

  .control-button {
    min-width: 32px;
    height: 32px;
    font-size: 10px;
    padding: 4px;
    border-radius: 16px;
  }

  .control-button .icon {
    font-size: 12px;
  }

  .distance-display {
    font-size: 12px;
  }

  .instruction-text {
    font-size: 10px;
  }

  .settings-panel {
    padding: 12px;
  }

  .settings-panel h3 {
    font-size: 14px;
  }

  .setting-item label {
    font-size: 12px;
  }

  .arrival-notification {
    padding: 12px;
  }

  .arrival-header h3 {
    font-size: 14px;
  }

  .arrival-content p {
    font-size: 12px;
  }

  .action-btn {
    padding: 8px;
    font-size: 14px;
  }
}

/* Landscape orientation */
@media (max-height: 500px) and (orientation: landscape) {
  .ar-controls-bar {
    bottom: 5px;
    left: 10px;
    right: 10px;
    padding: 4px 12px;
    flex-direction: row;
    flex-wrap: nowrap;
  }

  .navigation-info {
    order: 0;
    width: auto;
    margin-bottom: 0;
    margin-right: auto;
  }

  .distance-display {
    font-size: 11px;
  }

  .instruction-text {
    font-size: 9px;
  }

  .control-button {
    min-width: 30px;
    height: 30px;
    font-size: 10px;
    padding: 4px;
    margin: 0 2px;
  }

  .settings-panel {
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    max-width: 400px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .arrival-notification {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80vw;
    max-width: 350px;
    padding: 10px;
  }

  .arrival-header h3 {
    font-size: 14px;
  }

  .arrival-content p {
    font-size: 11px;
  }

  .arrival-actions {
    flex-direction: row;
    gap: 8px;
  }

  .action-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .control-button .icon {
    image-rendering: -webkit-optimize-contrast;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ar-navigation-container *,
  .settings-panel,
  .arrival-notification {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus styles for accessibility */
.control-button:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.action-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Touch-friendly adjustments for mobile */
@media (pointer: coarse) {
  .control-button {
    min-width: 44px;
    min-height: 44px;
  }

  .action-btn {
    min-height: 44px;
    padding: 12px 16px;
  }

  .toggle-switch {
    min-width: 44px;
    min-height: 24px;
  }

  input[type="range"] {
    min-height: 44px;
  }
}
</style>
