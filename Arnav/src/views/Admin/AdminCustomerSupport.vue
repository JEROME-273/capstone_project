<template>
  <AdminLayout @logout="logout">
    <template #nav>
      <div class="admin-nav-bar">
        <a href="#" class="nav-link">CUSTOMER SUPPORT</a>
      </div>
    </template>
    <div>
      <main>
        <!-- Support Statistics Cards -->
        <ul class="box-info">
          <li>
            <i class="bx bxs-message-detail"></i>
            <span class="text">
              <h3>{{ supportRequests.length }}</h3>
              <p>Total Requests</p>
            </span>
          </li>
          <li>
            <i class="bx bxs-message-dots"></i>
            <span class="text">
              <h3>{{ pendingCount }}</h3>
              <p>Pending</p>
            </span>
          </li>
          <li>
            <i class="bx bxs-message-check"></i>
            <span class="text">
              <h3>{{ resolvedCount }}</h3>
              <p>Resolved Today</p>
            </span>
          </li>
          <li>
            <i class="bx bxs-time"></i>
            <span class="text">
              <h3>{{ avgResponseTime }}</h3>
              <p>Avg Response</p>
            </span>
          </li>
        </ul>

        <!-- Support Requests Management -->
        <div class="table-data">
          <div class="order full-width">
            <div class="head">
              <h3>Support Requests</h3>
              <div class="header-actions">
                <button class="filter-btn" @click="showFilters = !showFilters">
                  <i class="bx bx-filter"></i>
                </button>
                <button class="refresh-btn" @click="fetchSupportRequests">
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
                <select v-model="statusFilter" class="filter-select">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select v-model="sortBy" class="filter-select">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            <!-- Support Requests List -->
            <div class="requests-container">
              <div v-if="filteredRequests.length === 0" class="empty-state">
                <i class="bx bx-support"></i>
                <h4>No support requests found</h4>
                <p v-if="searchQuery || statusFilter !== 'all'">
                  Try adjusting your filters to see more results.
                </p>
                <p v-else>
                  All caught up! No pending support requests at the moment.
                </p>
              </div>

              <div v-else class="requests-list">
                <div
                  v-for="req in filteredRequests"
                  :key="req.id"
                  class="request-card">
                  <div class="request-header">
                    <div class="request-user">
                      <div class="user-avatar">
                        <i class="bx bx-user"></i>
                      </div>
                      <div class="user-info">
                        <h4 class="user-email">{{ req.email }}</h4>
                        <span class="request-time">{{
                          formatDate(req.createdAt)
                        }}</span>
                      </div>
                    </div>
                    <div class="request-meta">
                      <span
                        class="status-badge"
                        :class="req.status || 'pending'">
                        {{ (req.status || "pending").toUpperCase() }}
                      </span>
                      <div class="priority-indicator" :class="getPriority(req)">
                        <i class="bx bx-flag"></i>
                      </div>
                    </div>
                  </div>

                  <div class="request-content">
                    <p class="request-message">{{ req.message }}</p>
                    <div v-if="req.subject" class="request-subject">
                      <strong>Subject:</strong> {{ req.subject }}
                    </div>
                  </div>

                  <div class="request-actions">
                    <button
                      class="action-btn reply"
                      @click="replyToRequest(req)"
                      title="Reply">
                      <i class="bx bx-reply"></i>
                      Reply
                    </button>
                    <button
                      v-if="req.status !== 'resolved'"
                      class="action-btn resolve"
                      @click="markAsResolved(req)"
                      title="Mark as Resolved">
                      <i class="bx bx-check"></i>
                      Resolve
                    </button>
                    <button
                      class="action-btn delete"
                      @click="deleteRequest(req)"
                      title="Delete">
                      <i class="bx bx-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reply Modal -->
        <div
          v-if="showReplyModal"
          class="modal-overlay"
          @click="closeReplyModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Reply to Support Request</h3>
              <button class="close-btn" @click="closeReplyModal">
                <i class="bx bx-x"></i>
              </button>
            </div>

            <div class="modal-body">
              <div class="request-info">
                <div class="info-item">
                  <strong>From:</strong> {{ selectedRequest?.email }}
                </div>
                <div class="info-item">
                  <strong>Date:</strong>
                  {{ formatDate(selectedRequest?.createdAt) }}
                </div>
                <div class="info-item">
                  <strong>Message:</strong>
                  <div class="original-message">
                    {{ selectedRequest?.message }}
                  </div>
                </div>
              </div>

              <div class="reply-section">
                <label for="replyText" class="reply-label">Your Reply:</label>
                <textarea
                  id="replyText"
                  v-model="replyText"
                  class="reply-textarea"
                  placeholder="Type your reply here..."
                  rows="6"></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeReplyModal">
                Cancel
              </button>
              <button
                class="btn btn-primary"
                @click="sendReply"
                :disabled="isReplying || !replyText.trim()">
                <i v-if="isReplying" class="bx bx-loader-alt bx-spin"></i>
                <i v-else class="bx bx-send"></i>
                {{ isReplying ? "Sending..." : "Send Reply" }}
              </button>
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
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import emailjs from "@emailjs/browser";
import { useToast } from "vue-toastification";
import AdminLayout from "./AdminLayout.vue";

export default {
  name: "AdminCustomerSupport",
  components: { AdminLayout },
  setup() {
    // Initialize toast
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      supportRequests: [],
      searchQuery: "",
      statusFilter: "all",
      sortBy: "newest",
      showFilters: false,
      resolvedToday: 0,
      selectedRequest: null,
      replyText: "",
      isReplying: false,
      showReplyModal: false,
    };
  },
  computed: {
    filteredRequests() {
      let filtered = [...this.supportRequests];

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (req) =>
            req.email.toLowerCase().includes(query) ||
            req.message.toLowerCase().includes(query) ||
            (req.subject && req.subject.toLowerCase().includes(query))
        );
      }

      // Filter by status
      if (this.statusFilter !== "all") {
        filtered = filtered.filter(
          (req) => (req.status || "pending") === this.statusFilter
        );
      }

      // Sort
      filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);

        if (this.sortBy === "newest") {
          return dateB - dateA;
        } else {
          return dateA - dateB;
        }
      });

      return filtered;
    },

    pendingCount() {
      return this.supportRequests.filter(
        (req) => (req.status || "pending") === "pending"
      ).length;
    },

    resolvedCount() {
      return this.resolvedToday;
    },

    avgResponseTime() {
      // Mock data for now - in real app, calculate from resolved requests
      return "2.4h";
    },
  },
  async mounted() {
    await this.fetchSupportRequests();
  },
  methods: {
    async fetchSupportRequests() {
      try {
        const db = getFirestore();
        const q = collection(db, "support_requests");
        const querySnapshot = await getDocs(q);

        this.supportRequests = [];
        querySnapshot.forEach((doc) => {
          this.supportRequests.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate
              ? doc.data().createdAt.toDate()
              : null,
          });
        });

        // Calculate resolved today count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.resolvedToday = this.supportRequests.filter(
          (req) =>
            req.status === "resolved" &&
            req.resolvedAt &&
            new Date(req.resolvedAt) >= today
        ).length;
      } catch (error) {
        console.error("Error fetching support requests:", error);
      }
    },

    getPriority(request) {
      // Determine priority based on keywords or time
      const message = request.message.toLowerCase();
      const urgentKeywords = [
        "urgent",
        "emergency",
        "critical",
        "asap",
        "immediately",
      ];

      if (urgentKeywords.some((keyword) => message.includes(keyword))) {
        return "high";
      }

      // Check if request is old (more than 24 hours)
      const hoursSinceCreated =
        (Date.now() - new Date(request.createdAt)) / (1000 * 60 * 60);
      if (hoursSinceCreated > 24) {
        return "medium";
      }

      return "low";
    },

    replyToRequest(request) {
      this.selectedRequest = request;
      this.replyText = "";
      this.showReplyModal = true;
    },

    async sendReply() {
      if (!this.replyText.trim()) {
        this.toast.warning("Please enter a reply message");
        return;
      }

      this.isReplying = true;

      try {
        // Save admin reply to Firestore
        const db = getFirestore();
        await addDoc(collection(db, "admin_replies"), {
          supportRequestId: this.selectedRequest.id,
          replyText: this.replyText.trim(),
          repliedAt: serverTimestamp(),
          repliedBy: "admin", // In real app, use current admin's ID
          type: "support_request",
        });

        // Send email to user
        await this.sendEmailToUser();

        // Mark request as resolved
        await updateDoc(doc(db, "support_requests", this.selectedRequest.id), {
          status: "resolved",
          resolvedAt: new Date(),
          resolvedBy: "admin",
        });

        // Refresh requests
        await this.fetchSupportRequests();

        this.replyText = "";

        // Close modal first, then show success toast
        this.closeReplyModal();

        // Show success toast with recipient email
        setTimeout(() => {
          this.toast.success(
            `Support reply sent successfully! Email delivered to ${this.selectedRequest.email}`
          );
        }, 100);
      } catch (error) {
        console.error("Error sending reply:", error);
        this.toast.error("Error sending reply: " + error.message);
      } finally {
        this.isReplying = false;
      }
    },

    async sendEmailToUser() {
      /**
       * EmailJS Integration for Support Request Replies
       * Uses a dedicated support template (different from feedback)
       */
      try {
        // Get Firestore instance
        const db = getFirestore();

        // Create email content
        const subject = `FarmGuide Support: Reply to Your Request`;
        const userFirstName = this.selectedRequest.email.split("@")[0];

        const emailBody = `
Dear ${userFirstName},

Thank you for contacting FarmGuide Support. We have reviewed your request and here is our response:

Your Original Message:
"${this.selectedRequest.message}"

Our Response:
${this.replyText.trim()}

We hope this addresses your concerns. If you have any further questions, please don't hesitate to contact us.

Best regards,
FarmGuide Support Team
arnavigation25@gmail.com
        `.trim();

        // Initialize EmailJS
        emailjs.init("_wqlThEYfyqQWfWu7"); // Your public key

        // Validate required fields
        if (
          !this.selectedRequest.email ||
          this.selectedRequest.email.trim() === ""
        ) {
          throw new Error("Recipient email is missing or empty");
        }

        // Prepare template parameters for Support Email (different from feedback)
        const templateParams = {
          // Primary recipient fields
          to_email: this.selectedRequest.email.trim(),
          to_name: userFirstName || "User",

          // Alternative recipient field names
          email: this.selectedRequest.email.trim(),
          user_email: this.selectedRequest.email.trim(),
          recipient_email: this.selectedRequest.email.trim(),

          // Name variations
          name: userFirstName || "User",
          user_name: userFirstName || "User",
          recipient_name: userFirstName || "User",

          // Sender information
          from_name: "FarmGuide Support Team",
          reply_to: "arnavigation25@gmail.com",

          // Subject variations
          subject: subject,
          email_subject: subject,

          // Support-specific content (NO RATING for support requests)
          user_message: this.selectedRequest.message || "",
          original_message: this.selectedRequest.message || "",
          support_reply: this.replyText.trim() || "",
          admin_response: this.replyText.trim() || "",

          // Full message content
          message: emailBody,
          email_body: emailBody,

          // Additional info
          request_id: this.selectedRequest.id || "",
          reply_date: new Date().toLocaleDateString(),
          request_type: "Support Request",
        };

        console.log("Sending support reply email via EmailJS...");

        // Send email using EmailJS - using existing auto reply template
        const response = await emailjs.send(
          "service_txhch6f", // Your service ID
          "template_btldizb", // Auto Reply template
          templateParams
        );

        console.log("Support reply email sent successfully:", response);

        // Update the admin reply status to include email status
        await addDoc(collection(db, "admin_replies"), {
          supportRequestId: this.selectedRequest.id,
          emailStatus: "sent",
          emailSentAt: serverTimestamp(),
          emailjsResponse: response.text,
        });
      } catch (error) {
        console.error("Error sending support reply email:", error);

        // Provide more specific error information
        let errorMessage = "Failed to send email";
        if (error.message && error.message.includes("recipients address")) {
          errorMessage =
            "Email template configuration error: Check EmailJS template";
        } else if (error.message) {
          errorMessage = `Email error: ${error.message}`;
        }

        this.toast.error(errorMessage);
        throw new Error(`Failed to send email: ${error.message}`);
      }
    },

    closeReplyModal() {
      this.showReplyModal = false;
      this.replyText = "";
      this.selectedRequest = null;
    },

    async markAsResolved(request) {
      if (confirm(`Mark request from ${request.email} as resolved?`)) {
        try {
          const db = getFirestore();
          await updateDoc(doc(db, "support_requests", request.id), {
            status: "resolved",
            resolvedAt: new Date(),
            resolvedBy: "admin", // In real app, use current admin's ID
          });

          await this.fetchSupportRequests();
          this.toast.success("Request marked as resolved!");
        } catch (error) {
          console.error("Error marking as resolved:", error);
          this.toast.error("Error marking request as resolved");
        }
      }
    },

    async deleteRequest(request, showConfirm = true) {
      if (
        showConfirm &&
        !confirm(
          `Delete request from ${request.email}? This action cannot be undone.`
        )
      ) {
        return;
      }

      try {
        const db = getFirestore();
        await deleteDoc(doc(db, "support_requests", request.id));
        await this.fetchSupportRequests();

        if (showConfirm) {
          this.toast.success("Request deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting request:", error);
        this.toast.error("Error deleting request");
      }
    },

    formatDate(date) {
      if (!date) return "N/A";
      const now = new Date();
      const requestDate = new Date(date);
      const diffInHours = (now - requestDate) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
      } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      } else {
        return requestDate.toLocaleDateString("en-US", {
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

/* Use consistent variable names from AdminLayout */
main {
  background: var(--bg-primary);
  padding: 16px; /* Reduced from default for mobile-first approach */
}

/* Mobile-first optimizations */
* {
  box-sizing: border-box;
}

/* Prevent text selection on interactive elements for better mobile UX */
button,
.nav-link {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  touch-action: manipulation;
}

/* Admin Navigation Bar */
.admin-nav-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.admin-nav-bar .nav-link {
  font-size: 20px; /* Reduced for mobile-first */
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  white-space: nowrap;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.admin-nav-bar .nav-link:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

/* Additional colors not in AdminLayout */
:root {
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}

.admin-layout.dark-mode {
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.box-info li:nth-child(3) .bx {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.box-info li:nth-child(4) .bx {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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
  background: var(--bg-primary);
  border-color: var(--primary-color);
}

/* Filters Section */
.filters-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-primary);
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

/* Support Requests */
.requests-container {
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

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  background: var(--card-bg);
  transition: all 0.2s ease;
}

.request-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.request-user {
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
  font-size: 18px;
}

.user-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.request-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.request-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.resolved {
  background: #d1fae5;
  color: #047857;
}

.priority-indicator {
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
}

.priority-indicator.high {
  background: #fee2e2;
  color: #dc2626;
}

.priority-indicator.medium {
  background: #fef3c7;
  color: #d97706;
}

.priority-indicator.low {
  background: #e5e7eb;
  color: var(--text-secondary);
}

.request-content {
  margin-bottom: 16px;
}

.request-message {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.request-subject {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 8px 12px;
  background: var(--bg-color);
  border-radius: 6px;
}

.request-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn.reply {
  background: var(--primary-color);
  color: white;
}

.action-btn.reply:hover {
  background: var(--primary-hover);
}

.action-btn.resolve {
  background: var(--success-color);
  color: white;
}

.action-btn.resolve:hover {
  background: #059669;
}

.action-btn.delete {
  background: var(--danger-color);
  color: white;
}
.action-btn.delete:hover {
  background: #dc2626;
}

/* Reply Modal Styles */
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
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px 24px;
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
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.request-info {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-item {
  margin-bottom: 12px;
  font-size: 14px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item strong {
  color: var(--text-primary);
  font-weight: 600;
}

.original-message {
  margin-top: 8px;
  padding: 12px;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-style: italic;
  color: var(--text-secondary);
}

.reply-section {
  margin-bottom: 24px;
}

.reply-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.reply-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
}

.reply-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px 24px;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--card-bg);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.bx-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Comprehensive Responsive Design for All Screen Sizes */

/* Large Desktop (1200px and up) */
@media (min-width: 1200px) {
  main {
    padding: 24px;
  }

  .box-info {
    grid-template-columns: repeat(4, 1fr);
  }

  .admin-nav-bar .nav-link {
    font-size: 24px;
  }
}

/* Medium Desktop (992px to 1199px) */
@media (max-width: 1199px) and (min-width: 992px) {
  .admin-nav-bar .nav-link {
    font-size: 22px;
  }

  .box-info {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablet (768px to 991px) */
@media (max-width: 991px) and (min-width: 768px) {
  main {
    padding: 16px;
  }

  .admin-nav-bar .nav-link {
    font-size: 20px;
  }

  .box-info {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .box-info li {
    padding: 20px;
  }

  .box-info li .text h3 {
    font-size: 20px;
  }

  .table-data {
    flex-direction: column;
  }

  .table-data .head h3 {
    font-size: 18px;
  }
}

/* Mobile Large (480px to 767px) */
@media (max-width: 767px) and (min-width: 480px) {
  main {
    padding: 12px;
  }

  .admin-nav-bar .nav-link {
    font-size: 18px;
  }

  .box-info {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .box-info li {
    padding: 16px;
    gap: 16px;
  }

  .box-info li .bx {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }

  .box-info li .text h3 {
    font-size: 18px;
  }

  .box-info li .text p {
    font-size: 13px;
  }

  .table-data {
    flex-direction: column;
    gap: 16px;
  }

  .table-data .order {
    padding: 16px;
  }

  .table-data .head h3 {
    font-size: 16px;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-box {
    min-width: auto;
  }

  .filter-select {
    min-width: auto;
  }

  .request-header {
    flex-direction: column;
    gap: 12px;
  }

  .request-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .modal-content {
    margin: 16px;
    max-width: calc(100% - 32px);
  }
}

/* Mobile Small (320px to 479px) */
@media (max-width: 479px) {
  main {
    padding: 8px;
  }

  .admin-nav-bar .nav-link {
    font-size: 16px;
    padding: 6px 12px;
  }

  .box-info {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }

  .box-info li {
    padding: 12px;
    gap: 12px;
    border-radius: 12px;
  }

  .box-info li .bx {
    width: 50px;
    height: 50px;
    font-size: 24px;
    border-radius: 8px;
  }

  .box-info li .text h3 {
    font-size: 16px;
  }

  .box-info li .text p {
    font-size: 12px;
  }

  .table-data {
    flex-direction: column;
    gap: 12px;
  }

  .table-data .order {
    padding: 12px;
    border-radius: 12px;
  }

  .table-data .head {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .table-data .head h3 {
    font-size: 14px;
  }

  .header-actions {
    gap: 6px;
  }

  .filter-btn,
  .refresh-btn {
    padding: 6px 8px;
    font-size: 14px;
  }

  .filters-section {
    padding: 12px;
    margin-bottom: 16px;
  }

  .filter-row {
    flex-direction: column;
    gap: 8px;
  }

  .search-box input {
    padding: 8px 12px 8px 32px;
    font-size: 13px;
  }

  .filter-select {
    padding: 8px 12px;
    font-size: 13px;
  }

  .request-card {
    padding: 12px;
    border-radius: 8px;
  }

  .request-header {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .user-info h4 {
    font-size: 14px;
  }

  .request-time {
    font-size: 11px;
  }

  .status-badge {
    padding: 2px 8px;
    font-size: 10px;
  }

  .priority-indicator {
    padding: 2px;
    font-size: 10px;
  }

  .request-message {
    font-size: 13px;
    margin-bottom: 8px;
  }

  .request-subject {
    font-size: 11px;
    padding: 6px 8px;
  }

  .request-actions {
    justify-content: center;
    flex-wrap: wrap;
    gap: 6px;
  }

  .action-btn {
    padding: 5px 10px;
    font-size: 11px;
    flex: 1;
    min-width: 70px;
    justify-content: center;
  }

  .empty-state {
    padding: 32px 16px;
  }

  .empty-state i {
    font-size: 36px;
  }

  .empty-state h4 {
    font-size: 16px;
  }

  .empty-state p {
    font-size: 13px;
  }

  .modal-overlay {
    padding: 8px;
  }

  .modal-content {
    margin: 0;
    max-width: 100%;
    border-radius: 12px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-header h3 {
    font-size: 16px;
  }

  .close-btn {
    font-size: 20px;
  }

  .modal-body {
    padding: 16px;
  }

  .request-info {
    padding: 12px;
    margin-bottom: 16px;
  }

  .info-item {
    font-size: 12px;
    margin-bottom: 8px;
  }

  .original-message {
    padding: 8px;
    font-size: 12px;
  }

  .reply-label {
    font-size: 12px;
  }

  .reply-textarea {
    padding: 8px;
    font-size: 13px;
    min-height: 100px;
  }

  .modal-footer {
    padding: 12px 16px;
  }

  .btn {
    padding: 8px 14px;
    font-size: 12px;
  }
}

/* Samsung Galaxy A55 and similar devices (390px to 414px) */
@media (max-width: 414px) and (min-width: 390px) {
  main {
    padding: 6px;
  }

  .admin-nav-bar .nav-link {
    font-size: 14px;
    padding: 4px 8px;
    text-align: center;
    width: 100%;
  }

  .box-info {
    gap: 8px;
    margin-bottom: 16px;
  }

  .box-info li {
    padding: 10px;
    gap: 10px;
  }

  .box-info li .bx {
    width: 45px;
    height: 45px;
    font-size: 20px;
  }

  .box-info li .text h3 {
    font-size: 14px;
  }

  .box-info li .text p {
    font-size: 11px;
  }

  .table-data .order {
    padding: 10px;
  }

  .table-data .head h3 {
    font-size: 12px;
  }

  .request-card {
    padding: 10px;
  }

  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .user-info h4 {
    font-size: 12px;
  }

  .request-message {
    font-size: 12px;
  }

  .action-btn {
    padding: 4px 8px;
    font-size: 10px;
  }
}

/* Very Small Mobile (300px to 389px) */
@media (max-width: 389px) {
  main {
    padding: 4px;
  }

  .admin-nav-bar .nav-link {
    font-size: 12px;
    padding: 2px 6px;
  }

  .box-info li {
    padding: 8px;
  }

  .box-info li .bx {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .box-info li .text h3 {
    font-size: 12px;
  }

  .box-info li .text p {
    font-size: 10px;
  }

  .table-data .order {
    padding: 8px;
  }

  .request-card {
    padding: 8px;
  }
}

/* Landscape orientation for mobile */
@media (max-height: 500px) and (orientation: landscape) {
  main {
    padding: 8px;
  }

  .box-info {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .box-info li {
    padding: 8px;
  }

  .modal-content {
    max-height: 95vh;
  }
}
</style>
