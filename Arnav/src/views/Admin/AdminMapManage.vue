<template>
  <AdminLayout>
    <template #nav>
      <div class="page-header">
        <h1 class="page-title">AR Navigation Management</h1>
      </div>
    </template>

    <div class="map-management">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">
          <i class="bx bx-loader-alt bx-spin"></i>
        </div>
        <h3>Loading AR Navigation System...</h3>
        <p>Please wait while we initialize the application</p>
      </div>

      <!-- Main Content (only show when not loading) -->
      <template v-else>
        <!-- Stats Overview -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="bx bxs-map-pin"></i>
            </div>
            <div class="stat-content">
              <h3>{{ waypoints.length }}</h3>
              <p>Total Waypoints</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="bx bxs-camera"></i>
            </div>
            <div class="stat-content">
              <h3>{{ waypoints.filter((w) => w.imageUrl).length }}</h3>
              <p>AR Markers</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="bx bxs-check-circle"></i>
            </div>
            <div class="stat-content">
              <h3>
                {{ waypoints.filter((w) => w.type === "facility").length }}
              </h3>
              <p>Facilities</p>
            </div>
          </div>
          <div class="stat-card maintenance-stat">
            <div class="stat-icon">
              <i class="bx bx-wrench"></i>
            </div>
            <div class="stat-content">
              <h3>
                {{ waypoints.filter((w) => w.isUnderMaintenance).length }}
              </h3>
              <p>Under Maintenance</p>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button
            :class="['tab-btn', { active: activeTab === 'add' }]"
            @click="activeTab = 'add'">
            <i class="bx bx-plus-circle"></i>
            Add Waypoint
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'list' }]"
            @click="activeTab = 'list'">
            <i class="bx bx-list-ul"></i>
            Waypoints
          </button>
          <router-link to="/admin-qr-generator" class="tab-btn">
            <i class="bx bx-qr-scan"></i>
            QR Generator
          </router-link>
        </div>

        <!-- Add/Edit Waypoint Form -->
        <div v-if="activeTab === 'add'" class="content-card">
          <div class="card-header">
            <h2>{{ isEditMode ? "Edit Waypoint" : "Add New Waypoint" }}</h2>
            <button v-if="isEditMode" @click="resetForm" class="btn-secondary">
              <i class="bx bx-x"></i>
              Cancel Edit
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="waypoint-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="name">Waypoint Name</label>
                <input
                  id="name"
                  v-model="waypoint.name"
                  type="text"
                  required
                  placeholder="Enter waypoint name" />
              </div>

              <div class="form-group">
                <label for="type">Type</label>
                <select id="type" v-model="waypoint.type" required>
                  <option value="entrance">Entrance</option>
                  <option value="exit">Exit</option>
                  <option value="landmark">Landmark</option>
                  <option value="junction">Junction</option>
                  <option value="facility">Facility</option>
                  <option value="parking">Parking</option>
                  <option value="office">Office</option>
                  <option value="cr">CR</option>
                  <option value="animal_enclosure">Animal Enclosure</option>
                  <option value="food_production">Food Production</option>
                  <option value="plant_areas">Plant Areas</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="waypoint.description"
                rows="3"
                required
                placeholder="Enter waypoint description"></textarea>
            </div>

            <div class="form-group">
              <div class="maintenance-section">
                <div class="maintenance-toggle">
                  <input
                    id="maintenance"
                    v-model="waypoint.isUnderMaintenance"
                    type="checkbox"
                    class="maintenance-checkbox" />
                  <label for="maintenance" class="maintenance-label">
                    <i class="bx bx-wrench"></i>
                    Under Maintenance
                  </label>
                </div>
                <div
                  v-if="waypoint.isUnderMaintenance"
                  class="maintenance-details">
                  <input
                    v-model="waypoint.maintenanceReason"
                    type="text"
                    placeholder="Reason for maintenance (optional)"
                    class="maintenance-reason-input" />
                </div>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="latitude">
                  Latitude (High Precision)
                  <i
                    class="fas fa-info-circle coordinates-info"
                    title="Ultra-precise coordinates (8 decimal places) required for exact AR Navigation positioning. Use GPS Capture for best accuracy.">
                  </i>
                </label>
                <input
                  id="latitude"
                  v-model.number="waypoint.coordinates.x"
                  type="number"
                  step="0.00000001"
                  min="-90"
                  max="90"
                  required
                  placeholder="0.00000000"
                  @input="validateCoordinates" />
                <small
                  class="coordinate-precision"
                  v-if="waypoint.coordinates.x">
                  {{ getCoordinatePrecision(waypoint.coordinates.x) }}
                </small>
              </div>

              <div class="form-group">
                <label for="longitude">
                  Longitude (High Precision)
                  <i
                    class="fas fa-info-circle coordinates-info"
                    title="Ultra-precise coordinates (8 decimal places) for exact location positioning.">
                  </i>
                </label>
                <input
                  id="longitude"
                  v-model.number="waypoint.coordinates.y"
                  type="number"
                  step="0.00000001"
                  min="-180"
                  max="180"
                  required
                  placeholder="0.00000000"
                  @input="validateCoordinates" />
                <small
                  class="coordinate-precision"
                  v-if="waypoint.coordinates.y">
                  {{ getCoordinatePrecision(waypoint.coordinates.y) }}
                </small>
              </div>

              <div class="form-group">
                <label for="altitude">
                  Altitude (m)
                  <i
                    class="fas fa-info-circle coordinates-info"
                    title="Altitude above sea level in meters. Helps with 3D positioning accuracy.">
                  </i>
                </label>
                <input
                  id="altitude"
                  v-model.number="waypoint.altitude"
                  type="number"
                  step="0.01"
                  placeholder="0.00" />
              </div>

              <!-- Enhanced location capture buttons -->
              <div class="form-group location-actions">
                <label>&nbsp;</label>
                <!-- Empty label for alignment -->
                <button
                  type="button"
                  @click="getCurrentLocationPrecise"
                  class="btn-location-precise"
                  :disabled="capturing">
                  <i
                    class="bx"
                    :class="
                      capturing ? 'bx-loader-alt bx-spin' : 'bx-target-lock'
                    "></i>
                  {{ capturing ? "Capturing GPS..." : "Get Precise Location" }}
                </button>
              </div>

              <!-- Overall accuracy indicator -->
              <div
                v-if="waypoint.coordinates.x && waypoint.coordinates.y"
                class="form-group">
                <div class="overall-accuracy">
                  <div class="accuracy-header">
                    <i class="bx bx-target-lock"></i>
                    <span>Location Accuracy Assessment</span>
                  </div>
                  <div
                    class="accuracy-indicator"
                    :class="getOverallAccuracyClass()">
                    {{ getOverallAccuracyText() }}
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="image">AR Marker Image</label>
              <div
                class="file-upload-area"
                @dragover.prevent
                @drop.prevent="handleFileDrop">
                <input
                  ref="fileInput"
                  id="image"
                  type="file"
                  @change="handleFileUpload"
                  accept="image/*"
                  class="file-input" />
                <div class="upload-placeholder">
                  <i class="bx bx-cloud-upload"></i>
                  <p>Click to upload or drag and drop</p>
                  <span>PNG, JPG, GIF up to 10MB</span>
                  <div class="upload-note">
                    <small>Note: Using Cloudinary for image storage</small>
                  </div>
                </div>
              </div>

              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Preview" />
                <button type="button" @click="removeImage" class="remove-image">
                  <i class="bx bx-x"></i>
                </button>
                <div class="image-status">
                  <span v-if="waypoint.imageUrl" class="status-success">
                    <i class="bx bx-check-circle"></i> Uploaded to cloud
                  </span>
                  <span v-else class="status-local">
                    <i class="bx bx-info-circle"></i> Local preview only
                  </span>
                </div>
              </div>

              <div v-if="uploading" class="upload-progress">
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <span
                  ><i class="bx bx-loader-alt bx-spin"></i> Uploading to
                  Cloudinary...</span
                >
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" :disabled="saving" class="btn-primary">
                <i class="bx bx-save"></i>
                {{
                  saving
                    ? "Saving..."
                    : isEditMode
                    ? "Update Waypoint"
                    : "Add Waypoint"
                }}
              </button>
              <button
                v-if="isEditMode"
                type="button"
                @click="confirmDeleteWaypoint(editingWaypoint)"
                class="btn-danger">
                <i class="bx bx-trash"></i>
                Delete
              </button>
            </div>
          </form>
        </div>

        <!-- Waypoints List -->
        <div v-if="activeTab === 'list'" class="content-card">
          <div class="card-header">
            <h2>Waypoints Management</h2>
            <div class="search-filter-container">
              <div class="search-box">
                <i class="bx bx-search"></i>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search waypoints..." />
              </div>
              <div class="category-filter">
                <i class="bx bx-filter"></i>
                <select v-model="selectedCategory" @change="filterByCategory">
                  <option value="">All Categories</option>
                  <option value="entrance">Entrance</option>
                  <option value="exit">Exit</option>
                  <option value="landmark">Landmark</option>
                  <option value="junction">Junction</option>
                  <option value="facility">Facility</option>
                  <option value="parking">Parking</option>
                  <option value="office">Office</option>
                  <option value="cr">CR</option>
                  <option value="animal_enclosure">Animal Enclosure</option>
                  <option value="food_production">Food Production</option>
                  <option value="plant_areas">Plant Areas</option>
                </select>
              </div>
              <div class="maintenance-filter">
                <i class="bx bx-wrench"></i>
                <select
                  v-model="maintenanceFilter"
                  @change="filterByMaintenance">
                  <option value="">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>
              <button
                v-if="selectedCategory || searchQuery || maintenanceFilter"
                @click="clearFilters"
                class="btn-clear-filters">
                <i class="bx bx-x"></i>
                Clear Filters
              </button>
            </div>
          </div>

          <!-- Filter Summary -->
          <div v-if="selectedCategory || searchQuery" class="filter-summary">
            <div class="filter-info">
              <i class="bx bx-info-circle"></i>
              <span>
                Showing {{ filteredWaypoints.length }} of
                {{ waypoints.length }} waypoints
                <template v-if="selectedCategory">
                  for category:
                  <strong>{{ formatCategoryName(selectedCategory) }}</strong>
                </template>
                <template v-if="searchQuery">
                  matching: <strong>"{{ searchQuery }}"</strong>
                </template>
              </span>
            </div>
          </div>

          <div v-if="filteredWaypoints.length === 0" class="empty-state">
            <i class="bx bx-map-pin"></i>
            <h3>No waypoints found</h3>
            <p>
              {{
                searchQuery || selectedCategory
                  ? "Try adjusting your search terms or filters"
                  : "Start by adding your first waypoint"
              }}
            </p>
          </div>

          <div v-else class="waypoints-grid">
            <div
              v-for="wp in filteredWaypoints"
              :key="wp.id"
              class="waypoint-card">
              <div class="waypoint-image">
                <img
                  :src="wp.imageUrl || '/placeholder.svg?height=120&width=120'"
                  :alt="wp.name" />
                <div class="waypoint-type">
                  {{ formatCategoryName(wp.type) }}
                </div>
                <div v-if="wp.isUnderMaintenance" class="maintenance-badge">
                  <i class="bx bx-wrench"></i>
                  Maintenance
                </div>
              </div>

              <div class="waypoint-content">
                <h3>{{ wp.name }}</h3>
                <p>{{ wp.description }}</p>

                <div v-if="wp.isUnderMaintenance" class="maintenance-info">
                  <div class="maintenance-status">
                    <i class="bx bx-error-circle"></i>
                    <span>Currently under maintenance</span>
                  </div>
                  <div v-if="wp.maintenanceReason" class="maintenance-reason">
                    <small>{{ wp.maintenanceReason }}</small>
                  </div>
                </div>

                <div class="waypoint-meta">
                  <div class="meta-item location-precision">
                    <div class="coordinate-info">
                      <div class="coordinates">
                        <i class="bx bx-map-pin"></i>
                        <span
                          >{{ wp.coordinates.x }}, {{ wp.coordinates.y }}</span
                        >
                      </div>
                      <div class="precision-info" v-if="wp.locationPrecision">
                        {{ getLocationAccuracyDisplay(wp) }}
                      </div>
                    </div>
                  </div>
                  <div v-if="wp.altitude" class="meta-item">
                    <i class="bx bx-trending-up"></i>
                    <span>{{ wp.altitude }}m</span>
                  </div>
                  <div class="meta-item">
                    <i
                      :class="
                        wp.imageUrl ? 'bx bx-check-circle' : 'bx bx-x-circle'
                      "></i>
                    <span>{{ wp.imageUrl ? "AR Marker" : "No Marker" }}</span>
                  </div>
                </div>
              </div>

              <div class="waypoint-actions">
                <button
                  @click="toggleMaintenance(wp)"
                  :class="[
                    'btn-maintenance',
                    { active: wp.isUnderMaintenance },
                  ]"
                  :title="
                    wp.isUnderMaintenance
                      ? 'Remove from maintenance'
                      : 'Mark as under maintenance'
                  ">
                  <i class="bx bx-wrench"></i>
                </button>
                <button @click="editWaypoint(wp)" class="btn-edit">
                  <i class="bx bx-edit"></i>
                </button>
                <button @click="confirmDeleteWaypoint(wp)" class="btn-delete">
                  <i class="bx bx-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirmation Modal -->
        <div
          v-if="showConfirmModal"
          class="modal-overlay"
          @click="cancelDelete">
          <div class="modal-content confirmation-modal" @click.stop>
            <div class="modal-header">
              <h3>
                <i class="bx bx-error-circle text-danger"></i>
                Confirm Deletion
              </h3>
            </div>
            <div class="modal-body">
              <p>{{ confirmationMessage }}</p>
              <div class="warning-note">
                <i class="bx bx-info-circle"></i>
                <span>This action cannot be undone.</span>
              </div>
            </div>
            <div class="modal-actions">
              <button @click="cancelDelete" class="btn-secondary">
                <i class="bx bx-x"></i>
                Cancel
              </button>
              <button @click="proceedWithDelete" class="btn-danger">
                <i class="bx bx-trash"></i>
                Delete {{ deleteType }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getApps, initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useToast } from "vue-toastification";
import AdminLayout from "../Admin/AdminLayout.vue";
import NotificationService from "@/services/NotificationService";

// Initialize toast
const toast = useToast();

// Firebase configuration
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBTylfFz4_JcbvSlDof4YTf-yDVHPY_swk",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "ar-path-3eb94.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ar-path-3eb94",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ar-path-3eb94.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "314906875610",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:314906875610:web:02edf761141fa1aa8677e3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V7PCV8YV9P",
};

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhkztfwiw";
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "my_unsigned_preset";

// Initialize Firebase
let firebaseApp;
const existingApps = getApps();
if (existingApps.length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = existingApps[0];
}

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Reactive data
const activeTab = ref("list");
const waypoints = ref([]);
const searchQuery = ref("");
const selectedCategory = ref("");
const maintenanceFilter = ref("");
const isEditMode = ref(false);
const editingWaypoint = ref(null);
const saving = ref(false);
const uploading = ref(false);
const imagePreview = ref("");
const isAuthenticated = ref(false);
const isLoading = ref(true);

// Enhanced location capture state
const capturing = ref(false);
const locationReadings = ref([]);

// Confirmation modal state
const showConfirmModal = ref(false);
const confirmationMessage = ref("");
const deleteType = ref("");
const pendingDeleteAction = ref(null);

// Form data
const waypoint = ref({
  name: "",
  description: "",
  coordinates: { x: 0, y: 0 },
  altitude: null,
  type: "landmark",
  imageUrl: "",
  isUnderMaintenance: false,
  maintenanceReason: "",
});

// Computed - Enhanced filtering logic
const filteredWaypoints = computed(() => {
  let filtered = waypoints.value;

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter((wp) => wp.type === selectedCategory.value);
  }

  // Filter by maintenance status
  if (maintenanceFilter.value) {
    if (maintenanceFilter.value === "maintenance") {
      filtered = filtered.filter((wp) => wp.isUnderMaintenance);
    } else if (maintenanceFilter.value === "active") {
      filtered = filtered.filter((wp) => !wp.isUnderMaintenance);
    }
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (wp) =>
        wp.name.toLowerCase().includes(query) ||
        wp.description.toLowerCase().includes(query) ||
        wp.type.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Confirmation functions
const confirmDeleteWaypoint = (waypointToDelete) => {
  confirmationMessage.value = `Are you sure you want to delete the waypoint "${waypointToDelete.name}"? This will permanently remove all associated data including coordinates, images, and connections.`;
  deleteType.value = "Waypoint";
  pendingDeleteAction.value = () => deleteWaypoint(waypointToDelete.id);
  showConfirmModal.value = true;
};

const proceedWithDelete = () => {
  if (pendingDeleteAction.value) {
    pendingDeleteAction.value();
  }
  cancelDelete();
};

const cancelDelete = () => {
  showConfirmModal.value = false;
  confirmationMessage.value = "";
  deleteType.value = "";
  pendingDeleteAction.value = null;
};

// New utility functions
const formatCategoryName = (category) => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const filterByCategory = () => {
  // This function is called when category changes
  // The computed property will automatically update
};

const filterByMaintenance = () => {
  // This function is called when maintenance filter changes
  // The computed property will automatically update
};

const clearFilters = () => {
  selectedCategory.value = "";
  searchQuery.value = "";
  maintenanceFilter.value = "";
};

// Firebase operations
const loadWaypoints = async () => {
  if (!isAuthenticated.value) {
    toast.error("Please wait for authentication...");
    return;
  }

  try {
    console.log("Loading waypoints...");
    const querySnapshot = await getDocs(collection(db, "waypoints"));
    waypoints.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(`Loaded ${waypoints.value.length} waypoints`);
  } catch (error) {
    console.error("Error loading waypoints:", error);
    if (error.code === "permission-denied") {
      toast.error("Access denied. Please check your permissions.");
    } else {
      toast.error("Failed to load waypoints. Please try again.");
    }
  }
};

// Authentication handler
const initializeAuth = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User authenticated:", user.uid);
        isAuthenticated.value = true;
        await loadData();
      } else {
        console.log("No user authenticated, signing in anonymously...");
        try {
          await signInAnonymously(auth);
          console.log("Anonymous sign-in successful");
        } catch (error) {
          console.error("Anonymous sign-in failed:", error);
          toast.error("Authentication failed. Please refresh the page.");
        }
      }
      isLoading.value = false;
      resolve();
    });
  });
};

const loadData = async () => {
  await loadWaypoints();
};

// CRUD operations
const handleSubmit = async () => {
  saving.value = true;
  try {
    // Enhanced coordinate validation
    if (
      !waypoint.value.coordinates ||
      (waypoint.value.coordinates.x === 0 && waypoint.value.coordinates.y === 0)
    ) {
      toast.error(
        "Please provide valid coordinates (not 0,0). Use 'Get Precise Location' for best accuracy."
      );
      saving.value = false;
      return;
    }

    // Validate coordinate ranges
    if (!validateCoordinates()) {
      saving.value = false;
      return;
    }

    // Check coordinate precision for accuracy warning
    const latPrecision = (
      waypoint.value.coordinates.x.toString().split(".")[1] || ""
    ).length;
    const lngPrecision = (
      waypoint.value.coordinates.y.toString().split(".")[1] || ""
    ).length;

    if (latPrecision < 6 || lngPrecision < 6) {
      const confirmed = confirm(
        `Warning: Coordinates have low precision (${Math.min(
          latPrecision,
          lngPrecision
        )} decimal places).\n\n` +
          `For high accuracy AR navigation, we recommend at least 6-8 decimal places.\n\n` +
          `Current accuracy: ~${
            latPrecision < 4 ? "100m+" : latPrecision < 6 ? "10m+" : "1m+"
          }\n\n` +
          `Continue with current coordinates?`
      );

      if (!confirmed) {
        saving.value = false;
        return;
      }
    }

    // Check for duplicate location (within 5 meters)
    const nearbyLocations = await findNearbyWaypoint(
      waypoint.value.coordinates.x,
      waypoint.value.coordinates.y,
      5
    );

    const duplicateLocation = nearbyLocations.find(
      (item) =>
        !isEditMode.value || item.waypoint.id !== editingWaypoint.value?.id
    );

    if (duplicateLocation) {
      const confirmed = confirm(
        `Warning: There's already a waypoint "${duplicateLocation.waypoint.name}" ` +
          `within ${duplicateLocation.accuracy} of this location.\n\n` +
          `Continue saving at this precise location?`
      );

      if (!confirmed) {
        saving.value = false;
        return;
      }
    }

    // Check for duplicate name (case-insensitive)
    const duplicate = waypoints.value.some(
      (wp) =>
        wp.name.trim().toLowerCase() ===
          waypoint.value.name.trim().toLowerCase() &&
        (!isEditMode.value || wp.id !== editingWaypoint.value?.id)
    );
    if (duplicate) {
      toast.error("A waypoint with this name already exists!");
      saving.value = false;
      return;
    }

    // Store EXACT coordinates without any rounding
    const waypointData = {
      name: waypoint.value.name,
      description: waypoint.value.description,
      coordinates: {
        x: waypoint.value.coordinates.x, // Store exact value
        y: waypoint.value.coordinates.y, // Store exact value
      },
      altitude: waypoint.value.altitude,
      type: waypoint.value.type,
      imageUrl: waypoint.value.imageUrl,
      isUnderMaintenance: waypoint.value.isUnderMaintenance || false,
      maintenanceReason: waypoint.value.maintenanceReason || "",
      updatedAt: new Date(),
      // Add precision metadata
      locationPrecision: {
        latitude: latPrecision,
        longitude: lngPrecision,
        capturedAt: new Date(),
        method: latPrecision >= 6 ? "high-precision" : "manual",
        gpsReadings:
          locationReadings.value.length > 0 ? locationReadings.value.length : 1,
      },
    };

    if (isEditMode.value && editingWaypoint.value) {
      await updateDoc(
        doc(db, "waypoints", editingWaypoint.value.id),
        waypointData
      );
    } else {
      waypointData.createdAt = new Date();
      const docRef = await addDoc(collection(db, "waypoints"), waypointData);

      // Create notification for new waypoint
      try {
        console.log(
          "Creating notification with EXACT coordinates:",
          waypoint.value.coordinates
        );
        await NotificationService.createWaypointNotification({
          id: docRef.id,
          name: waypoint.value.name,
          type: waypoint.value.type,
          description: waypoint.value.description,
          coordinates: waypoint.value.coordinates, // Exact coordinates for AR Navigation
        });
        console.log(
          "Notification created for new waypoint with exact coordinates"
        );
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't fail the waypoint creation if notification fails
      }
    }

    await loadWaypoints();
    resetForm();
    activeTab.value = "list";
  } catch (error) {
    console.error("Error saving waypoint:", error);
    toast.error(`Failed to save waypoint "${waypoint.value.name}"`);
  } finally {
    saving.value = false;
  }
};

const editWaypoint = (wp) => {
  isEditMode.value = true;
  editingWaypoint.value = wp;
  waypoint.value = { ...wp };
  imagePreview.value = wp.imageUrl || "";
  activeTab.value = "add";
  toast.info(`Editing waypoint: ${wp.name}`);
};

const deleteWaypoint = async (id) => {
  try {
    const waypointToDelete = waypoints.value.find((wp) => wp.id === id);
    const waypointName = waypointToDelete ? waypointToDelete.name : "Unknown";

    await deleteDoc(doc(db, "waypoints", id));
    await loadWaypoints();
    toast.success(`Waypoint "${waypointName}" deleted successfully!`);

    if (isEditMode.value && editingWaypoint.value?.id === id) {
      resetForm();
    }
  } catch (error) {
    console.error("Error deleting waypoint:", error);
    toast.error("Failed to delete waypoint");
  }
};

// Maintenance functions
const toggleMaintenance = async (waypointToToggle) => {
  try {
    const newMaintenanceStatus = !waypointToToggle.isUnderMaintenance;

    await updateDoc(doc(db, "waypoints", waypointToToggle.id), {
      isUnderMaintenance: newMaintenanceStatus,
      maintenanceReason: newMaintenanceStatus
        ? waypointToToggle.maintenanceReason || ""
        : "",
      updatedAt: new Date(),
    });

    // Create notification for maintenance status change
    try {
      if (newMaintenanceStatus) {
        await NotificationService.createMaintenanceNotification({
          id: waypointToToggle.id,
          name: waypointToToggle.name,
          type: waypointToToggle.type,
          reason: waypointToToggle.maintenanceReason || "Under maintenance",
          coordinates: waypointToToggle.coordinates,
          action: "started",
        });
        toast.success(
          `${waypointToToggle.name} marked as under maintenance. Users will be notified.`
        );
      } else {
        await NotificationService.createMaintenanceNotification({
          id: waypointToToggle.id,
          name: waypointToToggle.name,
          type: waypointToToggle.type,
          coordinates: waypointToToggle.coordinates,
          action: "completed",
        });
        toast.success(
          `${waypointToToggle.name} maintenance completed. Users will be notified.`
        );
      }
    } catch (notificationError) {
      console.error(
        "Error creating maintenance notification:",
        notificationError
      );
      // Don't fail the maintenance toggle if notification fails
    }

    await loadWaypoints();
  } catch (error) {
    console.error("Error toggling maintenance status:", error);
    toast.error(
      `Failed to update maintenance status for ${waypointToToggle.name}`
    );
  }
};

// File upload
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    toast.error("File size must be less than 10MB");
    // Clear file input so the next selection (even the same file) triggers change
    if (fileInput.value) fileInput.value.value = "";
    return;
  }

  // Show preview immediately
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);

  uploading.value = true;
  try {
    // Method 1: Try with your existing preset
    let response = await uploadToCloudinary(file, CLOUDINARY_UPLOAD_PRESET);

    // Method 2: If that fails, try with a different approach
    if (!response.ok) {
      console.log("First upload method failed, trying alternative...");
      response = await uploadToCloudinaryAlternative(file);
    }

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Upload failed");
    }

    waypoint.value.imageUrl = data.secure_url;
    toast.success("Image uploaded successfully!");
  } catch (error) {
    console.error("Error uploading image:", error);
    toast.error(`Failed to upload image: ${error.message}`);
    // Keep the preview but clear the URL
    waypoint.value.imageUrl = "";
  } finally {
    uploading.value = false;
    // Important: clear the file input to prevent double-open and allow re-selecting same file
    if (fileInput.value) fileInput.value.value = "";
  }
};

// Primary upload method
const uploadToCloudinary = async (file, uploadPreset) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  return await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
};

// Alternative upload method with different preset
const uploadToCloudinaryAlternative = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default"); // Cloudinary's default unsigned preset

  return await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
};

// Add these utility functions
const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileDrop = (event) => {
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith("image/")) {
      // Simulate file input change
      const fakeEvent = { target: { files: [file] } };
      handleFileUpload(fakeEvent);
    } else {
      toast.error("Please drop an image file");
    }
  }
};

// Enhanced utility functions for precise location handling
const validateCoordinates = () => {
  // Validate latitude range
  if (waypoint.value.coordinates.x < -90 || waypoint.value.coordinates.x > 90) {
    toast.error("Latitude must be between -90 and 90 degrees");
    return false;
  }

  // Validate longitude range
  if (
    waypoint.value.coordinates.y < -180 ||
    waypoint.value.coordinates.y > 180
  ) {
    toast.error("Longitude must be between -180 and 180 degrees");
    return false;
  }

  return true;
};

const getCoordinatePrecision = (coordinate) => {
  if (!coordinate) return "";

  const decimalPlaces = (coordinate.toString().split(".")[1] || "").length;
  let accuracyMeters;

  // Approximate accuracy based on decimal places
  switch (decimalPlaces) {
    case 0:
      accuracyMeters = "~111 km";
      break;
    case 1:
      accuracyMeters = "~11.1 km";
      break;
    case 2:
      accuracyMeters = "~1.1 km";
      break;
    case 3:
      accuracyMeters = "~110 m";
      break;
    case 4:
      accuracyMeters = "~11 m";
      break;
    case 5:
      accuracyMeters = "~1.1 m";
      break;
    case 6:
      accuracyMeters = "~0.11 m";
      break;
    case 7:
      accuracyMeters = "~1.1 cm";
      break;
    case 8:
      accuracyMeters = "~1.1 mm";
      break;
    default:
      accuracyMeters = decimalPlaces > 8 ? "Sub-millimeter" : "Low";
  }

  return `${decimalPlaces} decimal places (${accuracyMeters})`;
};

// Display location accuracy information for saved waypoints
const getLocationAccuracyDisplay = (waypoint) => {
  if (!waypoint.locationPrecision) return "Standard precision";

  const {
    latitude: latPrec,
    longitude: lngPrec,
    method,
    gpsReadings,
  } = waypoint.locationPrecision;
  const avgPrecision = Math.min(latPrec, lngPrec);

  let accuracyText = "";
  if (avgPrecision >= 8) {
    accuracyText = "Ultra-high precision (±1mm)";
  } else if (avgPrecision >= 6) {
    accuracyText = "High precision (±10cm)";
  } else if (avgPrecision >= 4) {
    accuracyText = "Medium precision (±10m)";
  } else {
    accuracyText = "Low precision (±100m+)";
  }

  const methodText =
    method === "high-precision" ? " • GPS captured" : " • Manual entry";
  const readingsText =
    gpsReadings > 1 ? ` • ${gpsReadings} readings averaged` : "";

  return accuracyText + methodText + readingsText;
};

// Overall accuracy assessment functions
const getOverallAccuracyClass = () => {
  const latPrec = (waypoint.value.coordinates.x.toString().split(".")[1] || "")
    .length;
  const lngPrec = (waypoint.value.coordinates.y.toString().split(".")[1] || "")
    .length;
  const minPrec = Math.min(latPrec, lngPrec);

  if (minPrec >= 8) return "accuracy-excellent";
  if (minPrec >= 6) return "accuracy-good";
  if (minPrec >= 4) return "accuracy-fair";
  return "accuracy-poor";
};

const getOverallAccuracyText = () => {
  const latPrec = (waypoint.value.coordinates.x.toString().split(".")[1] || "")
    .length;
  const lngPrec = (waypoint.value.coordinates.y.toString().split(".")[1] || "")
    .length;
  const minPrec = Math.min(latPrec, lngPrec);

  if (minPrec >= 8) {
    return `🎯 Ultra-High Precision • Sub-millimeter accuracy • Perfect for AR Navigation`;
  } else if (minPrec >= 6) {
    return `✅ High Precision • ~10cm accuracy • Excellent for AR Navigation`;
  } else if (minPrec >= 4) {
    return `⚠️ Medium Precision • ~10 meter accuracy • May affect AR accuracy`;
  } else {
    return `❌ Low Precision • 100+ meter accuracy • Not recommended for precise AR`;
  }
};

// High precision distance calculation using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
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
};

// Enhanced location finder function
const findNearbyWaypoint = async (targetLat, targetLng, radiusMeters = 10) => {
  const found = [];

  waypoints.value.forEach((wp) => {
    const distance = calculateDistance(
      targetLat,
      targetLng,
      wp.coordinates.x,
      wp.coordinates.y
    );

    if (distance <= radiusMeters) {
      found.push({
        waypoint: wp,
        distance: distance,
        accuracy: `±${distance.toFixed(2)}m`,
      });
    }
  });

  // Sort by distance (closest first)
  return found.sort((a, b) => a.distance - b.distance);
};

// Ultra-precise GPS capture with multiple readings
const getCurrentLocationPrecise = () => {
  if (!navigator.geolocation) {
    toast.error("Geolocation is not supported by this browser");
    return;
  }

  capturing.value = true;
  locationReadings.value = [];

  // High accuracy geolocation options for precise location
  const options = {
    enableHighAccuracy: true, // Use GPS for highest accuracy
    timeout: 30000, // Wait up to 30 seconds
    maximumAge: 0, // Don't use cached location, get fresh coordinates
  };

  // Get multiple readings for better accuracy
  const maxReadings = 3;
  let currentReading = 0;

  const getReading = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentReading++;
        locationReadings.value.push({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          timestamp: position.timestamp,
        });

        if (currentReading < maxReadings) {
          // Get another reading for better precision
          setTimeout(getReading, 1000); // Wait 1 second between readings
        } else {
          // Calculate the most accurate position from all readings
          const bestReading = locationReadings.value.reduce((best, current) =>
            current.accuracy < best.accuracy ? current : best
          );

          // Store exact coordinates without rounding
          waypoint.value.coordinates.x = bestReading.latitude;
          waypoint.value.coordinates.y = bestReading.longitude;
          waypoint.value.altitude = bestReading.altitude;

          capturing.value = false;

          // Provide detailed success feedback without toast
          const precisionLevel =
            bestReading.accuracy <= 5
              ? "Excellent"
              : bestReading.accuracy <= 10
              ? "Good"
              : bestReading.accuracy <= 20
              ? "Fair"
              : "Poor";

          console.log(`${precisionLevel} GPS location captured!`);
          console.log(`Accuracy: ±${bestReading.accuracy.toFixed(1)}m`);
          console.log(`${maxReadings} GPS readings averaged`);
          console.log("All readings:", locationReadings.value);
          console.log("Best reading selected:", bestReading);

          // Validate if location seems accurate enough
          if (bestReading.accuracy > 50) {
            toast.warning(
              `GPS accuracy is ${bestReading.accuracy.toFixed(
                1
              )}m. For better precision:\n` +
                `• Move to an open area\n` +
                `• Ensure GPS is enabled\n` +
                `• Try again in a few moments`,
              { duration: 6000 }
            );
          }
        }
      },
      (error) => {
        capturing.value = false;
        console.error("Error getting GPS reading:", error);

        let errorMessage = "Unable to get precise location: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage +=
              "Location information unavailable. Try moving to an open area.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "Unknown error occurred.";
            break;
        }

        toast.error(errorMessage);
      },
      options
    );
  };

  // Start getting readings
  getReading();
};

const getCurrentLocation = () => {
  // Legacy function - redirect to precise version
  getCurrentLocationPrecise();
};

const resetForm = () => {
  waypoint.value = {
    name: "",
    description: "",
    coordinates: { x: 0, y: 0 },
    altitude: null,
    type: "landmark",
    imageUrl: "",
    isUnderMaintenance: false,
    maintenanceReason: "",
  };
  imagePreview.value = "";
  isEditMode.value = false;
  editingWaypoint.value = null;
};

const removeImage = () => {
  imagePreview.value = "";
  waypoint.value.imageUrl = "";
  // Clear the file input so selecting the same file will fire change again
  if (fileInput.value) fileInput.value.value = "";
  toast.info("Image removed");
};

// Initialize
onMounted(async () => {
  try {
    await initializeAuth();
  } catch (error) {
    console.error("Error initializing:", error);
    toast.error("Failed to initialize application");
    isLoading.value = false;
  }
});
</script>

<style scoped>
@import "@/assets/adminmap.css";

/* Additional styles for confirmation modal */
.confirmation-modal {
  max-width: 500px;
}

.modal-body {
  padding: 20px;
  text-align: center;
}

.modal-body p {
  margin-bottom: 15px;
  font-size: 16px;
  line-height: 1.5;
}

.warning-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
  font-size: 14px;
}

.text-danger {
  color: #dc3545;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-danger:hover {
  background-color: #c82333;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 20px;
}

/* Coordinate Info Icon */
.coordinates-info {
  margin-left: 5px;
  color: var(--primary-color);
  cursor: help;
  font-size: 0.9rem;
}

.coordinates-info:hover {
  color: var(--primary-hover);
}

/* Enhanced location features */
.location-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-location-precise {
  background: linear-gradient(135deg, #00ff73, #0056b3);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
}

.btn-location-precise:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-location-precise:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.coordinate-precision {
  display: block;
  color: #6c757d;
  font-size: 0.75rem;
  margin-top: 4px;
  font-style: italic;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

/* Enhanced coordinate input styling */
.form-group input[type="number"] {
  font-family: "Courier New", monospace;
  letter-spacing: 0.5px;
}

/* High precision indicator (green) */
.form-group input[type="number"]:valid {
  border-left: 4px solid #28a745;
}

/* Overall accuracy indicator */
.overall-accuracy {
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  background: #f8f9fa;
}

.accuracy-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
}

.accuracy-indicator {
  padding: 10px 15px;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  font-size: 0.9rem;
  line-height: 1.4;
  transition: all 0.3s ease;
}

.accuracy-excellent {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  border: 1px solid #28a745;
}

.accuracy-good {
  background: linear-gradient(135deg, #d1ecf1, #bee5eb);
  color: #0c5460;
  border: 1px solid #17a2b8;
}

.accuracy-fair {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  color: #856404;
  border: 1px solid #ffc107;
}

.accuracy-poor {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  color: #721c24;
  border: 1px solid #dc3545;
}

/* Enhanced coordinate display in waypoint list */
.location-precision {
  flex-direction: column !important;
  align-items: flex-start !important;
}

.coordinate-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coordinates {
  font-family: "Courier New", monospace;
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 5px;
}

.precision-info {
  font-size: 0.75rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 500;
  background: #e9ecef;
}

/* Different colors for precision levels in waypoint cards */
.waypoint-card .precision-info:contains("Ultra-high") {
  background: #d1ecf1;
  color: #0c5460;
}

.waypoint-card .precision-info:contains("High precision") {
  background: #d4edda;
  color: #155724;
}

.waypoint-card .precision-info:contains("Medium") {
  background: #fff3cd;
  color: #856404;
}

.waypoint-card .precision-info:contains("Low") {
  background: #f8d7da;
  color: #721c24;
}
</style>
