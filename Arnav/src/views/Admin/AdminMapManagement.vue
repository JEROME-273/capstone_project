<template>
  <AdminLayout @logout="logout">
    <template #nav>
      <a href="#" class="nav-link">Map Management</a>
    </template>
    <div class="map-management">
      <h1>Map Management</h1>
      <p>This section is under development.</p>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "./AdminLayout.vue";

export default {
  name: "AdminMapManagement",
  components: {
    AdminLayout,
  },
  methods: {
    logout() {
      this.$emit("logout");
    },
  },
};
</script>

<style scoped>
.map-management {
  padding: 20px;
  color: var(--text-primary);
}

.map-management h1 {
  color: var(--text-primary);
  margin-bottom: 15px;
}

.map-management p {
  color: var(--text-secondary);
}
</style>
