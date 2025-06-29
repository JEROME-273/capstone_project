<template>
  <div class="loading-wrapper">
    <div class="container">
      <div class="map">
        <div class="pointer"></div>
      </div>
      <button v-if="showButton" id="continue-btn" @click="goToRegister">
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

const goToRegister = () => {
  router.push("/register");
};

onMounted(() => {
  // Prevent body scrolling
  document.body.style.overflow = "hidden";
  document.body.style.height = "100vh";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
  document.body.style.top = "0";
  document.body.style.left = "0";

  // Check if user is already authenticated
  const authListener = onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
      // User is authenticated, redirect them
      router.push("/homepage");
    } else {
      // Show continue button after delay for unauthenticated users
      setTimeout(() => {
        showButton.value = true;
      }, 3000);
    }
  });

  // Cleanup listener on component unmount
  return () => {
    authListener();
  };
});

onUnmounted(() => {
  // Restore body scrolling when component is destroyed
  document.body.style.overflow = "";
  document.body.style.height = "";
  document.body.style.position = "";
  document.body.style.width = "";
  document.body.style.top = "";
  document.body.style.left = "";
});
</script>

<style scoped>
.loading-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 1vh;
  background: #fff;
  z-index: 9999;
}

.container {
  position: relative;
  width: 220px;
  height: 220px;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  box-shadow: none;
}

.map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("@/assets/map2.png") no-repeat center;
  background-size: contain;
}

.pointer {
  position: absolute;
  bottom: 40%;
  left: 50%;
  width: 180px;
  height: 60px;
  background: url("@/assets/pointer.png") no-repeat center;
  background-size: contain;
  transform: translateX(-50%);
  z-index: 10;
  animation: moveUpDown 1.5s ease-in-out infinite;
}

#continue-btn {
  position: fixed;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: #fff;
  cursor: pointer;
  z-index: 20;
  opacity: 0.95;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

@keyframes moveUpDown {
  0% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-20px);
  }
  100% {
    transform: translateX(-50%) translateY(0);
  }
}

/* Mobile devices */
@media only screen and (max-width: 600px) {
  .loading-wrapper {
    padding-top: 15vh;
  }

  .container {
    width: 60vw;
    height: 60vw;
    max-width: 160px;
    max-height: 160px;
  }

  .pointer {
    width: 70vw;
    height: 20vw;
    max-width: 120px;
    max-height: 40px;
    bottom: 35%;
  }

  #continue-btn {
    bottom: 90px;
    padding: 14px 32px;
    font-size: 1.1rem;
    border-radius: 10px;
  }
}

/* Medium tablets */
@media only screen and (min-width: 768px) and (max-width: 992px) {
  .container {
    width: 50vw;
    height: 50vw;
    max-width: 300px;
    max-height: 300px;
  }

  .pointer {
    width: 100vw;
    height: 33vw;
    max-width: 600px;
    max-height: 200px;
  }
}

/* Desktop */
@media only screen and (min-width: 992px) {
  .container {
    width: 300px;
    height: 300px;
  }

  .pointer {
    width: 600px;
    height: 200px;
  }
}

/* Mobile landscape */
@media only screen and (max-width: 768px) and (orientation: landscape) {
  .container {
    width: 40vh;
    height: 40vh;
    max-width: 300px;
    max-height: 300px;
  }

  .pointer {
    width: 80vh;
    height: 27vh;
    max-width: 600px;
    max-height: 200px;
  }

  #continue-btn {
    bottom: 15px;
    padding: 10px 24px;
    font-size: 1rem;
  }
}
</style>
