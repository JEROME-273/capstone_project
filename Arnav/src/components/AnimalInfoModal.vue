<template>
  <div
    v-if="animal && visible"
    class="animal-info-modal-overlay"
    @click="closeModal">
    <div class="animal-info-modal" @click.stop>
      <div class="modal-header">
        <div class="header-content">
          <h2 class="animal-name">
            <i class="fas fa-paw"></i>
            {{ animal.name || "Animal Information" }}
          </h2>
        </div>
        <button @click="closeModal" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Animal Image -->
        <div class="animal-image-section" v-if="animal.imageUrl">
          <img :src="animal.imageUrl" :alt="animal.name" class="animal-image" />
        </div>

        <!-- Animal Details -->
        <div class="animal-details">
          <div class="detail-list">
            <div class="detail-item" v-if="animal.scientificName">
              <span class="detail-text"
                >Scientific Name: {{ animal.scientificName }}</span
              >
            </div>

            <div class="detail-item" v-if="animal.species">
              <span class="detail-text">Species: {{ animal.species }}</span>
            </div>

            <div class="detail-item" v-if="animal.habitat">
              <span class="detail-text">Habitat: {{ animal.habitat }}</span>
            </div>

            <div class="detail-item" v-if="animal.diet">
              <span class="detail-text">Diet: {{ animal.diet }}</span>
            </div>

            <div class="detail-item" v-if="animal.lifespan">
              <span class="detail-text">Lifespan: {{ animal.lifespan }}</span>
            </div>

            <div class="detail-item" v-if="animal.conservationStatus">
              <span class="detail-text"
                >Conservation Status:
                <span
                  class="conservation-status"
                  :class="getStatusClass(animal.conservationStatus)">
                  {{ animal.conservationStatus }}
                </span>
              </span>
            </div>

            <div class="detail-item" v-if="animal.weight">
              <span class="detail-text">Weight: {{ animal.weight }}</span>
            </div>

            <div class="detail-item" v-if="animal.length">
              <span class="detail-text">Length: {{ animal.length }}</span>
            </div>

            <div class="detail-item" v-if="animal.location">
              <span class="detail-text"
                >Location in Park: {{ animal.location }}</span
              >
            </div>
          </div>

          <!-- Description -->
          <div class="animal-description" v-if="animal.description">
            <h3>About {{ animal.name }}</h3>
            <p>{{ animal.description }}</p>
          </div>

          <!-- Fun Facts -->
          <div
            class="fun-facts"
            v-if="animal.funFacts && animal.funFacts.length">
            <h3>Fun Facts</h3>
            <ul>
              <li v-for="(fact, index) in animal.funFacts" :key="index">
                {{ fact }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="shareAnimal" class="share-btn">
          <i class="fas fa-share-alt"></i>
          Share
        </button>
        <button @click="closeModal" class="close-modal-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AnimalInfoModal",
  props: {
    animal: {
      type: Object,
      default: null,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  methods: {
    closeModal() {
      this.$emit("close");
    },

    getStatusClass(status) {
      if (!status) return "";
      const lowerStatus = status.toLowerCase();
      if (lowerStatus.includes("extinct")) return "extinct";
      if (lowerStatus.includes("endangered")) return "endangered";
      if (lowerStatus.includes("vulnerable")) return "vulnerable";
      if (lowerStatus.includes("concern")) return "concern";
      return "stable";
    },

    shareAnimal() {
      if (!this.animal) return;

      if (navigator.share) {
        navigator
          .share({
            title: `Learn about ${this.animal.name}`,
            text: `Check out this information about ${this.animal.name}!`,
            url: window.location.href,
          })
          .catch(console.error);
      } else {
        // Fallback: copy to clipboard
        const text = `Learn about ${this.animal.name}! ${
          this.animal.description || ""
        }`;
        navigator.clipboard
          .writeText(text)
          .then(() => {
            alert("Animal information copied to clipboard!");
          })
          .catch(() => {
            alert("Unable to share. Please try again.");
          });
      }
    },
  },
};
</script>

<style scoped>
.animal-info-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-out;
}

.animal-info-modal {
  background: #ffffff;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideInUp 0.3s ease-out;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.header-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.animal-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.animal-image-section {
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}

.animal-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.animal-details {
  padding: 24px;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
}

.detail-text {
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 500;
}

.detail-item label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.detail-item span {
  color: #333;
  font-size: 1rem;
}

.conservation-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.conservation-status.extinct {
  background: #ffebee;
  color: #c62828;
}

.conservation-status.endangered {
  background: #fff3e0;
  color: #ef6c00;
}

.conservation-status.vulnerable {
  background: #fff8e1;
  color: #f57f17;
}

.conservation-status.concern {
  background: #f3e5f5;
  color: #7b1fa2;
}

.conservation-status.stable {
  background: #e8f5e8;
  color: #2e7d32;
}

.animal-description {
  margin-bottom: 24px;
}

.animal-description h3 {
  color: #333;
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.animal-description p {
  color: #555;
  line-height: 1.6;
  font-size: 1rem;
}

.fun-facts {
  margin-bottom: 24px;
}

.fun-facts h3 {
  color: #333;
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.fun-facts ul {
  margin: 0;
  padding-left: 20px;
}

.fun-facts li {
  color: #555;
  margin-bottom: 8px;
  line-height: 1.5;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.share-btn,
.close-modal-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.share-btn {
  background: #4caf50;
  color: white;
  border: none;
}

.share-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.close-modal-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.close-modal-btn:hover {
  background: #e0e0e0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .animal-info-modal {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .animal-name {
    font-size: 1.3rem;
  }

  .modal-header h2 {
    font-size: 1.3rem;
  }

  .animal-details {
    padding: 20px;
  }

  .detail-list {
    gap: 10px;
  }

  .modal-footer {
    padding: 16px 20px;
    flex-direction: column;
  }

  .share-btn,
  .close-modal-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .animal-info-modal {
    width: 98%;
    max-height: 90vh;
  }

  .modal-header {
    padding: 14px 16px;
  }

  .animal-name {
    font-size: 1.2rem;
  }

  .modal-header h2 {
    font-size: 1.2rem;
  }

  .animal-details {
    padding: 16px;
  }
}

/* Dark mode support */
body.dark-mode .animal-info-modal {
  background: #1e1e20;
  color: #f2f2f7;
}

body.dark-mode .modal-header {
  background: linear-gradient(135deg, #654321 0%, #8b4513 100%);
}

body.dark-mode .detail-item label {
  color: #a0a0a8;
}

body.dark-mode .detail-item span {
  color: #f2f2f7;
}

body.dark-mode .animal-description h3,
body.dark-mode .fun-facts h3 {
  color: #f2f2f7;
}

body.dark-mode .animal-description p,
body.dark-mode .fun-facts li {
  color: #a0a0a8;
}

body.dark-mode .modal-footer {
  border-top-color: #444;
}

body.dark-mode .close-modal-btn {
  background: #28282c;
  color: #f2f2f7;
  border-color: #444;
}

body.dark-mode .close-modal-btn:hover {
  background: #333;
}
</style>
