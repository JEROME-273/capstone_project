<template>
  <div class="verify-email-container">
    <div class="verify-card">
      <h1>Email Verification</h1>

      <div v-if="loading" class="loading-spinner"></div>

      <div v-else>
        <p class="message">
          {{ message }}
        </p>

        <div class="actions">
          <button
            v-if="!verified"
            @click="resendVerificationEmail"
            class="resend-btn">
            Resend Verification Email
          </button>

          <button
            v-if="!verified"
            @click="checkVerificationStatus"
            class="check-btn">
            I've Verified My Email
          </button>

          <button v-if="verified" @click="goToHome" class="continue-btn">
            Continue to App
          </button>

          <button @click="goToLogin" class="login-btn">Back to Login</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getAuth,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

export default {
  name: "VerifyEmail",

  data() {
    return {
      loading: true,
      verified: false,
      message: "Please check your email for a verification link.",
      user: null,
      auth: null,
      db: null,
      userDoc: null,
    };
  },

  created() {
    this.auth = getAuth();
    this.db = getFirestore();

    // Check if user is logged in and verification status
    this.checkAuthState();
  },

  methods: {
    async checkAuthState() {
      this.loading = true;

      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          this.user = user;

          try {
            // Get user document from Firestore
            const userDocRef = doc(this.db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              this.userDoc = userDocSnap.data();
              console.log("User document:", this.userDoc);
              console.log(
                "Firestore emailVerified:",
                this.userDoc.emailVerified
              );
              console.log("Firebase Auth emailVerified:", user.emailVerified);
              console.log("Admin created:", this.userDoc.adminCreated);
            }

            // Force refresh to get the latest user data from Firebase Auth
            await user.reload();

            // Check verification status - prioritize Firestore for admin-created accounts
            const isFirestoreVerified = this.userDoc?.emailVerified === true;
            const isAuthVerified = user.emailVerified;
            const isAdminCreated = this.userDoc?.adminCreated === true;

            console.log("Verification check:", {
              isFirestoreVerified,
              isAuthVerified,
              isAdminCreated,
            });

            // User is considered verified if either method says verified
            if (isAuthVerified || isFirestoreVerified) {
              this.verified = true;

              if (isAdminCreated) {
                this.message =
                  "Your account has been verified by an administrator. Welcome!";
              } else {
                this.message = "Your email has been verified successfully!";
              }

              // Ensure both Firebase Auth and Firestore are in sync
              if (isFirestoreVerified && !isAuthVerified) {
                console.log("Syncing verification status...");
                await updateDoc(userDocRef, {
                  emailVerified: true,
                  verificationSyncedAt: new Date(),
                });
              }

              // Auto-redirect after 2 seconds if verified
              setTimeout(() => {
                this.goToHome();
              }, 2000);
            } else {
              this.verified = false;
              if (isAdminCreated) {
                this.message = `Your account was created by an administrator. You can continue to the app or verify your email at ${user.email} for additional security.`;
              } else {
                this.message = `We've sent a verification email to ${user.email}. Please check your inbox and spam folder.`;
              }
            }
          } catch (error) {
            console.error("Error checking user document:", error);
            // Fallback to Firebase Auth verification only
            if (user.emailVerified) {
              this.verified = true;
              this.message = "Your email has been verified successfully!";

              setTimeout(() => {
                this.goToHome();
              }, 2000);
            } else {
              this.verified = false;
              this.message = `We've sent a verification email to ${user.email}. Please check your inbox and spam folder.`;
            }
          }
        } else {
          // No user is signed in
          this.message = "You need to be logged in to verify your email.";
          this.$router.push("/register");
        }

        this.loading = false;
      });
    },

    async resendVerificationEmail() {
      if (!this.user) {
        this.message = "You need to be logged in to verify your email.";
        return;
      }

      this.loading = true;

      try {
        await sendEmailVerification(this.user);
        this.message =
          "Verification email has been resent. Please check your inbox.";
      } catch (error) {
        this.message = `Error sending verification email: ${error.message}`;
        console.error("Error sending verification email:", error);
      } finally {
        this.loading = false;
      }
    },

    async checkVerificationStatus() {
      if (!this.user) {
        this.message = "You need to be logged in to verify your email.";
        return;
      }

      this.loading = true;

      try {
        // Reload user to get fresh data from Firebase
        await this.user.reload();

        // Also check Firestore document
        const userDocRef = doc(this.db, "users", this.user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let firestoreVerified = false;
        if (userDocSnap.exists()) {
          firestoreVerified = userDocSnap.data().emailVerified === true;
        }

        if (this.user.emailVerified || firestoreVerified) {
          this.verified = true;
          this.message = "Your email has been verified successfully!";

          // Update Firestore document to ensure consistency
          await updateDoc(userDocRef, {
            emailVerified: true,
            lastVerificationCheck: new Date(),
          });

          // Auto-redirect after verification
          setTimeout(() => {
            this.goToHome();
          }, 1500);
        } else {
          this.message =
            "Your email is not verified yet. Please check your inbox and click the verification link.";
        }
      } catch (error) {
        this.message = `Error checking verification status: ${error.message}`;
        console.error("Error checking verification status:", error);
      } finally {
        this.loading = false;
      }
    },

    goToHome() {
      console.log(
        "Redirecting to home - auth middleware will handle role-based routing"
      );
      // Simply redirect to home - the auth middleware will handle role-based redirection
      this.$router.push("/homepage");
    },

    async goToLogin() {
      try {
        // Sign out the user first to avoid auth middleware redirection
        await signOut(this.auth);
        this.$router.push("/register");
      } catch (error) {
        console.error("Error signing out:", error);
        // If sign out fails, still try to redirect
        this.$router.push("/register");
      }
    },
  },
};
</script>

<style scoped>
.verify-email-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.verify-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 500px;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.message {
  margin-bottom: 30px;
  color: #555;
  line-height: 1.6;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.resend-btn {
  background-color: #3498db;
  color: white;
}

.resend-btn:hover {
  background-color: #2980b9;
}

.check-btn {
  background-color: #2ecc71;
  color: white;
}

.check-btn:hover {
  background-color: #27ae60;
}

.continue-btn {
  background-color: #2ecc71;
  color: white;
}

.continue-btn:hover {
  background-color: #27ae60;
}

.login-btn {
  background-color: #ecf0f1;
  color: #333;
}

.login-btn:hover {
  background-color: #bdc3c7;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
  margin: 20px auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===========================
   RESPONSIVE STYLES
   =========================== */

/* Tablet */
@media (max-width: 768px) {
  .verify-email-container {
    padding: 20px 15px;
  }

  .verify-card {
    padding: 30px 20px;
    margin: 20px 0;
    max-width: 90%;
  }

  h1 {
    font-size: 24px;
  }

  .message {
    font-size: 15px;
  }

  .actions {
    flex-direction: column;
    gap: 12px;
  }

  .resend-btn,
  .check-btn,
  .continue-btn,
  .login-btn {
    width: 100%;
    padding: 12px;
    font-size: 15px;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .verify-email-container {
    padding: 15px 10px;
    min-height: 100vh;
  }

  .verify-card {
    padding: 25px 15px;
    margin: 10px 0;
    max-width: 95%;
    border-radius: 8px;
  }

  h1 {
    font-size: 22px;
    margin-bottom: 15px;
  }

  .message {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 20px;
  }

  .actions {
    gap: 10px;
  }

  .resend-btn,
  .check-btn,
  .continue-btn,
  .login-btn {
    padding: 14px 12px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 44px; /* Touch target size */
    border-radius: 6px;
  }

  .loading-spinner {
    width: 30px;
    height: 30px;
    border-width: 3px;
  }
}

/* Small mobile */
@media (max-width: 360px) {
  .verify-card {
    padding: 20px 12px;
    margin: 5px 0;
  }

  h1 {
    font-size: 20px;
  }

  .message {
    font-size: 13px;
  }

  .resend-btn,
  .check-btn,
  .continue-btn,
  .login-btn {
    padding: 12px;
    font-size: 15px;
  }
}

/* Landscape orientation */
@media (max-height: 500px) and (orientation: landscape) {
  .verify-email-container {
    padding: 10px;
  }

  .verify-card {
    padding: 15px;
    margin: 5px 0;
    max-height: 90vh;
    overflow-y: auto;
  }

  h1 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .message {
    margin-bottom: 15px;
  }

  .actions {
    gap: 8px;
  }

  .resend-btn,
  .check-btn,
  .continue-btn,
  .login-btn {
    padding: 8px 12px;
    font-size: 14px;
  }
}
</style>
