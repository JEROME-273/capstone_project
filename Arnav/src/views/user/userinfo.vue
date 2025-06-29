<template>
  <div class="container-bg">
    <div class="profile-card">
      <div class="profile-header">
        <router-link to="/homepage">
          <i class="fas fa-arrow-left icon-back"></i>
        </router-link>
        <h1 class="profile-title">My Profile</h1>
        <div class="header-actions">
          <!-- Notification Bell -->
          <NotificationBell />
          <button class="icon-theme" @click="toggleTheme">
            <i class="fas fa-sun ml-1"></i>
          </button>
        </div>
      </div>
      <div class="profile-info">
        <div class="relative">
          <template v-if="profileImage">
            <img
              alt="Profile picture of a stylish boy"
              class="profile-img"
              height="100"
              :src="profileImage"
              width="100" />
          </template>
          <template v-else>
            <div class="profile-img user-icon-placeholder">
              <i class="fas fa-user"></i>
            </div>
          </template>
        </div>
        <h2 class="profile-name">{{ userName }}</h2>
      </div>
      <div class="profile-details">
        <div>
          <p class="label">Joined:</p>
          <p class="value">{{ joinedDate }}</p>
        </div>
        <div>
          <p class="label">Purpose of Visit:</p>
          <p class="value">{{ purpose }}</p>
        </div>
        <div>
          <p class="label">Gender:</p>
          <p class="value">{{ gender }}</p>
        </div>
      </div>
      <div class="space-y-4">
        <!-- Personal Info Button -->
        <div>
          <div class="profile-link" @click="openPersonalInfoModal">
            <div class="flex items-center">
              <i class="fas fa-user icon-section"></i>
              <span class="ml-4 text-lg">Personal Info</span>
            </div>
            <i class="fas fa-chevron-right icon-chevron"></i>
          </div>
        </div>

        <!-- Personal Info Modal -->
        <div v-if="showPersonalInfoModal" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Edit Personal Information</h2>
              <button class="close-button" @click="closePersonalInfoModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updatePersonalInfo">
                <div class="form-group">
                  <label>Email:</label>
                  <input v-model="editableInfo.email" type="email" disabled />
                </div>
                <div class="form-group">
                  <label>First Name:</label>
                  <input
                    v-model="editableInfo.firstName"
                    type="text"
                    required />
                </div>
                <div class="form-group">
                  <label>Middle Name:</label>
                  <input v-model="editableInfo.middleName" type="text" />
                </div>
                <div class="form-group">
                  <label>Last Name:</label>
                  <input v-model="editableInfo.lastName" type="text" required />
                </div>
                <div class="form-group">
                  <label>Gender:</label>
                  <select v-model="editableInfo.gender" required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Role:</label>
                  <input v-model="editableInfo.role" type="text" disabled />
                </div>
                <div class="form-group">
                  <label>Type of Visit:</label>
                  <input
                    v-model="editableInfo.typeofvisit"
                    type="text"
                    disabled />
                </div>
                <div class="form-group">
                  <label>Joined:</label>
                  <input
                    v-model="editableInfo.joinedDate"
                    type="text"
                    disabled />
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="cancel-button"
                    @click="closePersonalInfoModal">
                    Cancel
                  </button>
                  <button type="submit" class="save-button">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- History of Visit Dropdown -->
        <div>
          <div class="profile-link" @click="toggleDropdown('history')">
            <div class="flex items-center">
              <i class="fas fa-history icon-section"></i>
              <span class="ml-4 text-lg">History of Visit</span>
            </div>
            <i
              class="fas fa-chevron-right icon-chevron"
              :class="{ 'rotate-90': openDropdown === 'history' }"></i>
          </div>
          <div v-if="openDropdown === 'history'" class="dropdown-content">
            <div v-if="recentDestinations.length">
              <div
                v-for="(dest, idx) in recentDestinations"
                :key="idx"
                style="
                  margin-bottom: 1rem;
                  padding: 0.75rem;
                  border: 1px solid var(--border-color);
                  border-radius: 8px;
                  background: var(--card-bg);
                ">
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 0.5rem;
                  ">
                  <div>
                    <b style="color: var(--primary-color)">{{
                      dest.destinationName
                    }}</b>
                    <div
                      style="
                        font-size: 0.9em;
                        color: var(--text-secondary);
                        margin-top: 0.25rem;
                      ">
                      {{ dest.destinationAddress || "No address" }}
                    </div>
                  </div>
                  <span
                    style="
                      background: var(--success-color);
                      color: white;
                      padding: 0.2rem 0.5rem;
                      border-radius: 12px;
                      font-size: 0.75em;
                    ">
                    ✓ Completed
                  </span>
                </div>
                <div style="font-size: 0.85em; color: var(--text-muted)">
                  <div>
                    📅
                    {{
                      new Date(
                        dest.timestamp.seconds
                          ? dest.timestamp.seconds * 1000
                          : dest.timestamp
                      ).toLocaleDateString()
                    }}
                  </div>
                  <div>
                    🕒
                    {{
                      new Date(
                        dest.timestamp.seconds
                          ? dest.timestamp.seconds * 1000
                          : dest.timestamp
                      ).toLocaleTimeString()
                    }}
                  </div>
                  <div v-if="dest.navigationDuration">
                    ⏱️ Navigation time:
                    {{ Math.round(dest.navigationDuration / 1000) }}s
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else
              style="
                text-align: center;
                padding: 2rem;
                color: var(--text-muted);
              ">
              <i
                class="fas fa-map-marker-alt"
                style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5"></i>
              <p>No successful arrivals yet.</p>
              <p style="font-size: 0.9em">
                Start navigating to see your visit history!
              </p>
            </div>
          </div>
        </div>

        <!-- Settings Dropdown -->
        <div>
          <div class="profile-link" @click="toggleDropdown('settings')">
            <div class="flex items-center">
              <i class="fas fa-cog icon-section"></i>
              <span class="ml-4 text-lg">Settings</span>
            </div>
            <i
              class="fas fa-chevron-right icon-chevron"
              :class="{ 'rotate-90': openDropdown === 'settings' }"></i>
          </div>
          <div v-if="openDropdown === 'settings'" class="dropdown-content">
            <form @submit.prevent="updatePassword" class="password-form">
              <div class="form-group">
                <label for="oldPassword"><b>Current Password:</b></label>
                <div class="password-input-container">
                  <input
                    id="oldPassword"
                    v-model="oldPassword"
                    :type="showOldPassword ? 'text' : 'password'"
                    placeholder="Enter current password"
                    @blur="validateOldPassword"
                    required />

                  <i
                    v-if="oldPasswordValid"
                    class="password-check-icon fas fa-check"></i>
                </div>
              </div>

              <div class="form-group">
                <label for="newPassword"><b>New Password:</b></label>
                <div class="password-input-container">
                  <input
                    id="newPassword"
                    v-model="newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    placeholder="Enter new password"
                    minlength="6"
                    required />
                  <i
                    @click="toggleNewPassword"
                    :class="[
                      'password-toggle-icon',
                      showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye',
                    ]"></i>
                </div>
              </div>

              <div class="form-group">
                <label for="confirmPassword"
                  ><b>Confirm New Password:</b></label
                >
                <div class="password-input-container">
                  <input
                    id="confirmPassword"
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Confirm new password"
                    required />
                  <i
                    @click="toggleConfirmPassword"
                    :class="[
                      'password-toggle-icon',
                      showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye',
                    ]"></i>
                </div>
              </div>

              <button
                type="submit"
                class="update-password-btn"
                :disabled="isUpdatingPassword">
                {{ isUpdatingPassword ? "Updating..." : "Update Password" }}
              </button>
            </form>
            <p v-if="passwordUpdateMessage" :class="passwordMessageClass">
              {{ passwordUpdateMessage }}
            </p>
          </div>
        </div>
      </div>

      <!-- Logout using AuthManager component -->
      <div class="logout-container">
        <AuthManager />
      </div>
    </div>
  </div>
</template>

<script>
import AuthManager from "@/components/AuthManager.vue";
import NotificationBell from "@/components/NotificationBell.vue";
import { auth } from "@/firebase/config";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  limit,
} from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

export default {
  name: "UserInfo",
  components: {
    AuthManager,
    NotificationBell,
  },
  data() {
    return {
      userName: "",
      joinedDate: "",
      purpose: "",
      gender: "",
      profileImage: "",
      email: "",
      firstName: "",
      middleName: "",
      lastName: "",
      role: "",
      typeofvisit: "",
      recentDestination: "",
      openDropdown: null,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      passwordUpdateMessage: "",
      isUpdatingPassword: false,
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      oldPasswordValid: false,
      recentDestinations: [],
      showPersonalInfoModal: false,
      editableInfo: {
        email: "",
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        role: "",
        typeofvisit: "",
        joinedDate: "",
      },
      updateMessage: "",
    };
  },
  computed: {
    passwordMessageClass() {
      if (!this.passwordUpdateMessage) return "";
      return this.passwordUpdateMessage.includes("successfully")
        ? "success-message"
        : "error-message";
    },
  },
  async mounted() {
    const user = auth.currentUser;
    if (user) {
      const db = getFirestore();
      // Fetch user info
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.userName = `${data.firstName} ${data.lastName}`;
        this.firstName = data.firstName;
        this.middleName = data.middleName;
        this.lastName = data.lastName;
        this.gender = data.gender;
        this.joinedDate = data.createdAt
          ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
          : "";
        this.purpose = data.typeofvisit;
        this.typeofvisit = data.typeofvisit;
        this.role = data.role;
        this.email = data.email;
      }

      // Fetch arrival history from arrivalAnalytics
      try {
        console.log("Fetching arrival history for user:", user.uid);
        const arrivalRef = collection(db, "arrivalAnalytics");

        // Try with index first, fallback to simple query
        let querySnapshot;
        try {
          const q = query(
            arrivalRef,
            where("userId", "==", user.uid),
            orderBy("timestamp", "desc"),
            limit(10)
          );
          querySnapshot = await getDocs(q);
        } catch (indexError) {
          console.log("Index not ready, using simple query...");
          // Fallback: Get all user documents without ordering
          const simpleQuery = query(
            arrivalRef,
            where("userId", "==", user.uid)
          );
          querySnapshot = await getDocs(simpleQuery);
        }

        this.recentDestinations = [];
        this.arrivalHistory = [];

        console.log("Query returned", querySnapshot.docs.length, "documents");

        const arrivals = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Document data:", data);
          arrivals.push(data);
        });

        // Sort by timestamp manually if we used the fallback query
        arrivals.sort((a, b) => {
          const timeA = a.timestamp?.seconds
            ? a.timestamp.seconds * 1000
            : new Date(a.timestamp).getTime();
          const timeB = b.timestamp?.seconds
            ? b.timestamp.seconds * 1000
            : new Date(b.timestamp).getTime();
          return timeB - timeA; // Descending order (newest first)
        });

        // Take only the last 10
        const recentArrivals = arrivals.slice(0, 10);

        this.recentDestinations = recentArrivals;
        this.arrivalHistory = recentArrivals;

        console.log("Final recentDestinations:", this.recentDestinations);
      } catch (error) {
        console.error("Error fetching arrival history:", error);
        this.recentDestinations = [];
        this.arrivalHistory = [];
      }
    }
  },
  methods: {
    toggleTheme() {
      document.body.classList.toggle("dark-mode");
    },
    toggleDropdown(section) {
      this.openDropdown = this.openDropdown === section ? null : section;
    },

    // Password visibility toggles
    toggleOldPassword() {
      this.showOldPassword = !this.showOldPassword;
    },

    toggleNewPassword() {
      this.showNewPassword = !this.showNewPassword;
    },

    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },

    // Validate old password
    async validateOldPassword() {
      if (!this.oldPassword) {
        this.oldPasswordValid = false;
        return;
      }

      try {
        const user = auth.currentUser;
        if (!user) return;

        const credential = EmailAuthProvider.credential(
          user.email,
          this.oldPassword
        );
        await reauthenticateWithCredential(user, credential);
        this.oldPasswordValid = true;
      } catch (error) {
        this.oldPasswordValid = false;
      }
    },
    async updatePassword() {
      // Clear previous messages
      this.passwordUpdateMessage = "";

      // Validate passwords match
      if (this.newPassword !== this.confirmPassword) {
        this.passwordUpdateMessage = "New passwords do not match!";
        return;
      }

      // Check password length
      if (this.newPassword.length < 6) {
        this.passwordUpdateMessage =
          "New password must be at least 6 characters long!";
        return;
      }

      // Check if new password is different from old password
      if (this.oldPassword === this.newPassword) {
        this.passwordUpdateMessage =
          "New password must be different from current password!";
        return;
      }

      this.isUpdatingPassword = true;

      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("No user logged in");
        }

        // Create credential for reauthentication
        const credential = EmailAuthProvider.credential(
          user.email,
          this.oldPassword
        );

        // Reauthenticate user with old password
        await reauthenticateWithCredential(user, credential);

        // Update to new password
        await updatePassword(user, this.newPassword);

        // Success - clear form and show message
        this.oldPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
        this.oldPasswordValid = false;
        this.passwordUpdateMessage = "Password updated successfully!";

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          this.passwordUpdateMessage = "";
        }, 3000);
      } catch (error) {
        console.error("Password update error:", error);

        // Handle specific errors
        if (error.code === "auth/wrong-password") {
          this.passwordUpdateMessage = "Current password is incorrect!";
        } else if (error.code === "auth/weak-password") {
          this.passwordUpdateMessage = "New password is too weak!";
        } else if (error.code === "auth/requires-recent-login") {
          this.passwordUpdateMessage =
            "Please log out and log back in, then try again.";
        } else {
          this.passwordUpdateMessage =
            "Error updating password: " + error.message;
        }
      } finally {
        this.isUpdatingPassword = false;
      }
    },
    openPersonalInfoModal() {
      this.editableInfo = {
        email: this.email,
        firstName: this.firstName,
        middleName: this.middleName,
        lastName: this.lastName,
        gender: this.gender,
        role: this.role,
        typeofvisit: this.typeofvisit,
        joinedDate: this.joinedDate,
      };
      this.showPersonalInfoModal = true;
    },
    closePersonalInfoModal() {
      this.showPersonalInfoModal = false;
      this.updateMessage = "";
    },
    async updatePersonalInfo() {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");

        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);

        await updateDoc(userRef, {
          firstName: this.editableInfo.firstName,
          middleName: this.editableInfo.middleName,
          lastName: this.editableInfo.lastName,
          gender: this.editableInfo.gender,
        });

        // Update local state
        this.firstName = this.editableInfo.firstName;
        this.middleName = this.editableInfo.middleName;
        this.lastName = this.editableInfo.lastName;
        this.gender = this.editableInfo.gender;
        this.userName = `${this.firstName} ${this.lastName}`;

        this.updateMessage = "Profile updated successfully!";
        setTimeout(() => {
          this.closePersonalInfoModal();
        }, 1500);
      } catch (error) {
        this.updateMessage = "Error updating profile: " + error.message;
      }
    },
  },
};
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css");

/* Container for the whole background and centers the profile card */
.container-bg {
  background-color: #fff;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem; /* Responsive padding for small screens */
}

/* Main profile card box */
.profile-card {
  width: 100%;
  max-width: 28rem; /* max-w-md */
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 1rem;
  padding: 1.5rem;
}

/* Header section: back button, title, theme toggle */
.profile-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  min-height: 2.5rem;
}

.header-actions {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon-back {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  color: #22c55e;
}
.icon-theme {
  font-size: 1.25rem;
  color: #22c55e;
  background: none;
  border: none;
  cursor: pointer;
}
.header-actions {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
}
.profile-title {
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
  width: 100%;
  margin: 0;
}

/* Profile image and name section */
.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem; /* mb-6 */
}

/* Profile image (or icon placeholder) styling */
.profile-img {
  width: 6rem; /* w-24 */
  height: 6rem; /* h-24 */
  border-radius: 9999px; /* rounded-full */
  object-fit: cover;
}

/* User's name below the image */
.profile-name {
  font-size: 1.25rem; /* text-xl */
  font-weight: bold;
  margin-top: 1rem; /* mt-4 */
  word-break: break-word;
}

/* Details row: joined, purpose, gender */
.profile-details {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  text-align: center;
  margin-bottom: 1.5rem;
  gap: 2rem;
  width: 100%;
}
.profile-details > div {
  min-width: 0;
  flex: 1 1 0;
}

/* Label for each detail */
.label {
  color: #6b7280; /* text-gray-500 */
  font-size: 0.95rem;
}

/* Value for each detail */
.value {
  color: #22c55e; /* text-green-500 */
  font-size: 1.05rem;
}

/* Each clickable dropdown section (profile-link) */
.profile-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem; /* p-4 */
  background-color: #f3f4f6; /* bg-gray-100 */
  border-radius: 0.5rem; /* rounded-lg */
  cursor: pointer;
  margin-bottom: 0.5rem;
}

/* Icon for each section (user, history, settings) */
.icon-section {
  color: #22c55e; /* text-green-500 */
  font-size: 1.25rem; /* text-xl */
}

/* Chevron icon for dropdowns */
.icon-chevron {
  color: #9ca3af; /* text-gray-400 */
}

/* Logout container styling */
.logout-container {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

/* Placeholder for user icon if no profile image */
.user-icon-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #bdbdbd;
}
.user-icon-placeholder i {
  font-size: 2.5rem;
}

/* Dropdown content area for each section */
.dropdown-content {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  color: #333;
  font-size: 1rem;
  word-break: break-word;
}

/* Rotates the chevron icon when dropdown is open */
.rotate-90 {
  transform: rotate(90deg);
  transition: transform 0.2s;
}

/* CSS Variables for history styling */
:root {
  --border-color: #e5e7eb;
  --card-bg: #f9fafb;
  --primary-color: #22c55e;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --success-color: #22c55e;
}

/* Dark mode CSS variables */
body.dark-mode {
  --border-color: #374151;
  --card-bg: #1f2937;
  --primary-color: #22c55e;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;
  --success-color: #22c55e;
}

/* Responsive styles for mobile devices */
@media (max-width: 600px) {
  .container-bg {
    padding: 0.25rem;
  }
  .profile-card {
    padding: 0.75rem;
    max-width: 100vw;
    border-radius: 0.5rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }
  .profile-header {
    min-height: 2.5rem;
    margin-bottom: 1rem;
  }
  .profile-title {
    font-size: 1.05rem;
  }
  .profile-img {
    width: 4.5rem;
    height: 4.5rem;
  }
  .profile-name {
    font-size: 1.05rem;
    margin-top: 0.5rem;
  }
  .profile-details {
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: nowrap;
  }
  .profile-details > div {
    min-width: 110px;
  }
  .profile-link {
    padding: 0.75rem;
    font-size: 0.98rem;
  }
  .dropdown-content {
    padding: 0.75rem;
    font-size: 0.95rem;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.cancel-button,
.save-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-button {
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
}

.save-button {
  background-color: #22c55e;
  border: 1px solid #22c55e;
  color: white;
}

/* Dark mode modal styles */
body.dark-mode .modal-content {
  background-color: #27272a;
  color: #f3f4f6;
}

body.dark-mode .modal-header {
  border-bottom-color: #374151;
}

body.dark-mode .form-group input,
body.dark-mode .form-group select {
  background-color: #1f2937;
  border-color: #4b5563;
  color: #f3f4f6;
}

body.dark-mode .form-group input:disabled {
  background-color: #374151;
}

body.dark-mode .modal-footer {
  border-top-color: #374151;
}

body.dark-mode .cancel-button {
  background-color: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

/* Password Form Styles */
.password-form {
  max-width: 100%;
}

.password-form .form-group {
  margin-bottom: 1rem;
}

.password-form .form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.9rem;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-form .form-group input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.password-form .form-group input:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.password-toggle-icon {
  position: absolute;
  right: 12px;
  color: #6b7280;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.2s;
  z-index: 2;
}

.password-toggle-icon:hover {
  color: #374151;
}

.password-check-icon {
  position: absolute;
  right: 40px;
  color: #22c55e;
  font-size: 1rem;
  z-index: 2;
}

.update-password-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #22c55e;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.update-password-btn:hover:not(:disabled) {
  background-color: #16a34a;
}

.update-password-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.success-message {
  color: #16a34a !important;
  background-color: #dcfce7;
  border: 1px solid #bbf7d0;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  font-weight: 500;
}

.error-message {
  color: #dc2626 !important;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  font-weight: 500;
}

/* Dark mode password form styles */
body.dark-mode .password-form .form-group label {
  color: #f3f4f6;
}

body.dark-mode .password-form .form-group input {
  background-color: #1f2937;
  border-color: #4b5563;
  color: #f3f4f6;
}

body.dark-mode .password-form .form-group input:focus {
  border-color: #22c55e;
}

body.dark-mode .password-toggle-icon {
  color: #9ca3af;
}

body.dark-mode .password-toggle-icon:hover {
  color: #f3f4f6;
}

body.dark-mode .password-check-icon {
  color: #22c55e;
}

body.dark-mode .success-message {
  color: #22c55e !important;
  background-color: #064e3b;
  border-color: #065f46;
}

body.dark-mode .error-message {
  color: #f87171 !important;
  background-color: #7f1d1d;
  border-color: #991b1b;
}
</style>

<style>
/* Dark mode styles here (not scoped) */
body.dark-mode {
  background-color: #18181b !important;
  color: #f3f4f6 !important;
}
body.dark-mode .container-bg {
  background-color: #18181b !important;
  color: #f3f4f6 !important;
}
body.dark-mode .profile-card {
  background-color: #27272a !important;
  color: #f3f4f6 !important;
}
body.dark-mode .profile-link {
  background-color: #23272f !important;
}
body.dark-mode .profile-name,
body.dark-mode .label,
body.dark-mode .value {
  color: #22c55e !important;
}
body.dark-mode .dropdown-content {
  background: #23272f !important;
  color: #f3f4f6 !important;
}
</style>
