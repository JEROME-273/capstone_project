<script setup>
import { useRouter, useRoute } from "vue-router";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onMounted, computed } from "vue";

// Create reactive state
const isAuthenticated = ref(false);
const showLogoutConfirm = ref(false);
const router = useRouter();
const route = useRoute();

// Computed property to determine if logout button should be shown
const showLogoutButton = computed(() => {
  return (
    isAuthenticated.value &&
    route.name !== "register" &&
    route.name !== "VerifyEmail" &&
    route.name !== "loading"
  );
});

// Setup auth state listener
onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    isAuthenticated.value = !!user;
  });
});

// Show logout confirmation
const showLogoutConfirmation = () => {
  showLogoutConfirm.value = true;
};

// Cancel logout
const cancelLogout = () => {
  showLogoutConfirm.value = false;
};

// Confirm logout function
const confirmLogout = async () => {
  const auth = getAuth();
  try {
    await signOut(auth);
    localStorage.removeItem("user");
    showLogoutConfirm.value = false;
    router.push("register");
  } catch (error) {
    console.error("Error signing out:", error);
    showLogoutConfirm.value = false;
  }
};
</script>

<template>
  <div>
    <button v-if="showLogoutButton" @click="showLogoutConfirmation" class="logout-button">
      Logout
    </button>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutConfirm" class="logout-modal-overlay" @click="cancelLogout">
      <div class="logout-modal" @click.stop>
        <div class="logout-modal-header">
          <h3>Confirm Logout</h3>
        </div>
        <div class="logout-modal-body">
          <p>Are you sure you want to logout?</p>
          <p class="logout-warning">You will need to sign in again to access your account.</p>
        </div>
        <div class="logout-modal-footer">
          <button @click="cancelLogout" class="cancel-button">
            Cancel
          </button>
          <button @click="confirmLogout" class="confirm-logout-button">
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logout-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.logout-button:hover {
  background-color: #c0392b;
}

/* Logout Confirmation Modal Styles */
.logout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-out;
}

.logout-modal {
  background: #ffffff;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: slideInUp 0.3s ease-out;
  overflow: hidden;
}

.logout-modal-header {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.logout-modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.logout-modal-body {
  padding: 24px;
  text-align: center;
}

.logout-modal-body p {
  margin: 0 0 12px 0;
  font-size: 1rem;
  color: #333;
}

.logout-warning {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.logout-modal-footer {
  padding: 20px 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
  background: #f8f9fa;
}

.cancel-button {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  flex: 1;
}

.cancel-button:hover {
  background: #5a6268;
}

.confirm-logout-button {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  flex: 1;
}

.confirm-logout-button:hover {
  background: #c0392b;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .logout-modal {
    margin: 20px;
    max-width: none;
  }
  
  .logout-modal-footer {
    flex-direction: column;
  }
  
  .cancel-button,
  .confirm-logout-button {
    flex: none;
    width: 100%;
  }
}
</style>
