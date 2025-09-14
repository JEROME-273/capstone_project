<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <div class="app-container">
    <RouterView />
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
