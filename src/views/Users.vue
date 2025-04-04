<template>
  <div class="container mt-5">
    <h1 class="mb-4">Users Management</h1>
    <table class="table table-striped">
      <thead class="thead-dark">
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Name</th>
          <th scope="col">Email</th>
          <th scope="col">Role</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <button class="btn btn-danger btn-sm" @click="deleteUser(user.id)">Delete</button>
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
        const response = await axios.get('https://api.inventoryadministrator.com/api/users');
        console.log(response.data)
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    methods: {
      async deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
          try {
            await axios.delete(`https://api.inventoryadministrator.com/api/users/${userId}`);
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
  
