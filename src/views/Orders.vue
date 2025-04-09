<template>
  <div class="orders">
    <h1>Order List</h1>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Product</th>
          <th>Store</th>
          <th>Article #</th>
          <th>Quantity</th>
          <th>Owner</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>{{ order.id }}</td>
          <td>{{ order.product_name }}</td>
          <td>{{ order.store_name }}</td>
          <td>{{ order.article_number }}</td>
          <td>{{ order.quantity }}</td>
          <td>{{ order.owner }}</td>
          <td :class="statusClass(order.status)">{{ order.status }}</td>
          <td>
            <button @click="deleteOrder(order.id)">Delete</button>
            <button v-if="order.status === 'pending'" @click="completeOrder(order.id)">Complete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import API from '@/api' // <-- Bruk vår ferdige api.js

export default {
  data() {
    return {
      orders: []
    };
  },
  async mounted() {
    await this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await API.get('/orders');
        this.orders = response.data;
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },
    async deleteOrder(orderId) {
      if (confirm("Are you sure you want to delete this order?")) {
        try {
          await API.delete(`/orders/${orderId}`);
          this.orders = this.orders.filter(order => order.id !== orderId);
          alert("Order deleted successfully");
        } catch (error) {
          console.error("Error deleting order:", error);
        }
      }
    },
    async completeOrder(orderId) {
      if (confirm("Complete this order and update inventory?")) {
        try {
          await API.put(`/orders/${orderId}/complete`);
          this.orders = this.orders.filter(order => order.id !== orderId);
          alert("Order completed and inventory updated");
        } catch (error) {
          console.error("Error completing order:", error);
        }
      }
    },
    statusClass(status) {
      return {
        pending: "status-pending",
        completed: "status-completed"
      }[status] || "";
    }
  }
}
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

.status-pending {
  background: yellow;
  color: black;
}

.status-completed {
  background: lightgreen;
  color: black;
}
</style>
