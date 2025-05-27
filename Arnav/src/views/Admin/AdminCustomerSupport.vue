<template>
  <AdminLayout>
    <div>
      <div class="head-title">
        <div class="left">
          <h1>Customer Support</h1>
          <ul class="breadcrumb">
            <li><i class="bx bx-chevron-right"></i></li>
            <li><a class="active" href="#">Customer Support</a></li>
          </ul>
        </div>
      </div>
      <div class="section-content">
        <h2>Customer Support Requests</h2>
        <div v-if="supportRequests.length === 0">No support requests yet.</div>
        <ul v-else>
          <li v-for="req in supportRequests" :key="req.id">
            <strong>{{ req.email }}</strong
            >: {{ req.message }} <br />
            <small>{{ formatDate(req.createdAt) }}</small>
          </li>
        </ul>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { getFirestore, collection, getDocs } from "firebase/firestore";
import AdminLayout from "./AdminLayout.vue";

export default {
  name: "AdminCustomerSupport",
  components: { AdminLayout },
  data() {
    return {
      supportRequests: [],
    };
  },
  async mounted() {
    await this.fetchSupportRequests();
  },
  methods: {
    async fetchSupportRequests() {
      const db = getFirestore();
      const q = collection(db, "support_requests");
      const querySnapshot = await getDocs(q);
      this.supportRequests = [];
      querySnapshot.forEach((doc) => {
        this.supportRequests.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate
            ? doc.data().createdAt.toDate()
            : null,
        });
      });
    },
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleString();
    },
  },
};
</script>

<style scoped>
@import url("https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css");
.head-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: var(--text-primary);
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
}
.head-title .left h1 {
  font-size: 24px;
  margin-bottom: 5px;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
}
.breadcrumb a {
  color: var(--text-primary);
  text-decoration: none;
}
.section-content {
  background: var(--card-bg, #f3f4f6);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(44, 62, 80, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}
</style>
