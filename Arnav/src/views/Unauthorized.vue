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
</style>
