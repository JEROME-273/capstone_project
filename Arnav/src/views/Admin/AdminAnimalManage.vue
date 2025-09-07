<template>
  <AdminLayout @logout="logout">
    <template #nav>
      <div class="admin-nav-bar">
        <a href="#" class="nav-link">Animal Management</a>
      </div>
    </template>

    <div class="animal-management">
      <!-- Header Actions -->
      <div class="header-actions">
        <h2>Animal Management</h2>
        <button class="btn btn-primary" @click="showAddModal = true">
          <i class="bx bx-plus"></i> Add New Animal
        </button>
      </div>

      <!-- Animals Grid -->
      <div class="animals-grid">
        <div v-for="animal in animals" :key="animal.id" class="animal-card">
          <div class="animal-image">
            <img
              :src="
                animal.imageUrl ||
                'https://via.placeholder.com/300x200?text=No+Image'
              "
              :alt="animal.name"
              @error="handleImageError" />
          </div>
          <div class="animal-info">
            <h3>{{ animal.name }}</h3>
            <p class="scientific-name">{{ animal.scientificName }}</p>
            <p class="species">{{ animal.species }}</p>
            <div
              class="conservation-status"
              :class="getStatusClass(animal.conservationStatus)">
              {{ animal.conservationStatus }}
            </div>
          </div>
          <div class="animal-actions">
            <button class="btn btn-edit" @click="editAnimal(animal)">
              <i class="bx bx-edit"></i> Edit
            </button>
            <button class="btn btn-qr" @click="generateQR(animal)">
              <i class="bx bx-qr"></i> QR Code
            </button>
            <button class="btn btn-delete" @click="deleteAnimal(animal.id)">
              <i class="bx bx-trash"></i> Delete
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="animals.length === 0" class="empty-state">
          <i class="bx bx-cat"></i>
          <h3>No Animals Added Yet</h3>
          <p>Start by adding your first animal to the system</p>
          <button class="btn btn-primary" @click="showAddModal = true">
            Add First Animal
          </button>
        </div>
      </div>

      <!-- Add/Edit Animal Modal -->
      <div
        v-if="showAddModal || showEditModal"
        class="modal-overlay"
        @click="closeModals">
        <div class="modal animal-modal" @click.stop>
          <div class="modal-header">
            <h3>{{ showEditModal ? "Edit Animal" : "Add New Animal" }}</h3>
            <button class="close-btn" @click="closeModals">
              <i class="bx bx-x"></i>
            </button>
          </div>

          <form @submit.prevent="saveAnimal" class="animal-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Animal Name *</label>
                <input
                  v-model="animalForm.name"
                  type="text"
                  required
                  placeholder="e.g., Bengal Tiger" />
              </div>

              <div class="form-group">
                <label>Scientific Name *</label>
                <input
                  v-model="animalForm.scientificName"
                  type="text"
                  required
                  placeholder="e.g., Panthera tigris tigris" />
              </div>

              <div class="form-group">
                <label>Species *</label>
                <input
                  v-model="animalForm.species"
                  type="text"
                  required
                  placeholder="e.g., Tiger" />
              </div>

              <div class="form-group">
                <label>Conservation Status *</label>
                <select v-model="animalForm.conservationStatus" required>
                  <option value="">Select Status</option>
                  <option value="Least Concern">Least Concern</option>
                  <option value="Near Threatened">Near Threatened</option>
                  <option value="Vulnerable">Vulnerable</option>
                  <option value="Endangered">Endangered</option>
                  <option value="Critically Endangered">
                    Critically Endangered
                  </option>
                  <option value="Extinct in Wild">Extinct in Wild</option>
                  <option value="Extinct">Extinct</option>
                </select>
              </div>

              <div class="form-group">
                <label>Habitat *</label>
                <input
                  v-model="animalForm.habitat"
                  type="text"
                  required
                  placeholder="e.g., Tropical forests, grasslands" />
              </div>

              <div class="form-group">
                <label>Diet *</label>
                <input
                  v-model="animalForm.diet"
                  type="text"
                  required
                  placeholder="e.g., Carnivore - deer, wild boar" />
              </div>

              <div class="form-group">
                <label>Lifespan *</label>
                <input
                  v-model="animalForm.lifespan"
                  type="text"
                  required
                  placeholder="e.g., 10-15 years in wild" />
              </div>

              <div class="form-group">
                <label>Image URL</label>
                <input
                  v-model="animalForm.imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg" />
              </div>
            </div>

            <div class="form-group full-width">
              <label>Description *</label>
              <textarea
                v-model="animalForm.description"
                required
                rows="3"
                placeholder="Brief description about the animal..."></textarea>
            </div>

            <div class="form-group full-width">
              <label>Fun Facts (one per line)</label>
              <textarea
                v-model="funFactsText"
                rows="4"
                placeholder="Enter fun facts, one per line..."></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-cancel" @click="closeModals">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{
                  saving
                    ? "Saving..."
                    : showEditModal
                    ? "Update Animal"
                    : "Add Animal"
                }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- QR Code Modal -->
      <div
        v-if="showQRModal"
        class="modal-overlay"
        @click="showQRModal = false">
        <div class="modal qr-modal" @click.stop>
          <div class="modal-header">
            <h3>QR Code for {{ selectedAnimal?.name }}</h3>
            <button class="close-btn" @click="showQRModal = false">
              <i class="bx bx-x"></i>
            </button>
          </div>

          <div class="qr-content">
            <div class="qr-info">
              <p>
                Scan this QR code to view information about
                {{ selectedAnimal?.name }}
              </p>
              <div class="qr-data"><strong>QR Data:</strong> {{ qrData }}</div>
            </div>

            <div class="qr-code-container">
              <canvas ref="qrCanvas" class="qr-canvas"></canvas>
            </div>

            <div class="qr-actions">
              <button class="btn btn-primary" @click="downloadQR">
                <i class="bx bx-download"></i> Download QR Code
              </button>
              <button class="btn btn-secondary" @click="printQR">
                <i class="bx bx-printer"></i> Print QR Code
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading animals...</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { ref, onMounted, computed, nextTick } from "vue";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth } from "@/firebase/config";
import AdminLayout from "./AdminLayout.vue";
import QRCode from "qrcode";

export default {
  name: "AdminAnimalManage",
  components: {
    AdminLayout,
  },
  setup() {
    const animals = ref([]);
    const loading = ref(true);
    const saving = ref(false);
    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const showQRModal = ref(false);
    const selectedAnimal = ref(null);
    const qrCanvas = ref(null);

    const animalForm = ref({
      name: "",
      scientificName: "",
      species: "",
      habitat: "",
      diet: "",
      lifespan: "",
      conservationStatus: "",
      description: "",
      funFacts: [],
      imageUrl: "",
    });

    const funFactsText = ref("");

    const qrData = computed(() => {
      if (!selectedAnimal.value) return "";
      return JSON.stringify({
        type: "animal",
        animalId: selectedAnimal.value.id,
      });
    });

    // Load animals from Firestore
    const loadAnimals = async () => {
      try {
        loading.value = true;

        // Check if user is authenticated
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        const db = getFirestore();

        // Check user role first
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || userDoc.data().role !== "admin") {
          throw new Error("Access denied. Admin role required.");
        }

        const querySnapshot = await getDocs(collection(db, "animals"));
        animals.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error loading animals:", error);
        if (error.code === "permission-denied") {
          alert(
            "Permission denied. Please check your Firestore security rules or ensure you have admin access."
          );
        } else {
          alert(`Error loading animals: ${error.message}`);
        }
      } finally {
        loading.value = false;
      }
    };

    // Save animal (add or update)
    const saveAnimal = async () => {
      try {
        saving.value = true;
        const db = getFirestore();

        // Convert fun facts text to array
        const funFacts = funFactsText.value
          .split("\n")
          .map((fact) => fact.trim())
          .filter((fact) => fact.length > 0);

        const animalData = {
          ...animalForm.value,
          funFacts,
          updatedAt: new Date(),
        };

        if (showEditModal.value) {
          // Update existing animal
          await updateDoc(
            doc(db, "animals", selectedAnimal.value.id),
            animalData
          );
          const index = animals.value.findIndex(
            (a) => a.id === selectedAnimal.value.id
          );
          if (index !== -1) {
            animals.value[index] = {
              ...animalData,
              id: selectedAnimal.value.id,
            };
          }
        } else {
          // Add new animal
          animalData.createdAt = new Date();
          const docRef = await addDoc(collection(db, "animals"), animalData);
          animals.value.push({ ...animalData, id: docRef.id });
        }

        closeModals();
        alert(
          showEditModal.value
            ? "Animal updated successfully!"
            : "Animal added successfully!"
        );
      } catch (error) {
        console.error("Error saving animal:", error);
        if (error.code === "permission-denied") {
          alert(
            "Permission denied. Please ensure you have admin access to save animals."
          );
        } else {
          alert(`Error saving animal: ${error.message}`);
        }
      } finally {
        saving.value = false;
      }
    };

    // Edit animal
    const editAnimal = (animal) => {
      selectedAnimal.value = animal;
      animalForm.value = { ...animal };
      funFactsText.value = animal.funFacts ? animal.funFacts.join("\n") : "";
      showEditModal.value = true;
    };

    // Delete animal
    const deleteAnimal = async (animalId) => {
      if (!confirm("Are you sure you want to delete this animal?")) return;

      try {
        const db = getFirestore();
        await deleteDoc(doc(db, "animals", animalId));
        animals.value = animals.value.filter((a) => a.id !== animalId);
        alert("Animal deleted successfully!");
      } catch (error) {
        console.error("Error deleting animal:", error);
        if (error.code === "permission-denied") {
          alert(
            "Permission denied. Please ensure you have admin access to delete animals."
          );
        } else {
          alert(`Error deleting animal: ${error.message}`);
        }
      }
    };

    // Generate QR code
    const generateQR = async (animal) => {
      selectedAnimal.value = animal;
      showQRModal.value = true;

      await nextTick();
      if (qrCanvas.value) {
        try {
          const qrText = JSON.stringify({
            type: "animal",
            animalId: animal.id,
          });

          await QRCode.toCanvas(qrCanvas.value, qrText, {
            width: 300,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
        } catch (error) {
          console.error("Error generating QR code:", error);
        }
      }
    };

    // Download QR code
    const downloadQR = () => {
      if (qrCanvas.value) {
        const link = document.createElement("a");
        link.download = `${selectedAnimal.value.name.replace(
          /\s+/g,
          "_"
        )}_QR.png`;
        link.href = qrCanvas.value.toDataURL();
        link.click();
      }
    };

    // Print QR code
    const printQR = () => {
      if (qrCanvas.value) {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${selectedAnimal.value.name}</title>
              <style>
                body { text-align: center; font-family: Arial, sans-serif; margin: 40px; }
                .qr-container { display: inline-block; border: 2px solid #333; padding: 20px; }
                h2 { margin-bottom: 20px; }
                p { margin-top: 20px; font-size: 14px; color: #666; }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h2>${selectedAnimal.value.name}</h2>
                <img src="${qrCanvas.value.toDataURL()}" alt="QR Code" />
                <p>Scan to view animal information</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    };

    // Close modals
    const closeModals = () => {
      showAddModal.value = false;
      showEditModal.value = false;
      showQRModal.value = false;
      selectedAnimal.value = null;
      resetForm();
    };

    // Reset form
    const resetForm = () => {
      animalForm.value = {
        name: "",
        scientificName: "",
        species: "",
        habitat: "",
        diet: "",
        lifespan: "",
        conservationStatus: "",
        description: "",
        funFacts: [],
        imageUrl: "",
      };
      funFactsText.value = "";
    };

    // Get conservation status class
    const getStatusClass = (status) => {
      switch (status) {
        case "Least Concern":
          return "status-least-concern";
        case "Near Threatened":
          return "status-near-threatened";
        case "Vulnerable":
          return "status-vulnerable";
        case "Endangered":
          return "status-endangered";
        case "Critically Endangered":
          return "status-critically-endangered";
        case "Extinct in Wild":
          return "status-extinct-wild";
        case "Extinct":
          return "status-extinct";
        default:
          return "status-unknown";
      }
    };

    // Logout function (required by AdminLayout)
    const logout = () => {
      // Handle logout
      console.log("Logout clicked");
    };

    onMounted(() => {
      loadAnimals();
    });

    return {
      animals,
      loading,
      saving,
      showAddModal,
      showEditModal,
      showQRModal,
      selectedAnimal,
      animalForm,
      funFactsText,
      qrData,
      qrCanvas,
      saveAnimal,
      editAnimal,
      deleteAnimal,
      generateQR,
      downloadQR,
      printQR,
      closeModals,
      getStatusClass,
      logout,
    };
  },
};
</script>

<style scoped>
.animal-management {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-actions h2 {
  margin: 0;
  color: #333;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-edit {
  background: #ff9800;
  color: white;
}

.btn-edit:hover {
  background: #f57c00;
}

.btn-qr {
  background: #4caf50;
  color: white;
}

.btn-qr:hover {
  background: #388e3c;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-delete:hover {
  background: #d32f2f;
}

.btn-cancel {
  background: #9e9e9e;
  color: white;
}

.btn-cancel:hover {
  background: #757575;
}

.btn-secondary {
  background: #607d8b;
  color: white;
}

.btn-secondary:hover {
  background: #455a64;
}

.animals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.animal-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.animal-card:hover {
  transform: translateY(-2px);
}

.animal-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 15px;
}

.animal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.animal-info h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
}

.scientific-name {
  font-style: italic;
  color: #666;
  margin: 0 0 4px 0;
  font-size: 14px;
}

.species {
  color: #888;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.conservation-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 15px;
}

.status-least-concern {
  background: #e8f5e8;
  color: #2e7d32;
}
.status-near-threatened {
  background: #fff3e0;
  color: #ef6c00;
}
.status-vulnerable {
  background: #fff8e1;
  color: #f57f17;
}
.status-endangered {
  background: #ffebee;
  color: #c62828;
}
.status-critically-endangered {
  background: #ffebee;
  color: #b71c1c;
}
.status-extinct-wild {
  background: #f3e5f5;
  color: #7b1fa2;
}
.status-extinct {
  background: #eceff1;
  color: #455a64;
}
.status-unknown {
  background: #f5f5f5;
  color: #757575;
}

.animal-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.animal-actions .btn {
  padding: 6px 12px;
  font-size: 12px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state i {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.animal-modal {
  width: 800px;
}

.qr-modal {
  width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.animal-form {
  padding: 20px;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #2196f3;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.qr-content {
  padding: 20px;
  text-align: center;
}

.qr-info {
  margin-bottom: 20px;
}

.qr-data {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
}

.qr-code-container {
  margin: 20px 0;
}

.qr-canvas {
  border: 1px solid #ddd;
  border-radius: 8px;
}

.qr-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .animals-grid {
    grid-template-columns: 1fr;
  }

  .animal-modal {
    width: 95vw;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
