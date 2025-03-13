<template>
  <div class="inventory">
    <h1>Inventory Management</h1>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Product</th>
          <th>Store</th>
          <th>Article #</th>
          <th>Stock</th>
          <th>Min Threshold</th>
          <th>Max Stock</th>
          <th>Price</th>
          <th>Owner</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in inventory" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.product_name }}</td>
          <td>{{ item.store_name }}</td>
          <td>{{ item.article_number }}</td>
          <td>{{ item.stock_quantity }}</td>
          <td>{{ item.min_threshold }}</td>
          <td>{{ item.max_stock }}</td>
          <td>{{ item.price }} NOK</td>
          <td>{{ item.owner }}</td>
          <td>
            <button @click="deleteItem(item.id)">Delete</button>
            <button @click="editItem(item)">Edit</button>
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
      inventory: []
    };
  },
  async mounted() {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory');
      this.inventory = response.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  },
  methods: {
    async deleteItem(itemId) {
      if (confirm('Are you sure you want to delete this item?')) {
        try {
          await axios.delete(`http://localhost:5000/api/inventory/${itemId}`);
          this.inventory = this.inventory.filter(item => item.id !== itemId);
          alert('Item deleted successfully');
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      }
    },
    editItem(item) {
      alert(`Editing ${item.product_name} (Not implemented yet)`);
    }
  }
};
</script>

<style scoped>
.inventory {
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
  background: #ffc107;
}

button:nth-child(2):hover {
  background: #e0a800;
}
</style>
