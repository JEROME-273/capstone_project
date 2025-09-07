<template>
  <div class="container-bg">
    <div class="profile-card">
      <!-- Header -->
      <div class="profile-header">
        <router-link to="/homepage">
          <i class="fas fa-arrow-left icon-back"></i>
        </router-link>
        <h1 class="profile-title">My Profile</h1>
        <div class="header-actions"></div>
      </div>

      <!-- Profile Info -->
      <div class="profile-info">
        <div class="relative">
          <template v-if="profileImage">
            <img
              alt="Profile picture"
              class="profile-img"
              :src="profileImage" />
          </template>
          <template v-else>
            <div class="profile-img user-icon-placeholder">
              <i class="fas fa-user"></i>
            </div>
          </template>
        </div>
        <h2 class="profile-name">{{ userName }}</h2>
      </div>

      <!-- Profile Details -->
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

      <!-- Links & Actions -->
      <div class="sections">
        <!-- Personal Info -->
        <div class="section-block">
          <div class="profile-link" @click="openPersonalInfoModal">
            <div class="flex items-center">
              <i class="fas fa-user icon-section"></i>
              <span class="ml-4 text-lg">Personal Info</span>
            </div>
            <i class="fas fa-chevron-right icon-chevron"></i>
          </div>
        </div>

        <!-- History -->
        <div class="section-block">
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
                class="visit-card">
                <div class="visit-header">
                  <div>
                    <b>{{ dest.destinationName }}</b>
                    <div class="visit-address">
                      {{ dest.destinationAddress || "No address" }}
                    </div>
                  </div>
                  <span class="visit-status">✓ Completed</span>
                </div>
                <div class="visit-details">
                  <div>📅 {{ formatDate(dest.timestamp) }}</div>
                  <div>🕒 {{ formatTime(dest.timestamp) }}</div>
                  <div v-if="dest.navigationDuration">
                    ⏱️ Navigation:
                    {{ Math.round(dest.navigationDuration / 1000) }}s
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="visit-empty">
              <i class="fas fa-map-marker-alt"></i>
              <p>No successful arrivals yet.</p>
              <p>Start navigating to see your visit history!</p>
            </div>
          </div>
        </div>

        <!-- QR Scanner -->
        <div class="section-block">
          <div class="profile-link" @click="toggleDropdown('qrscanner')">
            <div class="flex items-center">
              <i class="fas fa-qrcode icon-section"></i>
              <span class="ml-4 text-lg">QR Scanner</span>
            </div>
            <i
              class="fas fa-chevron-right icon-chevron"
              :class="{ 'rotate-90': openDropdown === 'qrscanner' }"></i>
          </div>
          <div v-if="openDropdown === 'qrscanner'" class="dropdown-content">
            <SimpleQRScanner @decoded="onScanDecoded" />
            <div v-if="lastScannedCode" class="mt-2" style="font-size:12px;color:#4caf50;word-break:break-all;">
              Last scanned: {{ lastScannedCode }}
            </div>
          </div>
        </div>

        <!-- Help Center -->
        <div class="section-block">
          <div class="profile-link" @click="openHelpCenterModal">
            <div class="flex items-center">
              <i class="fas fa-question-circle icon-section"></i>
              <span class="ml-4 text-lg">Help Center</span>
            </div>
            <i class="fas fa-chevron-right icon-chevron"></i>
          </div>
        </div>

        <!-- Help Center Modal -->
        <div v-if="showHelpCenterModal" class="modal-overlay" @click="closeHelpCenterModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h2>Help Center & Customer Support</h2>
              <button class="close-button" @click="closeHelpCenterModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <!-- FULL HELP CENTER CONTENT -->
              <div class="help-center-container">
                <section class="faq-section">
                  <h2>Frequently Asked Questions</h2>

                  <!-- Getting Started -->
                  <div class="faq-item">
                    <h3
                      @click="toggleSection('gettingStarted')"
                      class="faq-header">
                      🧭 Getting Started
                      <span
                        class="toggle-icon"
                        :class="{ expanded: openSections.gettingStarted }"
                        >▼</span
                      >
                    </h3>
                    <div
                      class="faq-content"
                      v-show="openSections.gettingStarted">
                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('startNavigation')">
                        <strong
                          >How do I start AR navigation?
                          <span
                            class="question-toggle"
                            :class="{ expanded: openQuestions.startNavigation }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.startNavigation">
                          From the homepage, select a destination from the map
                          or use the search feature. Once selected, tap "Start
                          AR Navigation" to begin your journey with augmented
                          reality guidance.
                        </p>
                      </div>
                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('deviceSupport')">
                        <strong
                          >What devices are supported?
                          <span
                            class="question-toggle"
                            :class="{ expanded: openQuestions.deviceSupport }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.deviceSupport">
                          Our app works on modern smartphones with camera access
                          and location services. iOS 12+ and Android 8+ are
                          recommended for the best AR experience.
                        </p>
                      </div>

                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('internetConnection')">
                        <strong
                          >Do I need an internet connection?
                          <span
                            class="question-toggle"
                            :class="{
                              expanded: openQuestions.internetConnection,
                            }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.internetConnection">
                          Yes, an active internet connection is required for
                          real-time location updates, map data, and AR features
                          to function properly.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="faq-item">
                    <h3 @click="toggleSection('arFeatures')" class="faq-header">
                      📱 AR Navigation Features
                      <span
                        class="toggle-icon"
                        :class="{ expanded: openSections.arFeatures }"
                        >▼</span
                      >
                    </h3>
                    <div class="faq-content" v-show="openSections.arFeatures">
                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('howARWorks')">
                        <strong
                          >How does AR navigation work?
                          <span
                            class="question-toggle"
                            :class="{ expanded: openQuestions.howARWorks }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.howARWorks">
                          Our app uses your camera and GPS to overlay 3D arrows
                          and markers in the real world, showing you exactly
                          where to go. Simply hold your phone up and follow the
                          blue arrows!
                        </p>
                      </div>

                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('voiceCommands')">
                        <strong
                          >Can I use voice commands?
                          <span
                            class="question-toggle"
                            :class="{ expanded: openQuestions.voiceCommands }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.voiceCommands">
                          Yes! Tap the microphone icon during navigation and say
                          commands like "How far?", "Where am I?", or "Repeat
                          instruction" for hands-free assistance.
                        </p>
                      </div>

                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('navigationSettings')">
                        <strong
                          >How do I adjust navigation settings?
                          <span
                            class="question-toggle"
                            :class="{
                              expanded: openQuestions.navigationSettings,
                            }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.navigationSettings">
                          During AR navigation, tap the settings gear icon to
                          adjust voice guidance volume, toggle AR arrows on/off,
                          and switch between metric/imperial units.
                        </p>
                      </div>

                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('arrivalOptions')">
                        <strong
                          >What happens when I arrive at my destination?
                          <span
                            class="question-toggle"
                            :class="{ expanded: openQuestions.arrivalOptions }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.arrivalOptions">
                          You'll see a completion dialog with options to start a
                          new navigation, continue exploring, or finish and
                          return to the homepage.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="faq-item">
                    <h3
                      @click="toggleSection('troubleshooting')"
                      class="faq-header">
                      🔧 Troubleshooting
                      <span
                        class="toggle-icon"
                        :class="{ expanded: openSections.troubleshooting }"
                        >▼</span
                      >
                    </h3>
                    <div
                      class="faq-content"
                      v-show="openSections.troubleshooting">
                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('arNotWorking')">
                        <strong
                          >AR navigation isn't working properly
                          <span
                            class="question-toggle"
                            :class="{ expanded: openQuestions.arNotWorking }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.arNotWorking">
                          Ensure your camera and location permissions are
                          enabled. Try restarting the app, check your internet
                          connection, and make sure you're in an area with good
                          GPS signal.
                        </p>
                      </div>

                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('arrowsNotShowing')">
                        <strong
                          >The 3D arrows are not showing
                          <span
                            class="question-toggle"
                            :class="{
                              expanded: openQuestions.arrowsNotShowing,
                            }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.arrowsNotShowing">
                          Check if "Show AR Arrows" is enabled in navigation
                          settings. Also ensure your device camera has a clear
                          view and isn't covered or dirty.
                        </p>
                      </div>

                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('voiceNotWorking')">
                        <strong
                          >Voice guidance is not working
                          <span
                            class="question-toggle"
                            :class="{ expanded: openQuestions.voiceNotWorking }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.voiceNotWorking">
                          Go to navigation settings and make sure "Voice
                          Guidance" is enabled and volume is turned up. Check
                          your device's media volume settings as well.
                        </p>
                      </div>

                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('locationAccuracy')">
                        <strong
                          >Location accuracy is poor
                          <span
                            class="question-toggle"
                            :class="{
                              expanded: openQuestions.locationAccuracy,
                            }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.locationAccuracy">
                          Make sure you're outdoors or near windows for better
                          GPS signal. Enable high-accuracy location mode in your
                          device settings and restart the app.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="faq-item">
                    <h3 @click="toggleSection('account')" class="faq-header">
                      👤 Account & Profile
                      <span
                        class="toggle-icon"
                        :class="{ expanded: openSections.account }"
                        >▼</span
                      >
                    </h3>
                    <div class="faq-content" v-show="openSections.account">
                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('resetPassword')">
                        <strong
                          >How do I reset my password?
                          <span
                            class="question-toggle"
                            :class="{ expanded: openQuestions.resetPassword }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.resetPassword">
                          Go to your profile settings by tapping your avatar,
                          then select "Change Password" to update your login
                          credentials.
                        </p>
                      </div>

                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('navigationHistory')">
                        <strong
                          >How can I view my navigation history?
                          <span
                            class="question-toggle"
                            :class="{
                              expanded: openQuestions.navigationHistory,
                            }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.navigationHistory">
                          Visit your profile page to see your recent
                          destinations, successful arrivals, and navigation
                          statistics.
                        </p>
                      </div>

                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('favoriteDestinations')">
                        <strong
                          >Can I save favorite destinations?
                          <span
                            class="question-toggle"
                            :class="{
                              expanded: openQuestions.favoriteDestinations,
                            }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.favoriteDestinations">
                          Yes! When selecting a destination, you can bookmark it
                          for quick access later from your favorites list.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="faq-item">
                    <h3
                      @click="toggleSection('notifications')"
                      class="faq-header">
                      🔔 Notifications & Updates
                      <span
                        class="toggle-icon"
                        :class="{ expanded: openSections.notifications }"
                        >▼</span
                      >
                    </h3>
                    <div
                      class="faq-content"
                      v-show="openSections.notifications">
                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('notificationAlerts')">
                        <strong
                          >How do notification alerts work?
                          <span
                            class="question-toggle"
                            :class="{
                              expanded: openQuestions.notificationAlerts,
                            }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.notificationAlerts">
                          You'll receive notifications about new landmarks,
                          navigation updates, and system announcements. Tap on
                          notifications to start navigation to new locations.
                        </p>
                      </div>

                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('disableNotifications')">
                        <strong
                          >Can I disable notifications?
                          <span
                            class="question-toggle"
                            :class="{
                              expanded: openQuestions.disableNotifications,
                            }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.disableNotifications">
                          Yes, you can manage notification preferences in your
                          device settings under app notifications, or contact
                          support to adjust server-side notifications.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="faq-item">
                    <h3 @click="toggleSection('support')" class="faq-header">
                      📞 Support & Contact
                      <span
                        class="toggle-icon"
                        :class="{ expanded: openSections.support }"
                        >▼</span
                      >
                    </h3>
                    <div class="faq-content" v-show="openSections.support">
                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('contactSupport')">
                        <strong
                          >How do I contact support?
                          <span
                            class="question-toggle"
                            :class="{ expanded: openQuestions.contactSupport }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.contactSupport">
                          Use the support form below to send us a message. We
                          typically respond within 24 hours during business
                          days.
                        </p>
                      </div>

                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('provideFeedback')">
                        <strong
                          >How do I provide feedback or suggestions?
                          <span
                            class="question-toggle"
                            :class="{ expanded: openQuestions.provideFeedback }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.provideFeedback">
                          We love hearing from our users! Use the feedback form
                          below to share your ideas, report bugs, or suggest new
                          features.
                        </p>
                      </div>

                      <div
                        class="faq-question clickable-question"
                        @click="toggleQuestion('locationPrivacy')">
                        <strong
                          >Is my location data private?
                          <span
                            class="question-toggle"
                            :class="{ expanded: openQuestions.locationPrivacy }"
                            >▼</span
                          ></strong
                        >
                        <p v-show="openQuestions.locationPrivacy">
                          Yes, we take privacy seriously. Location data is only
                          used for navigation purposes and is not shared with
                          third parties. Check our privacy policy for full
                          details.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- Support Section -->
                <section class="support-section">
                  <h2>Submit a Support Request</h2>
                  <form @submit.prevent="submitSupportRequest">
                    <input
                      v-model="supportForm.email"
                      type="email"
                      placeholder="Your Email"
                      readonly
                      required />
                    <textarea
                      v-model="supportForm.message"
                      placeholder="Describe your issue..."
                      required></textarea>
                    <button type="submit">Send Request</button>
                  </form>
                  <div v-if="supportSuccess" class="success-message">
                    Support request sent!
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Info Modal -->
        <div v-if="showPersonalInfoModal" class="modal-overlay" @click="closePersonalInfoModal">
          <div class="modal-content" @click.stop>
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
              <p v-if="updateMessage" class="success-message">
                {{ updateMessage }}
              </p>
            </div>
          </div>
        </div>

        <!-- Change Password -->
        <div class="section-block">
          <div class="profile-link" @click="openPasswordModal">
            <div class="flex items-center">
              <i class="fas fa-lock icon-section"></i>
              <span class="ml-4 text-lg">Change Password</span>
            </div>
            <i class="fas fa-chevron-right icon-chevron"></i>
          </div>
        </div>
      </div>

      <!-- Change Password Modal -->
      <div v-if="showPasswordModal" class="modal-overlay" @click="closePasswordModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Change Password</h2>
            <button class="close-button" @click="closePasswordModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updatePassword">
              <div class="form-group">
                <label>Current Password:</label>
                <input v-model="oldPassword" type="password" required />
              </div>
              <div class="form-group">
                <label>New Password:</label>
                <input v-model="newPassword" type="password" required />
              </div>
              <div class="form-group">
                <label>Confirm New Password:</label>
                <input v-model="confirmPassword" type="password" required />
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="cancel-button"
                  @click="closePasswordModal">
                  Cancel
                </button>
                <button type="submit" class="save-button">Update</button>
              </div>
            </form>
            <p v-if="passwordUpdateMessage" :class="passwordMessageClass">
              {{ passwordUpdateMessage }}
            </p>
          </div>
        </div>
      </div>

      <!-- Logout -->
      <div class="logout-container">
        <AuthManager />
      </div>
    </div>
  </div>
</template>

<script>
import AuthManager from "@/components/AuthManager.vue";
import NotificationBell from "@/components/NotificationBell.vue";
import SimpleQRScanner from "@/components/SimpleQRScanner.vue";
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
  addDoc,
  serverTimestamp,
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
  SimpleQRScanner,
  },
  data() {
    return {
      // === User Info ===
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

      // === Modals ===
      showPasswordModal: false,
      showHelpCenterModal: false,

      // === HelpCenter Support ===
      supportForm: { email: "", message: "" },
      supportSuccess: false,
      openSections: {
        gettingStarted: false,
        arFeatures: false,
        troubleshooting: false,
        account: false,
        notifications: false,
        support: false,
      },
      openQuestions: {
        startNavigation: false,
        deviceSupport: false,
        internetConnection: false,
        howARWorks: false,
        voiceCommands: false,
        navigationSettings: false,
        arrivalOptions: false,
        arNotWorking: false,
        arrowsNotShowing: false,
        voiceNotWorking: false,
        locationAccuracy: false,
        resetPassword: false,
        navigationHistory: false,
        favoriteDestinations: false,
        notificationAlerts: false,
        disableNotifications: false,
        contactSupport: false,
        locationPrivacy: false,
      },
  // QR Scanner
  lastScannedCode: "",
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
    // Add keyboard event listener for modals
    document.addEventListener('keydown', this.handleKeydown);
    
    const user = auth.currentUser;
    if (user) {
      const db = getFirestore();

      // Prefill support form email
      this.supportForm.email = user.email;

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
        const arrivalRef = collection(db, "arrivalAnalytics");
        let querySnapshot;

        try {
          const q = query(
            arrivalRef,
            where("userId", "==", user.uid),
            orderBy("timestamp", "desc"),
            limit(10)
          );
          querySnapshot = await getDocs(q);
        } catch {
          const simpleQuery = query(
            arrivalRef,
            where("userId", "==", user.uid)
          );
          querySnapshot = await getDocs(simpleQuery);
        }

        const arrivals = [];
        querySnapshot.forEach((doc) => arrivals.push(doc.data()));

        arrivals.sort((a, b) => {
          const timeA = a.timestamp?.seconds
            ? a.timestamp.seconds * 1000
            : new Date(a.timestamp).getTime();
          const timeB = b.timestamp?.seconds
            ? b.timestamp.seconds * 1000
            : new Date(b.timestamp).getTime();
          return timeB - timeA;
        });

        this.recentDestinations = arrivals.slice(0, 10);
        this.arrivalHistory = arrivals.slice(0, 10);
      } catch (error) {
        console.error("Error fetching arrival history:", error);
        this.recentDestinations = [];
        this.arrivalHistory = [];
      }
    }
  },
  beforeUnmount() {
    // Remove keyboard event listener
    document.removeEventListener('keydown', this.handleKeydown);
    // Clean up any open modals
    document.body.classList.remove('modal-open');
  },
  methods: {
    // === Keyboard Handler ===
    handleKeydown(event) {
      if (event.key === 'Escape') {
        if (this.showPersonalInfoModal) {
          this.closePersonalInfoModal();
        } else if (this.showHelpCenterModal) {
          this.closeHelpCenterModal();
        } else if (this.showPasswordModal) {
          this.closePasswordModal();
        }
      }
    },

    // === Theme ===
    toggleTheme() {
      document.body.classList.toggle("dark-mode");
    },
    toggleDropdown(section) {
      this.openDropdown = this.openDropdown === section ? null : section;
    },

    // === Password Modal ===
    openPasswordModal() {
      this.showPasswordModal = true;
      document.body.classList.add('modal-open');
    },
    closePasswordModal() {
      this.showPasswordModal = false;
      this.oldPassword = "";
      this.newPassword = "";
      this.confirmPassword = "";
      this.passwordUpdateMessage = "";
      this.oldPasswordValid = false;
      document.body.classList.remove('modal-open');
    },

    // === Help Center Modal ===
    openHelpCenterModal() {
      this.showHelpCenterModal = true;
      document.body.classList.add('modal-open');
    },
    closeHelpCenterModal() {
      this.showHelpCenterModal = false;
      this.supportForm.message = "";
      this.supportSuccess = false;
      document.body.classList.remove('modal-open');
    },

    // === Password Management ===
    toggleOldPassword() {
      this.showOldPassword = !this.showOldPassword;
    },
    toggleNewPassword() {
      this.showNewPassword = !this.showNewPassword;
    },
    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
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
      } catch {
        this.oldPasswordValid = false;
      }
    },
    async updatePassword() {
      this.passwordUpdateMessage = "";
      if (this.newPassword !== this.confirmPassword) {
        this.passwordUpdateMessage = "New passwords do not match!";
        return;
      }
      if (this.newPassword.length < 6) {
        this.passwordUpdateMessage =
          "New password must be at least 6 characters long!";
        return;
      }
      if (this.oldPassword === this.newPassword) {
        this.passwordUpdateMessage =
          "New password must be different from current password!";
        return;
      }
      this.isUpdatingPassword = true;
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");
        const credential = EmailAuthProvider.credential(
          user.email,
          this.oldPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, this.newPassword);
        this.oldPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
        this.oldPasswordValid = false;
        this.passwordUpdateMessage = "Password updated successfully!";
        setTimeout(() => (this.passwordUpdateMessage = ""), 3000);
      } catch (error) {
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

    // === Personal Info ===
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
      document.body.classList.add('modal-open');
    },
    closePersonalInfoModal() {
      this.showPersonalInfoModal = false;
      this.updateMessage = "";
      document.body.classList.remove('modal-open');
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

    // === HelpCenter Support ===
    toggleSection(sectionName) {
      this.openSections[sectionName] = !this.openSections[sectionName];
    },
    toggleQuestion(questionName) {
      this.openQuestions[questionName] = !this.openQuestions[questionName];
    },
    async submitSupportRequest() {
      const db = getFirestore();
      await addDoc(collection(db, "support_requests"), {
        email: this.supportForm.email,
        message: this.supportForm.message,
        createdAt: serverTimestamp(),
      });
      this.supportForm.message = "";
      this.supportSuccess = true;
      setTimeout(() => (this.supportSuccess = false), 3000);
    },

    // === Utility Functions ===
    formatDate(timestamp) {
      if (!timestamp) return "N/A";
      try {
        let date;
        if (timestamp.seconds) {
          // Firestore timestamp
          date = new Date(timestamp.seconds * 1000);
        } else if (timestamp instanceof Date) {
          date = timestamp;
        } else {
          date = new Date(timestamp);
        }
        return date.toLocaleDateString();
      } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
      }
    },

    formatTime(timestamp) {
      if (!timestamp) return "N/A";
      try {
        let date;
        if (timestamp.seconds) {
          // Firestore timestamp
          date = new Date(timestamp.seconds * 1000);
        } else if (timestamp instanceof Date) {
          date = timestamp;
        } else {
          date = new Date(timestamp);
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (error) {
        console.error("Error formatting time:", error);
        return "Invalid Time";
      }
    },

    // === QR Scanner ===
    onScanDecoded(value) {
      this.lastScannedCode = value;
    },
  },
};
</script>

<style scoped>
@import "@/assets/allstyle.css";
@import "@/assets/responsive.css";
</style>
