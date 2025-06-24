<template>
  <div class="container-bg">
    <div class="profile-card">
      <div class="profile-header">
        <router-link to="/homepage">
          <i class="fas fa-arrow-left icon-back"></i>
        </router-link>
        <h1 class="profile-title">My Profile</h1>
        <button class="icon-theme" @click="toggleTheme">
          <i class="fas fa-sun ml-1"></i>
        </button>
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
                style="margin-bottom: 0.5rem">
                <b>{{ dest.name }}</b> <br />
                <small>{{ dest.address }}</small> <br />
                <span style="color: #888">{{
                  new Date(dest.timestamp.seconds * 1000).toLocaleString()
                }}</span>
              </div>
            </div>
            <div v-else>
              <p>No recent destinations found.</p>
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
            <form @submit.prevent="updatePassword">
              <label for="newPassword"><b>New Password:</b></label>
              <input
                id="newPassword"
                v-model="newPassword"
                type="password"
                required
                style="margin: 0 0.5rem 0 0.5rem" />
              <button type="submit">Update Password</button>
            </form>
            <p
              v-if="passwordUpdateMessage"
              :style="{
                color: passwordUpdateMessage.includes('success')
                  ? 'green'
                  : 'red',
              }">
              {{ passwordUpdateMessage }}
            </p>
          </div>
        </div>
      </div>
      <div class="profile-link logout-link mt-6" @click="logout">
        <div class="flex items-center text-red-500">
          <i class="fas fa-sign-out-alt icon-logout"></i>
          <span class="ml-4 text-lg">Log out</span>
        </div>
        <i class="fas fa-chevron-right icon-chevron"></i>
      </div>
    </div>
  </div>
</template>

<script>
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
} from "firebase/firestore";
import { signOut, updatePassword } from "firebase/auth";

export default {
  name: "UserInfo",
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
      newPassword: "",
      passwordUpdateMessage: "",
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
      // Fetch recent destinations
      const recentDestRef = collection(db, "recentDestinations");
      const q = query(
        recentDestRef,
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      this.recentDestinations = [];
      querySnapshot.forEach((doc) => {
        this.recentDestinations.push(doc.data());
      });
    }
  },
  methods: {
    toggleTheme() {
      document.body.classList.toggle("dark-mode");
    },
    async logout() {
      try {
        await signOut(auth);
        this.$router.push("/register"); // or your login route
      } catch (error) {
        alert("Sign out failed: " + error.message);
      }
    },
    toggleDropdown(section) {
      this.openDropdown = this.openDropdown === section ? null : section;
    },
    async updatePassword() {
      try {
        const user = auth.currentUser;
        await updatePassword(user, this.newPassword);
        this.passwordUpdateMessage = "Password updated successfully!";
        this.newPassword = "";
      } catch (error) {
        this.passwordUpdateMessage = "Error: " + error.message;
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
.icon-back {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  color: #22c55e;
}
.icon-theme {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  color: #22c55e;
  background: none;
  border: none;
  cursor: pointer;
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

/* Logout link styling */
.logout-link {
  margin-top: 1.5rem;
}

/* Logout icon styling */
.icon-logout {
  font-size: 1.25rem;
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
