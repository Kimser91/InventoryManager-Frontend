<template>
    <div class="users">
      <h1>Users Management</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button @click="deleteUser(user.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        users: []
      };
    },
    async mounted() {
      try {
        const response = await axios.get('https://api.inventoryadministrator.com/users');
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    methods: {
      async deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
          try {
            await axios.delete(`https://api.inventoryadministrator.com/users/${userId}`);
            this.users = this.users.filter(user => user.id !== userId);
            alert('User deleted successfully');
          } catch (error) {
            console.error('Error deleting user:', error);
          }
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .users {
    padding: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  thead {
    background: #007bff;
    color: white;
  }
  
  td, th {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: left;
  }
  
  button {
    background: #dc3545;
    color: white;
    padding: 5px 10px;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }
  
  button:hover {
    background: #c82333;
  }
  </style>
  