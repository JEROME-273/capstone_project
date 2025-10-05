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
                {{ waypoints.filter((w) => w.type === "facilities").length }}
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
          <!-- QR Generator tab removed -->
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
                  <option value="facilities">Facilities</option>
                  <option value="landmark">Landmark</option>
                  <option value="plants">Plants</option>
                  <option value="animals">Animals</option>
                  <option value="restroom">Restroom</option>
                  <option value="parking">Parking</option>
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
                  Latitude (Ultra-High Precision) 🎯
                  <i
                    class="fas fa-info-circle coordinates-info"
                    title="Ultra-precise coordinates (10+ decimal places) for millimeter-level accuracy. Each decimal place = 10x better precision.">
                  </i>
                </label>
                <input
                  id="latitude"
                  v-model.number="waypoint.coordinates.x"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  required
                  placeholder=""
                  inputmode="decimal"
                  @input="validateCoordinates"
                  style="
                    font-family: 'Courier New', monospace;
                    letter-spacing: 0.5px;
                  " />
                <small
                  class="coordinate-precision"
                  v-if="waypoint.coordinates.x">
                  {{ getCoordinatePrecision(waypoint.coordinates.x) }}
                </small>
              </div>

              <div class="form-group">
                <label for="longitude">
                  Longitude (Ultra-High Precision) 🎯
                  <i
                    class="fas fa-info-circle coordinates-info"
                    title="Ultra-precise coordinates (10+ decimal places) for millimeter-level accuracy. Each decimal place = 10x better precision.">
                  </i>
                </label>
                <input
                  id="longitude"
                  v-model.number="waypoint.coordinates.y"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  required
                  placeholder=""
                  inputmode="decimal"
                  @input="validateCoordinates"
                  style="
                    font-family: 'Courier New', monospace;
                    letter-spacing: 0.5px;
                  " />
                <small
                  class="coordinate-precision"
                  v-if="waypoint.coordinates.y">
                  {{ getCoordinatePrecision(waypoint.coordinates.y) }}
                </small>
              </div>

              <div class="form-group">
                <label for="altitude">
                  Altitude (Ultra-Precise) 📐
                  <i
                    class="fas fa-info-circle coordinates-info"
                    title="Ultra-precise altitude in meters above sea level. Critical for 3D AR Navigation accuracy and elevation-based calculations.">
                  </i>
                </label>
                <input
                  id="altitude"
                  v-model.number="waypoint.altitude"
                  type="number"
                  step="any"
                  placeholder=""
                  style="
                    font-family: 'Courier New', monospace;
                    letter-spacing: 0.5px;
                  " />
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
                  {{
                    capturing
                      ? "🛰️ Capturing Ultra-Precise GPS..."
                      : "🎯 Get Ultra-Precise Location"
                  }}
                  <span
                    v-if="bestCaptureAccuracy && !capturing"
                    class="gps-accuracy-badge"
                    :class="{
                      good: bestCaptureAccuracy <= 10,
                      fair:
                        bestCaptureAccuracy > 10 && bestCaptureAccuracy <= 25,
                      poor: bestCaptureAccuracy > 25,
                    }"
                    >±{{
                      bestCaptureAccuracy >= 10
                        ? bestCaptureAccuracy.toFixed(0)
                        : bestCaptureAccuracy.toFixed(1)
                    }}m</span
                  >
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

            <!-- Auto-generated QR preview after creating a waypoint -->
            <div
              v-if="lastGeneratedWaypoint && qrPreviewDataUrl"
              class="qr-latest-wrapper">
              <h3 class="qr-title">
                <i class="bx bx-qr"></i> QR Code (Auto) for
                {{ lastGeneratedWaypoint.name }}
              </h3>
              <div class="qr-latest-preview">
                <img
                  :src="qrPreviewDataUrl"
                  :alt="`QR for ${lastGeneratedWaypoint.name}`" />
                <div class="qr-actions">
                  <button
                    type="button"
                    class="btn-secondary btn-sm"
                    @click="
                      downloadQR(qrPreviewDataUrl, lastGeneratedWaypoint.name)
                    ">
                    <i class="bx bx-download"></i> Download
                  </button>
                  <button
                    type="button"
                    class="btn-secondary btn-sm"
                    @click="
                      printQR(qrPreviewDataUrl, lastGeneratedWaypoint.name)
                    ">
                    <i class="bx bx-printer"></i> Print
                  </button>
                </div>
                <small class="qr-hint"
                  >Ilagay ang QR sa mismong lokasyon. Kapag na-scan, automatic
                  magsa-start ang AR navigation.</small
                >
              </div>
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
                  <option value="facilities">Facilities</option>
                  <option value="landmark">Landmark</option>
                  <option value="plants">Plants</option>
                  <option value="animals">Animals</option>
                  <option value="restroom">Restroom</option>
                  <option value="parking">Parking</option>
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
                <button
                  @click="openQRModal(wp)"
                  class="btn-qr"
                  title="Show QR Code">
                  <i class="bx bx-qr"></i>
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

    <!-- QR Modal (Simplified to match animal QR modal) -->
    <div v-if="showQRModal" class="modal-overlay" @click="closeQRModal">
      <div class="modal qr-modal" @click.stop>
        <div class="modal-header">
          <h3>QR Code for {{ qrModalWaypoint?.name }}</h3>
          <button class="close-btn" @click="closeQRModal">
            <i class="bx bx-x"></i>
          </button>
        </div>
        <div class="qr-content">
          <div class="qr-info">
            <p>
              Scan this QR code to start AR navigation to
              {{ qrModalWaypoint?.name }}
            </p>
            <div v-if="qrModalWaypoint?.type" class="waypoint-type-badge">
              <strong>Type:</strong>
              {{ formatCategoryName(qrModalWaypoint?.type) }}
            </div>
          </div>
          <div class="qr-code-container">
            <template v-if="qrModalDataUrl">
              <img
                :src="qrModalDataUrl"
                :alt="`QR for ${qrModalWaypoint?.name}`"
                class="qr-canvas" />
            </template>
            <div v-else class="qr-loading">
              <i class="bx bx-loader-alt bx-spin"></i> Generating QR...
            </div>
          </div>
          <div class="qr-actions" v-if="qrModalDataUrl">
            <button
              class="btn btn-primary"
              @click="downloadQR(qrModalDataUrl, qrModalWaypoint.name)">
              <i class="bx bx-download"></i> Download QR Code
            </button>
            <button
              class="btn btn-secondary"
              @click="printQR(qrModalDataUrl, qrModalWaypoint.name)">
              <i class="bx bx-printer"></i> Print QR Code
            </button>
          </div>
        </div>
      </div>
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
// QR state
const qrPreviewDataUrl = ref("");
const lastGeneratedWaypoint = ref(null);
const showQRModal = ref(false);
const qrModalDataUrl = ref("");
const qrModalWaypoint = ref(null);
const qrCache = ref({});

// Enhanced location capture state
const capturing = ref(false);
const locationReadings = ref([]);
const bestCaptureAccuracy = ref(null); // meters from last capture session

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

    if (latPrecision < 8 || lngPrecision < 8) {
      const confirmed = confirm(
        `⚠️ ACCURACY WARNING: Coordinates have lower precision (${Math.min(
          latPrecision,
          lngPrecision
        )} decimal places).\n\n` +
          `🎯 For ULTRA-HIGH accuracy AR navigation, we recommend at least 8-10 decimal places.\n\n` +
          `📏 Current accuracy: ~${
            latPrecision < 4
              ? "100m+ (Poor)"
              : latPrecision < 6
              ? "10m+ (Fair)"
              : latPrecision < 8
              ? "1m+ (Good)"
              : "1cm+ (Excellent)"
          }\n\n` +
          `🚀 Recommended: Use 'Get Precise Location' for best results.\n\n` +
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

      // Auto-generate QR for new waypoint (no extra form fields)
      await generateQRCodeForWaypoint(docRef.id, waypoint.value.name, true);
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
  // Check if coordinates exist
  if (!waypoint.value.coordinates.x && waypoint.value.coordinates.x !== 0) {
    toast.error("Latitude is required / Kailangan ang latitude");
    return false;
  }

  if (!waypoint.value.coordinates.y && waypoint.value.coordinates.y !== 0) {
    toast.error("Longitude is required / Kailangan ang longitude");
    return false;
  }

  // Validate latitude range
  if (waypoint.value.coordinates.x < -90 || waypoint.value.coordinates.x > 90) {
    toast.error(
      "Latitude must be between -90 and 90 degrees / Ang latitude ay dapat nasa pagitan ng -90 at 90 degrees"
    );
    return false;
  }

  // Validate longitude range
  if (
    waypoint.value.coordinates.y < -180 ||
    waypoint.value.coordinates.y > 180
  ) {
    toast.error(
      "Longitude must be between -180 and 180 degrees / Ang longitude ay dapat nasa pagitan ng -180 at 180 degrees"
    );
    return false;
  }

  return true;
};

const getCoordinatePrecision = (coordinate) => {
  if (!coordinate) return "";

  const decimalPlaces = (coordinate.toString().split(".")[1] || "").length;
  let accuracyMeters, qualityLevel;

  // Ultra-precise accuracy assessment based on decimal places
  switch (decimalPlaces) {
    case 0:
      accuracyMeters = "~111 km";
      qualityLevel = "❌ Unusable";
      break;
    case 1:
      accuracyMeters = "~11.1 km";
      qualityLevel = "❌ Very Poor";
      break;
    case 2:
      accuracyMeters = "~1.1 km";
      qualityLevel = "❌ Poor";
      break;
    case 3:
      accuracyMeters = "~110 m";
      qualityLevel = "⚠️ Low";
      break;
    case 4:
      accuracyMeters = "~11 m";
      qualityLevel = "⚠️ Fair";
      break;
    case 5:
      accuracyMeters = "~1.1 m";
      qualityLevel = "✅ Good";
      break;
    case 6:
      accuracyMeters = "~11 cm";
      qualityLevel = "✅ High";
      break;
    case 7:
      accuracyMeters = "~1.1 cm";
      qualityLevel = "🎯 Very High";
      break;
    case 8:
      accuracyMeters = "~1.1 mm";
      qualityLevel = "🎯 Ultra-High";
      break;
    case 9:
      accuracyMeters = "~0.11 mm";
      qualityLevel = "🚀 Extreme";
      break;
    case 10:
      accuracyMeters = "~0.011 mm";
      qualityLevel = "🚀 Survey-Grade";
      break;
    default:
      if (decimalPlaces > 10) {
        accuracyMeters = "<0.01 mm";
        qualityLevel = "🚀 Professional";
      } else {
        accuracyMeters = "Unknown";
        qualityLevel = "❓ Unknown";
      }
  }

  return `${qualityLevel} • ${decimalPlaces} decimals (${accuracyMeters})`;
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

  if (minPrec >= 10) {
    return `🚀 Survey-Grade Precision • <0.01mm accuracy • Professional Mapping Quality`;
  } else if (minPrec >= 8) {
    return `🎯 Ultra-High Precision • ~1mm accuracy • Perfect for AR Navigation`;
  } else if (minPrec >= 6) {
    return `✅ High Precision • ~1cm accuracy • Excellent for AR Navigation`;
  } else if (minPrec >= 5) {
    return `✅ Good Precision • ~1m accuracy • Good for AR Navigation`;
  } else if (minPrec >= 4) {
    return `⚠️ Fair Precision • ~10m accuracy • May affect AR accuracy`;
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
  bestCaptureAccuracy.value = null;

  // Ultra-high accuracy geolocation options for maximum precision
  const options = {
    enableHighAccuracy: true, // Force GPS usage (not network/WiFi)
    timeout: 60000, // Wait up to 60 seconds for best possible accuracy
    maximumAge: 0, // Always get fresh coordinates, never cached
  };

  // Ultra-precise multi-reading capture for maximum accuracy
  const maxReadings = 15; // attempt up to 15 readings for best accuracy
  const MIN_GOOD_ACCURACY = 5; // meters – early finish if reached (stricter)
  const HARD_REQUIRED_ACCURACY = 20; // if no reading better than this, warn user (stricter)
  let currentReading = 0;
  let bestAccuracy = Infinity;

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

        if (position.coords.accuracy < bestAccuracy) {
          bestAccuracy = position.coords.accuracy;
          bestCaptureAccuracy.value = bestAccuracy;
        }

        const earlyGood = position.coords.accuracy <= MIN_GOOD_ACCURACY;
        const continueNeeded = currentReading < maxReadings && !earlyGood;

        if (continueNeeded) {
          setTimeout(getReading, 1000); // spaced sampling
          return;
        }

        // Weighted averaging by 1/accuracy^2
        const weighted = locationReadings.value.reduce(
          (acc, r) => {
            const weight = r.accuracy > 0 ? 1 / (r.accuracy * r.accuracy) : 1;
            acc.lat += r.latitude * weight;
            acc.lng += r.longitude * weight;
            acc.alt += (r.altitude || 0) * weight;
            acc.weight += weight;
            return acc;
          },
          { lat: 0, lng: 0, alt: 0, weight: 0 }
        );

        const avgLat = weighted.lat / weighted.weight;
        const avgLng = weighted.lng / weighted.weight;
        const avgAlt =
          weighted.weight > 0 ? weighted.alt / weighted.weight : null;
        const bestReading = locationReadings.value.reduce((b, c) =>
          c.accuracy < b.accuracy ? c : b
        );

        waypoint.value.coordinates.x = avgLat; // store averaged
        waypoint.value.coordinates.y = avgLng;
        waypoint.value.altitude = avgAlt;

        capturing.value = false;

        const precisionLevel =
          bestReading.accuracy <= 5
            ? "Excellent"
            : bestReading.accuracy <= 10
            ? "Good"
            : bestReading.accuracy <= 20
            ? "Fair"
            : "Poor";

        console.log(`GPS capture complete: ${currentReading} readings.`);
        console.log(`Best accuracy: ±${bestReading.accuracy.toFixed(1)}m`);
        console.log(`Weighted average position stored.`);
        console.log("All readings:", locationReadings.value);

        if (bestReading.accuracy > HARD_REQUIRED_ACCURACY) {
          toast.warning(
            `Low GPS accuracy (±${bestReading.accuracy.toFixed(
              0
            )}m). Consider recapturing before saving for better AR results.`,
            { duration: 6000 }
          );
        } else {
          toast.success(
            `${precisionLevel} GPS fix captured (±${bestReading.accuracy.toFixed(
              1
            )}m)`
          );
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

// QR generation functions
const generateQRCodeForWaypoint = async (id, name, setAsLatest = false) => {
  try {
    // Cache first
    if (qrCache.value[id]) {
      if (setAsLatest) {
        qrPreviewDataUrl.value = qrCache.value[id];
        lastGeneratedWaypoint.value = { id, name };
      }
      return qrCache.value[id];
    }
    const { default: QRCode } = await import("qrcode");
    const payload = JSON.stringify({
      locationId: id,
      ar: true,
      ts: Date.now(),
    });
    const dataUrl = await QRCode.toDataURL(payload, {
      width: 256,
      margin: 1,
      errorCorrectionLevel: "M",
    });
    qrCache.value[id] = dataUrl;
    if (setAsLatest) {
      qrPreviewDataUrl.value = dataUrl;
      lastGeneratedWaypoint.value = { id, name };
      toast.success("QR code generated");
    }
    return dataUrl;
  } catch (e) {
    console.error("QR generation failed", e);
    toast.error("Failed to generate QR code");
  }
};

const openQRModal = (wp) => {
  showQRModal.value = true;
  qrModalWaypoint.value = wp;
  qrModalDataUrl.value = "";
  generateQRCodeForWaypoint(wp.id, wp.name).then((d) => {
    qrModalDataUrl.value = d;
  });
};

const closeQRModal = () => {
  showQRModal.value = false;
  qrModalWaypoint.value = null;
  qrModalDataUrl.value = "";
};

const downloadQR = (dataUrl, name = "waypoint") => {
  if (!dataUrl) return;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${name}-qr.png`;
  a.click();
};

const printQR = (dataUrl, name = "waypoint") => {
  if (!dataUrl) return;
  const w = window.open("");
  w.document.write(
    `<title>QR Code - ${name}</title><img src="${dataUrl}" style="width:256px;height:256px"/>`
  );
  w.print();
  w.close();
};
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

/* GPS capture badge */
.gps-accuracy-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  background: #374151;
  color: #e5e7eb;
  line-height: 1;
}
.gps-accuracy-badge.good {
  background: #065f46;
  color: #d1fae5;
}
.gps-accuracy-badge.fair {
  background: #92400e;
  color: #fef3c7;
}
.gps-accuracy-badge.poor {
  background: #7f1d1d;
  color: #fee2e2;
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

/* ===========================
   RESPONSIVE STYLES
   =========================== */

/* Large desktop */
@media (min-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .waypoints-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
}

/* Desktop */
@media (max-width: 1199px) and (min-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
  }

  .waypoints-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .map-container {
    height: 400px;
  }
}

/* Tablet */
@media (max-width: 991px) and (min-width: 768px) {
  .map-management {
    padding: 15px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .management-tabs {
    flex-direction: column;
    gap: 8px;
  }

  .tab-btn {
    width: 100%;
    text-align: center;
  }

  .waypoints-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  }

  .waypoint-form {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .map-container {
    height: 350px;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .form-actions .btn {
    width: 100%;
  }
}

/* Mobile large */
@media (max-width: 767px) and (min-width: 480px) {
  .map-management {
    padding: 10px;
  }

  .page-title {
    font-size: 24px;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat-card {
    padding: 15px;
  }

  .stat-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
  }

  .stat-content h3 {
    font-size: 20px;
  }

  .stat-content p {
    font-size: 12px;
  }

  .management-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 5px;
  }

  .tab-btn {
    min-width: 120px;
    padding: 10px 15px;
    font-size: 13px;
  }

  .waypoints-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .waypoint-card {
    padding: 15px;
  }

  .waypoint-form {
    gap: 12px;
  }

  .form-group label {
    font-size: 13px;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 10px;
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .map-container {
    height: 300px;
  }

  .btn {
    padding: 12px;
    font-size: 14px;
    min-height: 44px; /* Touch target size */
  }

  .waypoint-actions {
    flex-direction: column;
    gap: 8px;
  }

  .waypoint-actions .btn {
    width: 100%;
  }
}

/* Mobile small */
@media (max-width: 479px) {
  .map-management {
    padding: 8px;
  }

  .page-title {
    font-size: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .stat-card {
    padding: 12px;
    text-align: center;
  }

  .management-tabs {
    flex-direction: column;
  }

  .tab-btn {
    width: 100%;
    padding: 12px;
    font-size: 14px;
  }

  .waypoint-card {
    padding: 12px;
  }

  .waypoint-header h3 {
    font-size: 16px;
  }

  .waypoint-meta {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }

  .waypoint-form {
    gap: 10px;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 8px;
  }

  .map-container {
    height: 250px;
  }

  .form-actions {
    flex-direction: column;
    gap: 8px;
  }

  .btn {
    padding: 10px;
    font-size: 14px;
  }

  .qr-preview {
    max-width: 100px;
  }
}

/* Extra small mobile */
@media (max-width: 360px) {
  .map-management {
    padding: 5px;
  }

  .page-title {
    font-size: 18px;
  }

  .stat-card {
    padding: 10px;
  }

  .stat-content h3 {
    font-size: 18px;
  }

  .waypoint-card {
    padding: 10px;
  }

  .waypoint-header h3 {
    font-size: 14px;
  }

  .map-container {
    height: 200px;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    font-size: 14px;
  }

  .btn {
    padding: 8px;
    font-size: 13px;
  }

  .qr-preview {
    max-width: 80px;
  }
}

/* Landscape orientation */
@media (max-height: 500px) and (orientation: landscape) {
  .map-management {
    padding: 5px;
    overflow-y: auto;
  }

  .stats-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 5px;
  }

  .stat-card {
    padding: 8px;
  }

  .stat-content h3 {
    font-size: 16px;
  }

  .stat-content p {
    font-size: 10px;
  }

  .map-container {
    height: 200px;
  }

  .waypoint-form {
    gap: 8px;
  }

  .form-group {
    margin-bottom: 8px;
  }

  .btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .modal-content {
    max-height: 90vh;
    overflow-y: auto;
  }
}

/* Simple QR modal styles (aligned with AdminAnimalManage) */
.qr-modal {
  width: 500px;
}
.qr-content {
  padding: 20px;
  text-align: center;
}
.qr-info {
  margin-bottom: 20px;
}
.qr-info p {
  margin: 0 0 12px 0;
  color: #555;
  font-size: 14px;
}
.waypoint-type-badge {
  display: inline-block;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #444;
}
.qr-code-container {
  margin: 20px 0;
}
.qr-canvas {
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 256px;
  width: 100%;
  height: auto;
}
.qr-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 10px;
}
.qr-loading {
  padding: 40px 0;
  color: #666;
  font-size: 14px;
}
@media (max-width: 600px) {
  .qr-modal {
    width: 90vw;
  }
}

/* QR Modal responsive */
@media (max-width: 768px) {
  .qr-modal .modal-content {
    margin: 10px;
    max-width: calc(100vw - 20px);
  }

  .qr-modal .modal-header {
    padding: 15px;
  }

  .qr-modal .modal-body {
    padding: 15px;
    text-align: center;
  }

  .qr-modal .qr-display {
    max-width: 200px;
    margin: 0 auto;
  }

  .qr-modal .modal-footer {
    padding: 15px;
    flex-direction: column;
    gap: 10px;
  }

  .qr-modal .btn {
    width: 100%;
  }
}

/* QR simple modal close button alignment */
.qr-modal .modal-header {
  position: relative;
}
.qr-modal .close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  padding: 0;
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
  transition: background 0.15s ease, color 0.15s ease;
}
.qr-modal .close-btn i {
  font-size: 20px;
  display: block;
}
.qr-modal .close-btn:hover {
  background: #f0f0f0;
  color: #222;
}
</style>
