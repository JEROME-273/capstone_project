<script setup>
import { useRouter, useRoute } from "vue-router";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onMounted, computed } from "vue";

// Create reactive state
const isAuthenticated = ref(false);
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

// Logout function
const logout = async () => {
  const auth = getAuth();
  try {
    await signOut(auth);
    localStorage.removeItem("user");
    router.push("/");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
</script>

<template>
  <button v-if="showLogoutButton" @click="logout" class="logout-button">
    Logout
  </button>
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
</style>
