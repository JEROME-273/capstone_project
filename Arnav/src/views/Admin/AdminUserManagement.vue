<template>
  <AdminLayout @logout="logout">
    <template #nav>
      <div class="admin-nav-bar">
        <a href="#" class="nav-link">USER MANAGEMENT</a>
      </div>
    </template>
    <div>
      <main>
        <!-- Search and Filters Card -->
        <div class="content-card">
          <div class="card-header">
            <h3>Search & Filters</h3>
            <div class="header-actions">
              <button
                class="primary-btn"
                @click="showAddUserForm = !showAddUserForm">
                <i class="bx bx-user-plus"></i> Add User
              </button>
            </div>
          </div>
          <div class="filters-section">
            <div class="search-box">
              <i class="bx bx-search"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search users..." />
            </div>
            <div class="filter-selects">
              <select v-model="userFilter">
                <option value="all">All Types</option>
                <option value="Visitor">Visitor</option>
                <option value="Research">Research</option>
                <option value="Business">Business</option>
              </select>
              <select v-model="statusFilter">
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Users Table Card -->
        <div class="content-card">
          <div class="card-header">
            <h3>User Management</h3>
            <div class="user-stats">
              <span class="stat-item">Total: {{ users.length }}</span>
              <span class="stat-item"
                >Verified:
                {{ users.filter((u) => u.emailVerified).length }}</span
              >
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
                  <th>Created</th>
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
                    <span class="badge" :class="user.typeofvisit.toLowerCase()">
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
                      <button
                        class="icon-btn"
                        @click="editUser(user)"
                        title="Edit">
                        <i class="bx bx-edit"></i>
                      </button>
                      <button
                        class="icon-btn"
                        @click="toggleUserStatus(user)"
                        title="Toggle Status">
                        <i
                          class="bx"
                          :class="
                            user.emailVerified ? 'bx-lock' : 'bx-lock-open'
                          "></i>
                      </button>
                      <button
                        class="icon-btn delete"
                        @click="deleteUser(user)"
                        title="Delete">
                        <i class="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Register New User Section -->
        <div v-if="showAddUserForm || editingUser" class="content-card">
          <div class="card-header">
            <h3>{{ editingUser ? "Edit User" : "Register New User" }}</h3>
            <p>
              {{
                editingUser
                  ? "Update user information"
                  : "Add a new user to the system"
              }}
            </p>
          </div>

          <form @submit.prevent="saveUser" class="register-form">
            <div class="form-row">
              <div class="form-group">
                <label>First Name</label>
                <input
                  v-model="userForm.firstName"
                  type="text"
                  placeholder="Enter first name"
                  required />
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input
                  v-model="userForm.lastName"
                  type="text"
                  placeholder="Enter last name"
                  required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Middle Name</label>
                <input
                  v-model="userForm.middleName"
                  type="text"
                  placeholder="Enter middle name (optional)" />
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  placeholder="Enter email address"
                  required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Gender</label>
                <select v-model="userForm.gender" required>
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div class="form-group">
                <label>Type of Visit</label>
                <select v-model="userForm.typeofvisit" required>
                  <option value="" disabled>Select Type of Visit</option>
                  <option value="Visitor">Visitor</option>
                  <option value="Research">Research</option>
                  <option value="Business">Business</option>
                </select>
              </div>
            </div>

            <div class="form-row" v-if="!editingUser">
              <div class="form-group">
                <label>Password</label>
                <input
                  v-model="userForm.password"
                  type="password"
                  placeholder="Enter password"
                  required />
              </div>
              <div class="form-group">
                <label>Role</label>
                <select v-model="userForm.role" required>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="save-btn" :disabled="isCreatingUser">
                {{
                  isCreatingUser
                    ? "Processing..."
                    : editingUser
                    ? "Update User"
                    : "Register User"
                }}
              </button>
              <button
                type="button"
                class="cancel-btn"
                v-if="editingUser"
                @click="cancelEdit">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </AdminLayout>
</template>

<script>
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateEmail,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import AdminLayout from "./AdminLayout.vue";

export default {
  name: "AdminUserManagement",
  components: { AdminLayout },
  data() {
    return {
      users: [],
      searchQuery: "",
      userFilter: "all",
      statusFilter: "all",
      editingUser: null,
      isCreatingUser: false,
      showAddUserForm: false,
      currentAdminUser: null, // Store current admin user
      userForm: {
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        gender: "",
        typeofvisit: "",
        password: "",
        role: "user",
      },
    };
  },
  computed: {
    filteredUsers() {
      let filtered = this.users;
      if (this.userFilter !== "all") {
        filtered = filtered.filter((u) => u.typeofvisit === this.userFilter);
      }
      if (this.statusFilter !== "all") {
        const isVerified = this.statusFilter === "verified";
        filtered = filtered.filter((u) => u.emailVerified === isVerified);
      }
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
      }
      return filtered;
    },
  },
  created() {
    // Store the current admin user info
    this.currentAdminUser = getAuth().currentUser;
  },
  methods: {
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
      } catch (e) {
        console.error("Error fetching users:", e);
      }
    },

    async saveUser() {
      const db = getFirestore();
      const auth = getAuth();

      this.isCreatingUser = true;

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
            role: this.userForm.role,
          });
          if (this.userForm.email !== this.editingUser.email) {
            await updateEmail(auth.currentUser, this.userForm.email);
          }
          alert("User updated successfully!");
        } else {
          // Create new user WITHOUT automatically signing them in
          console.log("Creating new user without auto-login...");

          // Store current admin credentials
          const currentUser = auth.currentUser;
          const adminEmail = currentUser.email;

          // Get admin password from localStorage or prompt (you might want to implement a better way)
          const adminPassword = prompt(
            "Please enter your admin password to continue creating the user:"
          );
          if (!adminPassword) {
            alert("Admin password required to create users.");
            return;
          }

          // Create the new user (this will sign them in automatically)
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            this.userForm.email,
            this.userForm.password
          );

          const newUserId = userCredential.user.uid;
          console.log("New user created with UID:", newUserId);

          // Save user data to Firestore - admin-created accounts are pre-verified
          const userData = {
            firstName: this.userForm.firstName,
            lastName: this.userForm.lastName,
            middleName: this.userForm.middleName,
            email: this.userForm.email,
            gender: this.userForm.gender,
            typeofvisit: this.userForm.typeofvisit,
            role: this.userForm.role,
            emailVerified: true, // Admin-created accounts are pre-verified
            createdAt: new Date(),
            createdBy: "admin",
            adminCreated: true,
          };

          await setDoc(doc(db, "users", newUserId), userData);
          console.log("User document saved successfully");

          // IMPORTANT: Sign out the newly created user and sign the admin back in
          await signOut(auth);
          console.log("Signed out new user");

          // Sign the admin back in
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          console.log("Admin signed back in");

          alert("User created successfully with verified email!");
        }

        this.resetForm();
        await this.fetchUsers();
      } catch (e) {
        console.error("Error saving user:", e);

        // Handle specific errors
        if (e.code === "auth/wrong-password") {
          alert("Incorrect admin password. User creation cancelled.");
        } else if (e.code === "auth/email-already-in-use") {
          alert("Email is already in use. Please use a different email.");
        } else {
          alert(
            `Error ${this.editingUser ? "updating" : "creating"} user: ${
              e.message
            }`
          );
        }

        // If there was an error during user creation, make sure admin is still signed in
        try {
          const currentUser = getAuth().currentUser;
          if (
            !currentUser ||
            currentUser.email !== this.currentAdminUser?.email
          ) {
            // Admin got logged out, try to restore session
            const adminData = JSON.parse(localStorage.getItem("user") || "{}");
            if (adminData.email) {
              console.log("Attempting to restore admin session...");
              // You might want to redirect to login or handle this differently
            }
          }
        } catch (restoreError) {
          console.error("Error restoring admin session:", restoreError);
        }
      } finally {
        this.isCreatingUser = false;
      }
    },

    editUser(user) {
      this.editingUser = user;
      this.showAddUserForm = true;
      this.userForm = { ...user, password: "" };
    },
    cancelEdit() {
      this.resetForm();
    },
    async deleteUser(user) {
      if (confirm(`Delete user ${user.firstName} ${user.lastName}?`)) {
        const db = getFirestore();
        try {
          await deleteDoc(doc(db, "users", user.uid));
          this.fetchUsers();
          alert("User deleted successfully!");
        } catch (e) {
          console.error("Error deleting user:", e);
          alert(`Error deleting user: ${e.message}`);
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
        alert(
          `User ${user.emailVerified ? "unverified" : "verified"} successfully!`
        );
      } catch (e) {
        console.error("Error toggling user status:", e);
        alert(`Error updating user status: ${e.message}`);
      }
    },
    resetForm() {
      this.editingUser = null;
      this.showAddUserForm = false;
      this.userForm = {
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        gender: "",
        typeofvisit: "",
        password: "",
        role: "user",
      };
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
    logout() {
      signOut(getAuth()).then(() => {
        localStorage.removeItem("user");
        this.$router.push("/register");
      });
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
main {
  padding: 32px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.head-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  color: var(--text-primary);
  padding: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-size: 14px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.breadcrumb a {
  color: var(--text-secondary);
  text-decoration: none;
}

.content-card {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
  overflow: hidden;
}

.card-header {
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-header p {
  color: var(--text-secondary);
  margin: 4px 0 0 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.primary-btn {
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
  font-size: 14px;
}

.primary-btn:hover {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.user-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.filters-section {
  padding: 24px 32px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 18px;
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-box input::placeholder {
  color: var(--text-secondary);
}

.filter-selects {
  display: flex;
  gap: 12px;
}

.filter-selects select {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 14px;
  min-width: 120px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.filter-selects select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: var(--table-header-bg);
  color: var(--text-secondary);
  padding: 16px 24px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-color);
}

.users-table td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 14px;
}

.users-table tr:hover {
  background: var(--table-row-hover);
}

.users-table tr:last-child td {
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.badge.visitor {
  background: #dbeafe;
  color: #3b82f6;
}

.badge.research {
  background: #f3e8ff;
  color: #8b5cf6;
}

.badge.business {
  background: #f0fdf4;
  color: #22c55e;
}

.admin-layout.dark-mode .badge.visitor {
  background: #1e3a8a;
  color: #93c5fd;
}

.admin-layout.dark-mode .badge.research {
  background: #581c87;
  color: #c4b5fd;
}

.admin-layout.dark-mode .badge.business {
  background: #14532d;
  color: #86efac;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  background: #fef2f2;
  color: #dc2626;
}

.status-indicator.verified {
  background: #f0fdf4;
  color: #16a34a;
}

.admin-layout.dark-mode .status-indicator {
  background: #450a0a;
  color: #fca5a5;
}

.admin-layout.dark-mode .status-indicator.verified {
  background: #052e16;
  color: #86efac;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 16px;
  background: var(--hover-bg);
  color: var(--text-secondary);
}

.icon-btn:hover {
  color: var(--text-primary);
  transform: translateY(-1px);
}

.icon-btn.delete {
  background: #fef2f2;
  color: #ef4444;
}

.icon-btn.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

.admin-layout.dark-mode .icon-btn.delete {
  background: #450a0a;
  color: #fca5a5;
}

.admin-layout.dark-mode .icon-btn.delete:hover {
  background: #7f1d1d;
  color: #fecaca;
}

.register-form {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input::placeholder {
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

.save-btn {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.4);
}

.save-btn:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  padding: 12px 24px;
  background: var(--input-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.cancel-btn:hover {
  background: var(--hover-bg);
}

.admin-nav-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.admin-nav-bar .nav-link {
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  margin-right: 20px;
  white-space: nowrap;
  font-size: 32px;
}

@media (max-width: 1024px) {
  main {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .search-box {
    max-width: none;
  }

  .card-header {
    padding: 20px 24px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .user-stats {
    width: 100%;
    justify-content: space-between;
  }

  .register-form {
    padding: 24px;
  }

  .users-table th,
  .users-table td {
    padding: 12px 16px;
  }
}

@media (max-width: 768px) {
  .head-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}
</style>
} .filter-selects { justify-content: flex-start; } } @media (max-width: 768px) {
.head-title { flex-direction: column; align-items: flex-start; gap: 16px; }
.users-table-section { overflow-x: auto; } .users-table { min-width: 800px; }
.register-section { padding: 24px; } }
