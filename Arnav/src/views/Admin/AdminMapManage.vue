<template>
  <AdminLayout>
    <template #nav>
      <div class="page-header">
        <h1 class="page-title">AR Navigation Management</h1>
        <div class="page-actions" v-if="!isLoading">
          <button
            @click="activeTab = 'add'"
            :class="['action-btn', { active: activeTab === 'add' }]">
            <i class="bx bx-plus"></i>
            Add Waypoint
          </button>
        </div>
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
              <i class="bx bxs-directions"></i>
            </div>
            <div class="stat-content">
              <h3>{{ paths.length }}</h3>
              <p>Active Paths</p>
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
                {{ waypoints.filter((w) => w.type === "destination").length }}
              </h3>
              <p>Destinations</p>
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
          <button
            :class="['tab-btn', { active: activeTab === 'paths' }]"
            @click="activeTab = 'paths'">
            <i class="bx bx-git-branch"></i>
            Paths
          </button>
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
                  <option value="destination">Destination</option>
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

            <div class="form-grid">
              <div class="form-group">
                <label for="latitude">Latitude</label>
                <input
                  id="latitude"
                  v-model.number="waypoint.coordinates.x"
                  type="number"
                  step="any"
                  required
                  placeholder="0.000000" />
              </div>

              <div class="form-group">
                <label for="longitude">Longitude</label>
                <input
                  id="longitude"
                  v-model.number="waypoint.coordinates.y"
                  type="number"
                  step="any"
                  required
                  placeholder="0.000000" />
              </div>

              <div class="form-group">
                <label for="altitude">Altitude (m)</label>
                <input
                  id="altitude"
                  v-model.number="waypoint.altitude"
                  type="number"
                  step="any"
                  placeholder="Optional" />
              </div>

              <div class="form-group">
                <button
                  type="button"
                  @click="getCurrentLocation"
                  class="btn-location">
                  <i class="bx bx-current-location"></i>
                  Use Current Location
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="image">AR Marker Image</label>
              <div
                class="file-upload-area"
                @click="triggerFileInput"
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
                  <option value="destination">Destination</option>
                  <option value="parking">Parking</option>
                  <option value="office">Office</option>
                  <option value="cr">CR</option>
                  <option value="animal_enclosure">Animal Enclosure</option>
                  <option value="food_production">Food Production</option>
                  <option value="plant_areas">Plant Areas</option>
                </select>
              </div>
              <button
                v-if="selectedCategory || searchQuery"
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
              </div>

              <div class="waypoint-content">
                <h3>{{ wp.name }}</h3>
                <p>{{ wp.description }}</p>

                <div class="waypoint-meta">
                  <div class="meta-item">
                    <i class="bx bx-map-pin"></i>
                    <span
                      >{{ wp.coordinates.x.toFixed(6) }},
                      {{ wp.coordinates.y.toFixed(6) }}</span
                    >
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

        <!-- Paths Management -->
        <div v-if="activeTab === 'paths'" class="content-card">
          <div class="card-header">
            <h2>Navigation Paths</h2>
            <button @click="showPathModal = true" class="btn-primary">
              <i class="bx bx-plus"></i>
              Create Path
            </button>
          </div>

          <div v-if="paths.length === 0" class="empty-state">
            <i class="bx bx-git-branch"></i>
            <h3>No paths created</h3>
            <p>Create navigation paths to connect waypoints</p>
          </div>

          <div v-else class="paths-grid">
            <div v-for="path in paths" :key="path.id" class="path-card">
              <div class="path-header">
                <h3>{{ path.name }}</h3>
                <button @click="confirmDeletePath(path)" class="btn-delete">
                  <i class="bx bx-trash"></i>
                </button>
              </div>

              <p class="path-description">{{ path.description }}</p>

              <div class="path-stats">
                <div class="stat">
                  <i class="bx bx-ruler"></i>
                  <span>{{ path.distance }}m</span>
                </div>
                <div class="stat">
                  <i class="bx bx-map-pin"></i>
                  <span>{{ path.waypoints.length }} waypoints</span>
                </div>
              </div>

              <div class="path-waypoints">
                <h4>Connected Waypoints:</h4>
                <div class="waypoint-chips">
                  <span
                    v-for="waypointId in path.waypoints"
                    :key="waypointId"
                    class="waypoint-chip">
                    {{ getWaypointName(waypointId) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Path Creation Modal -->
        <div v-if="showPathModal" class="modal-overlay" @click="closePathModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Create New Path</h3>
              <button @click="closePathModal" class="btn-close">
                <i class="bx bx-x"></i>
              </button>
            </div>

            <form @submit.prevent="savePath" class="path-form">
              <div class="form-group">
                <label for="pathName">Path Name</label>
                <input
                  id="pathName"
                  v-model="pathForm.name"
                  type="text"
                  required
                  placeholder="Enter path name" />
              </div>

              <div class="form-group">
                <label for="pathDescription">Description</label>
                <textarea
                  id="pathDescription"
                  v-model="pathForm.description"
                  rows="3"
                  required
                  placeholder="Describe this navigation path"></textarea>
              </div>

              <div class="form-group">
                <label for="pathDistance">Distance (meters)</label>
                <input
                  id="pathDistance"
                  v-model.number="pathForm.distance"
                  type="number"
                  required
                  placeholder="Path distance in meters" />
              </div>

              <div class="form-group">
                <label>Select Waypoints</label>
                <div class="waypoint-selector">
                  <div
                    v-for="wp in waypoints"
                    :key="wp.id"
                    class="waypoint-option">
                    <input
                      :id="`wp-${wp.id}`"
                      v-model="pathForm.waypoints"
                      :value="wp.id"
                      type="checkbox" />
                    <label :for="`wp-${wp.id}`">
                      <span class="waypoint-name">{{ wp.name }}</span>
                      <span class="waypoint-type-badge">{{ wp.type }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button
                  type="button"
                  @click="closePathModal"
                  class="btn-secondary">
                  Cancel
                </button>
                <button type="submit" :disabled="saving" class="btn-primary">
                  {{ saving ? "Creating..." : "Create Path" }}
                </button>
              </div>
            </form>
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
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhkztfwlw";
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
const paths = ref([]);
const searchQuery = ref("");
const selectedCategory = ref("");
const isEditMode = ref(false);
const editingWaypoint = ref(null);
const saving = ref(false);
const uploading = ref(false);
const imagePreview = ref("");
const showPathModal = ref(false);
const isAuthenticated = ref(false);
const isLoading = ref(true);

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
});

const pathForm = ref({
  name: "",
  description: "",
  distance: 0,
  waypoints: [],
});

// Computed - Enhanced filtering logic
const filteredWaypoints = computed(() => {
  let filtered = waypoints.value;

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter((wp) => wp.type === selectedCategory.value);
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

const confirmDeletePath = (pathToDelete) => {
  confirmationMessage.value = `Are you sure you want to delete the path "${pathToDelete.name}"? This will permanently remove the navigation path and all its waypoint connections.`;
  deleteType.value = "Path";
  pendingDeleteAction.value = () => deletePath(pathToDelete.id);
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

const clearFilters = () => {
  selectedCategory.value = "";
  searchQuery.value = "";
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

const loadPaths = async () => {
  if (!isAuthenticated.value) {
    toast.error("Please wait for authentication...");
    return;
  }

  try {
    console.log("Loading paths...");
    const querySnapshot = await getDocs(collection(db, "paths"));
    paths.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(`Loaded ${paths.value.length} paths`);
  } catch (error) {
    console.error("Error loading paths:", error);
    if (error.code === "permission-denied") {
      toast.error("Access denied. Please check your permissions.");
    } else {
      toast.error("Failed to load paths. Please try again.");
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
  await Promise.all([loadWaypoints(), loadPaths()]);
};

// CRUD operations
const handleSubmit = async () => {
  saving.value = true;
  try {
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

    const waypointData = {
      name: waypoint.value.name,
      description: waypoint.value.description,
      coordinates: waypoint.value.coordinates,
      altitude: waypoint.value.altitude,
      type: waypoint.value.type,
      imageUrl: waypoint.value.imageUrl,
      updatedAt: new Date(),
    };

    if (isEditMode.value && editingWaypoint.value) {
      await updateDoc(
        doc(db, "waypoints", editingWaypoint.value.id),
        waypointData
      );
      toast.success(`Waypoint "${waypoint.value.name}" updated successfully!`);
    } else {
      waypointData.createdAt = new Date();
      await addDoc(collection(db, "waypoints"), waypointData);
      toast.success(`Waypoint "${waypoint.value.name}" created successfully!`);
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

// Path operations
const savePath = async () => {
  saving.value = true;
  try {
    const pathData = {
      ...pathForm.value,
      createdAt: new Date(),
    };

    await addDoc(collection(db, "paths"), pathData);
    await loadPaths();
    closePathModal();
    toast.success(`Path "${pathForm.value.name}" created successfully!`);
  } catch (error) {
    console.error("Error saving path:", error);
    toast.error(`Failed to create path "${pathForm.value.name}"`);
  } finally {
    saving.value = false;
  }
};

const deletePath = async (id) => {
  try {
    const pathToDelete = paths.value.find((p) => p.id === id);
    const pathName = pathToDelete ? pathToDelete.name : "Unknown";

    await deleteDoc(doc(db, "paths", id));
    await loadPaths();
    toast.success(`Path "${pathName}" deleted successfully!`);
  } catch (error) {
    console.error("Error deleting path:", error);
    toast.error("Failed to delete path");
  }
};

// File upload
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    toast.error("File size must be less than 10MB");
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

// Utility functions
const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        waypoint.value.coordinates.x = position.coords.latitude;
        waypoint.value.coordinates.y = position.coords.longitude;
        waypoint.value.altitude = position.coords.altitude;
        toast.success("Location added successfully!");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to get current location");
      }
    );
  } else {
    toast.error("Geolocation is not supported");
  }
};

const resetForm = () => {
  waypoint.value = {
    name: "",
    description: "",
    coordinates: { x: 0, y: 0 },
    altitude: null,
    type: "landmark",
    imageUrl: "",
  };
  imagePreview.value = "";
  isEditMode.value = false;
  editingWaypoint.value = null;
};

const removeImage = () => {
  imagePreview.value = "";
  waypoint.value.imageUrl = "";
  toast.info("Image removed");
};

const closePathModal = () => {
  showPathModal.value = false;
  pathForm.value = {
    name: "",
    description: "",
    distance: 0,
    waypoints: [],
  };
};

const getWaypointName = (id) => {
  const wp = waypoints.value.find((w) => w.id === id);
  return wp ? wp.name : "Unknown";
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
</style>
