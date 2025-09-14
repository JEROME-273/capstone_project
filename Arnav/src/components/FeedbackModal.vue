<template>
  <div v-if="visible" class="feedback-modal-overlay" @click="closeModal">
    <div class="feedback-modal" @click.stop>
      <div class="modal-header">
        <h2>Send Feedback</h2>
        <button @click="closeModal" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitFeedback">
          <input
            v-model="feedbackForm.email"
            type="email"
            placeholder="Your Email"
            readonly
            required />

          <!-- Star Rating System -->
          <div class="rating-section">
            <label class="rating-label">Rate your experience:</label>
            <div class="star-rating">
              <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{
                  filled: star <= feedbackForm.rating,
                  hovered: star <= hoveredStar,
                }"
                @click="setRating(star)"
                @mouseenter="hoveredStar = star"
                @mouseleave="hoveredStar = 0">
                ★
              </span>
            </div>
            <div class="rating-text">
              {{ getRatingText(feedbackForm.rating) }}
            </div>
          </div>

          <textarea
            v-model="feedbackForm.message"
            placeholder="Tell us about your experience..."
            required></textarea>

          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? "Sending..." : "Send Feedback" }}
          </button>
        </form>

        <div v-if="feedbackSuccess" class="success-message">
          Thank you for your feedback!
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from "@/firebase/config";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default {
  name: "FeedbackModal",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      feedbackForm: {
        email: "",
        message: "",
        rating: 0,
      },
      hoveredStar: 0,
      feedbackSuccess: false,
      isSubmitting: false,
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializeForm();
      } else {
        this.resetForm();
      }
    },
  },
  methods: {
    initializeForm() {
      const user = auth.currentUser;
      if (user) {
        this.feedbackForm.email = user.email || "";
      }
    },
    resetForm() {
      this.feedbackForm = {
        email: "",
        message: "",
        rating: 0,
      };
      this.hoveredStar = 0;
      this.feedbackSuccess = false;
      this.isSubmitting = false;
    },
    closeModal() {
      this.$emit("close");
    },
    setRating(rating) {
      this.feedbackForm.rating = rating;
    },
    getRatingText(rating) {
      const texts = {
        1: "Very Poor",
        2: "Poor",
        3: "Average",
        4: "Good",
        5: "Excellent",
      };
      return texts[rating] || "No rating";
    },
    async submitFeedback() {
      if (!this.feedbackForm.message.trim() || this.feedbackForm.rating === 0) {
        alert("Please provide a rating and message.");
        return;
      }

      this.isSubmitting = true;

      try {
        const db = getFirestore();
        const user = auth.currentUser;

        await addDoc(collection(db, "feedback"), {
          userId: user?.uid || "anonymous",
          email: this.feedbackForm.email,
          message: this.feedbackForm.message,
          rating: this.feedbackForm.rating,
          createdAt: serverTimestamp(),
        });

        this.feedbackSuccess = true;

        setTimeout(() => {
          this.closeModal();
        }, 2000);
      } catch (error) {
        console.error("Error submitting feedback:", error);
        alert("Failed to send feedback. Please try again.");
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.feedback-modal-overlay {
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

.feedback-modal {
  background: #ffffff;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideInUp 0.3s ease-out;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
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
  padding: 24px;
  overflow-y: auto;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

input,
textarea {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #1976d2;
}

input[readonly] {
  background: #f5f5f5;
  color: #666;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.rating-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-label {
  font-weight: 600;
  color: #333;
}

.star-rating {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 2rem;
  color: #ddd;
  cursor: pointer;
  transition: all 0.2s ease;
}

.star.filled,
.star.hovered {
  color: #ffc107;
}

.star:hover {
  transform: scale(1.1);
}

.rating-text {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

button {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  background: linear-gradient(135deg, #1565c0, #0d47a1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(25, 118, 210, 0.3);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.success-message {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  margin-top: 16px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
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

/* Mobile responsive */
@media (max-width: 768px) {
  .feedback-modal {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-header h2 {
    font-size: 1.3rem;
  }

  .modal-body {
    padding: 20px;
  }

  .star {
    font-size: 1.8rem;
  }

  input,
  textarea {
    padding: 12px 14px;
    font-size: 0.95rem;
  }

  button {
    padding: 12px 20px;
    font-size: 0.95rem;
  }
}
</style>
