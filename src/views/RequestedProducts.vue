<template>
    <div class="requested-products">
      <h1>Requested Products</h1>
  
      <table>
        <thead>
          <tr>
            <th>Request ID</th>
            <th>User ID</th>
            <th>Company ID</th>
            <th>Status</th>
            <th>Requested At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in requests" :key="request.id">
            <td>{{ request.id }}</td>
            <td>{{ request.user_id }}</td>
            <td>{{ request.company_id }}</td>
            <td>{{ request.status }}</td>
            <td>{{ new Date(request.created_at).toLocaleString() }}</td>
            <td>
              <button @click="markCompleted(request.id)">Mark as Completed</button>
              <button @click="deleteRequest(request.id)">Delete</button>
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
      async markCompleted(requestId) {
        try {
          const token = localStorage.getItem('admin.token');
          await axios.put(`${API_BASE_URL}/requests/${requestId}/complete`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await this.fetchRequests();
          alert('Request marked as completed!');
        } catch (error) {
          console.error('Error completing request:', error);
        }
      },
      async deleteRequest(requestId) {
        try {
          const token = localStorage.getItem('admin.token');
          await axios.delete(`${API_BASE_URL}/requests/${requestId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await this.fetchRequests();
          alert('Request deleted!');
        } catch (error) {
          console.error('Error deleting request:', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .requested-products {
    padding: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  thead {
    background-color: #343a40;
    color: white;
  }
  
  td, th {
    padding: 10px;
    border: 1px solid #dee2e6;
    text-align: left;
  }
  
  button {
    margin-right: 5px;
    padding: 5px 10px;
    background-color: #0d6efd;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0b5ed7;
  }
  </style>
  