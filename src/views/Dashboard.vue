<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    
    <!-- Statistikk -->
    <div class="stats-container">
      <div class="stat-box">
        <h3>Total Users</h3>
        <p>{{ totalUsers }}</p>
      </div>
      <div class="stat-box">
        <h3>Low Stock Items</h3>
        <p>{{ lowStockItems }}</p>
      </div>
      <div class="stat-box">
        <h3>Generated Orders</h3>
        <p>{{ generatedOrders }}</p>
      </div>
    </div>

    <!-- Lagerstatus etter butikk -->
    <h2>Inventory by Store</h2>
    <div class="store-orders">
      <div v-for="(items, store) in inventoryByStore" :key="store" class="store-box">
        <h3>{{ store }}</h3>
        <p>Low Stock Items: {{ items.length }}</p>
        <button @click="generateOrders(store)" :disabled="items.length === 0">
          Generate Orders
        </button>
      </div>
    </div>

    <!-- 🆕 Vis genererte ordrer -->
    <h2>Generated Orders</h2>
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
            <button v-if="order.status === 'pending'" @click="markCompleted(order.id)">Complete</button>
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
      totalUsers: 0,
      lowStockItems: 0,
      generatedOrders: 0,
      inventoryByStore: {},
      orders: [] // Nytt felt for ordrer
    };
  },
  async mounted() {
    try {
      // 🚀 Hent brukere
      const usersResponse = await axios.get('https://api.inventoryadministrator.com/api/users');
      this.totalUsers = usersResponse.data.length;

      // 🚀 Hent lagerstatus
      const inventoryResponse = await axios.get('https://api.inventoryadministrator.com/api/inventory');

      // 🚀 Filtrer produkter med lav beholdning
      const lowStock = inventoryResponse.data.filter(item => item.stock_quantity < item.min_threshold);
      this.lowStockItems = lowStock.length;

      // 🚀 Gruppér produkter etter butikk
      this.inventoryByStore = lowStock.reduce((acc, item) => {
        if (!acc[item.store_name]) {
          acc[item.store_name] = [];
        }
        acc[item.store_name].push(item);
        return acc;
      }, {});

      // 🚀 Hent eksisterende ordrer
      const ordersResponse = await axios.get("https://api.inventoryadministrator.com/api/orders");
      this.orders = ordersResponse.data;
      this.generatedOrders = this.orders.length;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  },
  methods: {
    async generateOrders(store) {
      try {
        const items = this.inventoryByStore[store];
        await axios.post('https://api.inventoryadministrator.com/api/inventory/generate-orders', { store, items });

        // Oppdater ordrelisten
        const ordersResponse = await axios.get("https://api.inventoryadministrator.com/api/orders");
        this.orders = ordersResponse.data;
        this.generatedOrders = this.orders.length;

        alert(`Orders for ${store} generated successfully!`);
      } catch (error) {
        console.error('Error generating orders:', error);
      }
    },
    async deleteOrder(orderId) {
      if (confirm("Are you sure you want to delete this order?")) {
        try {
          await axios.delete(`https://api.inventoryadministrator.com/api/orders/${orderId}`);
          this.orders = this.orders.filter(order => order.id !== orderId);
          this.generatedOrders -= 1;
          alert("Order deleted successfully");
        } catch (error) {
          console.error("Error deleting order:", error);
        }
      }
    },
    async markCompleted(orderId) {
      try {
        await axios.put(`https://api.inventoryadministrator.com/api/orders/${orderId}`, { status: "completed" });
        this.orders = this.orders.map(order => 
          order.id === orderId ? { ...order, status: "completed" } : order
        );
        alert("Order marked as completed");
      } catch (error) {
        console.error("Error updating order:", error);
      }
    },
    statusClass(status) {
      return {
        pending: "status-pending",
        completed: "status-completed"
      }[status] || "";
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
