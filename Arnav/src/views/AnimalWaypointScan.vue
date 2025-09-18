<template>
  <div class="qr-scanner-page">
    <div class="header">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span> Back
      </button>
      <h1>Scan Animal or Waypoint QR</h1>
    </div>

    <div class="scanner-wrapper">
      <AnimalWaypointQRScanner ref="awScanner" @qr-scanned="onQRScanned" />
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
import AnimalWaypointQRScanner from "@/components/AnimalWaypointQRScanner.vue";
import AnimalInfoModal from "@/components/AnimalInfoModal.vue";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default {
  name: "AnimalWaypointScan",
  components: { AnimalWaypointQRScanner, AnimalInfoModal },
  setup() {
    const router = useRouter();
    const showAnimalModal = ref(false);
    const selectedAnimal = ref(null);
    const awScanner = ref(null);

    const goBack = () => router.back();

    const onQRScanned = async (result) => {
      if (!result || !result.type) return;

      if (result.type === "animal") {
        const animalId = (
          result.data?.id ||
          result.data?.name ||
          "unknown"
        ).toString();
        if (awScanner.value && awScanner.value.stopScanner)
          awScanner.value.stopScanner();
        await showAnimal(animalId);
      } else if (result.type === "waypoint") {
        const id = result.data?.id;
        if (id) {
          if (awScanner.value && awScanner.value.stopScanner)
            awScanner.value.stopScanner();
          // Same behavior as QRScanner: redirect to homepage and trigger AR
          router.push({ name: "homepage", query: { startAr: String(id) } });
        } else {
          // If no ID, show minimal info
          selectedAnimal.value = {
            id: "waypoint",
            name: result.data?.name || "Waypoint",
            scientificName: "",
            species: "",
            habitat: `${result.data?.latitude ?? ""}, ${
              result.data?.longitude ?? ""
            }`,
            description:
              result.data?.description ||
              "Waypoint scanned but no ID provided to navigate.",
            imageUrl: "/src/assets/image.png",
          };
          showAnimalModal.value = true;
        }
      } else {
        // Unknown QR, show minimal info
        selectedAnimal.value = {
          id: "qr",
          name: "QR Data",
          scientificName: "",
          species: "",
          habitat: "",
          description: result.rawData,
          imageUrl: "/src/assets/image.png",
        };
        showAnimalModal.value = true;
      }
    };

    const showAnimal = async (animalId) => {
      try {
        const db = getFirestore();
        const animalDoc = await getDoc(doc(db, "animals", String(animalId)));

        let animalData;
        if (animalDoc.exists()) {
          animalData = animalDoc.data();
          animalData.id = String(animalId);
        } else {
          animalData = getDefaultAnimalData(String(animalId));
        }

        selectedAnimal.value = animalData;
        showAnimalModal.value = true;
      } catch (e) {
        selectedAnimal.value = getDefaultAnimalData(String(animalId));
        showAnimalModal.value = true;
      }
    };

    const getDefaultAnimalData = (animalId) => {
      const name = String(animalId);
      return {
        id: name,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        scientificName: "Unknown",
        species: "Unknown",
        habitat: "Information not available",
        diet: "Information not available",
        lifespan: "Information not available",
        conservationStatus: "Unknown",
        description: `Information about ${name} is not currently available.`,
        funFacts: ["More information coming soon!"],
        imageUrl: "/src/assets/image.png",
      };
    };

    return {
      goBack,
      onQRScanned,
      showAnimalModal,
      selectedAnimal,
      awScanner,
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 10px 0;
  position: relative;
}

.back-button {
  background: #2196f3;
  border: 2px solid #2196f3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  cursor: pointer;
  color: white;
  padding: 8px 12px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.back-button:hover {
  background: #1976d2;
  border-color: #1976d2;
  transform: scale(1.05);
}

.back-icon {
  font-size: 20px;
}

h1 {
  margin: 0;
  text-align: center;
  flex: 1;
  padding: 0 20px;
}

.scanner-wrapper {
  width: 100%;
  margin: 20px 0;
}

@media (max-width: 600px) {
  .qr-scanner-page {
    padding: 15px;
  }
}
</style>
