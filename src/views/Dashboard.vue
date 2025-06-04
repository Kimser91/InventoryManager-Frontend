<template>
  <div class="container mt-4">
    <h1 class="mb-4">Dashboard</h1>

    <div class="row">
      <div class="col-md-4 mb-4">
        <router-link to="/inventory" class="text-decoration-none">
          <div class="card text-white bg-primary h-100 clickable-card">
            <div class="card-body">
              <h5 class="card-title">Produkter</h5>
              <p class="card-text display-6">{{ inventoryCount }}</p>
            </div>
          </div>
        </router-link>
      </div>

      <div class="col-md-4 mb-4">
        <router-link to="/users" class="text-decoration-none">
          <div class="card text-white bg-success h-100 clickable-card">
            <div class="card-body">
              <h5 class="card-title">Brukere</h5>
              <p class="card-text display-6">{{ userCount }}</p>
            </div>
          </div>
        </router-link>
      </div>

      <div class="col-md-4 mb-4">
        <router-link to="/orders" class="text-decoration-none">
          <div class="card text-white bg-warning h-100 clickable-card">
            <div class="card-body">
              <h5 class="card-title">Åpne Ordrer</h5>
              <p class="card-text display-6">{{ orderCount }}</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.inventoryadministrator.com/api";

export default {
  data() {
    return {
      inventoryCount: 0,
      userCount: 0,
      orderCount: 0,
      currentUserRole: '',
      userPermissions: []
    };
  },
  async mounted() {
    await this.fetchCurrentUser();
    await this.fetchDashboardData();
  },
  methods: {
    async fetchCurrentUser() {
      try {
        const token = localStorage.getItem('admin.token');
        const response = await axios.get(`${API_BASE_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = response.data;
        this.currentUserRole = user.role || '';

        if (user.permissions) {
          const permissions = JSON.parse(user.permissions);
          this.userPermissions = permissions;
          localStorage.setItem('admin.permissions', JSON.stringify(permissions));
        }
      } catch (error) {
        console.error('Feil ved henting av bruker:', error);
      }
    },
    async fetchDashboardData() {
      try {
        const token = localStorage.getItem('admin.token');
        
        // Inventory
        const inventoryRes = await axios.get(`${API_BASE_URL}/inventory`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allInventory = inventoryRes.data;
            console.log('🔎 All inventory:', allInventory);
            console.log('🔎 currentUserRole:', this.currentUserRole);
            console.log('🔎 userPermissions:', this.userPermissions);

        this.inventoryCount = this.currentUserRole === 'Superadmin' || this.currentUserRole === 'Hovedadmin'
          ? allInventory.length
          : allInventory.filter(item => this.userPermissions.includes(item.owner)).length;

        // Users
        const usersRes = await axios.get(`${API_BASE_URL}/admin/users`, {
        
          headers: { Authorization: `Bearer ${token}` }
        });
        this.userCount = usersRes.data.length;

        // Orders
        const ordersRes = await axios.get(`${API_BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.orderCount = ordersRes.data.filter(order => order.status === 'pending').length;

      } catch (error) {
        console.error('Feil ved henting av dashboard data:', error);
      }
    }
  }
};
</script>

<style scoped>
.card {
  border: none;
  border-radius: 1rem;
  transition: transform 0.2s;
}

.card:hover {
  transform: scale(1.03);
  cursor: pointer;
}

.text-decoration-none {
  text-decoration: none;
}

.clickable-card {
  height: 100%;
}
</style>
