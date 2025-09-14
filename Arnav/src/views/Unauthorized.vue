<template>
  <div class="unauthorized-container">
    <div class="unauthorized-card">
      <h1>Access Denied</h1>
      <div class="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <p>
        You don't have permission to access this page. Please contact an
        administrator if you believe this is an error.
      </p>
      <button @click="goToHomepage" class="back-button">Go to Homepage</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Unauthorized",

  methods: {
    goToHomepage() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.unauthorized-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.unauthorized-card {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.unauthorized-card h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #e74c3c;
}

.icon {
  color: #e74c3c;
  margin: 20px 0;
}

.unauthorized-card p {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.back-button {
  background-color: #2da871;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.back-button:hover {
  background-color: #1e7a4f;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(45, 168, 113, 0.2);
}

.back-button:active {
  transform: translateY(0);
}

/* ===========================
   RESPONSIVE STYLES
   =========================== */

/* Tablet */
@media (max-width: 768px) {
  .unauthorized-container {
    padding: 15px;
  }

  .unauthorized-card {
    padding: 30px 20px;
    max-width: 90%;
  }

  .unauthorized-card h1 {
    font-size: 24px;
  }

  .icon svg {
    width: 60px;
    height: 60px;
  }

  .unauthorized-card p {
    font-size: 15px;
    margin-bottom: 25px;
  }

  .back-button {
    padding: 14px 28px;
    font-size: 15px;
    width: 100%;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .unauthorized-container {
    padding: 10px;
  }

  .unauthorized-card {
    padding: 25px 15px;
    max-width: 95%;
    border-radius: 8px;
  }

  .unauthorized-card h1 {
    font-size: 22px;
    margin: 15px 0;
  }

  .icon svg {
    width: 50px;
    height: 50px;
  }

  .unauthorized-card p {
    font-size: 14px;
    margin-bottom: 20px;
    text-align: center;
  }

  .back-button {
    padding: 16px 20px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 44px; /* Touch target size */
    border-radius: 6px;
  }
}

/* Small mobile */
@media (max-width: 360px) {
  .unauthorized-card {
    padding: 20px 12px;
  }

  .unauthorized-card h1 {
    font-size: 20px;
  }

  .icon svg {
    width: 40px;
    height: 40px;
  }

  .unauthorized-card p {
    font-size: 13px;
  }

  .back-button {
    padding: 14px 16px;
    font-size: 15px;
  }
}

/* Landscape orientation */
@media (max-height: 500px) and (orientation: landscape) {
  .unauthorized-container {
    padding: 5px;
  }

  .unauthorized-card {
    padding: 15px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .unauthorized-card h1 {
    font-size: 18px;
    margin: 10px 0;
  }

  .icon svg {
    width: 30px;
    height: 30px;
  }

  .unauthorized-card p {
    font-size: 13px;
    margin-bottom: 15px;
  }

  .back-button {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>
