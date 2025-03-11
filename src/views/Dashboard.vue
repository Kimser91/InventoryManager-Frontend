<template>
    <div class="dashboard">
      <h1>Dashboard</h1>
      <div class="stats-container">
        <div class="stat-box">
          <h3>Total Users</h3>
          <p>{{ totalUsers }}</p>
        </div>
        <div class="stat-box">
          <h3>Active Orders</h3>
          <p>{{ activeOrders }}</p>
        </div>
        <div class="stat-box">
          <h3>Completed Orders</h3>
          <p>{{ completedOrders }}</p>
        </div>
      </div>
      
      <h2>Orders by Store</h2>
      <div class="store-orders">
        <div v-for="(orders, store) in ordersByStore" :key="store" class="store-box">
          <h3>{{ store }}</h3>
          <p>Total Orders: {{ orders.length }}</p>
          <button @click="sendOrders(store)">Send Orders</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        totalUsers: 0,
        activeOrders: 0,
        completedOrders: 0,
        ordersByStore: {}
      };
    },
    async mounted() {
      try {
        const usersResponse = await axios.get('https://api.example.com/users');
        const ordersResponse = await axios.get('https://api.example.com/orders');
  
        this.totalUsers = usersResponse.data.length;
        this.activeOrders = ordersResponse.data.filter(order => order.status === 'active').length;
        this.completedOrders = ordersResponse.data.filter(order => order.status === 'completed').length;
        
        // Sort orders by store
        this.ordersByStore = ordersResponse.data.reduce((acc, order) => {
          if (!acc[order.store]) {
            acc[order.store] = [];
          }
          acc[order.store].push(order);
          return acc;
        }, {});
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    },
    methods: {
      async sendOrders(store) {
        try {
          const orders = this.ordersByStore[store];
          await axios.post('https://api.example.com/orders/send', {
            store,
            orders
          });
          
          // Remove sent orders from the database
          const orderIds = orders.map(order => order.id);
          await axios.post('https://api.example.com/orders/delete', { orderIds });
          
          // Refresh the dashboard
          this.ordersByStore[store] = [];
          this.activeOrders -= orders.length;
          alert(`Orders from ${store} have been sent and deleted.`);
        } catch (error) {
          console.error('Error sending orders:', error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .dashboard {
    padding: 20px;
  }
  
  .stats-container {
    display: flex;
    gap: 20px;
  }
  
  .stat-box {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    flex: 1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .stat-box h3 {
    margin-bottom: 10px;
  }
  
  .stat-box p {
    font-size: 1.5em;
    font-weight: bold;
  }
  
  .store-orders {
    margin-top: 20px;
    display: flex;
    gap: 20px;
  }
  
  .store-box {
    background: #e9ecef;
    padding: 15px;
    border-radius: 5px;
    text-align: center;
    flex: 1;
  }
  
  button {
    background: #007bff;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
  }
  
  button:hover {
    background: #0056b3;
  }
  </style>