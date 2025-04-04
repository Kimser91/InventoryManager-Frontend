<template>
  <div class="dashboard">
    
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
      orders: []
    };
  },
  async mounted() {
    try {
      const usersResponse = await axios.get('https://api.inventoryadministrator.com/api/users');
      this.totalUsers = usersResponse.data.length;

      const inventoryResponse = await axios.get('https://api.inventoryadministrator.com/api/inventory');

      const lowStock = inventoryResponse.data.filter(item => item.stock_quantity < item.min_threshold);
      this.lowStockItems = lowStock.length;

      this.inventoryByStore = lowStock.reduce((acc, item) => {
        if (!acc[item.store_name]) {
          acc[item.store_name] = [];
        }
        acc[item.store_name].push(item);
        return acc;
      }, {});

      const ordersResponse = await axios.get("https://api.inventoryadministrator.com/api/orders");
      this.orders = ordersResponse.data;
      this.generatedOrders = this.orders.length;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  },
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

</style>
