<template>
  <div class="d-flex min-vh-100">
    <!-- Sidebar -->
    <nav class="d-flex flex-column flex-shrink-0 p-3 bg-secondary text-white" style="width: 250px;">
      <h4 class="mb-4 text-center">Admin Panel</h4>

      <!-- Brukerinfo -->
      <div class="text-center my-3">
        <strong>{{ currentUser.username }}</strong>
        <div v-if="currentUser.role" class="mt-1">
          <span v-if="currentUser.role === 'Superadmin'" class="badge bg-danger">Superadmin</span>
          <span v-else-if="currentUser.role === 'Hovedadmin'" class="badge bg-primary">Hovedadmin</span>
          <span v-else-if="currentUser.role === 'Admin'" class="badge bg-success">Admin</span>
        </div>
      </div>

      <!-- Navigasjon -->
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
        <li>
          <button class="btn btn-outline-light mt-4" @click="logout">Logg ut</button>
        </li>
      </ul>
    </nav>

    <!-- Main content -->
    <main class="flex-grow-1 p-4 bg-light">
      <router-view />
    </main>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: "AdminLayout",
  data() {
    return {
      currentUser: {
        username: '',
        role: ''
      }
    };
  },
  async mounted() {
    await this.fetchCurrentUser();
  },
  methods: {
    async fetchCurrentUser() {
      try {
        const token = localStorage.getItem('admin.token');
        const response = await axios.get('https://api.inventoryadministrator.com/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.currentUser.username = response.data.username;
        this.currentUser.role = response.data.role;
      } catch (error) {
        console.error('Feil ved henting av bruker i AdminLayout:', error);
      }
    },
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
