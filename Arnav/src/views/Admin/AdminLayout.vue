<template>
  <div class="admin-layout" :class="{ 'dark-mode': isDarkMode }">
    <section id="sidebar">
      <router-link to="/admin-dashboard" class="brand">
        <i class="bx bxs-smile"></i>
        <span class="text">AR Path Admin</span>
      </router-link>
      <ul class="side-menu top">
        <li :class="{ active: $route.name === 'AdminDashboard' }">
          <router-link to="/admin-dashboard">
            <i class="bx bxs-dashboard"></i>
            <span class="text">Dashboard</span>
          </router-link>
        </li>
        <li :class="{ active: $route.name === 'AdminUserManagement' }">
          <router-link to="/admin-user-management">
            <i class="bx bxs-user-detail"></i>
            <span class="text">User Management</span>
          </router-link>
        </li>
        <li :class="{ active: $route.name === 'AdminCustomerSupport' }">
          <router-link to="/admin-customer-support">
            <i class="bx bxs-help-circle"></i>
            <span class="text">Customer Support</span>
          </router-link>
        </li>
        <li :class="{ active: $route.name === 'AdminFeedback' }">
          <router-link to="/admin-feedback">
            <i class="bx bxs-message-dots"></i>
            <span class="text">Feedback</span>
          </router-link>
        </li>
        <li :class="{ active: $route.name === 'AdminAnalytics' }">
          <router-link to="/admin-analytics">
            <i class="bx bxs-bar-chart-alt-2"></i>

            <span class="text">Analytics</span>
          </router-link>
        </li>
        <li :class="{ active: $route.name === 'AdminMapManagement' }">
          <router-link to="/adminmap-manage">
            <i class="bx bxs-map"></i>
            <span class="text">Map Management</span>
          </router-link>
        </li>
        <li :class="{ active: $route.name === 'AdminLearningManage' }">
          <router-link to="/admin-learning-manage">
            <i class="bx bx-brain"></i>
            <span class="text">Learning Management</span>
          </router-link>
        </li>
        <li :class="{ active: $route.name === 'AdminAnimalManage' }">
          <router-link to="/admin-animal-manage">
            <i class="bx bxs-cat"></i>
            <span class="text">Animal Management</span>
          </router-link>
        </li>
      </ul>
      <ul class="side-menu">
        <li>
          <a href="#" @click="logout" class="logout">
            <i class="bx bxs-log-out-circle"></i>
            <span class="text">Logout</span>
          </a>
        </li>
      </ul>
    </section>
    <section id="content">
      <nav>
        <i class="bx bx-menu" @click="toggleSidebar"></i>
        <slot name="nav"></slot>
        <div class="nav-actions">
          <NotificationBell />
          <div class="theme-toggle">
            <i
              :class="isDarkMode ? 'bx bx-sun' : 'bx bx-moon'"
              @click="toggleTheme"></i>
          </div>
        </div>
      </nav>
      <main>
        <slot />
      </main>
    </section>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutConfirm" class="modal-overlay">
      <div class="modal">
        <div class="modal-message">Are you sure you want to logout?</div>
        <div class="modal-actions">
          <button class="modal-btn logout" @click="confirmLogout">
            Yes, logout
          </button>
          <button class="modal-btn cancel" @click="showLogoutConfirm = false">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { getAuth, signOut } from "firebase/auth";
import NotificationBell from "@/components/NotificationBell.vue";

export default {
  name: "AdminLayout",
  components: {
    NotificationBell,
  },
  setup() {
    const isDarkMode = ref(false);
    const showLogoutConfirm = ref(false);

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value;
      localStorage.setItem("adminTheme", isDarkMode.value ? "dark" : "light");
    };

    onMounted(() => {
      const savedTheme = localStorage.getItem("adminTheme");
      if (savedTheme) {
        isDarkMode.value = savedTheme === "dark";
      } else {
        // Check system preference
        isDarkMode.value = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
      }
    });

    return {
      isDarkMode,
      toggleTheme,
      showLogoutConfirm,
    };
  },
  methods: {
    toggleSidebar() {
      const sidebar = document.getElementById("sidebar");
      const content = document.getElementById("content");
      if (sidebar && content) {
        sidebar.classList.toggle("close");
        content.classList.toggle("close");
      }
    },
    logout() {
      this.showLogoutConfirm = true;
    },
    confirmLogout() {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          this.showLogoutConfirm = false;
          localStorage.removeItem("user");
          // Redirect to login or home page
          this.$router.push("/register");
        })
        .catch((error) => {
          this.showLogoutConfirm = false;
          alert("Logout failed: " + error.message);
        });
    },
  },
};
</script>

<style>
@import "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";

:root {
  --bg-primary: #f8f9fa;
  --bg-secondary: #fff;
  --text-primary: #2c3e50;
  --text-secondary: #666;
  --hover-bg: #f0f2f5;
  --shadow: 0 4px 24px rgba(44, 62, 80, 0.1), 0 1.5px 6px rgba(44, 62, 80, 0.08);
  --card-bg: #fff;
  --border-color: #d0d0d0;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --shadow-light: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.dark-mode {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --hover-bg: #3d3d3d;
  --shadow: rgba(0, 0, 0, 0.3);
  --card-bg: #2d2d2d;
  --border-color: #404040;
  --primary-color: #3b82f6;
  --primary-hover: #60a5fa;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --shadow-light: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3),
    0 4px 6px -4px rgb(0 0 0 / 0.3);
}

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

#sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 260px;
  background: var(--bg-secondary);
  z-index: 100;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px var(--shadow);
}

#sidebar.close {
  width: 60px;
}

#sidebar .brand {
  display: flex;
  align-items: center;
  padding: 20px;
  color: var(--text-primary);
  text-decoration: none;
}

#sidebar .brand i {
  font-size: 24px;
  margin-right: 10px;
}

#sidebar .brand .text {
  font-size: 18px;
  font-weight: 600;
}

#sidebar.close .text {
  display: none;
}

#sidebar .side-menu {
  padding: 0;
  margin: 0;
  list-style: none;
}

#sidebar .side-menu li {
  margin: 8px 0;
}

#sidebar .side-menu li a {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
}

#sidebar .side-menu li a:hover,
#sidebar .side-menu li.active a {
  background: var(--hover-bg);
  color: var(--text-primary);
}

#sidebar .side-menu li a i {
  font-size: 20px;
  margin-right: 10px;
}

#content {
  margin-left: 260px;
  width: calc(100% - 260px);
  transition: all 0.3s ease;
}

#content.close {
  margin-left: 60px;
  width: calc(100% - 60px);
}

nav {
  display: flex;
  align-items: center;
  padding: 20px;
  background: var(--bg-secondary);
  box-shadow: 0 0 10px var(--shadow);
}

nav .bx-menu {
  font-size: 24px;
  cursor: pointer;
  margin-right: 20px;
  color: var(--text-primary);
}

.nav-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle {
  margin-right: 20px;
  position: relative;
}

.theme-toggle i {
  font-size: 24px;
  cursor: pointer;
  color: var(--primary-color);
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid transparent;
}

.theme-toggle i:hover {
  transform: rotate(30deg) scale(1.1);
  color: var(--primary-hover);
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

main {
  padding: 20px;
}

/* Logout Confirmation Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal {
  background: var(--bg-secondary, #fff);
  padding: 24px 32px;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(44, 62, 80, 0.15);
  min-width: 280px;
  text-align: center;
}
.modal-message {
  margin-bottom: 18px;
  font-size: 1.1rem;
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}
.modal-btn {
  padding: 8px 18px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}
.modal-btn.logout {
  background: #e53e3e;
  color: #fff;
}
.modal-btn.cancel {
  background: #ccc;
  color: #222;
}

@media (max-width: 768px) {
  #sidebar {
    width: 60px;
  }
  #sidebar .brand .text,
  #sidebar .side-menu li a span {
    display: none;
  }
  #content {
    margin-left: 60px;
    width: calc(100% - 60px);
  }
}
</style>
