<template>
  <div class="loading-wrapper">
    <!-- Background -->
    <div class="bg-overlay"></div>

    <!-- Foreground Content -->
    <div class="content">
      <div class="logo" aria-label="iNavPark logo" role="img"></div>

      <h2 class="welcome-title fade-in">Welcome to iNavPark!</h2>
      <p class="welcome-text fade-in delay-1">
        We’re excited to guide you through Calapan Recreational and Zoological
        Park.<br />
        With our interactive AR navigation, finding your way has never been
        easier.<br />
        Discover hidden gems, enjoy nature, and unlock fun facts along the
        way.<br />
        Your adventure starts here!
      </p>

      <button
        v-if="showButton"
        id="continue-btn"
        class="fade-in delay-2"
        @click="goToRegister">
        Continue
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const showButton = ref(false);
const router = useRouter();
const auth = getAuth();

const goToRegister = () => router.push("/register");

onMounted(() => {
  // Lock scroll
  document.body.style.overflow = "hidden";

  const authListener = onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
      router.push("/homepage");
    } else {
      setTimeout(() => (showButton.value = true), 2500);
    }
  });

  return () => authListener();
});

onUnmounted(() => {
  document.body.style.overflow = "";
});
</script>

<style scoped>
.loading-wrapper {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
  text-align: center;
  padding: 0 20px;
  box-sizing: border-box;
  background: #000; /* fallback behind blurred bg */
  font-family: "Open Sans", Arial, sans-serif;
}

/* Background (use existing asset map2.png as placeholder for bulusanpark.jpg) */
.bg-overlay {
  position: absolute;
  inset: 0;
  background: url("@/assets/bulusanpark.jpg") no-repeat center center / cover;
  filter: blur(2px) brightness(0.9);
  z-index: 1;
}
.bg-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 128, 0, 0.35);
  z-index: 2;
}

.content {
  position: relative;
  z-index: 3;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 40px 20px;
  box-sizing: border-box;
}

.logo {
  width: clamp(340px, 80%, 560px);
  height: clamp(180px, 33vw, 320px);
  background: url("@/assets/inavparklogo1.png") no-repeat center;
  background-size: contain;
  margin-bottom: 20px;
  animation: pulseScale 2.5s ease-in-out infinite;
}

.welcome-title {
  font-size: clamp(1.9rem, 4vw, 2.6rem);
  font-weight: 800;
  margin-top: 36px;
  margin-bottom: 18px;
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.7);
  font-family: "Montserrat", sans-serif;
}

.welcome-text {
  font-size: clamp(1rem, 1.6vw, 1.2rem);
  line-height: 1.65;
  max-width: 680px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  margin-bottom: 30px;
}

#continue-btn {
  margin-top: 10px;
  padding: 16px 42px;
  font-size: 1.25rem;
  font-weight: 700;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: #fff;
  cursor: pointer;
  transition: 0.3s ease;
  box-shadow: 0 6px 18px rgba(46, 204, 113, 0.5);
}
#continue-btn:hover {
  transform: scale(1.08);
  background: linear-gradient(135deg, #27ae60, #219150);
}

@keyframes pulseScale {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.9s ease forwards;
}
.fade-in.delay-1 {
  animation-delay: 0.7s;
}
.fade-in.delay-2 {
  animation-delay: 1.4s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Small screens tweak */
@media (max-width: 600px) {
  .welcome-text {
    line-height: 1.55;
  }
  #continue-btn {
    padding: 14px 34px;
    font-size: 1.1rem;
  }
}
</style>
