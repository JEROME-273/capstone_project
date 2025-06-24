<template>
  <div class="auth-container">
    <!-- Main Container -->
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
                @click="togglePassword"
                :class="[
                  'visibility-icon',
                  showPassword ? 'eye-off-icon' : 'eye-icon',
                ]"></i>
            </div>
          </div>

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
                @click="toggleConfirmPassword"
                :class="[
                  'visibility-icon',
                  showConfirmPassword ? 'eye-off-icon' : 'eye-icon',
                ]"></i>
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
          <p class="form-subtitle">
            Welcome back! Please login to your account
          </p>

          <div class="form-group">
            <label for="loginEmail">Email</label>
            <div class="input-with-icon">
              <i class="icon email-icon"></i>
              <input
                v-model="email"
                id="loginEmail"
                type="email"
                placeholder="Email"
                required />
            </div>
          </div>

          <div class="form-group">
            <label for="loginPassword">Password</label>
            <div class="password-container">
              <i class="icon lock-icon"></i>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="loginPassword"
                v-model="password"
                placeholder="Password"
                required />
              <i
                @click="togglePassword"
                :class="[
                  'visibility-icon',
                  showPassword ? 'eye-off-icon' : 'eye-icon',
                ]"></i>
            </div>
          </div>

          <div class="forgot-password">
            <a href="#" @click.prevent="forgotPassword">Forgot Password?</a>
          </div>

          <button type="submit" class="submit-button" :disabled="loading">
            {{ loading ? "Signing In..." : "Sign In" }}
          </button>

          <!-- Mobile Toggle Link -->
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
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
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

        // Store additional user data in Firestore
        await setDoc(doc(this.db, "users", user.uid), {
          firstName: this.firstName,
          lastName: this.lastName,
          middleName: this.middleName,
          email: this.email,
          gender: this.gender,
          typeofvisit: this.typeofvisit,
          role: "user", // Default role
          emailVerified: false,
          createdAt: new Date(),
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

          // Check verification status - either Firebase Auth OR Firestore
          const isAuthVerified = user.emailVerified;
          const isFirestoreVerified = userData.emailVerified === true;
          const isAdminCreated = userData.adminCreated === true;

          console.log("Login verification check:", {
            isAuthVerified,
            isFirestoreVerified,
            isAdminCreated,
            userRole: userData.role,
          });

          // If not verified by either method, redirect to verification
          if (!isAuthVerified && !isFirestoreVerified) {
            this.showToast(
              "Please verify your email before logging in.",
              "error"
            );
            this.$router.push("/verify-email");
            return;
          }

          // Store user data in localStorage for session management
          localStorage.setItem(
            "user",
            JSON.stringify({
              uid: user.uid,
              email: user.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role,
              emailVerified: isAuthVerified || isFirestoreVerified,
              adminCreated: isAdminCreated,
            })
          );

          this.showToast("Login successful!", "success");

          // Redirect based on user role
          setTimeout(() => {
            if (userData.role === "admin") {
              this.$router.push("/admin-dashboard");
            } else {
              this.$router.push("/");
            }
          }, 1000);
        } else {
          this.showToast(
            "User data not found. Please contact support.",
            "error"
          );
        }
      } catch (error) {
        let errorMessage = "Login failed. Please try again.";

        // Handle specific Firebase errors
        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password"
        ) {
          errorMessage = "Invalid email or password.";
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "Invalid email format.";
        } else if (error.code === "auth/user-disabled") {
          errorMessage = "This account has been disabled.";
        } else if (error.code === "auth/too-many-requests") {
          errorMessage =
            "Too many failed login attempts. Please try again later.";
        }

        this.showToast(errorMessage, "error");
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // Handle forgot password with Firebase
    async forgotPassword() {
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
