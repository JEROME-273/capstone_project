<template>
  <div class="container">
    <div class="map">
      <div class="pointer"></div>
    </div>
    <button v-if="showButton" id="continue-btn" @click="goToRegister">
      Continue
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const showButton = ref(false);
const router = useRouter();

onMounted(() => {
  setTimeout(() => {
    showButton.value = true;
  }, 3000);
});

const goToRegister = () => {
  router.push("/register");
};
</script>

<style scoped>
html,
body {
  height: 100%;
  overflow: hidden; /* Prevent scrolling */
}

body {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
}

.container {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto;
  background: transparent;
  box-shadow: none !important;
  margin-top: -50px;
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
  display: block;
  position: absolute;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  padding: 10px 24px;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  background: #007bff;
  color: #fff;
  cursor: pointer;
  z-index: 20;
  opacity: 0.95;
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

/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {
  .container {
    width: 60vw;
    height: 60vw;
    max-width: 160px;
    max-height: 160px;
    margin: 10px auto 0 auto;
    position: relative;
    top: 0;
  }

  .map {
    width: 100%;
    height: 100%;
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
  }
}

/* Small devices (portrait tablets and large phones, 600px and up) */
@media only screen and (min-width: 600px) and (max-width: 768px) {
  .container {
    width: 70vw;
    height: 70vw;
    max-width: 300px;
    max-height: 300px;
  }

  .pointer {
    width: 140vw;
    height: 47vw;
    max-width: 600px;
    max-height: 200px;
  }
}

/* Medium devices (landscape tablets, 768px and up) */
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

/* Large devices (laptops/desktops, 992px and up) */
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

/* For landscape orientation on mobile */
@media only screen and (max-width: 768px) and (orientation: landscape) {
  body {
    align-items: flex-start;
    padding-top: 20px;
  }

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
}
</style>
