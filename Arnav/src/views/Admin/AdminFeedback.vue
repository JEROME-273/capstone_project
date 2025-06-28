<template>
  <AdminLayout @logout="logout">
    <template #nav>
      <div class="admin-nav-bar">
        <a href="#" class="nav-link">USER FEEDBACK</a>
      </div>
    </template>
    <div>
      <main>
        <!-- Feedback Statistics Cards -->
        <ul class="box-info">
          <li>
            <i class="bx bxs-message-detail"></i>
            <span class="text">
              <h3>{{ feedbacks.length }}</h3>
              <p>Total Feedback</p>
            </span>
          </li>
          <li>
            <i class="bx bxs-star"></i>
            <span class="text">
              <h3>{{ averageRating.toFixed(1) }}</h3>
              <p>Average Rating</p>
            </span>
          </li>
          <li>
            <i class="bx bxs-like"></i>
            <span class="text">
              <h3>{{ positiveCount }}</h3>
              <p>Positive (4-5★)</p>
            </span>
          </li>
          <li>
            <i class="bx bxs-dislike"></i>
            <span class="text">
              <h3>{{ negativeCount }}</h3>
              <p>Needs Attention (1-2★)</p>
            </span>
          </li>
        </ul>

        <!-- Feedback Management -->
        <div class="table-data">
          <div class="order full-width">
            <div class="head">
              <h3>User Feedback</h3>
              <div class="header-actions">
                <button class="filter-btn" @click="showFilters = !showFilters">
                  <i class="bx bx-filter"></i>
                </button>
                <button class="refresh-btn" @click="fetchFeedbacks">
                  <i class="bx bx-refresh"></i>
                </button>
              </div>
            </div>

            <!-- Filter Section -->
            <div v-if="showFilters" class="filters-section">
              <div class="filter-row">
                <div class="search-box">
                  <i class="bx bx-search"></i>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by email or message..." />
                </div>
                <select v-model="ratingFilter" class="filter-select">
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
                <select v-model="sortBy" class="filter-select">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating-high">Highest Rating</option>
                  <option value="rating-low">Lowest Rating</option>
                </select>
              </div>
            </div>

            <!-- Feedback List -->
            <div class="feedback-container">
              <div v-if="filteredFeedbacks.length === 0" class="empty-state">
                <i class="bx bx-message"></i>
                <h4>No feedback found</h4>
                <p v-if="searchQuery || ratingFilter !== 'all'">
                  Try adjusting your filters to see more results.
                </p>
                <p v-else>No user feedback available at the moment.</p>
              </div>

              <div v-else class="feedback-list">
                <div
                  v-for="feedback in filteredFeedbacks"
                  :key="feedback.id"
                  class="feedback-card"
                  @click="openFeedbackDetails(feedback)">
                  <div class="feedback-header">
                    <div class="feedback-user">
                      <div class="user-avatar">
                        {{ feedback.email.charAt(0).toUpperCase() }}
                      </div>
                      <div class="user-info">
                        <h4 class="user-email">{{ feedback.email }}</h4>
                        <span class="feedback-time">{{
                          formatDate(feedback.createdAt)
                        }}</span>
                      </div>
                    </div>
                    <div class="feedback-meta">
                      <div class="star-rating">
                        <i
                          v-for="n in 5"
                          :key="n"
                          class="bx"
                          :class="
                            n <= (feedback.rating || 0) ? 'bxs-star' : 'bx-star'
                          "
                          :style="{
                            color:
                              n <= (feedback.rating || 0)
                                ? '#fbbf24'
                                : '#d1d5db',
                          }">
                        </i>
                        <span class="rating-text"
                          >({{ feedback.rating || 0 }} out of 5)</span
                        >
                      </div>
                      <div v-if="feedback.adminReply" class="reply-indicator">
                        <i
                          class="bx bx-check-circle"
                          style="color: #10b981"></i>
                        <span>Replied</span>
                      </div>
                    </div>
                  </div>

                  <div class="feedback-content">
                    <p class="feedback-message">
                      {{ truncateMessage(feedback.message) }}
                    </p>
                    <div v-if="feedback.subject" class="feedback-subject">
                      <strong>Subject:</strong> {{ feedback.subject }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feedback Details Modal -->
        <div
          v-if="selectedFeedback"
          class="modal-overlay"
          @click.self="closeFeedbackDetails">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Feedback Details</h3>
              <button class="close-btn" @click="closeFeedbackDetails">
                <i class="bx bx-x"></i>
              </button>
            </div>

            <div class="modal-body">
              <div class="feedback-info">
                <div class="user-section">
                  <div class="user-avatar large">
                    {{ selectedFeedback.email.charAt(0).toUpperCase() }}
                  </div>
                  <div class="user-details">
                    <h4>{{ selectedFeedback.email }}</h4>
                    <div class="star-rating large">
                      <i
                        v-for="n in 5"
                        :key="n"
                        class="bx"
                        :class="
                          n <= (selectedFeedback.rating || 0)
                            ? 'bxs-star'
                            : 'bx-star'
                        "
                        :style="{
                          color:
                            n <= (selectedFeedback.rating || 0)
                              ? '#fbbf24'
                              : '#d1d5db',
                        }">
                      </i>
                      <span class="rating-text"
                        >({{ selectedFeedback.rating || 0 }} out of 5)</span
                      >
                    </div>
                  </div>
                </div>

                <div class="feedback-section">
                  <h5>Feedback Message:</h5>
                  <p class="feedback-text">{{ selectedFeedback.message }}</p>
                  <p class="feedback-date">
                    Received: {{ formatDate(selectedFeedback.createdAt) }}
                  </p>
                </div>

                <div class="admin-reply-section">
                  <h5>Admin Reply</h5>
                  <div
                    v-if="selectedFeedback.adminReply"
                    class="existing-reply">
                    <p>{{ selectedFeedback.adminReply }}</p>
                    <small
                      >Replied on:
                      {{ formatDate(selectedFeedback.repliedAt) }}</small
                    >
                  </div>
                  <div v-else>
                    <textarea
                      v-model="replyText"
                      placeholder="Type your response here..."
                      class="reply-textarea">
                    </textarea>
                    <button
                      class="send-reply-btn"
                      @click="sendReply"
                      :disabled="!replyText.trim() || isReplying">
                      <i class="bx bx-send"></i>
                      {{ isReplying ? "Sending..." : "Send Reply" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </AdminLayout>
</template>

<script>
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import AdminLayout from "./AdminLayout.vue";

export default {
  name: "AdminFeedback",
  components: { AdminLayout },
  data() {
    return {
      feedbacks: [],
      searchQuery: "",
      ratingFilter: "all",
      sortBy: "newest",
      showFilters: false,
      selectedFeedback: null,
      replyText: "",
      isReplying: false,
    };
  },
  computed: {
    filteredFeedbacks() {
      let filtered = [...this.feedbacks];

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (feedback) =>
            feedback.email.toLowerCase().includes(query) ||
            feedback.message.toLowerCase().includes(query) ||
            (feedback.subject && feedback.subject.toLowerCase().includes(query))
        );
      }

      // Filter by rating
      if (this.ratingFilter !== "all") {
        filtered = filtered.filter(
          (feedback) => feedback.rating === parseInt(this.ratingFilter)
        );
      }

      // Sort
      filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);

        switch (this.sortBy) {
          case "newest":
            return dateB - dateA;
          case "oldest":
            return dateA - dateB;
          case "rating-high":
            return (b.rating || 0) - (a.rating || 0);
          case "rating-low":
            return (a.rating || 0) - (b.rating || 0);
          default:
            return dateB - dateA;
        }
      });

      return filtered;
    },

    averageRating() {
      if (this.feedbacks.length === 0) return 0;
      const total = this.feedbacks.reduce(
        (sum, feedback) => sum + (feedback.rating || 0),
        0
      );
      return total / this.feedbacks.length;
    },

    positiveCount() {
      return this.feedbacks.filter((feedback) => (feedback.rating || 0) >= 4)
        .length;
    },

    negativeCount() {
      return this.feedbacks.filter((feedback) => (feedback.rating || 0) <= 2)
        .length;
    },
  },
  async mounted() {
    await this.fetchFeedbacks();
  },
  methods: {
    async fetchFeedbacks() {
      try {
        const db = getFirestore();
        const q = collection(db, "feedback");
        const querySnapshot = await getDocs(q);

        this.feedbacks = [];
        querySnapshot.forEach((doc) => {
          this.feedbacks.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate
              ? doc.data().createdAt.toDate()
              : null,
            repliedAt: doc.data().repliedAt?.toDate
              ? doc.data().repliedAt.toDate()
              : null,
          });
        });
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    },

    openFeedbackDetails(feedback) {
      this.selectedFeedback = feedback;
      this.replyText = "";
    },

    closeFeedbackDetails() {
      this.selectedFeedback = null;
      this.replyText = "";
      this.isReplying = false;
    },

    async sendReply() {
      if (!this.replyText.trim() || !this.selectedFeedback) return;

      this.isReplying = true;

      try {
        const db = getFirestore();
        await updateDoc(doc(db, "feedback", this.selectedFeedback.id), {
          adminReply: this.replyText.trim(),
          repliedAt: new Date(),
          repliedBy: "admin", // In real app, use current admin's ID
        });

        // Update local data
        this.selectedFeedback.adminReply = this.replyText.trim();
        this.selectedFeedback.repliedAt = new Date();

        // Update in the feedbacks array
        const index = this.feedbacks.findIndex(
          (f) => f.id === this.selectedFeedback.id
        );
        if (index !== -1) {
          this.feedbacks[index] = { ...this.selectedFeedback };
        }

        this.replyText = "";
        this.showSuccessToast("Reply sent successfully!");
      } catch (error) {
        console.error("Error sending reply:", error);
        this.showErrorToast("Error sending reply");
      } finally {
        this.isReplying = false;
      }
    },

    truncateMessage(message, maxLength = 100) {
      if (!message) return "";
      return message.length > maxLength
        ? message.substring(0, maxLength) + "..."
        : message;
    },

    showSuccessToast(message) {
      // Simple toast implementation - in real app, use a proper toast library
      alert(message);
    },

    showErrorToast(message) {
      // Simple toast implementation - in real app, use a proper toast library
      alert(message);
    },

    formatDate(date) {
      if (!date) return "N/A";
      const now = new Date();
      const feedbackDate = new Date(date);
      const diffInHours = (now - feedbackDate) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
      } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      } else {
        return feedbackDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    },

    logout() {
      signOut(getAuth()).then(() => {
        localStorage.removeItem("user");
        this.$router.push("/register");
      });
    },
  },
};
</script>

<style scoped>
@import url("https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css");

/* CSS Variables for consistent theming */
:root {
  --bg-color: #f3f4f6;
  --card-bg: #ffffff;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}

[data-theme="dark"] {
  --bg-color: #111827;
  --card-bg: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
  --primary-color: #3b82f6;
  --primary-hover: #60a5fa;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3),
    0 4px 6px -4px rgb(0 0 0 / 0.3);
}

/* Statistics Cards */
.box-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  grid-gap: 24px;
  margin-bottom: 36px;
  list-style: none;
  padding: 0;
}

.box-info li {
  padding: 24px;
  background: var(--card-bg);
  border-radius: 20px;
  display: flex;
  align-items: center;
  grid-gap: 24px;
  cursor: pointer;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.box-info li:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.box-info li .bx {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  font-size: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.box-info li:nth-child(1) .bx {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.box-info li:nth-child(2) .bx {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.box-info li:nth-child(3) .bx {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.box-info li:nth-child(4) .bx {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.box-info li .text h3 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.box-info li .text p {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

/* Main Content Layout */
.table-data {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 24px;
  margin-top: 24px;
  width: 100%;
}

.table-data .order {
  flex: 1;
  border-radius: 20px;
  background: var(--card-bg);
  padding: 24px;
  overflow-x: auto;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  min-width: 0;
}

.table-data .order.full-width {
  flex: 100%;
}

.table-data .head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.table-data .head h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.filter-btn,
.refresh-btn {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.filter-btn:hover,
.refresh-btn:hover {
  background: var(--bg-color);
  border-color: var(--primary-color);
}

/* Filters Section */
.filters-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
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
  padding: 10px 16px 10px 40px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 14px;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 14px;
  min-width: 150px;
}

/* Feedback Container */
.feedback-container {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h4 {
  font-size: 18px;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feedback-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  background: var(--card-bg);
  transition: all 0.2s ease;
  cursor: pointer;
}

.feedback-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow);
  transform: translateY(-1px);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.feedback-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.user-avatar.large {
  width: 60px;
  height: 60px;
  font-size: 20px;
}

.user-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.feedback-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.feedback-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.star-rating {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star-rating.large {
  gap: 4px;
}

.star-rating .bx {
  font-size: 16px;
}

.star-rating.large .bx {
  font-size: 20px;
}

.rating-text {
  margin-left: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.reply-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--success-color);
}

.feedback-content {
  margin-bottom: 16px;
}

.feedback-message {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.feedback-subject {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 8px 12px;
  background: var(--bg-color);
  border-radius: 6px;
}

/* Modal Styles */
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
  padding: 20px;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-color);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.user-details h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--text-primary);
}

.feedback-section {
  margin-bottom: 24px;
}

.feedback-section h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feedback-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.feedback-date {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.admin-reply-section h5 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.existing-reply {
  padding: 16px;
  background: var(--bg-color);
  border-radius: 8px;
  border-left: 4px solid var(--success-color);
}

.existing-reply p {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  line-height: 1.6;
}

.existing-reply small {
  color: var(--text-secondary);
  font-size: 12px;
}

.reply-textarea {
  width: 100%;
  min-height: 100px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  margin-bottom: 16px;
}

.reply-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.send-reply-btn {
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.send-reply-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.send-reply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .box-info {
    grid-template-columns: 1fr;
  }

  .table-data {
    flex-direction: column;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .feedback-header {
    flex-direction: column;
    gap: 12px;
  }

  .feedback-meta {
    align-items: flex-start;
  }

  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }

  .user-section {
    flex-direction: column;
    text-align: center;
  }
}

@media screen and (max-width: 480px) {
  .box-info li {
    padding: 16px;
    gap: 16px;
  }

  .box-info li .bx {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }

  .table-data .order {
    padding: 16px;
  }

  .feedback-card {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }
}
</style>
