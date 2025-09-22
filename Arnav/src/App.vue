<script setup>
import { RouterView } from "vue-router";
import PWAInstallPrompt from "@/components/PWAInstallPrompt.vue";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt.vue";
import PWAOfflineIndicator from "@/components/PWAOfflineIndicator.vue";
</script>

<template>
  <div class="app-container">
    <PWAOfflineIndicator />
    <RouterView />
    <PWAInstallPrompt />
    <PWAUpdatePrompt />
  </div>
</template>

<style>
/* Import global responsive styles */
@import "@/assets/global-responsive.css";
</style>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
}
</style>
