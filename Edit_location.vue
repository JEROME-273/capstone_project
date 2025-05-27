<template>
  <div class="container">
    <h1 class="page-title">Location CRUD</h1>

    <!-- Mobile Navigation Tabs -->
    <div class="mobile-tabs">
      <button
        :class="['tab-button', { active: activeTab === 'add' }]"
        @click="activeTab = 'add'">
        <i class="fas fa-plus-circle"></i> Add
      </button>
      <button
        :class="['tab-button', { active: activeTab === 'list' }]"
        @click="activeTab = 'list'">
        <i class="fas fa-list"></i> View
      </button>
    </div>

    <!-- Add / Edit Location Form -->
    <div class="card" :class="{ 'mobile-hidden': activeTab === 'list' }">
      <h2 class="section-title">
        {{ isEditMode ? "Edit Location" : "Add Location" }}
      </h2>
      <form class="location-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="locationName">Location Name</label>
          <input
            id="locationName"
            v-model="location.name"
            type="text"
            required />
        </div>

        <div class="form-group">
          <label for="locationDescription">Description</label>
          <textarea
            id="locationDescription"
            v-model="location.description"
            rows="3"
            required></textarea>
        </div>

        <div class="form-group">
          <label for="locationImage">Upload Image</label>
          <input
            id="locationImage"
            type="file"
            @change="handleFileUpload"
            accept="image/*" />
        </div>

        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Image Preview" class="uploaded-image" />
        </div>

        <div class="form-row">
          <div class="form-group form-group-half">
            <label for="locationLatitude">Latitude</label>
            <input
              id="locationLatitude"
              v-model.number="location.coordinates.x"
              type="number"
              step="any"
              required />
          </div>

          <div class="form-group form-group-half">
            <label for="locationLongitude">Longitude</label>
            <input
              id="locationLongitude"
              v-model.number="location.coordinates.y"
              type="number"
              step="any"
              required />
          </div>
        </div>

        <div class="form-group">
          <label for="locationCategory">Category</label>
          <select id="locationCategory" v-model="location.category" required>
            <option value="office">Office</option>
            <option value="parking">Parking</option>
            <option value="cr">CR</option>
            <option value="animal_enclosure">Animal Enclosure</option>
            <option value="food_production">Food Production</option>
            <option value="plant_areas">Plant Areas</option>
          </select>
        </div>

        <div class="form-group">
          <button
            type="button"
            class="location-button"
            @click="getCurrentLocation">
            <i class="fas fa-map-marker-alt"></i> Use Current Location
          </button>
        </div>

        <button type="submit" class="submit-button">
          <i class="fas fa-save"></i>
          {{ isEditMode ? "Update Location" : "Add Location" }}
        </button>
        <button
          v-if="isEditMode"
          type="button"
          class="delete-button"
          @click="deleteLocation">
          <i class="fas fa-trash"></i> Delete Location
        </button>
      </form>
    </div>

    <!-- Locations List -->
    <div class="card" :class="{ 'mobile-hidden': activeTab === 'add' }">
      <h2 class="section-title">Locations</h2>
      <div v-if="locations.length === 0" class="empty-state">
        No locations found.
      </div>
      <div v-else class="locations-list">
        <div
          v-for="(loc, index) in locations"
          :key="loc.id || index"
          class="location-item">
          <div class="location-info">
            <img
              :src="loc.imageUrl"
              :alt="`Image of ${loc.name}`"
              class="location-image" />
            <div class="location-details">
              <h3 class="location-name">{{ loc.name }}</h3>
              <p class="location-description">{{ loc.description }}</p>
              <p class="location-category">Category: {{ loc.category }}</p>
              <p class="location-coordinates">
                <i class="fas fa-map-marker-alt"></i>
                {{ loc.coordinates.x }}, {{ loc.coordinates.y }} (Longitude,
                Latitude)
              </p>
            </div>
          </div>
          <div class="location-actions">
            <button class="edit-button" @click="editLocation(loc)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-button" @click="deleteLocation(loc.id)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  uploadImage,
  listenForLocationUpdates, // ✅ Import SSE function
} from "@/services/locationService";

export default {
  data() {
    return {
      activeTab: "list",
      isEditMode: false,
      locations: [],
      selectedFile: null,
      imagePreview: null,
      location: {
        name: "",
        description: "",
        imageUrl: "",
        category: "office",
        coordinates: { latitude: null, longitude: null },
      },
      unsubscribe: null, // ✅ Store SSE listener reference
    };
  },
  created() {
    this.loadLocations();
    this.startRealTimeUpdates(); // ✅ Enable real-time updates
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe(); // ✅ Close SSE connection when component is destroyed
    }
  },
  methods: {
    async loadLocations() {
      this.locations = await getLocations();
    },
    startRealTimeUpdates() {
      this.unsubscribe = listenForLocationUpdates((updatedLocations) => {
        this.locations = updatedLocations;
      });
    },
    async handleSubmit() {
      try {
        let imageUrl = this.location.imageUrl;

        if (this.selectedFile) {
          try {
            imageUrl = await uploadImage(this.selectedFile);
          } catch (uploadError) {
            console.error("Image upload failed:", uploadError);
            alert("Failed to upload image. Please try again.");
            return;
          }
        }

        this.location.imageUrl = imageUrl;

        if (this.isEditMode) {
          await updateLocation(this.location.id, this.location);
          alert("Location updated successfully!");
        } else {
          await addLocation(this.location);
          alert("Location added successfully!");
        }

        this.resetForm();
      } catch (error) {
        console.error("Error saving location:", error);
        alert("Failed to save location.");
      }
    },
    editLocation(loc) {
      this.isEditMode = true;
      this.location = { ...loc };
      this.imagePreview = loc.imageUrl;
      this.activeTab = "add";
    },
    async deleteLocation(id) {
      if (!confirm("Are you sure you want to delete this location?")) return;
      try {
        await deleteLocation(id);
        alert("Location deleted successfully!");
      } catch (error) {
        console.error("Error deleting location:", error);
        alert("Failed to delete location.");
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },
    resetForm() {
      this.isEditMode = false;
      this.selectedFile = null;
      this.imagePreview = null;
      this.location = {
        name: "",
        description: "",
        imageUrl: "",
        category: "office",
        coordinates: { latitude: null, longitude: null },
      };
    },
    getCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Note: x = longitude, y = latitude
            this.location.coordinates.x = position.coords.longitude;
            this.location.coordinates.y = position.coords.latitude;
          },
          (error) => {
            alert("Failed to get current location.");
            console.error("Geolocation error:", error);
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    },
  },
};
</script>

<style>
/* Base styles */
body {
  font-family: "Roboto", sans-serif;
  background-color: #f3f4f6;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5rem;
}

/* Mobile tabs navigation */
.mobile-tabs {
  display: none;
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-button {
  flex: 1;
  padding: 0.75rem;
  background-color: white;
  border: none;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button.active {
  background-color: #4f46e5;
  color: white;
}

.tab-button i {
  margin-right: 0.5rem;
}

/* Card styles */
.card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Form styles */
.location-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group-half {
  flex: 1;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.location-button {
  background-color: #10b981;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.location-button:hover {
  background-color: #059669;
}

.submit-button {
  background-color: #4f46e5;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover {
  background-color: #4338ca;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}

/* Locations list styles */
.locations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.location-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.location-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.location-image {
  width: 4rem;
  height: 4rem;
  object-fit: cover;
  border-radius: 0.25rem;
}

.location-details {
  display: flex;
  flex-direction: column;
}

.location-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.location-description {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0 0 0.25rem 0;
}

.location-category {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.location-coordinates {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.location-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.view-button {
  color: #10b981;
}

.view-button:hover {
  color: #059669;
}

.edit-button {
  color: #3b82f6;
}

.edit-button:hover {
  color: #2563eb;
}

.delete-button {
  color: #ef4444;
}

.delete-button:hover {
  color: #dc2626;
}

/* Responsive styles */
@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }

  .page-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .mobile-tabs {
    display: flex;
  }

  .mobile-hidden {
    display: none;
  }

  .card {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .form-row {
    flex-direction: column;
    gap: 1rem;
  }

  .location-item {
    flex-direction: column;
    gap: 1rem;
  }

  .location-info {
    width: 100%;
  }

  .location-image {
    width: 3.5rem;
    height: 3.5rem;
  }

  .location-actions {
    width: 100%;
    justify-content: flex-end;
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .action-button {
    padding: 0.5rem;
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .location-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .location-image {
    width: 100%;
    height: 150px;
    margin-bottom: 0.5rem;
  }

  .location-details {
    width: 100%;
  }
}

.image-preview {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.uploaded-image {
  width: 225px;
  height: 225px;
  object-fit: cover;
  border-radius: 0.25rem;
  border: 1px solid #ddd;
}
</style>
