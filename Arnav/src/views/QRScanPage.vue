<template>
  <div class="qr-scanner-page">
    <div class="header">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span> Back
      </button>
      <h1>Scan QR Code</h1>
    </div>

    <div class="scanner-wrapper">
      <QRScanner
        title="Scan QR Code to View Location or Animal Info"
        @scanned="onQRScanned"
        @animal-scanned="onAnimalScanned" />
    </div>

    <div class="instructions">
      <h3>Instructions:</h3>
      <ol>
        <li>Position your device so the QR code appears in the scanner.</li>
        <li>Hold steady until the code is recognized.</li>
        <li>
          Once scanned, you'll be redirected to the location details or animal
          information.
        </li>
      </ol>
      <p class="note">
        Note: QR codes should be placed at entrances, key points of each
        location, or near animal exhibits.
      </p>
    </div>

    <!-- Animal Info Modal -->
    <teleport to="body">
      <AnimalInfoModal
        :animal="selectedAnimal"
        :visible="showAnimalModal"
        @close="showAnimalModal = false" />
    </teleport>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import QRScanner from "@/components/QRScanner.vue";
import AnimalInfoModal from "@/components/AnimalInfoModal.vue";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default {
  name: "QRScanPage",
  components: {
    QRScanner,
    AnimalInfoModal,
  },
  setup() {
    const router = useRouter();
    const showAnimalModal = ref(false);
    const selectedAnimal = ref(null);

    const goBack = () => {
      router.back();
    };

    const onQRScanned = (data) => {
      console.log("QR Code scanned:", data);
      // The QRScanner component will handle navigation
    };

    const onAnimalScanned = async (animalId) => {
      console.log("Animal QR scanned:", animalId);

      try {
        const db = getFirestore();
        const animalDoc = await getDoc(doc(db, "animals", animalId));

        let animalData;
        if (animalDoc.exists()) {
          animalData = animalDoc.data();
          animalData.id = animalId;
        } else {
          // Use default animal data if not found in database
          animalData = getDefaultAnimalData(animalId);
        }

        selectedAnimal.value = animalData;
        showAnimalModal.value = true;
      } catch (error) {
        console.error("Error fetching animal data:", error);
        // Use default data as fallback
        const animalData = getDefaultAnimalData(animalId);
        selectedAnimal.value = animalData;
        showAnimalModal.value = true;
      }
    };

    const getDefaultAnimalData = (animalId) => {
      // Default animal data for common animals
      const defaultAnimals = {
        tiger: {
          id: "tiger",
          name: "Bengal Tiger",
          scientificName: "Panthera tigris tigris",
          species: "Tiger",
          habitat: "Tropical forests, grasslands, and mangroves",
          diet: "Carnivore - primarily deer, wild boar, and water buffalo",
          lifespan: "10-15 years in wild, up to 26 years in captivity",
          conservationStatus: "Endangered",
          description:
            "The Bengal tiger is a population of the Panthera tigris tigris subspecies. It is one of the most recognizable and iconic animals in the world.",
          funFacts: [
            "Tigers are excellent swimmers and often cool off in pools or streams",
            "Each tiger has a unique stripe pattern, like a human fingerprint",
            "Tigers can leap horizontally up to 33 feet",
            "A tiger's roar can be heard from up to 2 miles away",
          ],
          feedingSchedule: {
            morning: "6:00 AM - Raw meat (15 kg)",
            afternoon: "2:00 PM - Enrichment feeding",
            evening: "6:00 PM - Raw meat (10 kg)",
          },
          imageUrl: "/src/assets/images/tiger.jpg",
        },
        lion: {
          id: "lion",
          name: "African Lion",
          scientificName: "Panthera leo",
          species: "Lion",
          habitat: "Savannas, grasslands, and semi-deserts",
          diet: "Carnivore - zebras, wildebeest, antelopes",
          lifespan: "12-16 years in wild, up to 25 years in captivity",
          conservationStatus: "Vulnerable",
          description:
            "The lion is a muscular, deep-chested cat with a short, rounded head, reduced neck, and round ears.",
          funFacts: [
            "Lions are the only cats that live in groups called prides",
            "A lion's roar can be heard from 5 miles away",
            "Lions can sleep up to 20 hours a day",
            "Female lions do most of the hunting for their pride",
          ],
          feedingSchedule: {
            morning: "7:00 AM - Raw meat (12 kg)",
            afternoon: "1:00 PM - Enrichment activities",
            evening: "5:00 PM - Raw meat (8 kg)",
          },
          imageUrl: "/src/assets/images/lion.jpg",
        },
        elephant: {
          id: "elephant",
          name: "Asian Elephant",
          scientificName: "Elephas maximus",
          species: "Elephant",
          habitat: "Tropical forests and grasslands",
          diet: "Herbivore - grasses, fruits, bark, and leaves",
          lifespan: "60-70 years in wild and captivity",
          conservationStatus: "Endangered",
          description:
            "Asian elephants are smaller than their African relatives and have smaller, rounded ears.",
          funFacts: [
            "Elephants can recognize themselves in mirrors",
            "They have excellent memories and can remember other elephants for decades",
            "Elephants produce sounds below human hearing range to communicate",
            "They can consume up to 300 pounds of vegetation daily",
          ],
          feedingSchedule: {
            morning: "6:00 AM - Hay and fruits (150 kg)",
            afternoon: "12:00 PM - Vegetables and enrichment",
            evening: "5:00 PM - Hay and grains (100 kg)",
          },
          imageUrl: "/src/assets/images/elephant.jpg",
        },
      };

      return (
        defaultAnimals[animalId.toLowerCase()] || {
          id: animalId,
          name: animalId.charAt(0).toUpperCase() + animalId.slice(1),
          scientificName: "Unknown",
          species: "Unknown",
          habitat: "Information not available",
          diet: "Information not available",
          lifespan: "Information not available",
          conservationStatus: "Unknown",
          description: `Information about ${animalId} is not currently available. Please contact the zoo administration for more details.`,
          funFacts: ["More information coming soon!"],
          feedingSchedule: {
            morning: "Please check with zoo staff",
            afternoon: "Please check with zoo staff",
            evening: "Please check with zoo staff",
          },
          imageUrl: "/src/assets/image.png",
        }
      );
    };

    return {
      goBack,
      onQRScanned,
      onAnimalScanned,
      showAnimalModal,
      selectedAnimal,
    };
  },
};
</script>

<style scoped>
.qr-scanner-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
}

.header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  top: 0;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  cursor: pointer;
  color: #2196f3;
}

.back-icon {
  font-size: 20px;
}

h1 {
  margin: 10px 0;
  text-align: center;
}

.scanner-wrapper {
  width: 100%;
  margin: 20px 0;
}

.instructions {
  width: 100%;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  margin-top: 20px;
}

ol {
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
  line-height: 1.4;
}

.note {
  font-style: italic;
  color: #666;
  margin-top: 15px;
}

@media (max-width: 600px) {
  .qr-scanner-page {
    padding: 15px;
  }
}
</style>
