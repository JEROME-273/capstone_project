<script setup>
import AuthManager from "./AuthManager.vue";
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="nav-logo">AR Navigation</router-link>
    </div>
    <div class="navbar-menu">
      <router-link to="/help-center" class="nav-item">Help Center</router-link>
      <router-link to="/userinfo" class="user-icon-circle">
        <i class="fas fa-user"></i>
      </router-link>
      <AuthManager />
    </div>
  </nav>
</template>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css");

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-item {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-item:hover {
  color: #333;
}

.user-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #666;
  transition: all 0.3s ease;
}

.user-icon-circle:hover {
  background-color: #e5e7eb;
  color: #333;
}

.user-icon-circle i {
  font-size: 1.2rem;
}
</style>
