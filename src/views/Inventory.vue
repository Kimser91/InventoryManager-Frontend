<template>
  <div class="inventory">
    <h1>Inventory Management</h1>

    <!-- Legg til nytt produkt -->
    <div class="add-product">
      <h2>Add New Product</h2>
      <form @submit.prevent="addProduct">
        <input v-model="newProduct.product_name" placeholder="Product Name" required />
        <input v-model="newProduct.store_name" placeholder="Store Name" required />
        <input v-model="newProduct.article_number" placeholder="Article #" required />
        <input type="number" v-model="newProduct.stock_quantity" placeholder="Stock Quantity" required />
        <input type="number" v-model="newProduct.min_threshold" placeholder="Min Threshold" required />
        <input type="number" v-model="newProduct.max_stock" placeholder="Max Stock" required />
        <input type="number" v-model="newProduct.price" placeholder="Price (NOK)" required />
        <input v-model="newProduct.owner" placeholder="Owner" required />
        <button type="submit">Add Product</button>
      </form>
    </div>

    <!-- Lagerbeholdning -->
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
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in inventory" :key="item.id" :class="getRowClass(item)">
          <td>{{ item.id }}</td>
          <td><input v-if="editingId === item.id" v-model="editProduct.product_name" />
              <span v-else>{{ item.product_name }}</span></td>
          <td><input v-if="editingId === item.id" v-model="editProduct.store_name" />
              <span v-else>{{ item.store_name }}</span></td>
          <td><input v-if="editingId === item.id" v-model="editProduct.article_number" />
              <span v-else>{{ item.article_number }}</span></td>
          <td><input v-if="editingId === item.id" type="number" v-model="editProduct.stock_quantity" />
              <span v-else>{{ item.stock_quantity }}</span></td>
          <td><input v-if="editingId === item.id" type="number" v-model="editProduct.min_threshold" />
              <span v-else>{{ item.min_threshold }}</span></td>
          <td><input v-if="editingId === item.id" type="number" v-model="editProduct.max_stock" />
              <span v-else>{{ item.max_stock }}</span></td>
          <td><input v-if="editingId === item.id" type="number" v-model="editProduct.price" />
              <span v-else>{{ item.price }} NOK</span></td>
          <td><input v-if="editingId === item.id" v-model="editProduct.owner" />
              <span v-else>{{ item.owner }}</span></td>
          <td>{{ getStatusText(item) }}</td>
          <td>
            <button v-if="editingId === item.id" @click="saveEdit(item.id)">Save</button>
            <button v-else @click="editItem(item)">Edit</button>
            <button @click="deleteItem(item.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Generer ordre -->
    <button class="generate-orders" @click="generateOrders">Generate Orders</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      inventory: [],
      newProduct: {
        product_name: '',
        store_name: '',
        article_number: '',
        stock_quantity: 0,
        min_threshold: 1,
        max_stock: 10,
        price: 0,
        owner: ''
      },
      editingId: null,
      editProduct: {}
    };
  },
  async mounted() {
    await this.fetchInventory();
  },
  methods: {
    async fetchInventory() {
      try {
        const response = await axios.get('http://localhost:5000/api/inventory');
        this.inventory = response.data;
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    },
    async addProduct() {
      try {
        await axios.post('http://localhost:5000/api/inventory', this.newProduct);
        alert('Product added!');
        this.newProduct = { product_name: '', store_name: '', article_number: '', stock_quantity: 0, min_threshold: 1, max_stock: 10, price: 0, owner: '' };
        await this.fetchInventory();
      } catch (error) {
        console.error('Error adding product:', error);
      }
    },
    editItem(item) {
      this.editingId = item.id;
      this.editProduct = { ...item };
    },
    async saveEdit(id) {
      try {
        await axios.put(`http://localhost:5000/api/inventory/${id}`, this.editProduct);
        this.editingId = null;
        await this.fetchInventory();
      } catch (error) {
        console.error('Error updating product:', error);
      }
    },
    async deleteItem(itemId) {
      if (confirm('Are you sure you want to delete this item?')) {
        try {
          await axios.delete(`http://localhost:5000/api/inventory/${itemId}`);
          await this.fetchInventory();
          alert('Item deleted successfully');
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      }
    },
    async generateOrders() {
      try {
        await axios.post('http://localhost:5000/api/inventory/generate-orders');
        alert('Orders generated!');
        await this.fetchInventory();
      } catch (error) {
        console.error('Error generating orders:', error);
      }
    },
    getStatusText(item) {
      if (item.stock_quantity >= item.min_threshold) return 'OK';
      if (item.is_ordered) return 'Ordered';
      return 'Below';
    },
    getRowClass(item) {
      if (item.stock_quantity >= item.min_threshold) return 'ok';
      if (item.is_ordered) return 'ordered';
      return 'below';
    }
  }
};
</script>

<style scoped>
.inventory {
  padding: 20px;
}

.add-product {
  background: #f8f9fa;
  padding: 15px;
  margin-bottom: 20px;
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

.ok { background: #c8f7c5; } /* Grønn */
.ordered { background: #fff3cd; } /* Gul */
.below { background: #f8d7da; } /* Rød */

button {
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  margin-right: 5px;
}

.generate-orders {
  margin-top: 20px;
  background: #28a745;
  color: white;
}

.generate-orders:hover {
  background: #218838;
}
</style>
