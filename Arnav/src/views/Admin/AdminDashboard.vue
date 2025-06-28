<template>
  <AdminLayout @logout="logout">
    <template #nav>
      <div class="admin-nav-bar">
        <a href="#" class="nav-link">Dashboard Overview</a>
      </div>
    </template>
    <div>
      <main>
        <div class="head-title">
          <button class="download-report-btn" @click="downloadReport">
            <i class="bx bx-download"></i>
            Download Report
          </button>
        </div>

        <ul class="box-info">
          <li>
            <i class="bx bxs-user"></i>
            <span class="text">
              <h3>{{ totalUsers }}</h3>
              <p>Total Users</p>
            </span>
          </li>
          <li>
            <i class="bx bxs-group"></i>
            <span class="text">
              <h3>{{ visitStats.Visitor }}</h3>
              <p>Visitors</p>
            </span>
          </li>
          <li>
            <i class="bx bxs-flask"></i>
            <span class="text">
              <h3>{{ visitStats.Research }}</h3>
              <p>Researchers</p>
            </span>
          </li>
          <li>
            <i class="bx bxs-briefcase"></i>
            <span class="text">
              <h3>{{ visitStats.Business }}</h3>
              <p>Business</p>
            </span>
          </li>
        </ul>

        <div class="table-data">
          <div class="order">
            <div class="head">
              <h3>Visit Type Distribution</h3>
              <i class="bx bx-filter"></i>
            </div>
            <div class="chart-container">
              <Bar
                v-if="chartData"
                :data="chartData"
                :options="chartOptions"
                @chart:render="handleChartRender" />
            </div>
          </div>
          <div class="order">
            <div class="head">
              <h3>Recent Activity</h3>
              <i class="bx bx-filter"></i>
            </div>
            <div class="recent-activity">
              <div v-if="recentUsers.length > 0" class="activity-list">
                <div
                  v-for="user in recentUsers"
                  :key="user.id"
                  class="activity-item">
                  <div class="activity-icon">
                    <i class="bx bx-user-plus"></i>
                  </div>
                  <div class="activity-details">
                    <p class="activity-name">
                      {{ user.firstName }} {{ user.lastName }}
                    </p>
                    <p class="activity-type">{{ user.typeofvisit }}</p>
                    <p class="activity-time">
                      {{ formatDate(user.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="no-activity">
                <p>No recent activity</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeSection === 'user-management'" class="section-content">
          <div class="section-header">
            <div class="header-actions">
              <button class="secondary-btn" @click="exportUserData">
                <i class="bx bx-export"></i> Export Data
              </button>
              <button class="primary-btn" @click="showAddUserModal = true">
                <i class="bx bx-user-plus"></i> Add User
              </button>
            </div>
          </div>

          <div class="content-card">
            <div class="user-filters">
              <div class="filter-group">
                <select v-model="userFilter" class="filter-select">
                  <option value="all">All Users</option>
                  <option value="Visitor">Visitors</option>
                  <option value="Research">Researchers</option>
                  <option value="Business">Business</option>
                </select>
                <select v-model="statusFilter" class="filter-select">
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>

            <div class="table-container">
              <table class="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Gender</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.uid">
                    <td>
                      <div class="user-info">
                        <div class="user-avatar">
                          {{ user.firstName.charAt(0)
                          }}{{ user.lastName.charAt(0) }}
                        </div>
                        <span>{{ user.firstName }} {{ user.lastName }}</span>
                      </div>
                    </td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="user.typeofvisit.toLowerCase()">
                        {{ user.typeofvisit }}
                      </span>
                    </td>
                    <td>{{ user.gender }}</td>
                    <td>
                      <span
                        class="status-indicator"
                        :class="{ verified: user.emailVerified }">
                        {{ user.emailVerified ? "Verified" : "Unverified" }}
                      </span>
                    </td>
                    <td>{{ formatDate(user.createdAt) }}</td>
                    <td>
                      <div class="action-buttons">
                        <button class="icon-btn" @click="editUser(user)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button
                          class="icon-btn"
                          @click="toggleUserStatus(user)">
                          <i
                            class="bx"
                            :class="
                              user.emailVerified ? 'bx-lock' : 'bx-lock-open'
                            "></i>
                        </button>
                        <button
                          class="icon-btn delete"
                          @click="deleteUser(user)">
                          <i class="bx bx-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="pagination">
              <button
                class="pagination-btn"
                :disabled="currentPage === 1"
                @click="prevPage">
                <i class="bx bx-chevron-left"></i>
              </button>
              <span class="pagination-info"
                >Page {{ currentPage }} of {{ totalPages }}</span
              >
              <button
                class="pagination-btn"
                :disabled="currentPage === totalPages"
                @click="nextPage">
                <i class="bx bx-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Add/Edit User Modal -->
        <div v-if="showAddUserModal" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3>{{ editingUser ? "Edit User" : "Add New User" }}</h3>
              <button class="close-modal" @click="closeModal">
                <i class="bx bx-x"></i>
              </button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveUser" class="user-form">
                <div class="form-grid">
                  <div class="form-group">
                    <label>First Name</label>
                    <input v-model="userForm.firstName" type="text" required />
                  </div>
                  <div class="form-group">
                    <label>Last Name</label>
                    <input v-model="userForm.lastName" type="text" required />
                  </div>
                </div>
                <div class="form-group">
                  <label>Middle Name</label>
                  <input v-model="userForm.middleName" type="text" />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input v-model="userForm.email" type="email" required />
                </div>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Gender</label>
                    <select v-model="userForm.gender" required>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Type of Visit</label>
                    <select v-model="userForm.typeofvisit" required>
                      <option value="Visitor">Visitor</option>
                      <option value="Research">Research</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                </div>
                <div class="form-group" v-if="!editingUser">
                  <label>Password</label>
                  <input v-model="userForm.password" type="password" required />
                </div>
                <div class="modal-footer">
                  <button type="button" class="cancel-btn" @click="closeModal">
                    Cancel
                  </button>
                  <button type="submit" class="save-btn">Save User</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Customer Support Section -->
        <!-- Feedback Section -->
      </main>
    </div>
  </AdminLayout>
</template>

<script>
import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  where,
  startAfter,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  createUserWithEmailAndPassword,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import AdminLayout from "./AdminLayout.vue";
import { ref, onMounted } from "vue";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default {
  name: "AdminDashboard",
  components: { AdminLayout, Bar },
  setup() {
    // Store the chart instance in a ref instead of the component
    const chartInstance = ref(null);

    return { chartInstance };
  },
  data() {
    return {
      // Your existing data properties
      adminName: "",
      totalUsers: 0,
      visitStats: {
        Visitor: 0,
        Research: 0,
        Business: 0,
      },
      recentUsers: [],
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#1e293b",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "#334155",
            borderWidth: 1,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#64748b",
              font: {
                size: 12,
                weight: "500",
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "#f1f5f9",
              drawBorder: false,
            },
            ticks: {
              precision: 0,
              color: "#64748b",
              font: {
                size: 12,
              },
            },
          },
        },
      },
      darkMode: false,
      sidebarOpen: true,
      userFilter: "all",
      statusFilter: "all",
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,
      users: [],
      showAddUserModal: false,
      editingUser: null,
      userForm: {
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        gender: "",
        typeofvisit: "",
        password: "",
      },
      activeSection: "dashboard",
    };
  },

  methods: {
    // Add this new method to handle the chart render event
    handleChartRender(chart) {
      // Store the chart instance when it's rendered
      this.chartInstance = chart;
      console.log("Chart instance:", chart);
    },

    // Your existing methods remain the same
    async logout() {
      const auth = getAuth();
      try {
        await signOut(auth);
        localStorage.removeItem("user");
        this.$router.push("/register");
      } catch (error) {
        console.error("Error signing out:", error);
      }
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
      const sidebar = document.getElementById("sidebar");
      const content = document.getElementById("content");

      if (this.sidebarOpen) {
        sidebar.classList.remove("close");
        content.classList.remove("close");
      } else {
        sidebar.classList.add("close");
        content.classList.add("close");
      }
    },

    async fetchVisitStats() {
      const db = getFirestore();
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));

        // Reset stats
        this.visitStats = {
          Visitor: 0,
          Research: 0,
          Business: 0,
        };

        // Count visit types and total users
        this.totalUsers = 0;
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          this.totalUsers++;
          if (
            userData.typeofvisit &&
            this.visitStats.hasOwnProperty(userData.typeofvisit)
          ) {
            this.visitStats[userData.typeofvisit]++;
          }
        });

        // Prepare chart data
        this.chartData = {
          labels: Object.keys(this.visitStats),
          datasets: [
            {
              label: "Number of Users",
              data: Object.values(this.visitStats),
              backgroundColor: ["#60a5fa", "#fbbf24", "#34d399"],
              borderColor: ["#3b82f6", "#f59e0b", "#10b981"],
              borderWidth: 0,
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        };

        console.log("Visit stats:", this.visitStats);
        console.log("Chart data:", this.chartData);
      } catch (error) {
        console.error("Error fetching visit statistics:", error);
      }
    },

    async fetchRecentUsers() {
      const db = getFirestore();
      try {
        const q = query(
          collection(db, "users"),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const querySnapshot = await getDocs(q);
        this.recentUsers = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          this.recentUsers.push({
            id: doc.id,
            ...userData,
            createdAt: userData.createdAt?.toDate() || new Date(),
          });
        });
      } catch (error) {
        console.error("Error fetching recent users:", error);
      }
    },

    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    async fetchUsers() {
      const db = getFirestore();
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(q);
        this.users = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          this.users.push({
            uid: doc.id,
            ...userData,
            createdAt: userData.createdAt?.toDate() || new Date(),
          });
        });

        this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },

    async saveUser() {
      const db = getFirestore();
      const auth = getAuth();

      try {
        if (this.editingUser) {
          // Update existing user
          const userRef = doc(db, "users", this.editingUser.uid);
          await updateDoc(userRef, {
            firstName: this.userForm.firstName,
            lastName: this.userForm.lastName,
            middleName: this.userForm.middleName,
            email: this.userForm.email,
            gender: this.userForm.gender,
            typeofvisit: this.userForm.typeofvisit,
          });

          // Update email if changed
          if (this.userForm.email !== this.editingUser.email) {
            await updateEmail(auth.currentUser, this.userForm.email);
          }
        } else {
          // Create new user
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            this.userForm.email,
            this.userForm.password
          );

          await setDoc(doc(db, "users", userCredential.user.uid), {
            firstName: this.userForm.firstName,
            lastName: this.userForm.lastName,
            middleName: this.userForm.middleName,
            email: this.userForm.email,
            gender: this.userForm.gender,
            typeofvisit: this.userForm.typeofvisit,
            role: "user",
            emailVerified: false,
            createdAt: new Date(),
          });
        }

        this.closeModal();
        this.fetchUsers();
      } catch (error) {
        console.error("Error saving user:", error);
      }
    },

    editUser(user) {
      this.editingUser = user;
      this.userForm = { ...user };
      this.showAddUserModal = true;
    },

    async deleteUser(user) {
      if (
        confirm(
          `Are you sure you want to delete ${user.firstName} ${user.lastName}?`
        )
      ) {
        const db = getFirestore();
        try {
          await deleteDoc(doc(db, "users", user.uid));
          this.fetchUsers();
        } catch (error) {
          console.error("Error deleting user:", error);
        }
      }
    },

    async toggleUserStatus(user) {
      const db = getFirestore();
      try {
        await updateDoc(doc(db, "users", user.uid), {
          emailVerified: !user.emailVerified,
        });
        this.fetchUsers();
      } catch (error) {
        console.error("Error toggling user status:", error);
      }
    },

    closeModal() {
      this.showAddUserModal = false;
      this.editingUser = null;
      this.userForm = {
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        gender: "",
        typeofvisit: "",
        password: "",
      };
    },

    exportUserData() {
      const data = this.users.map((user) => ({
        Name: `${user.firstName} ${user.lastName}`,
        Email: user.email,
        Type: user.typeofvisit,
        Gender: user.gender,
        Status: user.emailVerified ? "Verified" : "Unverified",
        "Created At": this.formatDate(user.createdAt),
      }));

      const csv = this.convertToCSV(data);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.csv";
      a.click();
    },

    convertToCSV(arr) {
      const array = [Object.keys(arr[0])].concat(arr);
      return array
        .map((row) => {
          return Object.values(row)
            .map((value) => {
              return `"${value}"`;
            })
            .join(",");
        })
        .join("\n");
    },

    downloadReport() {
      const reportData = {
        totalUsers: this.totalUsers,
        visitStats: this.visitStats,
        generatedAt: new Date().toLocaleString(),
      };

      const csvData = [
        ["Metric", "Value"],
        ["Total Users", this.totalUsers],
        ["Visitors", this.visitStats.Visitor],
        ["Researchers", this.visitStats.Research],
        ["Business", this.visitStats.Business],
        ["Report Generated", new Date().toLocaleString()],
      ];

      const csv = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-dashboard-report-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
  },

  mounted() {
    this.fetchUsers();
    this.fetchVisitStats();
    this.fetchRecentUsers();
  },
};
</script>

<style scoped>
/* Main container styling */
main {
  background: var(--bg-primary);
  min-height: 100vh;
  padding: 20px;
}

.head-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  color: var(--text-primary);
  padding: 0;
}

.head-title .left h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-size: 14px;
}

.breadcrumb a {
  color: #64748b;
  text-decoration: none;
}

.download-report-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.4);
}

.download-report-btn:hover {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.box-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
  padding: 0;
}

.box-info li {
  padding: 24px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.box-info li:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Different background colors for each card */
.box-info li:nth-child(1) {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.admin-layout.dark-mode .box-info li:nth-child(1) {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
}

.box-info li:nth-child(2) {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
}

.admin-layout.dark-mode .box-info li:nth-child(2) {
  background: linear-gradient(135deg, #14532d 0%, #166534 100%);
}

.box-info li:nth-child(3) {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.admin-layout.dark-mode .box-info li:nth-child(3) {
  background: linear-gradient(135deg, #92400e 0%, #b45309 100%);
}

.box-info li:nth-child(4) {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
}

.admin-layout.dark-mode .box-info li:nth-child(4) {
  background: linear-gradient(135deg, #581c87 0%, #6b21a8 100%);
}

.box-info li i {
  font-size: 32px;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.box-info li:nth-child(1) i {
  background: #dbeafe;
  color: #3b82f6;
}

.box-info li:nth-child(2) i {
  background: #f0fdf4;
  color: #22c55e;
}

.box-info li:nth-child(3) i {
  background: #fef3c7;
  color: #f59e0b;
}

.box-info li:nth-child(4) i {
  background: #f3e8ff;
  color: #8b5cf6;
}

.box-info li .text h3 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.box-info li .text p {
  color: var(--text-secondary);
  font-weight: 500;
  margin: 0;
}

/* Specific text colors for each card */
.box-info li:nth-child(1) .text h3 {
  color: #1e40af;
}

.box-info li:nth-child(1) .text p {
  color: #3b82f6;
}

.admin-layout.dark-mode .box-info li:nth-child(1) .text h3,
.admin-layout.dark-mode .box-info li:nth-child(1) .text p {
  color: #dbeafe;
}

.box-info li:nth-child(2) .text h3 {
  color: #166534;
}

.box-info li:nth-child(2) .text p {
  color: #22c55e;
}

.admin-layout.dark-mode .box-info li:nth-child(2) .text h3,
.admin-layout.dark-mode .box-info li:nth-child(2) .text p {
  color: #dcfce7;
}

.box-info li:nth-child(3) .text h3 {
  color: #b45309;
}

.box-info li:nth-child(3) .text p {
  color: #f59e0b;
}

.admin-layout.dark-mode .box-info li:nth-child(3) .text h3,
.admin-layout.dark-mode .box-info li:nth-child(3) .text p {
  color: #fef3c7;
}

.box-info li:nth-child(4) .text h3 {
  color: #6b21a8;
}

.box-info li:nth-child(4) .text p {
  color: #8b5cf6;
}

.admin-layout.dark-mode .box-info li:nth-child(4) .text h3,
.admin-layout.dark-mode .box-info li:nth-child(4) .text p {
  color: #f3e8ff;
}

.table-data {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  margin-bottom: 32px;
  padding: 0;
}

.table-data .order {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  padding: 24px;
}

.table-data .head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.table-data .head h3 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.table-data .head i {
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 20px;
}

.chart-container {
  height: 300px;
}

.recent-activity {
  max-height: 300px;
  overflow-y: auto;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  border: 1px solid var(--border-color);
}

.activity-item:hover {
  background: var(--hover-bg);
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: var(--hover-bg);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.activity-details {
  flex: 1;
}

.activity-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  font-size: 14px;
}

.activity-type {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 2px;
}

.activity-time {
  color: var(--text-secondary);
  font-size: 12px;
}

.no-activity {
  text-align: center;
  color: var(--text-secondary);
  padding: 20px;
}

/* Admin Nav Bar Styles */
.admin-nav-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.admin-nav-bar .nav-link {
  font-size: 32px;
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

/* User Management Styles */
.section-content {
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 0 10px var(--shadow);
  padding: 20px;
  margin-bottom: 20px;
}

.section-header {
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.primary-btn,
.secondary-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.primary-btn {
  background: #4caf50;
  color: white;
}

.secondary-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.user-filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 20px;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.filter-select,
.search-input {
  padding: 8px;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-primary);
}

.table-container {
  overflow-x: auto;
  padding: 10px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
}

.users-table th {
  background: var(--table-header-bg);
  color: var(--text-primary);
}

.users-table td {
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.users-table tr:hover {
  background: var(--table-row-hover);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  font-weight: 600;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.badge.visitor {
  background: var(--badge-visitor);
  color: var(--badge-text-visitor);
}

.badge.research {
  background: var(--badge-research);
  color: var(--badge-text-research);
}

.badge.business {
  background: var(--badge-business);
  color: var(--badge-text-business);
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  background: #ffebee;
  color: #c62828;
}

.status-indicator.verified {
  background: #e8f5e9;
  color: #2e7d32;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.icon-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-btn:hover {
  background: var(--hover-bg);
}

.icon-btn.delete:hover {
  background: #ffebee;
  color: #c62828;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 10px;
}

.pagination-btn {
  padding: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--text-secondary);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--modal-bg);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: var(--text-primary);
}

.close-modal {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 24px;
}

.modal-body {
  padding: 20px;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: var(--text-primary);
}

.form-group input,
.form-group select {
  padding: 8px;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-primary);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .box-info {
    grid-template-columns: 1fr;
  }

  .table-data {
    grid-template-columns: 1fr;
  }

  .user-filters {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
