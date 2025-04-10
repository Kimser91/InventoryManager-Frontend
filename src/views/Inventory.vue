<template>
  <div class="container mt-4">
    <h1 class="mb-4">Inventory Management</h1>

    <button class="btn btn-primary mb-4" @click="showForm = !showForm">
      {{ showForm ? 'Hide Form' : 'Add New Product' }}
    </button>

    <transition name="slide-fade">
      <div v-if="showForm" class="card p-4 mb-4">
        <h2>Add New Product</h2>
        <form @submit.prevent="addProduct">
          <div class="row g-3">
            <div class="col-md-6" v-for="(label, key) in productFields" :key="key">
              <label class="form-label">{{ label }}</label>
              <input v-model="newProduct[key]" :type="key.includes('quantity') || key.includes('threshold') || key.includes('price') ? 'number' : 'text'" class="form-control" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Owner</label>
              <select v-model="selectedOwner" class="form-control" required>
                <option disabled value="">Select existing or add new</option>
                <option v-for="owner in owners" :key="owner" :value="owner">{{ owner }}</option>
                <option value="__custom__">-- Add new owner --</option>
              </select>
            </div>

            <div v-if="selectedOwner === '__custom__'" class="col-md-6">
              <label class="form-label">New Owner</label>
              <input v-model="customOwner" class="form-control" placeholder="Enter new owner name" required />
            </div>
          </div>

          <button type="submit" class="btn btn-success mt-3">Add Product</button>
        </form>
      </div>
    </transition>

    <table class="table table-striped table-bordered">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th v-for="head in tableHeaders" :key="head">{{ head }}</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredInventory" :key="item.id" :class="getRowClass(item)">
          <td>{{ item.id }}</td>
          
          <td v-for="field in itemFields" :key="field">
            <template v-if="editingId === item.id">
              <input v-if="field !== 'owner'" v-model="editProduct[field]" :type="field.includes('quantity') || field.includes('threshold') || field.includes('price') ? 'number' : 'text'" class="form-control form-control-sm" />
              
              <select v-else v-model="editProduct.owner" class="form-control form-control-sm">
                <option v-for="owner in owners" :key="owner" :value="owner">{{ owner }}</option>
              </select>
            </template>
            <template v-else>
              {{ item[field] }}
            </template>
          </td>

          <td>
            <span :class="getStatusClass(getStatusText(item))">{{ getStatusText(item) }}</span>
          </td>

          <td>
            <button v-if="editingId === item.id" class="btn btn-success btn-sm" @click="saveEdit(item.id)">Save</button>
            <button v-else class="btn btn-primary btn-sm" @click="editItem(item)">Edit</button>
            <button class="btn btn-danger btn-sm" @click="deleteItem(item.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <button class="btn btn-success mt-4" @click="generateOrders">Generate Orders</button>
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
      tableHeaders: ['Product', 'Store', 'Article #', 'Stock', 'Min Threshold', 'Max Stock', 'Price', 'Owner', 'Status']
    };
  },
  async mounted() {
    await this.fetchUser();
    await this.fetchInventory();
  },
  methods: {
    async fetchUser() {
      const token = localStorage.getItem('admin.token');
      const response = await axios.get(`${API_BASE_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.userPermissions = response.data.permissions ? JSON.parse(response.data.permissions) : [];
      this.canSeeAll = !!response.data.can_see_all;
    },
    async fetchInventory() {
      const token = localStorage.getItem('admin.token');
      const response = await axios.get(`${API_BASE_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.inventory = response.data;
      this.filterInventory();
      this.updateOwnersList();
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
      const token = localStorage.getItem('admin.token');
      const owner = this.selectedOwner === '__custom__' ? this.customOwner : this.selectedOwner;
      await axios.post(`${API_BASE_URL}/inventory`, { ...this.newProduct, owner }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.resetForm();
      await this.fetchInventory();
    },
    editItem(item) {
      this.editingId = item.id;
      this.editProduct = { ...item };
    },
    async saveEdit(id) {
      const token = localStorage.getItem('admin.token');
      await axios.put(`${API_BASE_URL}/inventory/${id}`, this.editProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.editingId = null;
      await this.fetchInventory();
    },
    async deleteItem(id) {
      if (confirm('Are you sure you want to delete this item?')) {
        const token = localStorage.getItem('admin.token');
        await axios.delete(`${API_BASE_URL}/inventory/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await this.fetchInventory();
      }
    },
    async generateOrders() {
      const token = localStorage.getItem('admin.token');
      await axios.post(`${API_BASE_URL}/inventory/generate-orders`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Orders generated successfully!');
      await this.fetchInventory();
    },
    getStatusText(item) {
      if (item.stock_quantity >= item.min_threshold) return 'OK';
      if (item.is_ordered) return 'Ordered';
      return 'Below';
    },
    getRowClass(item) {
      if (item.stock_quantity >= item.min_threshold) return 'table-success';
      if (item.is_ordered) return 'table-warning';
      return 'table-danger';
    },
    getStatusClass(status) {
      if (status === 'OK') return 'badge bg-success';
      if (status === 'Ordered') return 'badge bg-warning text-dark';
      return 'badge bg-danger';
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
