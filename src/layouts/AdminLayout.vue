<template>
  <div class="d-flex min-vh-100">
    <!-- Sidebar -->
    <nav
      class="d-flex flex-column flex-shrink-0 p-3 bg-secondary text-white"
      style="width: 250px;"
    >
      <h4 class="mb-4 text-center">Admin Panel</h4>
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item">
          <router-link to="/dashboard" class="nav-link text-white" active-class="active">
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/inventory" class="nav-link text-white" active-class="active">
            Inventory
          </router-link>
        </li>
        <li>
          <router-link to="/users" class="nav-link text-white" active-class="active">
            Users
          </router-link>
        </li>
        <li>
          <router-link to="/orders" class="nav-link text-white" active-class="active">
            Orders
          </router-link>
        </li>
        <li><button class="btn btn-outline-light mt-4" @click="logout"> Log out </button></li>
      </ul>
    </nav>

    <!-- Main content -->
    <main class="flex-grow-1 p-4 bg-light">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: "AdminLayout",
  methods: {
    logout() {
      localStorage.removeItem('admin.token');
      window.location.href = 'https://inventoryadministrator.com/login';
    }
  }
};
</script>

<style scoped>
.active {
  background-color: #0d6efd !important;
}
</style>

