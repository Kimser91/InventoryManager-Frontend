<template>
    <div class="orders">
      <h1>Order Management</h1>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Store</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.customer }}</td>
            <td>{{ order.store }}</td>
            <td>{{ order.status }}</td>
            <td>
              <button @click="deleteOrder(order.id)">Delete</button>
              <button v-if="order.status !== 'completed'" @click="completeOrder(order.id)">Mark as Completed</button>
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
        orders: []
      };
    },
    async mounted() {
      try {
        const response = await axios.get('https://api.inventoryadministrator.com/api/orders');
        this.orders = response.data;
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    },
    methods: {
      async deleteOrder(orderId) {
        if (confirm('Are you sure you want to delete this order?')) {
          try {
            await axios.delete(`https://api.inventoryadministrator.com/api/orders/${orderId}`);
            this.orders = this.orders.filter(order => order.id !== orderId);
            alert('Order deleted successfully');
          } catch (error) {
            console.error('Error deleting order:', error);
          }
        }
      },
      async completeOrder(orderId) {
        try {
          await axios.put(`https://api.inventoryadministrator.com/api/orders/${orderId}`, { status: 'completed' });
          this.orders = this.orders.map(order => 
            order.id === orderId ? { ...order, status: 'completed' } : order
          );
          alert('Order marked as completed');
        } catch (error) {
          console.error('Error updating order:', error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .orders {
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
    background: #28a745;
    color: white;
    padding: 5px 10px;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    margin-right: 5px;
  }
  
  button:hover {
    background: #218838;
  }
  
  button:nth-child(2) {
    background: #dc3545;
  }
  
  button:nth-child(2):hover {
    background: #c82333;
  }
  </style>
  