<template>
    <div class="admin-layout">
      <nav class="sidebar">
        <ul>
          <li><router-link to="/dashboard">Dashboard</router-link></li>
          <li><router-link to="/users">Users</router-link></li>
          <li><router-link to="/orders">Orders</router-link></li>
          <li><button @click="logout">Logout</button></li>
        </ul>
      </nav>
      <main>
        <slot></slot>
      </main>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      logout() {
        localStorage.removeItem('token');
        this.$router.push('/');
      }
    }
  }
  </script>
  
  <style scoped>
  .admin-layout {
    display: flex;
    height: 100vh;
  }
  
  .sidebar {
    width: 250px;
    background: #343a40;
    color: white;
    padding: 20px;
  }
  
  .sidebar ul {
    list-style: none;
    padding: 0;
  }
  
  .sidebar ul li {
    margin-bottom: 10px;
  }
  
  .sidebar a, .sidebar button {
    color: white;
    text-decoration: none;
    display: block;
    padding: 10px;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
  }
  
  .sidebar a:hover, .sidebar button:hover {
    background: #495057;
  }
  
  main {
    flex-grow: 1;
    padding: 20px;
  }
  </style>
  