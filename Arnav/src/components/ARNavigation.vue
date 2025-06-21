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
const emit = defineEmits(["stop-navigation"]);

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

  // Get initial position
  navigator.geolocation.getCurrentPosition(
    updateCurrentLocation,
    handleLocationError,
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
  );

  // Watch position changes
  navigator.geolocation.watchPosition(
    updateCurrentLocation,
    handleLocationError,
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
  );
}

function updateCurrentLocation(position) {
  currentLocation.value = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };

  if (destinationLocation.value) {
    calculateNavigationData();
  }
}

function handleLocationError(error) {
  console.error("Location error:", error);
  arInstructions.value =
    "Unable to get your location. Please check GPS settings.";
}

function startOrientationTracking() {
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", handleOrientationChange);
  }
}

function handleOrientationChange(event) {
  // Get compass heading (0-360 degrees)
  userHeading.value = event.alpha || 0;

  if (currentLocation.value && destinationLocation.value) {
    calculateNavigationData();
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

  // Check for arrival
  if (distanceToDestination.value < 3 && previousDistance >= 3) {
    announceArrival();
  }
}

function updateARInstructions() {
  const distance = distanceToDestination.value;
  const destination = destinationLocation.value;

  if (distance < 3) {
    arInstructions.value = `You have arrived at ${destination.name}!`;
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

function update3DElements() {
  if (
    !arrowModel ||
    !markerModel ||
    !currentLocation.value ||
    !destinationLocation.value ||
    !settings.value.showArrows
  )
    return;

  const distance = distanceToDestination.value;
  const relativeDirection = directionToDestination.value - userHeading.value;
  const normalizedDirection = ((relativeDirection % 360) + 360) % 360;

  // Show arrow only when distance is greater than 10 meters
  if (distance > 10) {
    arrowModel.visible = settings.value.showArrows;
    markerModel.visible = false;

    // Update arrow rotation to point toward destination
    const arrowRotationY = (normalizedDirection * Math.PI) / 180;
    arrowModel.rotation.y = arrowRotationY;

    // Add subtle floating animation to arrow
    const time = Date.now() * 0.002;
    arrowModel.position.y = -2 + Math.sin(time) * 0.1;

    // Scale arrow based on distance (closer = smaller, further = larger)
    const arrowScale = Math.max(0.3, Math.min(0.8, distance / 100));
    arrowModel.scale.set(arrowScale, arrowScale, arrowScale);
  }
  // Show marker only when within 10 meters, positioned at exact GPS coordinates
  else {
    arrowModel.visible = false;
    markerModel.visible = true;

    // Calculate exact world position based on GPS coordinates
    const worldPos = gpsToWorldPosition(
      currentLocation.value.lat,
      currentLocation.value.lng,
      destinationLocation.value.lat,
      destinationLocation.value.lng
    );

    // Apply device heading rotation to world coordinates
    const headingRad = ((userHeading.value || 0) * Math.PI) / 180;
    const rotatedX =
      worldPos.x * Math.cos(headingRad) - worldPos.z * Math.sin(headingRad);
    const rotatedZ =
      worldPos.x * Math.sin(headingRad) + worldPos.z * Math.cos(headingRad);

    // Position marker at exact calculated coordinates
    markerModel.position.set(rotatedX, 0, rotatedZ);

    // Add pulsing animation to marker
    const time = Date.now() * 0.002;
    const pulseScale = 0.4 + Math.sin(time * 2) * 0.05;
    markerModel.scale.set(pulseScale, pulseScale, pulseScale);

    // Rotate marker slowly for visibility
    markerModel.rotation.y += 0.01;

    // Debug log for exact positioning
    console.log(`Marker positioned at exact GPS coordinates:
      User: ${currentLocation.value.lat.toFixed(
        6
      )}, ${currentLocation.value.lng.toFixed(6)}
      Destination: ${destinationLocation.value.lat.toFixed(
        6
      )}, ${destinationLocation.value.lng.toFixed(6)}
      World Position: x=${rotatedX.toFixed(2)}, z=${rotatedZ.toFixed(2)}
      Distance: ${distance.toFixed(2)}m`);
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

  // Emit stop event to parent
  emit("stop-navigation");
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
  bottom: 100px;
  left: 20px;
  right: 20px;
  z-index: 10001;
}

.ar-destination-info {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ar-destination-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #22c55e;
}

.ar-destination-info p {
  margin: 0 0 8px 0;
  font-size: 16px;
  opacity: 0.9;
}

.ar-distance {
  font-size: 24px;
  font-weight: bold;
  color: #22c55e;
  text-align: center;
  margin-top: 8px;
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
</style>
