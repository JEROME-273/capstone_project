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
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import AdminLayout from "./AdminLayout.vue";

export default {
  name: "AdminCustomerSupport",
  components: { AdminLayout },
  data() {
    return {
      supportRequests: [],
      searchQuery: "",
      statusFilter: "all",
      sortBy: "newest",
      showFilters: false,
      resolvedToday: 0,
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
      // Create a more professional email template
      const subject = `Re: Support Request - ${
        request.subject || "General Inquiry"
      }`;
      const body = `Dear ${request.email.split("@")[0]},

Thank you for contacting FarmGuide Support. We have received your message regarding:

"${request.message}"

Our support team is reviewing your request and will respond with a detailed solution within 24 hours. 

If this is an urgent matter, please don't hesitate to contact us directly.

Best regards,
FarmGuide Support Team
support@farmguide.com`;

      const mailtoLink = `mailto:${request.email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
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
          this.showSuccessToast("Request marked as resolved!");
        } catch (error) {
          console.error("Error marking as resolved:", error);
          this.showErrorToast("Error marking request as resolved");
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
          this.showSuccessToast("Request deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting request:", error);
        this.showErrorToast("Error deleting request");
      }
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

  .request-header {
    flex-direction: column;
    gap: 12px;
  }

  .request-actions {
    justify-content: center;
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

  .request-card {
    padding: 16px;
  }
}
</style>
