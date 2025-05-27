<template>
  <div class="help-center-container">
    <h1>Help Center & Customer Support</h1>
    <section class="faq-section">
      <h2>Frequently Asked Questions</h2>
      <ul>
        <li>
          <strong>How do I reset my password?</strong> <br />Go to your profile
          settings and click "Reset Password".
        </li>
        <li>
          <strong>How do I contact support?</strong> <br />Use the form below to
          submit a support request.
        </li>
        <li>
          <strong>How do I provide feedback?</strong> <br />Fill out the
          feedback form below.
        </li>
      </ul>
    </section>
    <section class="support-section">
      <h2>Submit a Support Request</h2>
      <form @submit.prevent="submitSupportRequest">
        <input
          v-model="supportForm.email"
          type="email"
          placeholder="Your Email"
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
          required />
        <textarea
          v-model="feedbackForm.message"
          placeholder="Your feedback..."
          required></textarea>
        <button type="submit">Send Feedback</button>
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

export default {
  name: "HelpCenter",
  data() {
    return {
      supportForm: { email: "", message: "" },
      feedbackForm: { email: "", message: "" },
      supportSuccess: false,
      feedbackSuccess: false,
    };
  },
  methods: {
    async submitSupportRequest() {
      const db = getFirestore();
      await addDoc(collection(db, "support_requests"), {
        email: this.supportForm.email,
        message: this.supportForm.message,
        createdAt: serverTimestamp(),
      });
      this.supportForm = { email: "", message: "" };
      this.supportSuccess = true;
      setTimeout(() => (this.supportSuccess = false), 3000);
    },
    async submitFeedback() {
      const db = getFirestore();
      await addDoc(collection(db, "feedback"), {
        email: this.feedbackForm.email,
        message: this.feedbackForm.message,
        createdAt: serverTimestamp(),
      });
      this.feedbackForm = { email: "", message: "" };
      this.feedbackSuccess = true;
      setTimeout(() => (this.feedbackSuccess = false), 3000);
    },
  },
};
</script>

<style scoped>
.help-center-container {
  max-width: 600px;
  margin: 40px auto;
  background: var(--bg-secondary, #fff);
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.faq-section,
.support-section,
.feedback-section {
  margin-bottom: 32px;
}
.faq-section ul {
  padding-left: 20px;
}
.faq-section li {
  margin-bottom: 12px;
}
form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
input,
textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  background: #1976d2;
  color: #fff;
  border: none;
  padding: 10px 0;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
.success-message {
  color: #388e3c;
  margin-top: 8px;
}
</style>
