<template>
  <div class="inventory">
    <h1>Inventory Management</h1>

    <div class="add-product bg-light mt-5">
      <button class="btn btn-primary mb-4" @click="showForm = !showForm">
        {{ showForm ? 'Hide Form' : 'Add New Product' }}
      </button>

      <transition name="slide-fade">
        <div v-if="showForm" class="bg-light p-4 rounded">
          <h2>Add New Product</h2>
          <form @submit.prevent="addProduct">
            <div class="mb-3" v-for="(label, key) in productFields" :key="key">
              <label>{{ label }}</label>
              <input v-model="newProduct[key]" :type="key.includes('quantity') || key.includes('threshold') || key.includes('price') ? 'number' : 'text'" class="form-control" required />
            </div>

            <div class="mb-3">
              <label>Owner</label>
              <select v-model="selectedOwner" class="form-control" required>
                <option disabled value="">Select existing or add new</option>
                <option v-for="owner in owners" :key="owner" :value="owner">{{ owner }}</option>
                <option value="__custom__">-- Add new owner --</option>
              </select>
            </div>

            <div v-if="selectedOwner === '__custom__'" class="mb-3">
              <label>New Owner</label>
              <input v-model="customOwner" class="form-control" placeholder="Enter new owner name" required />
            </div>

            <button type="submit" class="btn btn-success mt-2">Add Product</button>
          </form>
        </div>
      </transition>
    </div>

    <table>
      <thead>
        <tr>
          <th v-for="head in tableHeaders" :key="head">{{ head }}</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredInventory" :key="item.id" :class="getRowClass(item)">
          <td>{{ item.id }}</td>
          <td v-for="field in itemFields" :key="field">
            <input v-if="editingId === item.id" v-model="editProduct[field]" :type="field.includes('quantity') || field.includes('threshold') || field.includes('price') ? 'number' : 'text'" />
            <span v-else>{{ field === 'price' ? item[field] + ' NOK' : item[field] }}</span>
          </td>
          <td>{{ getStatusText(item) }}</td>
          <td>
            <button v-if="editingId === item.id" @click="saveEdit(item.id)">Save</button>
            <button v-else @click="editItem(item)">Edit</button>
            <button @click="deleteItem(item.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <button class="generate-orders" @click="generateOrders">Generate Orders</button>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.inventoryadministrator.com/api';

export default {
  data() {
    return {
      showForm: false,
      inventory: [],
      filteredInventory: [],
      owners: [],
      selectedOwner: '',
      customOwner: '',
      userPermissions: [],
      canSeeAll: false,
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
      editProduct: {},
      productFields: {
        product_name: 'Product Name',
        store_name: 'Store Name',
        article_number: 'Article #',
        stock_quantity: 'Stock Quantity',
        min_threshold: 'Min Threshold',
        max_stock: 'Max Stock',
        price: 'Price (NOK)'
      },
      itemFields: ['product_name', 'store_name', 'article_number', 'stock_quantity', 'min_threshold', 'max_stock', 'price', 'owner'],
      tableHeaders: ['ID', 'Product', 'Store', 'Article #', 'Stock', 'Min Threshold', 'Max Stock', 'Price', 'Owner', 'Status']
    };
  },
  async mounted() {
    await this.fetchUser();
    await this.fetchInventory();
  },
  methods: {
    async fetchUser() {
      try {
        const token = localStorage.getItem('admin.token');
        const response = await axios.get(`${API_BASE_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.userPermissions = response.data.permissions ? JSON.parse(response.data.permissions) : [];
        this.canSeeAll = !!response.data.can_see_all;
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    },
    async fetchInventory() {
      try {
        const token = localStorage.getItem('admin.token');
        const response = await axios.get(`${API_BASE_URL}/inventory`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.inventory = response.data;
        this.filterInventory();
        this.updateOwnersList();
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    },
    filterInventory() {
      this.filteredInventory = this.canSeeAll
        ? this.inventory
        : this.inventory.filter(item => this.userPermissions.includes(item.owner));
    },
    updateOwnersList() {
      const ownerSet = new Set(this.inventory.map(item => item.owner).filter(Boolean));
      this.owners = Array.from(ownerSet);
    },
    async addProduct() {
      try {
        const token = localStorage.getItem('admin.token');
        const owner = this.selectedOwner === '__custom__' ? this.customOwner : this.selectedOwner;
        await axios.post(`${API_BASE_URL}/inventory`, { ...this.newProduct, owner }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.resetForm();
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
        const token = localStorage.getItem('admin.token');
        await axios.put(`${API_BASE_URL}/inventory/${id}`, this.editProduct, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.editingId = null;
        await this.fetchInventory();
      } catch (error) {
        console.error('Error saving edit:', error);
      }
    },
    async deleteItem(id) {
      if (confirm('Are you sure you want to delete this item?')) {
        try {
          const token = localStorage.getItem('admin.token');
          await axios.delete(`${API_BASE_URL}/inventory/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          await this.fetchInventory();
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      }
    },
    async generateOrders() {
      try {
        const token = localStorage.getItem('admin.token');
        await axios.post(`${API_BASE_URL}/inventory/generate-orders`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Orders generated successfully!');
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
    },
    resetForm() {
      this.newProduct = {
        product_name: '',
        store_name: '',
        article_number: '',
        stock_quantity: 0,
        min_threshold: 1,
        max_stock: 10,
        price: 0,
        owner: ''
      };
      this.selectedOwner = '';
      this.customOwner = '';
      this.showForm = false;
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
.ok { background: #c8f7c5; }
.ordered { background: #fff3cd; }
.below { background: #f8d7da; }
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
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.5s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.slide-fade-enter-to, .slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
