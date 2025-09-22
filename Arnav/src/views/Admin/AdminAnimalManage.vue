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
            <div v-if="!animal.imageUrl" class="no-image-placeholder">
              <i class="bx bx-image"></i>
              <span>No Image</span>
            </div>
            <img
              v-else
              :src="animal.imageUrl"
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
            <button
              v-if="animal.soundUrl"
              class="btn btn-sound"
              @click="toggleSound(animal)">
              <i
                :class="
                  currentAnimalId === animal.id && isPlaying
                    ? 'bx bx-pause'
                    : 'bx bx-play'
                " />
              {{
                currentAnimalId === animal.id && isPlaying
                  ? "Pause"
                  : "Play Sound"
              }}
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
                <label>Image Upload</label>
                <div class="image-upload-container">
                  <!-- Image Preview -->
                  <div v-if="imagePreview" class="image-preview">
                    <img
                      :src="imagePreview"
                      alt="Preview"
                      style="max-width: 100%; height: auto" />
                    <button
                      type="button"
                      class="remove-image-btn"
                      @click="removeImage">
                      <i class="bx bx-x"></i>
                    </button>
                  </div>

                  <!-- Upload Area -->
                  <div
                    v-else
                    class="upload-area"
                    @click="triggerFileInput"
                    @dragover.prevent
                    @drop.prevent="handleFileDrop">
                    <i class="bx bx-cloud-upload"></i>
                    <p>Click to upload or drag and drop</p>
                    <span>Supports: JPG, PNG, GIF (Max 10MB)</span>
                  </div>

                  <!-- Hidden File Input -->
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleFileUpload"
                    style="display: none" />

                  <!-- Upload Progress -->
                  <div v-if="uploading" class="upload-progress">
                    <div class="progress-bar">
                      <div class="progress-fill"></div>
                    </div>
                    <span>Uploading image...</span>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>Animal Sound Upload</label>
                <div class="audio-upload-container">
                  <!-- Audio Preview -->
                  <div v-if="audioPreview" class="audio-preview">
                    <div class="audio-player">
                      <audio controls :src="audioPreview" preload="metadata">
                        Your browser does not support the audio element.
                      </audio>
                      <div class="audio-info">
                        <span class="file-name">{{ audioFileName }}</span>
                        <button
                          type="button"
                          class="remove-audio-btn"
                          @click="removeAudio">
                          <i class="bx bx-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Upload Area -->
                  <div
                    v-else
                    class="upload-area audio-upload"
                    @click="triggerAudioInput"
                    @dragover.prevent
                    @drop.prevent="handleAudioDrop">
                    <i class="bx bx-music"></i>
                    <p>Click to upload or drag and drop</p>
                    <span>Supports: MP3, WAV, OGG (Max 10MB)</span>
                  </div>

                  <!-- Hidden Audio Input -->
                  <input
                    ref="audioInput"
                    type="file"
                    accept="audio/*"
                    @change="handleAudioUpload"
                    style="display: none" />

                  <!-- Upload Progress -->
                  <div v-if="audioUploading" class="upload-progress">
                    <div class="progress-bar">
                      <div class="progress-fill"></div>
                    </div>
                    <span>Uploading audio...</span>
                  </div>
                </div>
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
import { ref, onMounted, computed, nextTick, watch } from "vue";
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
    // Single audio playback state
    const currentAudio = ref(null); // HTMLAudioElement
    const currentAnimalId = ref(null); // ID of animal whose audio is loaded
    const isPlaying = ref(false);
    // Legacy array kept if needed elsewhere; can be removed if unused
    const playingSounds = ref([]); // no longer used for UI state
    const previewPlaying = ref(false);
    const uploading = ref(false);
    const imagePreview = ref("");
    const fileInput = ref(null);

    // Audio upload variables
    const audioUploading = ref(false);
    const audioPreview = ref("");
    const audioFileName = ref("");
    const audioInput = ref(null);

    // Debug watcher for imagePreview
    watch(imagePreview, (newValue, oldValue) => {
      console.log("imagePreview changed from:", oldValue, "to:", newValue);
    });

    // Cloudinary configuration
    const CLOUDINARY_CLOUD_NAME =
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhkztfwiw";
    const CLOUDINARY_UPLOAD_PRESET =
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "my_unsigned_preset";

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
      soundUrl: "",
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
        animals.value = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Clean up any old placeholder URLs
          if (data.imageUrl && data.imageUrl.includes("via.placeholder.com")) {
            data.imageUrl = "";
          }
          return {
            id: doc.id,
            ...data,
          };
        });
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

    // File upload functions
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
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

        animalForm.value.imageUrl = data.secure_url;
        imagePreview.value = data.secure_url; // Update preview with Cloudinary URL
        console.log("Image uploaded successfully! URL:", data.secure_url);
        console.log("Image preview set to:", imagePreview.value);
        alert("Image uploaded successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        alert(`Failed to upload image: ${error.message}`);
        animalForm.value.imageUrl = "";
        imagePreview.value = ""; // Clear preview on error
      } finally {
        uploading.value = false;
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
          alert("Please drop an image file");
        }
      }
    };

    const removeImage = () => {
      imagePreview.value = "";
      animalForm.value.imageUrl = "";
      if (fileInput.value) fileInput.value.value = "";
      alert("Image removed");
    };

    // Audio upload functions
    const handleAudioUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("audio/")) {
        alert("Please select an audio file (MP3, WAV, OGG)");
        if (audioInput.value) audioInput.value.value = "";
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        if (audioInput.value) audioInput.value.value = "";
        return;
      }

      // Show preview immediately using local URL
      const reader = new FileReader();
      reader.onload = (e) => {
        audioPreview.value = e.target.result;
        audioFileName.value = file.name;
      };
      reader.readAsDataURL(file);

      audioUploading.value = true;
      try {
        console.log("Starting audio upload to Cloudinary...");

        // Upload to Cloudinary (same as images but for audio)
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("resource_type", "video"); // Use 'video' for audio files in Cloudinary

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || "Upload failed");
        }

        animalForm.value.soundUrl = data.secure_url;
        audioPreview.value = data.secure_url; // Use Cloudinary URL for final preview
        console.log(
          "Audio uploaded successfully to Cloudinary! URL:",
          data.secure_url
        );
        alert("Audio uploaded successfully!");
      } catch (error) {
        console.error("Error uploading audio:", error);
        alert(`Failed to upload audio: ${error.message}`);
        animalForm.value.soundUrl = "";
        audioPreview.value = "";
        audioFileName.value = "";
      } finally {
        audioUploading.value = false;
        if (audioInput.value) audioInput.value.value = "";
      }
    };

    const triggerAudioInput = () => {
      audioInput.value?.click();
    };

    const handleAudioDrop = (event) => {
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("audio/")) {
          // Simulate file input change
          const fakeEvent = { target: { files: [file] } };
          handleAudioUpload(fakeEvent);
        } else {
          alert("Please drop an audio file");
        }
      }
    };

    const removeAudio = () => {
      audioPreview.value = "";
      audioFileName.value = "";
      animalForm.value.soundUrl = "";
      if (audioInput.value) audioInput.value.value = "";
      alert("Audio removed");
    };

    // Edit animal - update to handle both image and audio preview
    const editAnimal = (animal) => {
      selectedAnimal.value = animal;
      animalForm.value = { ...animal };
      funFactsText.value = animal.funFacts ? animal.funFacts.join("\n") : "";
      imagePreview.value = animal.imageUrl || "";
      audioPreview.value = animal.soundUrl || "";
      audioFileName.value = animal.soundUrl ? "Existing audio file" : "";
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

    // Toggle play/pause for an animal sound ensuring only one plays at a time
    const toggleSound = async (animal) => {
      if (!animal || !animal.soundUrl) return;

      try {
        // If the same animal is currently playing, pause it
        if (currentAnimalId.value === animal.id) {
          if (currentAudio.value) {
            if (isPlaying.value) {
              currentAudio.value.pause();
              isPlaying.value = false;
            } else {
              await currentAudio.value.play();
              isPlaying.value = true;
            }
          }
          return;
        }

        // Different animal: stop previous audio if exists
        if (currentAudio.value) {
          currentAudio.value.pause();
          currentAudio.value.currentTime = 0;
        }

        // Create and play new audio
        const audio = new Audio(animal.soundUrl);
        currentAudio.value = audio;
        currentAnimalId.value = animal.id;
        isPlaying.value = false; // will set true after successful play

        // Cleanup on end
        audio.addEventListener("ended", () => {
          isPlaying.value = false;
          currentAnimalId.value = null;
          // Reset audio reference
          currentAudio.value = null;
        });

        audio.addEventListener("pause", () => {
          // pause event also fires on end before ended sometimes; guard with currentTime
          if (audio.currentTime < audio.duration) {
            isPlaying.value = false;
          }
        });

        audio.addEventListener("play", () => {
          isPlaying.value = true;
        });

        audio.addEventListener("error", (e) => {
          console.error("Error playing sound:", e);
          alert("Error playing sound. Please check the sound URL.");
          isPlaying.value = false;
          currentAnimalId.value = null;
          currentAudio.value = null;
        });

        await audio.play();
      } catch (err) {
        console.error("Audio playback failed:", err);
        alert(
          "Unable to play the sound. User interaction may be required or the file may be inaccessible."
        );
        isPlaying.value = false;
        currentAnimalId.value = null;
        currentAudio.value = null;
      }
    };

    // Preview sound in form
    const previewSound = async (soundUrl) => {
      if (!soundUrl || previewPlaying.value) return;

      try {
        previewPlaying.value = true;

        // Create audio element
        const audio = new Audio(soundUrl);

        // Handle audio events
        audio.addEventListener("ended", () => {
          previewPlaying.value = false;
        });

        audio.addEventListener("error", (e) => {
          console.error("Error previewing sound:", e);
          alert("Error previewing sound. Please check the sound URL.");
          previewPlaying.value = false;
        });

        // Play the audio
        await audio.play();
      } catch (error) {
        console.error("Error previewing sound:", error);
        alert(
          "Error previewing sound. Please ensure the URL is valid and accessible."
        );
        previewPlaying.value = false;
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
        soundUrl: "",
      };
      funFactsText.value = "";
      imagePreview.value = "";
      if (fileInput.value) fileInput.value.value = "";
    };

    // Handle image loading errors
    const handleImageError = (event) => {
      console.log("Image error for URL:", event.target.src);
      // Hide the image and show placeholder
      if (!event.target.dataset.errorHandled) {
        event.target.dataset.errorHandled = "true";
        event.target.style.display = "none";

        // Create and show placeholder
        const placeholder = document.createElement("div");
        placeholder.className = "no-image-placeholder";
        placeholder.innerHTML =
          '<i class="bx bx-image"></i><span>Image Failed</span>';
        event.target.parentNode.appendChild(placeholder);
      }
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
      playingSounds,
      previewPlaying,
      uploading,
      imagePreview,
      fileInput,
      audioUploading,
      audioPreview,
      audioFileName,
      audioInput,
      saveAnimal,
      editAnimal,
      deleteAnimal,
      generateQR,
      downloadQR,
      printQR,
      toggleSound,
      currentAnimalId,
      isPlaying,
      previewSound,
      handleFileUpload,
      triggerFileInput,
      handleFileDrop,
      removeImage,
      handleAudioUpload,
      triggerAudioInput,
      handleAudioDrop,
      removeAudio,
      closeModals,
      getStatusClass,
      handleImageError,
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

.btn-sound {
  background: #9c27b0;
  color: white;
}

.btn-sound:hover {
  background: #7b1fa2;
}

.btn-sound:disabled {
  background: #ba68c8;
  cursor: not-allowed;
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

.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
  border: 2px dashed #ddd;
  border-radius: 8px;
}

.no-image-placeholder i {
  font-size: 48px;
  margin-bottom: 8px;
}

.no-image-placeholder span {
  font-size: 14px;
  font-weight: 500;
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

.input-with-button {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.input-with-button input {
  flex: 1;
}

.btn-preview {
  background: #3f51b5;
  color: white;
  padding: 8px 12px;
  font-size: 12px;
  white-space: nowrap;
}

.btn-preview:hover {
  background: #303f9f;
}

.btn-preview:disabled {
  background: #7986cb;
  cursor: not-allowed;
}

/* Image Upload Styles */
.image-upload-container {
  margin-top: 8px;
}

.image-preview {
  position: relative;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #ddd;
}

.image-preview img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background: rgba(255, 255, 255, 1);
  color: #f44336;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #2196f3;
  background: #f0f8ff;
}

.upload-area i {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 16px;
  display: block;
}

.upload-area:hover i {
  color: #2196f3;
}

.upload-area p {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.upload-area span {
  font-size: 14px;
  color: #999;
}

.upload-progress {
  margin-top: 16px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196f3, #21cbf3);
  animation: progress-animation 1.5s ease-in-out infinite;
}

@keyframes progress-animation {
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

.upload-progress span {
  font-size: 14px;
  color: #666;
  font-weight: 500;
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

/* Audio Upload Styles */
.audio-upload-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.audio-upload {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px dashed rgba(255, 255, 255, 0.3);
}

.audio-upload:hover {
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

.audio-upload i {
  font-size: 2.5rem;
  margin-bottom: 15px;
  opacity: 0.8;
}

.audio-preview {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.audio-player {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.audio-player audio {
  width: 100%;
  border-radius: 5px;
}

.audio-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 10px 15px;
  border-radius: 5px;
  border: 1px solid #e0e0e0;
}

.file-name {
  font-size: 0.9rem;
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-audio-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
}

.remove-audio-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

.remove-audio-btn i {
  font-size: 1rem;
}
</style>
