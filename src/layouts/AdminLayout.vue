<template>
  <div class="admin-layout">
    <nav class="sidebar">
      <ul>
        <li><router-link to="/dashboard">Dashboard</router-link></li>
        <li><router-link to="/users">Users</router-link></li>
        <li><router-link to="/inventory">Inventory</router-link></li>
        <li><router-link to="/orders">Orders</router-link></li>
        <li><button @click="logout">Logout</button></li>
      </ul>
    </nav>
    <main>
      <h1>Welcome, {{ user.name }}</h1>
      <slot></slot>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {
        name: "Admin User",
        role: "Hovedadmin"
      }
    };
  },
  methods: {
    logout() {
      console.log("User logged out");
      this.$router.push('/');
    }
  }
};
</script>
