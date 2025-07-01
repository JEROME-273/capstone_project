<template>
  <div class="help-center-container">
    <h1>Help Center & Customer Support</h1>
    <section class="faq-section">
      <h2>Frequently Asked Questions</h2>

      <div class="faq-item">
        <h3 @click="toggleSection('gettingStarted')" class="faq-header">
          🧭 Getting Started
          <span
            class="toggle-icon"
            :class="{ expanded: openSections.gettingStarted }"
            >▼</span
          >
        </h3>
        <div class="faq-content" v-show="openSections.gettingStarted">
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
              From the homepage, select a destination from the map or use the
              search feature. Once selected, tap "Start AR Navigation" to begin
              your journey with augmented reality guidance.
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
              Our app works on modern smartphones with camera access and
              location services. iOS 12+ and Android 8+ are recommended for the
              best AR experience.
            </p>
          </div>

          <div
            class="faq-question clickable-question"
            @click="toggleQuestion('internetConnection')">
            <strong
              >Do I need an internet connection?
              <span
                class="question-toggle"
                :class="{ expanded: openQuestions.internetConnection }"
                >▼</span
              ></strong
            >
            <p v-show="openQuestions.internetConnection">
              Yes, an active internet connection is required for real-time
              location updates, map data, and AR features to function properly.
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
              Our app uses your camera and GPS to overlay 3D arrows and markers
              in the real world, showing you exactly where to go. Simply hold
              your phone up and follow the blue arrows!
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
              Yes! Tap the microphone icon during navigation and say commands
              like "How far?", "Where am I?", or "Repeat instruction" for
              hands-free assistance.
            </p>
          </div>

          <div
            class="faq-question clickable-question"
            @click="toggleQuestion('navigationSettings')">
            <strong
              >How do I adjust navigation settings?
              <span
                class="question-toggle"
                :class="{ expanded: openQuestions.navigationSettings }"
                >▼</span
              ></strong
            >
            <p v-show="openQuestions.navigationSettings">
              During AR navigation, tap the settings gear icon to adjust voice
              guidance volume, toggle AR arrows on/off, and switch between
              metric/imperial units.
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
              You'll see a completion dialog with options to start a new
              navigation, continue exploring, or finish and return to the
              homepage.
            </p>
          </div>
        </div>
      </div>

      <div class="faq-item">
        <h3 @click="toggleSection('troubleshooting')" class="faq-header">
          🔧 Troubleshooting
          <span
            class="toggle-icon"
            :class="{ expanded: openSections.troubleshooting }"
            >▼</span
          >
        </h3>
        <div class="faq-content" v-show="openSections.troubleshooting">
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
              Ensure your camera and location permissions are enabled. Try
              restarting the app, check your internet connection, and make sure
              you're in an area with good GPS signal.
            </p>
          </div>

          <div
            class="faq-question clickable-question"
            @click="toggleQuestion('arrowsNotShowing')">
            <strong
              >The 3D arrows are not showing
              <span
                class="question-toggle"
                :class="{ expanded: openQuestions.arrowsNotShowing }"
                >▼</span
              ></strong
            >
            <p v-show="openQuestions.arrowsNotShowing">
              Check if "Show AR Arrows" is enabled in navigation settings. Also
              ensure your device camera has a clear view and isn't covered or
              dirty.
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
              Go to navigation settings and make sure "Voice Guidance" is
              enabled and volume is turned up. Check your device's media volume
              settings as well.
            </p>
          </div>

          <div
            class="faq-question clickable-question"
            @click="toggleQuestion('locationAccuracy')">
            <strong
              >Location accuracy is poor
              <span
                class="question-toggle"
                :class="{ expanded: openQuestions.locationAccuracy }"
                >▼</span
              ></strong
            >
            <p v-show="openQuestions.locationAccuracy">
              Make sure you're outdoors or near windows for better GPS signal.
              Enable high-accuracy location mode in your device settings and
              restart the app.
            </p>
          </div>
        </div>
      </div>

      <div class="faq-item">
        <h3 @click="toggleSection('account')" class="faq-header">
          👤 Account & Profile
          <span class="toggle-icon" :class="{ expanded: openSections.account }"
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
              Go to your profile settings by tapping your avatar, then select
              "Change Password" to update your login credentials.
            </p>
          </div>

          <div
            class="faq-question clickable-question"
            @click="toggleQuestion('navigationHistory')">
            <strong
              >How can I view my navigation history?
              <span
                class="question-toggle"
                :class="{ expanded: openQuestions.navigationHistory }"
                >▼</span
              ></strong
            >
            <p v-show="openQuestions.navigationHistory">
              Visit your profile page to see your recent destinations,
              successful arrivals, and navigation statistics.
            </p>
          </div>

          <div
            class="faq-question clickable-question"
            @click="toggleQuestion('favoriteDestinations')">
            <strong
              >Can I save favorite destinations?
              <span
                class="question-toggle"
                :class="{ expanded: openQuestions.favoriteDestinations }"
                >▼</span
              ></strong
            >
            <p v-show="openQuestions.favoriteDestinations">
              Yes! When selecting a destination, you can bookmark it for quick
              access later from your favorites list.
            </p>
          </div>
        </div>
      </div>

      <div class="faq-item">
        <h3 @click="toggleSection('notifications')" class="faq-header">
          🔔 Notifications & Updates
          <span
            class="toggle-icon"
            :class="{ expanded: openSections.notifications }"
            >▼</span
          >
        </h3>
        <div class="faq-content" v-show="openSections.notifications">
          <div
            class="faq-question clickable-question"
            @click="toggleQuestion('notificationAlerts')">
            <strong
              >How do notification alerts work?
              <span
                class="question-toggle"
                :class="{ expanded: openQuestions.notificationAlerts }"
                >▼</span
              ></strong
            >
            <p v-show="openQuestions.notificationAlerts">
              You'll receive notifications about new landmarks, navigation
              updates, and system announcements. Tap on notifications to start
              navigation to new locations.
            </p>
          </div>

          <div
            class="faq-question clickable-question"
            @click="toggleQuestion('disableNotifications')">
            <strong
              >Can I disable notifications?
              <span
                class="question-toggle"
                :class="{ expanded: openQuestions.disableNotifications }"
                >▼</span
              ></strong
            >
            <p v-show="openQuestions.disableNotifications">
              Yes, you can manage notification preferences in your device
              settings under app notifications, or contact support to adjust
              server-side notifications.
            </p>
          </div>
        </div>
      </div>

      <div class="faq-item">
        <h3 @click="toggleSection('support')" class="faq-header">
          📞 Support & Contact
          <span class="toggle-icon" :class="{ expanded: openSections.support }"
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
              Use the support form below to send us a message. We typically
              respond within 24 hours during business days.
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
              We love hearing from our users! Use the feedback form below to
              share your ideas, report bugs, or suggest new features.
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
              Yes, we take privacy seriously. Location data is only used for
              navigation purposes and is not shared with third parties. Check
              our privacy policy for full details.
            </p>
          </div>
        </div>
      </div>
    </section>
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
    <section class="feedback-section">
      <h2>Send Feedback</h2>
      <form @submit.prevent="submitFeedback">
        <input
          v-model="feedbackForm.email"
          type="email"
          placeholder="Your Email"
          readonly
          required />

        <!-- Star Rating System -->
        <div class="rating-section">
          <label class="rating-label">Rate your experience:</label>
          <div class="star-rating">
            <span
              v-for="star in 5"
              :key="star"
              class="star"
              :class="{
                filled: star <= feedbackForm.rating,
                hovered: star <= hoveredStar,
              }"
              @click="setRating(star)"
              @mouseenter="hoveredStar = star"
              @mouseleave="hoveredStar = 0"
              title="Rate {{ star }} star{{ star > 1 ? 's' : '' }}">
              ★
            </span>
          </div>
          <span class="rating-text">{{
            getRatingText(feedbackForm.rating)
          }}</span>
        </div>

        <textarea
          v-model="feedbackForm.message"
          placeholder="Your feedback..."
          required></textarea>
        <button type="submit" :disabled="!feedbackForm.rating">
          Send Feedback
        </button>
      </form>
      <div v-if="feedbackSuccess" class="success-message">
        Thank you for your feedback!
      </div>
    </section>
  </div>
</template>

<script>
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  name: "HelpCenter",
  data() {
    return {
      supportForm: { email: "", message: "" },
      feedbackForm: { email: "", message: "", rating: 0 },
      supportSuccess: false,
      feedbackSuccess: false,
      hoveredStar: 0,
      // FAQ section visibility
      openSections: {
        gettingStarted: false,
        arFeatures: false,
        troubleshooting: false,
        account: false,
        notifications: false,
        support: false,
      },
      // Individual question visibility
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
        provideFeedback: false,
        locationPrivacy: false,
      },
    };
  },
  mounted() {
    // Get current user's email and pre-populate forms
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && user.email) {
      this.supportForm.email = user.email;
      this.feedbackForm.email = user.email;
    }
  },
  methods: {
    setRating(rating) {
      this.feedbackForm.rating = rating;
    },
    getRatingText(rating) {
      const ratingTexts = {
        0: "Please select a rating",
        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Very Good",
        5: "Excellent",
      };
      return ratingTexts[rating] || "";
    },
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
      // Only clear the message, keep the email
      this.supportForm.message = "";
      this.supportSuccess = true;
      setTimeout(() => (this.supportSuccess = false), 3000);
    },
    async submitFeedback() {
      const db = getFirestore();
      await addDoc(collection(db, "feedback"), {
        email: this.feedbackForm.email,
        message: this.feedbackForm.message,
        rating: this.feedbackForm.rating,
        createdAt: serverTimestamp(),
      });
      // Only clear the message and rating, keep the email
      this.feedbackForm.message = "";
      this.feedbackForm.rating = 0;
      this.hoveredStar = 0;
      this.feedbackSuccess = true;
      setTimeout(() => (this.feedbackSuccess = false), 3000);
    },
  },
};
</script>

<style scoped>
.help-center-container {
  max-width: 800px;
  margin: 40px auto;
  background: var(--bg-secondary, #fff);
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

h1 {
  color: var(--text-primary, #1a1a1a);
  margin-bottom: 32px;
  text-align: center;
  font-size: 2.2rem;
  font-weight: 700;
}

h2 {
  color: var(--text-primary, #1a1a1a);
  margin-bottom: 24px;
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 3px solid var(--accent-color, #1976d2);
  padding-bottom: 8px;
}

.faq-section,
.support-section,
.feedback-section {
  margin-bottom: 40px;
}

/* FAQ Styling */
.faq-item {
  margin-bottom: 32px;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-primary, #fafafa);
}

.faq-item h3,
.faq-header {
  background: linear-gradient(135deg, var(--accent-color, #1976d2), #1565c0);
  color: white;
  margin: 0;
  padding: 16px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.faq-header:hover {
  background: linear-gradient(135deg, #1565c0, #0d47a1);
}

.toggle-icon {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.faq-content {
  padding: 20px;
  transition: all 0.3s ease;
}

.faq-question {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light, #f0f0f0);
}

.faq-question:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.clickable-question {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 12px;
  margin: -12px;
  margin-bottom: 8px;
}

.clickable-question:hover {
  background: rgba(25, 118, 210, 0.05);
}

.faq-question strong {
  color: var(--text-primary, #1a1a1a);
  font-size: 1.05rem;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.question-toggle {
  font-size: 0.7rem;
  transition: transform 0.3s ease;
  color: var(--accent-color, #1976d2);
}

.question-toggle.expanded {
  transform: rotate(180deg);
}

.faq-question p {
  color: var(--text-secondary, #666);
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
  margin-top: 8px;
}

/* Star Rating Styling */
.rating-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-label {
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
  font-size: 1rem;
  margin-bottom: 4px;
}

.star-rating {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-bottom: 8px;
}

.star {
  font-size: 2rem;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  line-height: 1;
}

.star:hover {
  transform: scale(1.1);
}

.star.filled,
.star.hovered {
  color: #ffd700;
  text-shadow: 0 0 4px rgba(255, 215, 0, 0.3);
}

.rating-text {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  font-weight: 500;
  min-height: 20px;
}

/* Form Styling */
form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--bg-primary, #fafafa);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid var(--border-color, #e0e0e0);
}

input,
textarea {
  padding: 14px 16px;
  border: 2px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--bg-secondary, #fff);
  color: var(--text-primary, #1a1a1a);
}

input[readonly] {
  background: var(--bg-primary, #f5f5f5);
  color: var(--text-secondary, #666);
  cursor: not-allowed;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--accent-color, #1976d2);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

textarea {
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
}

button {
  background: linear-gradient(135deg, var(--accent-color, #1976d2), #1565c0);
  color: #fff;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

button:hover {
  background: linear-gradient(135deg, #1565c0, #0d47a1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(25, 118, 210, 0.3);
}

button:active {
  transform: translateY(0);
}

/* Disabled button styling */
button:disabled {
  background: #ccc !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

button:disabled:hover {
  background: #ccc !important;
  transform: none !important;
  box-shadow: none !important;
}

.success-message {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 12px;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .help-center-container {
    background: var(--bg-secondary, #1e1e1e);
    color: var(--text-primary, #fff);
  }

  .faq-item {
    background: var(--bg-primary, #2a2a2a);
    border-color: var(--border-color, #404040);
  }

  form {
    background: var(--bg-primary, #2a2a2a);
    border-color: var(--border-color, #404040);
  }

  input,
  textarea {
    background: var(--bg-secondary, #1e1e1e);
    border-color: var(--border-color, #404040);
    color: var(--text-primary, #fff);
  }

  input[readonly] {
    background: var(--bg-primary, #2a2a2a);
    color: var(--text-secondary, #999);
  }

  .rating-label {
    color: var(--text-primary, #fff);
  }

  .rating-text {
    color: var(--text-secondary, #ccc);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .help-center-container {
    margin: 20px;
    padding: 24px;
  }

  h1 {
    font-size: 1.8rem;
  }

  h2 {
    font-size: 1.3rem;
  }

  .faq-item h3 {
    font-size: 1rem;
    padding: 14px 16px;
  }

  .faq-content {
    padding: 16px;
  }

  .faq-question strong {
    font-size: 1rem;
  }

  .faq-question p {
    font-size: 0.9rem;
  }

  form {
    padding: 20px;
  }

  input,
  textarea {
    padding: 12px 14px;
    font-size: 0.95rem;
  }

  button {
    padding: 12px 20px;
    font-size: 0.95rem;
  }
}
</style>
