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
                      <div
                        v-if="hasAdminReply(feedback.id)"
                        class="reply-indicator">
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
                    v-if="getAdminReply(selectedFeedback.id)"
                    class="existing-reply">
                    <p>{{ getAdminReply(selectedFeedback.id).message }}</p>
                    <small
                      >Replied on:
                      {{
                        formatDate(getAdminReply(selectedFeedback.id).createdAt)
                      }}</small
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
                      {{ isReplying ? "Sending..." : "Send Reply via Email" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Toast Notifications -->
        <!-- Toast notifications are now handled by vue-toastification -->
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
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import emailjs from "@emailjs/browser";
import { useToast } from "vue-toastification";
import AdminLayout from "./AdminLayout.vue";

export default {
  name: "AdminFeedback",
  components: { AdminLayout },
  setup() {
    // Initialize toast
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      feedbacks: [],
      adminReplies: [],
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
    await this.fetchAdminReplies();
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
          });
        });
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        this.showErrorToast("Error loading feedback data");
      }
    },

    async fetchAdminReplies() {
      try {
        const db = getFirestore();
        const q = collection(db, "admin_replies");
        const querySnapshot = await getDocs(q);

        this.adminReplies = [];
        querySnapshot.forEach((doc) => {
          this.adminReplies.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate
              ? doc.data().createdAt.toDate()
              : null,
          });
        });
      } catch (error) {
        console.error("Error fetching admin replies:", error);
        if (error.code === "permission-denied") {
          console.warn(
            "Admin replies collection access denied. Please check Firestore security rules."
          );
          this.adminReplies = [];
        }
      }
    },

    hasAdminReply(feedbackId) {
      return this.adminReplies.some((reply) => reply.feedbackId === feedbackId);
    },

    getAdminReply(feedbackId) {
      return this.adminReplies.find((reply) => reply.feedbackId === feedbackId);
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
        const auth = getAuth();
        const currentUser = auth.currentUser;

        // Save reply to admin_replies collection
        const replyData = {
          feedbackId: this.selectedFeedback.id,
          userEmail: this.selectedFeedback.email,
          message: this.replyText.trim(),
          createdAt: serverTimestamp(),
          repliedBy: currentUser?.email || "admin",
          status: "sent",
        };

        await addDoc(collection(db, "admin_replies"), replyData);

        // Send actual email to user
        await this.sendEmailToUser();

        // Refresh admin replies
        await this.fetchAdminReplies();

        this.replyText = "";

        // Close modal first, then show success toast
        this.closeFeedbackDetails();

        // Show success toast with recipient email
        setTimeout(() => {
          this.toast.success(
            `Reply sent successfully! Email delivered to ${this.selectedFeedback.email}`
          );
        }, 100);
      } catch (error) {
        console.error("Error sending reply:", error);
        if (error.code === "permission-denied") {
          this.toast.error(
            "Permission denied. Please check Firestore security rules for admin_replies collection."
          );
        } else {
          this.toast.error("Error sending reply: " + error.message);
        }
      } finally {
        this.isReplying = false;
      }
    },

    async sendEmailToUser() {
      try {
        // Create email content
        const subject = `FarmGuide Support: Reply to Your Feedback`;
        const userFirstName = this.selectedFeedback.email.split("@")[0];

        const emailBody = `
Dear ${userFirstName},

Thank you for your feedback regarding FarmGuide AR Navigation. We have reviewed your message and here is our response:

Your Original Feedback:
"${this.selectedFeedback.message}"

Your Rating: ${this.selectedFeedback.rating} out of 5 stars

Our Response:
${this.replyText.trim()}

We appreciate your input and hope this addresses your concerns. If you have any further questions, please don't hesitate to contact us.

Best regards,
FarmGuide Support Team
arnavigation25@gmail.com

---
This is an automated response from FarmGuide Support System.
        `.trim();

        // Initialize EmailJS
        emailjs.init("_wqlThEYfyqQWfWu7");

        // Validate required fields
        if (
          !this.selectedFeedback.email ||
          this.selectedFeedback.email.trim() === ""
        ) {
          throw new Error("Recipient email is missing or empty");
        }

        // Prepare template parameters for EmailJS
        const templateParams = {
          to_email: this.selectedFeedback.email.trim(),
          to_name: userFirstName || "User",
          email: this.selectedFeedback.email.trim(),
          user_email: this.selectedFeedback.email.trim(),
          recipient_email: this.selectedFeedback.email.trim(),
          name: userFirstName || "User",
          user_name: userFirstName || "User",
          recipient_name: userFirstName || "User",
          from_name: "FarmGuide Support Team",
          reply_to: "arnavigation25@gmail.com",
          subject: subject || "Reply to Your Feedback",
          email_subject: subject || "Reply to Your Feedback",
          user_feedback: this.selectedFeedback.message || "",
          user_rating: this.selectedFeedback.rating || "No rating",
          admin_reply: this.replyText.trim() || "",
          reply_message: this.replyText.trim() || "",
          message: emailBody || "",
          email_body: emailBody || "",
          feedback_id: this.selectedFeedback.id || "",
          reply_date: new Date().toLocaleDateString(),
        };

        console.log("Sending email via EmailJS...");

        // Send email using EmailJS
        const response = await emailjs.send(
          "service_txhch6f",
          "template_z9y5zqt",
          templateParams
        );

        console.log("Email sent successfully via EmailJS:", response);

        // Update the admin reply status to include email status
        const db = getFirestore();
        const replyQuery = query(
          collection(db, "admin_replies"),
          where("feedbackId", "==", this.selectedFeedback.id)
        );
        const replySnapshot = await getDocs(replyQuery);

        if (!replySnapshot.empty) {
          const replyDoc = replySnapshot.docs[0];
          await updateDoc(doc(db, "admin_replies", replyDoc.id), {
            emailStatus: "sent",
            emailSentAt: serverTimestamp(),
            emailjsResponse: response.text,
          });
        }
      } catch (error) {
        console.error("Error sending email via EmailJS:", error);

        let errorMessage = "Failed to send email";
        if (error.message && error.message.includes("recipients address")) {
          errorMessage =
            "Email template configuration error: Check that your EmailJS template has a field for the recipient's email";
        } else if (error.message && error.message.includes("template")) {
          errorMessage =
            "Email template not found: Check your template ID in EmailJS dashboard";
        } else if (error.message && error.message.includes("service")) {
          errorMessage =
            "Email service error: Check your service ID in EmailJS dashboard";
        } else if (error.message) {
          errorMessage = `Email error: ${error.message}`;
        }

        this.toast.error(errorMessage);

        // Update reply status to show email failed
        try {
          const db = getFirestore();
          const replyQuery = query(
            collection(db, "admin_replies"),
            where("feedbackId", "==", this.selectedFeedback.id)
          );
          const replySnapshot = await getDocs(replyQuery);

          if (!replySnapshot.empty) {
            const replyDoc = replySnapshot.docs[0];
            await updateDoc(doc(db, "admin_replies", replyDoc.id), {
              emailStatus: "failed",
              emailError: error.message,
            });
          }
        } catch (updateError) {
          console.error("Error updating email status:", updateError);
        }

        throw new Error(`Failed to send email: ${error.message}`);
      }
    },

    truncateMessage(message, maxLength = 100) {
      if (!message) return "";
      return message.length > maxLength
        ? message.substring(0, maxLength) + "..."
        : message;
    },

    formatDate(date) {
      if (!date) return "N/A";
      const now = new Date();
      const targetDate = new Date(date);
      const diffInHours = (now - targetDate) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
      } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      } else {
        return targetDate.toLocaleDateString("en-US", {
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-gap: 16px;
  margin-bottom: 24px;
  list-style: none;
  padding: 0;
}

.box-info li {
  padding: 16px;
  background: var(--card-bg);
  border-radius: 12px;
  display: flex;
  align-items: center;
  grid-gap: 16px;
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
  width: 64px;
  height: 64px;
  border-radius: 10px;
  font-size: 28px;
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
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.box-info li .text p {
  color: var(--text-secondary);
  font-size: 12px;
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
  border-radius: 16px;
  background: var(--card-bg);
  padding: 16px;
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
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.table-data .head h3 {
  font-size: 16px;
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
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  font-size: 11px;
}

.filter-btn:hover,
.refresh-btn:hover {
  background: var(--bg-color);
  border-color: var(--primary-color);
}

/* Filters Section */
.filters-section {
  margin-bottom: 16px;
  padding: 12px;
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
  padding: 8px 14px 8px 36px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 12px;
}

.filter-select {
  padding: 8px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 12px;
  min-width: 120px;
}

/* Feedback Container */
.feedback-container {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state h4 {
  font-size: 16px;
  margin-bottom: 6px;
  color: var(--text-primary);
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feedback-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
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
  margin-bottom: 12px;
}

.feedback-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.user-avatar.large {
  width: 48px;
  height: 48px;
  font-size: 18px;
}

.user-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.feedback-time {
  font-size: 11px;
  color: var(--text-secondary);
}

.feedback-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
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
  font-size: 14px;
}

.star-rating.large .bx {
  font-size: 18px;
}

.rating-text {
  margin-left: 6px;
  font-size: 11px;
  color: var(--text-secondary);
}

.reply-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--success-color);
}

.feedback-content {
  margin-bottom: 12px;
}

.feedback-message {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.feedback-subject {
  font-size: 11px;
  color: var(--text-secondary);
  padding: 6px 10px;
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
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
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
  padding: 16px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.user-details h4 {
  margin: 0 0 6px 0;
  font-size: 15px;
  color: var(--text-primary);
}

.feedback-section {
  margin-bottom: 16px;
}

.feedback-section h5 {
  margin: 0 0 6px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feedback-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.feedback-date {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
}

.admin-reply-section h5 {
  margin: 0 0 12px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.existing-reply {
  padding: 12px;
  background: var(--bg-color);
  border-radius: 8px;
  border-left: 4px solid var(--success-color);
}

.existing-reply p {
  margin: 0 0 6px 0;
  color: var(--text-primary);
  line-height: 1.5;
  font-size: 13px;
}

.existing-reply small {
  color: var(--text-secondary);
  font-size: 11px;
}

.reply-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.4;
  resize: vertical;
  margin-bottom: 12px;
}

.reply-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.send-reply-btn {
  padding: 10px 20px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  font-size: 13px;
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
    gap: 12px;
  }

  .box-info li {
    padding: 12px;
    gap: 12px;
  }

  .box-info li .bx {
    width: 48px;
    height: 48px;
    font-size: 22px;
  }

  .box-info li .text h3 {
    font-size: 16px;
  }

  .box-info li .text p {
    font-size: 11px;
  }

  .table-data {
    flex-direction: column;
  }

  .table-data .order {
    padding: 12px;
  }

  .table-data .head h3 {
    font-size: 14px;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .search-box {
    min-width: auto;
  }

  .feedback-header {
    flex-direction: column;
    gap: 8px;
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
    padding: 10px;
    gap: 10px;
  }

  .box-info li .bx {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .box-info li .text h3 {
    font-size: 14px;
  }

  .box-info li .text p {
    font-size: 10px;
  }

  .table-data .order {
    padding: 10px;
  }

  .table-data .head h3 {
    font-size: 13px;
  }

  .feedback-card {
    padding: 10px;
  }

  .feedback-message {
    font-size: 12px;
  }

  .modal-body {
    padding: 12px;
  }

  .modal-header {
    padding: 12px 12px 8px;
  }

  .modal-header h3 {
    font-size: 14px;
  }

  .user-details h4 {
    font-size: 13px;
  }

  .feedback-text {
    font-size: 12px;
  }
}

/* Samsung Galaxy A55 specific optimizations (390px - 414px width) */
@media screen and (min-width: 390px) and (max-width: 414px) {
  .box-info {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .box-info li {
    padding: 8px;
    gap: 8px;
  }

  .box-info li .bx {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .box-info li .text h3 {
    font-size: 13px;
  }

  .box-info li .text p {
    font-size: 9px;
  }

  .feedback-card {
    padding: 8px;
  }

  .feedback-message {
    font-size: 11px;
    line-height: 1.4;
  }

  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .star-rating .bx {
    font-size: 12px;
  }

  .filter-btn,
  .refresh-btn {
    padding: 4px 8px;
    font-size: 10px;
  }

  .search-box input,
  .filter-select {
    padding: 6px 10px 6px 32px;
    font-size: 11px;
  }

  .modal-content {
    margin: 5px;
    border-radius: 12px;
  }

  .modal-header {
    padding: 10px;
  }

  .modal-body {
    padding: 10px;
  }

  .modal-header h3 {
    font-size: 13px;
  }

  .user-details h4 {
    font-size: 12px;
  }

  .feedback-text {
    font-size: 11px;
  }

  .reply-textarea {
    min-height: 60px;
    padding: 8px;
    font-size: 11px;
  }

  .send-reply-btn {
    padding: 8px 16px;
    font-size: 11px;
  }
}
</style>
