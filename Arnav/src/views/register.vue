<template>
  <!-- Logo and Welcome Text Section (Visible on both Sign In and Sign Up) -->
  <div class="signin-header">
    <img
      src="../assets/inavparklogo1.png"
      alt="InavPark Logo"
      class="signin-logo" />
    <div class="signin-welcome-text">
      <p v-if="!isSignUpActive">
        Welcome back! Please sign in to your account.
      </p>
      <p v-else>Join us today! Create your account below.</p>
    </div>
  </div>

  <div class="auth-container">
    <!-- Toast Component -->
    <div
      class="toast"
      :class="{
        'toast-visible': isToastVisible,
        'toast-success': toastType === 'success',
        'toast-error': toastType === 'error',
      }">
      <div class="toast-content">
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </div>

    <div class="container" :class="{ active: isSignUpActive }">
      <!-- Sign Up Form -->
      <div class="form-container sign-up">
        <form @submit.prevent="register" class="form-content">
          <h1 class="form-title">Create Account</h1>
          <p class="form-subtitle">Register with your personal details</p>

          <div class="form-grid">
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <div class="input-with-icon">
                <i class="icon user-icon"></i>
                <input
                  v-model="lastName"
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  required />
              </div>
            </div>

            <div class="form-group">
              <label for="firstName">First Name</label>
              <div class="input-with-icon">
                <i class="icon user-icon"></i>
                <input
                  v-model="firstName"
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  required />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="middleName">Middle Name</label>
            <div class="input-with-icon">
              <i class="icon user-icon"></i>
              <input
                v-model="middleName"
                id="middleName"
                type="text"
                placeholder="Middle Name"
                required />
            </div>
          </div>

          <div class="form-group">
            <label for="email">E-mail</label>
            <div class="input-with-icon">
              <i class="icon email-icon"></i>
              <input
                v-model="email"
                id="email"
                type="email"
                placeholder="Email"
                required
                title="Please enter a valid email" />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="gender">Gender</label>
              <div class="select-wrapper">
                <select v-model="gender" id="gender" required>
                  <option value="" disabled selected>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="typeofvisit">Type of Visit</label>
              <div class="select-wrapper">
                <select v-model="typeofvisit" id="typeofvisit" required>
                  <option value="" disabled selected>Select Type</option>
                  <option value="Visitor">Visitor</option>
                  <option value="Research">Research</option>
                  <option value="Business">Business</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ✅ Fixed Password -->
          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-container">
              <i class="icon lock-icon"></i>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                placeholder="Password"
                minlength="6"
                required />
              <i
                class="visibility-icon"
                :class="showPassword ? 'eye-off-icon' : 'eye-icon'"
                @click="togglePassword"></i>
            </div>
          </div>

          <!-- ✅ Fixed Confirm Password -->
          <div class="form-group">
            <label for="confirmpassword">Confirm Password</label>
            <div class="password-container">
              <i class="icon lock-icon"></i>
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmpassword"
                v-model="confirmpassword"
                placeholder="Confirm Password"
                required />
              <i
                class="visibility-icon"
                :class="showConfirmPassword ? 'eye-off-icon' : 'eye-icon'"
                @click="toggleConfirmPassword"></i>
            </div>
          </div>

          <button type="submit" class="submit-button" :disabled="loading">
            {{ loading ? "Signing Up..." : "Sign Up" }}
          </button>

          <!-- Mobile Toggle Link -->
          <div class="mobile-toggle">
            <p>
              Already have an account?
              <a href="#" @click.prevent="isSignUpActive = false">Sign In</a>
            </p>
          </div>
        </form>
      </div>

      <!-- Sign In Form -->
      <div class="form-container sign-in">
        <form @submit.prevent="login" class="form-content">
          <h1 class="form-title">Sign In</h1>

          <!-- Lockout Warning -->
          <div v-if="isLockedOut" class="lockout-warning">
            <div class="lockout-icon">🔒</div>
            <p><strong>Account Temporarily Locked</strong></p>
            <p>Too many failed attempts. Please try again in:</p>
            <div class="countdown-timer">
              {{ formatTime(lockoutTimeRemaining) }}
            </div>
          </div>

          <div class="form-group">
            <label for="loginEmail">Email</label>
            <div class="input-with-icon">
              <i class="icon email-icon"></i>
              <input
                v-model="email"
                id="loginEmail"
                type="email"
                placeholder="Email"
                :disabled="isLockedOut"
                required />
            </div>
          </div>

          <!-- ✅ Fixed Sign In Password -->
          <div class="form-group">
            <label for="loginPassword">Password</label>
            <div class="password-container">
              <i class="icon lock-icon"></i>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="loginPassword"
                v-model="password"
                placeholder="Password"
                :disabled="isLockedOut"
                required />
              <i
                class="visibility-icon"
                :class="showPassword ? 'eye-off-icon' : 'eye-icon'"
                :style="{ pointerEvents: isLockedOut ? 'none' : 'auto' }"
                @click="togglePassword"></i>
            </div>
          </div>

          <div class="forgot-password">
            <a
              href="#"
              @click.prevent="forgotPassword"
              :class="{ disabled: isLockedOut }">
              Forgot Password?
            </a>
          </div>

          <div
            v-if="failedAttempts > 0 && !isLockedOut"
            class="attempts-warning">
            <div class="warning-icon">⚠️</div>
            <p>
              <strong>{{ 5 - failedAttempts }} attempts remaining</strong>
            </p>
            <p>
              Account will be locked for 5 minutes after
              {{ 5 - failedAttempts }} more failed
              {{ 5 - failedAttempts === 1 ? "attempt" : "attempts" }}
            </p>
          </div>

          <button
            type="submit"
            class="submit-button"
            :disabled="loading || isLockedOut">
            <span v-if="loading">Signing In...</span>
            <span v-else-if="isLockedOut">🔒 Account Locked</span>
            <span v-else>Sign In</span>
          </button>

          <div class="mobile-toggle">
            <p>
              Don't have an account?
              <a href="#" @click.prevent="isSignUpActive = true">Sign Up</a>
            </p>
          </div>
        </form>
      </div>

      <!-- Toggle Container (Desktop Only) -->
      <div class="toggle-container">
        <div class="toggle">
          <div class="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all site features</p>
            <button @click="isSignUpActive = false" class="toggle-button">
              Sign In
            </button>
          </div>
          <div class="toggle-panel toggle-right">
            <h1>Hello, Friend!</h1>
            <p>Register with your personal details to use all site features</p>
            <button @click="isSignUpActive = true" class="toggle-button">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import "../assets/register.css"; // Import the CSS file

export default {
  name: "RegisterPage",

  data() {
    return {
      // Sign Up Form Data
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      password: "",
      confirmpassword: "",
      gender: "",
      typeofvisit: "",
      showPassword: false,
      showConfirmPassword: false,

      // UI State
      isSignUpActive: false,
      loading: false,

      // Toast
      toastMessage: "",
      isToastVisible: false,
      toastType: "success", // success or error

      // Firebase
      auth: null,
      db: null,

      // Login attempt tracking
      failedAttempts: 0,
      lockoutTime: null,
      lockoutTimeRemaining: 0,
      isLockedOut: false,
      lockoutTimer: null,
    };
  },

  created() {
    // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyBTylfFz4_JcbvSlDof4YTf-yDVHPY_swk",
      authDomain: "ar-path-3eb94.firebaseapp.com",
      projectId: "ar-path-3eb94",
      storageBucket: "ar-path-3eb94.appspot.com",
      messagingSenderId: "314906875610",
      appId: "1:314906875610:web:02edf761141fa1aa8677e3",
      measurementId: "G-V7PCV8YV9P",
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    this.db = getFirestore(app);
  },

  mounted() {
    this.checkLockoutStatus();
  },

  beforeUnmount() {
    if (this.lockoutTimer) {
      clearInterval(this.lockoutTimer);
    }
  },

  methods: {
    // Show toast message
    showToast(message, type = "success") {
      this.toastMessage = message;
      this.toastType = type;
      this.isToastVisible = true;

      setTimeout(() => {
        this.isToastVisible = false;
      }, 3000); // Hide toast after 3 seconds
    },

    // Toggle password visibility
    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },

    // Clear form fields
    clearFields() {
      this.firstName = "";
      this.lastName = "";
      this.middleName = "";
      this.email = "";
      this.password = "";
      this.confirmpassword = "";
      this.gender = "";
      this.typeofvisit = "";
    },

    // Check if user is currently locked out
    checkLockoutStatus() {
      const lockoutData = localStorage.getItem("loginLockout");
      if (lockoutData) {
        const { attempts, lockoutTime } = JSON.parse(lockoutData);
        this.failedAttempts = attempts || 0;

        if (lockoutTime) {
          const now = Date.now();
          const lockoutEnd = new Date(lockoutTime).getTime() + 2 * 60 * 1000; // 5 minutes

          if (now < lockoutEnd) {
            this.isLockedOut = true;
            this.lockoutTimeRemaining = Math.ceil((lockoutEnd - now) / 1000);
            this.startLockoutTimer();
          } else {
            // Lockout period has expired
            this.resetLoginAttempts();
          }
        }
      }
    },

    // Start countdown timer for lockout period
    startLockoutTimer() {
      if (this.lockoutTimer) {
        clearInterval(this.lockoutTimer);
      }

      this.lockoutTimer = setInterval(() => {
        this.lockoutTimeRemaining--;

        if (this.lockoutTimeRemaining <= 0) {
          this.isLockedOut = false;
          this.resetLoginAttempts();
          clearInterval(this.lockoutTimer);
          this.lockoutTimer = null;
          this.showToast(
            "Account unlocked. You may now try logging in again.",
            "success"
          );
        }
      }, 1000);
    },

    // Format time for display (mm:ss)
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    },

    // Reset login attempts counter
    resetLoginAttempts() {
      this.failedAttempts = 0;
      this.lockoutTime = null;
      this.isLockedOut = false;
      localStorage.removeItem("loginLockout");

      if (this.lockoutTimer) {
        clearInterval(this.lockoutTimer);
        this.lockoutTimer = null;
      }
    },

    // Record failed login attempt
    recordFailedAttempt() {
      this.failedAttempts++;

      if (this.failedAttempts >= 5) {
        // Lock out user for 5 minutes
        this.lockoutTime = new Date().toISOString();
        this.isLockedOut = true;
        this.lockoutTimeRemaining = 2 * 60; // 5 minutes in seconds

        localStorage.setItem(
          "loginLockout",
          JSON.stringify({
            attempts: this.failedAttempts,
            lockoutTime: this.lockoutTime,
          })
        );

        // Clear any existing fields and show lockout immediately
        this.password = "";
        this.startLockoutTimer();
        this.showToast(
          "Too many failed attempts. Account locked for 2 minutes.",
          "error"
        );
      } else {
        // Save current attempt count
        localStorage.setItem(
          "loginLockout",
          JSON.stringify({
            attempts: this.failedAttempts,
            lockoutTime: null,
          })
        );

        const remaining = 5 - this.failedAttempts;
        this.showToast(
          `Invalid credentials. ${remaining} ${
            remaining === 1 ? "attempt" : "attempts"
          } remaining before lockout.`,
          "error"
        );
      }
    },

    // Handle Sign Up with Firebase
    async register() {
      // Validate passwords match
      if (this.password !== this.confirmpassword) {
        this.showToast("Passwords do not match!", "error");
        return;
      }

      this.loading = true;

      try {
        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          this.auth,
          this.email,
          this.password
        );

        const user = userCredential.user;

        // Send email verification
        await sendEmailVerification(user);

        // Gather environment / device metadata
        const deviceType = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
          ? "Mobile"
          : /Tablet|iPad/i.test(navigator.userAgent)
          ? "Tablet"
          : "Desktop";

        const screenResolution = `${window.screen.width}x${window.screen.height}`;

        // Store additional user data in Firestore (use serverTimestamp for consistency)
        await setDoc(doc(this.db, "users", user.uid), {
          firstName: this.firstName,
          lastName: this.lastName,
          middleName: this.middleName,
          email: this.email,
          gender: this.gender,
          typeofvisit: this.typeofvisit,
          role: "user", // Default role
          emailVerified: false,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(), // initial login time treated same as registration
          deviceType,
          platform: navigator.platform || null,
          screenResolution,
          userAgent: navigator.userAgent,
        });

        this.showToast(
          "Registration successful! Please check your email for verification.",
          "success"
        );
        this.clearFields();
        this.isSignUpActive = false; // Switch to Sign In form
      } catch (error) {
        let errorMessage = "Registration failed. Please try again.";

        // Handle specific Firebase errors
        if (error.code === "auth/email-already-in-use") {
          errorMessage =
            "Email is already in use. Please use a different email.";
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "Invalid email format.";
        } else if (error.code === "auth/weak-password") {
          errorMessage =
            "Password is too weak. Please use at least 6 characters.";
        }

        this.showToast(errorMessage, "error");
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // Handle Sign In with Firebase - UPDATED
    async login() {
      // Check if user is locked out
      if (this.isLockedOut) {
        this.showToast(
          `Account locked. Please wait ${this.formatTime(
            this.lockoutTimeRemaining
          )}.`,
          "error"
        );
        return;
      }

      this.loading = true;

      try {
        // Sign in with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(
          this.auth,
          this.email,
          this.password
        );

        const user = userCredential.user;

        // Get user data from Firestore
        const userDoc = await getDoc(doc(this.db, "users", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Check verification status
          const isAuthVerified = user.emailVerified;
          const isFirestoreVerified = userData.emailVerified === true;

          if (!isAuthVerified && !isFirestoreVerified) {
            this.showToast(
              "Please verify your email before logging in.",
              "error"
            );
            this.$router.push("/verify-email");
            return;
          }

          // Reset failed attempts on successful login
          this.resetLoginAttempts();

          // Update lastLoginAt + environment snapshot & sync emailVerified if needed
          try {
            const updates = {
              lastLoginAt: serverTimestamp(),
              deviceType: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
                ? "Mobile"
                : /Tablet|iPad/i.test(navigator.userAgent)
                ? "Tablet"
                : "Desktop",
              platform: navigator.platform || null,
              screenResolution: `${window.screen.width}x${window.screen.height}`,
              userAgent: navigator.userAgent,
            };
            if (
              (user.emailVerified || userData.emailVerified) &&
              !userData.emailVerified
            ) {
              updates.emailVerified = true;
            }
            await updateDoc(doc(this.db, "users", user.uid), updates);
            // Record login history & generic event
            try {
              const { logLogin } = await import(
                "@/services/AnalyticsService.js"
              );
              await logLogin();
            } catch (e) {
              console.warn("logLogin failed or service unavailable", e);
            }
          } catch (metaErr) {
            console.warn("Failed to update login metadata:", metaErr);
          }

          // Store user data in localStorage
          localStorage.setItem(
            "user",
            JSON.stringify({
              uid: user.uid,
              email: user.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role,
              emailVerified: isAuthVerified || isFirestoreVerified,
              adminCreated: userData.adminCreated || false,
            })
          );

          this.showToast("Login successful!", "success");

          // Redirect based on user role
          setTimeout(() => {
            if (userData.role === "admin") {
              this.$router.push("/admin-dashboard");
            } else {
              this.$router.push("/homepage");
            }
          }, 1000);
        } else {
          // User not found in Firestore - sign out and record failed attempt
          try {
            await this.auth.signOut();
            console.log("User signed out due to missing Firestore document");
          } catch (signOutError) {
            console.error("Error signing out user:", signOutError);
          }
          this.recordFailedAttempt();
        }
      } catch (error) {
        console.error("Login error:", error);

        // Handle authentication errors by recording failed attempts
        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password" ||
          error.code === "auth/invalid-email" ||
          error.code === "auth/invalid-credential" ||
          error.code === "auth/user-disabled"
        ) {
          this.recordFailedAttempt();
        } else if (error.code === "auth/too-many-requests") {
          // Firebase's own lockout - trigger our lockout system immediately
          this.failedAttempts = 5; // Force lockout
          this.lockoutTime = new Date().toISOString();
          this.isLockedOut = true;
          this.lockoutTimeRemaining = 2 * 60; // 5 minutes in seconds

          localStorage.setItem(
            "loginLockout",
            JSON.stringify({
              attempts: this.failedAttempts,
              lockoutTime: this.lockoutTime,
            })
          );

          this.password = "";
          this.startLockoutTimer();
          this.showToast(
            "Too many requests detected. Account locked for 2 minutes.",
            "error"
          );
        } else {
          // Other errors
          this.showToast("Login failed. credentails do not match.", "error");
        }
      } finally {
        this.loading = false;
      }
    },

    // Handle forgot password with Firebase
    async forgotPassword() {
      if (this.isLockedOut) {
        this.showToast(
          "Please wait until the lockout period expires.",
          "error"
        );
        return;
      }

      if (!this.email) {
        this.showToast("Please enter your email address first.", "error");
        return;
      }

      this.loading = true;

      try {
        await sendPasswordResetEmail(this.auth, this.email);
        this.showToast(
          "Password reset email sent. Please check your inbox.",
          "success"
        );
      } catch (error) {
        let errorMessage = "Failed to send password reset email.";

        if (error.code === "auth/user-not-found") {
          errorMessage = "No account found with this email address.";
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "Invalid email format.";
        }

        this.showToast(errorMessage, "error");
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
