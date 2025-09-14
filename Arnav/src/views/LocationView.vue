<template>
  <div class="location-view-container">
    <div v-if="loading" class="loading">
      <p>Loading location information...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="goBack" class="back-button">Go Back</button>
    </div>
    <div v-else class="location-details">
      <div class="location-header">
        <h1>{{ location.name }}</h1>
        <div class="location-meta">
          <span class="location-building">{{ location.building }}</span>
          <span class="location-floor">Floor {{ location.floor }}</span>
        </div>
      </div>

      <div class="location-image-container" v-if="location.imageUrl">
        <img
          :src="location.imageUrl"
          alt="Location image"
          class="location-image" />
      </div>

      <div class="location-description">
        <p>{{ location.description }}</p>
      </div>

      <div
        class="location-services"
        v-if="location.services && location.services.length">
        <h3>Services Available</h3>
        <ul class="services-list">
          <li v-for="(service, index) in location.services" :key="index">
            {{ service }}
          </li>
        </ul>
      </div>

      <div class="location-contact" v-if="location.contactInfo">
        <h3>Contact Information</h3>
        <p v-if="location.contactInfo.phone">
          <strong>Phone:</strong> {{ location.contactInfo.phone }}
        </p>
        <p v-if="location.contactInfo.email">
          <strong>Email:</strong> {{ location.contactInfo.email }}
        </p>
        <p v-if="location.contactInfo.hours">
          <strong>Hours:</strong> {{ location.contactInfo.hours }}
        </p>
      </div>

      <div class="action-buttons">
        <button @click="getDirections" class="direction-button">
          Get Directions
        </button>
        <button @click="goBack" class="back-button">Go Back</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "LocationView",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const location = ref({});
    const loading = ref(true);
    const error = ref(null);

    const fetchLocationData = async () => {
      // Reset state
      loading.value = true;
      error.value = null;

      const locationId = route.params.id;

      if (!locationId) {
        error.value = "No location ID provided";
        loading.value = false;
        return;
      }

      try {
        // Here you would typically call your API or Firebase to fetch location data
        // For now, we'll simulate with a timeout and mock data

        // Simulated API call
        setTimeout(() => {
          // Mock data - in a real app, replace this with your actual data fetch
          if (locationId === "lib001") {
            location.value = {
              id: "lib001",
              name: "Main Library",
              building: "Academic Center",
              floor: 2,
              imageUrl: "/src/assets/images/library.jpg",
              description:
                "The main library features extensive collections, quiet study areas, and computer workstations. It houses over 100,000 books and provides access to online databases.",
              services: [
                "Book borrowing",
                "Computer access",
                "Printing and copying",
                "Study rooms",
                "Research assistance",
              ],
              contactInfo: {
                phone: "123-456-7890",
                email: "library@university.edu",
                hours: "Monday-Friday 8am-10pm, Weekends 10am-8pm",
              },
              coordinates: {
                x: 120.5,
                y: 60.2,
              },
            };
          } else if (locationId === "cafe002") {
            location.value = {
              id: "cafe002",
              name: "Campus Café",
              building: "Student Center",
              floor: 1,
              imageUrl: "/src/assets/images/cafe.jpg",
              description:
                "The Campus Café offers a variety of food and beverages, with comfortable seating and free Wi-Fi for students.",
              services: [
                "Hot food counter",
                "Coffee and drinks",
                "Snacks",
                "Vegan options",
                "Outdoor seating",
              ],
              contactInfo: {
                phone: "123-456-7891",
                hours: "Monday-Friday 7am-8pm, Weekends 8am-6pm",
              },
              coordinates: {
                x: 80.3,
                y: 45.7,
              },
            };
          } else {
            // If the location ID doesn't match any known location
            error.value = "Location not found";
          }

          loading.value = false;
        }, 1000);
      } catch (err) {
        console.error("Error fetching location:", err);
        error.value = "Failed to load location information";
        loading.value = false;
      }
    };

    const getDirections = () => {
      if (location.value && location.value.coordinates) {
        router.push({
          name: "homepage",
          query: {
            destination: location.value.id,
            x: location.value.coordinates.x,
            y: location.value.coordinates.y,
          },
        });
      }
    };

    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      fetchLocationData();
    });

    return {
      location,
      loading,
      error,
      getDirections,
      goBack,
    };
  },
};
</script>

<style scoped>
.location-view-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.loading,
.error {
  text-align: center;
  padding: 40px 0;
}

.error {
  color: #d32f2f;
}

.location-header {
  margin-bottom: 20px;
}

.location-meta {
  display: flex;
  gap: 15px;
  color: #666;
  margin-top: 5px;
}

.location-image-container {
  margin: 20px 0;
  text-align: center;
}

.location-image {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.location-description {
  margin: 20px 0;
  line-height: 1.6;
}

.services-list {
  list-style-type: disc;
  padding-left: 20px;
  margin: 10px 0;
}

.location-contact {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  justify-content: center;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.direction-button {
  background-color: #2196f3;
  color: white;
}

.back-button {
  background-color: #9e9e9e;
  color: white;
}

button:hover {
  opacity: 0.8;
}

/* ===========================
   ENHANCED RESPONSIVE STYLES
   =========================== */

/* Tablet */
@media (max-width: 768px) {
  .location-view-container {
    padding: 15px;
  }

  .location-card {
    padding: 20px;
    border-radius: 8px;
  }

  .location-image {
    height: 200px;
    border-radius: 6px;
  }

  .location-title {
    font-size: 24px;
    margin: 15px 0 10px 0;
  }

  .location-description {
    font-size: 15px;
    line-height: 1.5;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
  }

  .start-navigation-btn,
  .back-btn {
    width: 100%;
    padding: 14px;
    font-size: 15px;
  }
}

/* Mobile */
@media (max-width: 600px) {
  .location-view-container {
    padding: 10px;
  }

  .location-card {
    padding: 15px;
    margin: 10px 0;
  }

  .location-image {
    height: 180px;
  }

  .location-title {
    font-size: 22px;
    margin: 12px 0 8px 0;
  }

  .location-description {
    font-size: 14px;
    margin-bottom: 15px;
  }

  .action-buttons {
    gap: 10px;
    margin-top: 15px;
  }

  .start-navigation-btn,
  .back-btn {
    padding: 16px 12px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 44px; /* Touch target size */
    border-radius: 6px;
  }
}

/* Small mobile */
@media (max-width: 480px) {
  .location-view-container {
    padding: 8px;
  }

  .location-card {
    padding: 12px;
    margin: 5px 0;
  }

  .location-image {
    height: 160px;
  }

  .location-title {
    font-size: 20px;
    margin: 10px 0 6px 0;
  }

  .location-description {
    font-size: 13px;
    margin-bottom: 12px;
  }

  .action-buttons {
    gap: 8px;
    margin-top: 12px;
  }

  .start-navigation-btn,
  .back-btn {
    padding: 14px 10px;
    font-size: 15px;
  }
}

/* Extra small mobile */
@media (max-width: 360px) {
  .location-card {
    padding: 10px;
  }

  .location-image {
    height: 140px;
  }

  .location-title {
    font-size: 18px;
  }

  .location-description {
    font-size: 12px;
  }

  .start-navigation-btn,
  .back-btn {
    padding: 12px 8px;
    font-size: 14px;
  }
}

/* Landscape orientation */
@media (max-height: 500px) and (orientation: landscape) {
  .location-view-container {
    padding: 5px;
    overflow-y: auto;
    max-height: 100vh;
  }

  .location-card {
    padding: 10px;
    margin: 5px 0;
  }

  .location-image {
    height: 120px;
  }

  .location-title {
    font-size: 16px;
    margin: 8px 0 4px 0;
  }

  .location-description {
    font-size: 12px;
    margin-bottom: 8px;
  }

  .action-buttons {
    flex-direction: row;
    gap: 10px;
    margin-top: 8px;
  }

  .start-navigation-btn,
  .back-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>
