<template>
  <AdminLayout @logout="logout">
    <template #nav>
      <a href="#" class="nav-link">User Management</a>
    </template>
    <div>
      <div class="admin-user-management">
        <div class="aum-container">
          <!-- User List Section -->
          <div class="aum-users">
            <div class="aum-header">
              <h2>User Management</h2>
              <div class="aum-filters">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search users..." />
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
            <table class="aum-table">
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
                  <td>{{ user.firstName }} {{ user.lastName }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span
                      class="aum-badge"
                      :class="user.typeofvisit.toLowerCase()"
                      >{{ user.typeofvisit }}</span
                    >
                  </td>
                  <td>{{ user.gender }}</td>
                  <td>
                    <span
                      class="aum-status"
                      :class="{ verified: user.emailVerified }">
                      {{ user.emailVerified ? "Verified" : "Unverified" }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <button class="aum-action" @click="editUser(user)">
                      <i class="bx bx-edit"></i>
                    </button>
                    <button class="aum-action" @click="toggleUserStatus(user)">
                      <i
                        class="bx"
                        :class="
                          user.emailVerified ? 'bx-lock' : 'bx-lock-open'
                        "></i>
                    </button>
                    <button class="aum-action delete" @click="deleteUser(user)">
                      <i class="bx bx-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Registration/Edit Form Section -->
          <div class="aum-form-section">
            <h3>{{ editingUser ? "Edit User" : "Register New User" }}</h3>
            <form @submit.prevent="saveUser" class="aum-form">
              <div class="aum-form-row">
                <input
                  v-model="userForm.firstName"
                  type="text"
                  placeholder="First Name"
                  required />
                <input
                  v-model="userForm.lastName"
                  type="text"
                  placeholder="Last Name"
                  required />
              </div>
              <div class="aum-form-row">
                <input
                  v-model="userForm.middleName"
                  type="text"
                  placeholder="Middle Name" />
                <input
                  v-model="userForm.email"
                  type="email"
                  placeholder="Email"
                  required />
              </div>
              <div class="aum-form-row">
                <select v-model="userForm.gender" required>
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <select v-model="userForm.typeofvisit" required>
                  <option value="" disabled>Select Type of Visit</option>
                  <option value="Visitor">Visitor</option>
                  <option value="Research">Research</option>
                  <option value="Business">Business</option>
                </select>
                <select v-model="userForm.role" required>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="aum-form-row" v-if="!editingUser">
                <input
                  v-model="userForm.password"
                  type="password"
                  placeholder="Password"
                  required />
              </div>
              <div class="aum-form-actions">
                <button
                  type="submit"
                  class="aum-btn primary"
                  :disabled="isCreatingUser">
                  {{
                    isCreatingUser
                      ? "Creating..."
                      : editingUser
                      ? "Update User"
                      : "Register User"
                  }}
                </button>
                <button
                  type="button"
                  class="aum-btn"
                  v-if="editingUser"
                  @click="cancelEdit">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
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
:root {
  --bg-primary: #f8f9fa;
  --bg-secondary: #fff;
  --text-primary: #2c3e50;
  --text-secondary: #666;
  --hover-bg: #f0f2f5;
  --shadow: 0 4px 24px rgba(44, 62, 80, 0.1), 0 1.5px 6px rgba(44, 62, 80, 0.08);
  --card-bg: #f3f4f6;
  --border-color: #d0d0d0;
  --input-bg: #fff;
  --input-border: #ddd;
  --table-header-bg: #f8f9fa;
  --table-row-hover: #f5f5f5;
  --modal-bg: #fff;
  --modal-overlay: rgba(0, 0, 0, 0.5);
  --badge-visitor: #e3f2fd;
  --badge-research: #f3e5f5;
  --badge-business: #e8f5e9;
  --badge-text-visitor: #1976d2;
  --badge-text-research: #7b1fa2;
  --badge-text-business: #2e7d32;
}

.admin-user-management {
  padding: 20px;
  color: var(--text-primary);
}

.aum-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.aum-users {
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 0 10px var(--shadow);
  padding: 20px;
  border: 1.5px solid var(--border-color);
}

.aum-header {
  margin-bottom: 20px;
}

.aum-header h2 {
  color: var(--text-primary);
  margin-bottom: 15px;
}

.aum-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.aum-filters input,
.aum-filters select {
  padding: 8px;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-primary);
}

.aum-table {
  width: 100%;
  border-collapse: collapse;
  position: relative;
}

.aum-table th {
  background: var(--table-header-bg);
  color: var(--text-primary);
  padding: 12px;
  text-align: left;
  position: relative;
}

.aum-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  position: relative;
}

.aum-table tr:hover {
  background: var(--table-row-hover);
}

.aum-table th:hover::after,
.aum-table td:hover::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--hover-bg);
  opacity: 0.3;
  pointer-events: none;
  z-index: 1;
}

.aum-table td > *,
.aum-table th > * {
  position: relative;
  z-index: 2;
}

.aum-table td .aum-badge,
.aum-table td .aum-status,
.aum-table td .aum-action {
  position: relative;
  z-index: 2;
}

.aum-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.aum-badge.visitor {
  background: var(--badge-visitor);
  color: var(--badge-text-visitor);
}

.aum-badge.research {
  background: var(--badge-research);
  color: var(--badge-text-research);
}

.aum-badge.business {
  background: var(--badge-business);
  color: var(--badge-text-business);
}

.aum-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  background: #ffebee;
  color: #c62828;
}

.aum-status.verified {
  background: #e8f5e9;
  color: #2e7d32;
}

.aum-action {
  padding: 6px;
  border: none;
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.aum-action:hover {
  background: var(--hover-bg);
}

.aum-action.delete:hover {
  background: #ffebee;
  color: #c62828;
}

.aum-form-section {
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 0 10px var(--shadow);
  padding: 20px;
  border: 1.5px solid var(--border-color);
}

.aum-form-section h3 {
  color: var(--text-primary);
  margin-bottom: 20px;
}

.aum-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.aum-form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.aum-form input,
.aum-form select {
  padding: 8px;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-primary);
}

.aum-form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.aum-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.aum-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.aum-btn.primary {
  background: #4caf50;
  color: white;
}

.aum-btn:not(.primary) {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

@media (max-width: 1024px) {
  .aum-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .aum-filters {
    flex-direction: column;
  }

  .aum-form-row {
    grid-template-columns: 1fr;
  }
}
</style>
