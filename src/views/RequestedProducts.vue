<template>
  <div class="container mt-4">
    <h1 class="mb-4">Requested Products</h1>

    <table class="table table-striped table-bordered">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Product</th>
          <th>Store</th>
          <th>Article #</th>
          <th>Quantity</th>
          <th>Min Threshold</th>
          <th>Max Stock</th>
          <th>Price (NOK)</th>
          <th>Status</th>
          <th>Requested At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in requests" :key="request.id" :class="getRowClass(request.status)">
          <td>{{ request.id }}</td>
          <td>{{ request.product_name }}</td>
          <td>{{ request.store_name }}</td>
          <td>{{ request.article_number }}</td>
          <td>{{ request.stock_quantity }}</td>
          <td>{{ request.min_threshold }}</td>
          <td>{{ request.max_stock }}</td>
          <td>{{ request.price }}</td>
          <td>
            <span :class="getStatusClass(request.status)">
              {{ request.status }}
            </span>
          </td>
          <td>{{ formatDate(request.created_at) }}</td>
          <td>
            <button class="btn btn-success btn-sm me-2" @click="completeRequest(request.id)">Complete</button>
            <button class="btn btn-danger btn-sm" @click="deleteRequest(request.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.inventoryadministrator.com/api';

export default {
  data() {
    return {
      requests: [],
    };
  },
  async mounted() {
    await this.fetchRequests();
  },
  methods: {
    async fetchRequests() {
      try {
        const token = localStorage.getItem('admin.token');
        const response = await axios.get(`${API_BASE_URL}/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.requests = response.data;
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    },
    async completeRequest(id) {
      if (confirm('Are you sure you want to complete this request?')) {
        try {
          const token = localStorage.getItem('admin.token');
          await axios.put(`${API_BASE_URL}/requests/${id}/complete`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert('Request processed and completed!');
          await this.fetchRequests();
        } catch (error) {
          console.error('Error completing request:', error);
          alert('Failed to complete the request.');
        }
      }
    },
    async deleteRequest(id) {
      if (confirm('Are you sure you want to delete this request?')) {
        try {
          const token = localStorage.getItem('admin.token');
          await axios.delete(`${API_BASE_URL}/requests/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert('Request deleted.');
          await this.fetchRequests();
        } catch (error) {
          console.error('Error deleting request:', error);
          alert('Failed to delete the request.');
        }
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    getStatusClass(status) {
      if (status === 'completed') return 'badge bg-success';
      if (status === 'pending') return 'badge bg-warning text-dark';
      if (status === 'requested') return 'badge bg-orange text-white';
      return 'badge bg-secondary';
    },
    getRowClass(status) {
      if (status === 'completed') return 'table-success';
      if (status === 'pending') return 'table-warning';
      if (status === 'requested') return 'table-info';
      return '';
    }
  },
};
</script>

<style scoped>
.badge.bg-orange {
  background-color: #fd7e14;
  color: white;
}
</style>
