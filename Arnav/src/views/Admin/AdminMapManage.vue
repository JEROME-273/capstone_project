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
                @click="deleteWaypoint"
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
            <div class="search-box">
              <i class="bx bx-search"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search waypoints..." />
            </div>
          </div>

          <div v-if="filteredWaypoints.length === 0" class="empty-state">
            <i class="bx bx-map-pin"></i>
            <h3>No waypoints found</h3>
            <p>
              {{
                searchQuery
                  ? "Try adjusting your search terms"
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
                <div class="waypoint-type">{{ wp.type }}</div>
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
                <button @click="deleteWaypoint(wp.id)" class="btn-delete">
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
                <button @click="deletePath(path.id)" class="btn-delete">
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

        <!-- Toast Messages -->
        <div v-if="toast.show" :class="['toast', toast.type]">
          <i
            :class="
              toast.type === 'success'
                ? 'bx bx-check-circle'
                : 'bx bx-error-circle'
            "></i>
          <span>{{ toast.message }}</span>
          <button @click="hideToast" class="toast-close">
            <i class="bx bx-x"></i>
          </button>
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
import AdminLayout from "../Admin/AdminLayout.vue";

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
const isEditMode = ref(false);
const editingWaypoint = ref(null);
const saving = ref(false);
const uploading = ref(false);
const imagePreview = ref("");
const showPathModal = ref(false);
const isAuthenticated = ref(false);
const isLoading = ref(true);

// Toast system
const toast = ref({
  show: false,
  type: "success",
  message: "",
});

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

// Computed
const filteredWaypoints = computed(() => {
  if (!searchQuery.value) return waypoints.value;

  const query = searchQuery.value.toLowerCase();
  return waypoints.value.filter(
    (wp) =>
      wp.name.toLowerCase().includes(query) ||
      wp.description.toLowerCase().includes(query) ||
      wp.type.toLowerCase().includes(query)
  );
});

// Firebase operations
const loadWaypoints = async () => {
  if (!isAuthenticated.value) {
    showToast("Please wait for authentication...", "error");
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
      showToast("Access denied. Please check your permissions.", "error");
    } else {
      showToast("Failed to load waypoints. Please try again.", "error");
    }
  }
};

const loadPaths = async () => {
  if (!isAuthenticated.value) {
    showToast("Please wait for authentication...", "error");
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
      showToast("Access denied. Please check your permissions.", "error");
    } else {
      showToast("Failed to load paths. Please try again.", "error");
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
          showToast("Authentication failed. Please refresh the page.", "error");
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
      showToast("Waypoint updated successfully!", "success");
    } else {
      waypointData.createdAt = new Date();
      await addDoc(collection(db, "waypoints"), waypointData);
      showToast("Waypoint created successfully!", "success");
    }

    await loadWaypoints();
    resetForm();
    activeTab.value = "list";
  } catch (error) {
    console.error("Error saving waypoint:", error);
    showToast("Failed to save waypoint", "error");
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
};

const deleteWaypoint = async (id) => {
  if (id && confirm("Are you sure you want to delete this waypoint?")) {
    try {
      await deleteDoc(doc(db, "waypoints", id));
      await loadWaypoints();
      showToast("Waypoint deleted successfully!", "success");
      if (isEditMode.value && editingWaypoint.value?.id === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting waypoint:", error);
      showToast("Failed to delete waypoint", "error");
    }
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
    showToast("Path created successfully!", "success");
  } catch (error) {
    console.error("Error saving path:", error);
    showToast("Failed to create path", "error");
  } finally {
    saving.value = false;
  }
};

const deletePath = async (id) => {
  if (confirm("Are you sure you want to delete this path?")) {
    try {
      await deleteDoc(doc(db, "paths", id));
      await loadPaths();
      showToast("Path deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting path:", error);
      showToast("Failed to delete path", "error");
    }
  }
};

// File upload
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    showToast("File size must be less than 10MB", "error");
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
    showToast("Image uploaded successfully!", "success");
  } catch (error) {
    console.error("Error uploading image:", error);
    showToast(`Failed to upload image: ${error.message}`, "error");
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
      showToast("Please drop an image file", "error");
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
        showToast("Location updated successfully!", "success");
      },
      (error) => {
        console.error("Error getting location:", error);
        showToast("Unable to get current location", "error");
      }
    );
  } else {
    showToast("Geolocation is not supported", "error");
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

const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 4000);
};

const hideToast = () => {
  toast.value.show = false;
};

// Initialize
onMounted(async () => {
  try {
    await initializeAuth();
  } catch (error) {
    console.error("Error initializing:", error);
    showToast("Failed to initialize application", "error");
    isLoading.value = false;
  }
});
</script>

<style scoped>
.map-management {
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.action-btn:hover,
.action-btn.active {
  border-color: #007bff;
  color: #007bff;
  background: rgba(0, 123, 255, 0.1);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  font-size: 24px;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.stat-content p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 14px;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 4px;
  background: var(--card-bg);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab-btn.active {
  background: var(--bg-secondary);
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-btn:hover:not(.active) {
  background: rgba(0, 0, 0, 0.05);
}

/* Content Cards */
.content-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.card-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* Search Box */
.search-box {
  position: relative;
  width: 300px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-box input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}

.search-box input:focus {
  outline: none;
  border-color: #007bff;
}

/* Forms */
.waypoint-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
}

/* File Upload */
.upload-note {
  margin-top: 8px;
}

.upload-note small {
  color: var(--text-secondary);
  font-size: 11px;
}

.image-status {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  text-align: center;
}

.status-success {
  color: #28a745;
  font-size: 12px;
  font-weight: 500;
}

.status-local {
  color: #ffc107;
  font-size: 12px;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}

.file-upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.file-upload-area:hover {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

.file-upload-area.drag-over {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.05);
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder i {
  font-size: 48px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.upload-placeholder p {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.upload-placeholder span {
  font-size: 12px;
  color: var(--text-secondary);
}

.image-preview {
  position: relative;
  display: inline-block;
  margin-top: 12px;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #007bff;
  font-weight: 500;
  margin-top: 8px;
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-danger,
.btn-location,
.btn-edit,
.btn-delete,
.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.btn-danger {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #c82333, #a71e2a);
  transform: translateY(-2px);
}

.btn-location {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  color: white;
}

.btn-location:hover {
  background: linear-gradient(135deg, #1e7e34, #155724);
  transform: translateY(-2px);
}

.btn-edit {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  color: #212529;
  padding: 8px 12px;
}

.btn-edit:hover {
  background: linear-gradient(135deg, #e0a800, #d39e00);
  transform: translateY(-1px);
}

.btn-delete {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  padding: 8px 12px;
}

.btn-delete:hover {
  background: linear-gradient(135deg, #c82333, #a71e2a);
  transform: translateY(-1px);
}

.btn-close {
  background: none;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 50%;
}

.btn-close:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

/* Waypoints Grid */
.waypoints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.waypoint-card {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.waypoint-card:hover {
  border-color: #007bff;
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
  transform: translateY(-2px);
}

.waypoint-image {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.waypoint-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.waypoint-type {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.waypoint-content {
  padding: 20px;
}

.waypoint-content h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.waypoint-content p {
  color: var(--text-secondary);
  margin: 0 0 16px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.waypoint-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.meta-item i {
  width: 16px;
  text-align: center;
}

.waypoint-actions {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.waypoint-card:hover .waypoint-actions {
  opacity: 1;
}

/* Paths Grid */
.paths-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.path-card {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.path-card:hover {
  border-color: #28a745;
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.15);
  transform: translateY(-2px);
}

.path-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.path-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.path-description {
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.path-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

.path-waypoints h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.waypoint-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.waypoint-chip {
  background: var(--hover-bg);
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.path-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.waypoint-selector {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  background: var(--bg-primary);
}

.waypoint-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.waypoint-option:hover {
  background: var(--hover-bg);
}

.waypoint-option input[type="checkbox"] {
  margin: 0;
  width: 16px;
  height: 16px;
}

.waypoint-option label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
}

.waypoint-name {
  font-weight: 500;
  color: var(--text-primary);
}

.waypoint-type-badge {
  background: var(--hover-bg);
  color: var(--text-secondary);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Toast Messages */
.toast {
  position: fixed;
  top: 80px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  max-width: 400px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.toast.error {
  background: linear-gradient(135deg, #dc3545, #c82333);
}

.toast-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  margin-left: auto;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .search-box {
    width: 100%;
  }

  .waypoints-grid,
  .paths-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 20px;
    width: calc(100% - 40px);
  }

  .form-actions {
    flex-direction: column;
  }

  .toast {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .tab-navigation {
    flex-direction: column;
  }

  .tab-btn {
    justify-content: flex-start;
  }

  .stat-card {
    padding: 16px;
  }

  .content-card {
    padding: 16px;
  }
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: var(--text-secondary);
}

.loading-spinner {
  font-size: 48px;
  color: #007bff;
  margin-bottom: 20px;
}

.loading-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.loading-state p {
  margin: 0;
  font-size: 14px;
}
</style>
