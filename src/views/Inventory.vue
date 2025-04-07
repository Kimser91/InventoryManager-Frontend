<template>
  <div class="inventory">
    <h1>Inventory Management</h1>

    <div class="add-product bg-light mt-5">

      <button class="btn btn-primary mb-4" @click="showForm = !showForm">
          {{ showForm ? 'Skjul skjema' : 'Legg til nytt produkt' }}
      </button>
      <transition name="slide-fade">
      <div v-if="showForm" class="add-product bg-light mt-5">
        <h2>Add New Product</h2>

      <form @submit.prevent="addProduct">
        <div class="mb-3">
          <label>Product Name</label>
          <input v-model="newProduct.product_name" class="form-control" required />
        </div>

        <div class="mb-3">
          <label>Store Name</label>
          <input v-model="newProduct.store_name" class="form-control" required />
        </div>

        <div class="mb-3">
          <label>Article #</label>
          <input v-model="newProduct.article_number" class="form-control" required />
        </div>

        <div class="mb-3">
          <label>Stock Quantity</label>
          <input type="number" v-model="newProduct.stock_quantity" class="form-control" required />
        </div>

        <div class="mb-3">
          <label>Min Threshold</label>
          <input type="number" v-model="newProduct.min_threshold" class="form-control" required />
        </div>

        <div class="mb-3">
          <label>Max Stock</label>
          <input type="number" v-model="newProduct.max_stock" class="form-control" required />
        </div>

        <div class="mb-3">
          <label>Price (NOK)</label>
          <input type="number" v-model="newProduct.price" class="form-control" required />
        </div>


        <div class="mb-3">
          <label>Owner</label>
          <select v-model="selectedOwner" class="form-control" required>
            <option disabled value="">Velg eksisterende eller skriv nytt</option>
            <option v-for="owner in owners" :key="owner" :value="owner">{{ owner }}</option>
            <option value="__custom__">-- Skriv nytt navn --</option>
          </select>
        </div>

        <div v-if="selectedOwner === '__custom__'" class="mb-3">
          <label>Ny Owner</label>
          <input v-model="customOwner" class="form-control" placeholder="Skriv nytt eiernavn" required />
        </div>

        <button type="submit">Add Product</button>
      </form>
      </div>
    </transition>
    </div>

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
        <tr v-for="item in filteredInventory" :key="item.id" :class="getRowClass(item)">
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

    <button class="generate-orders" @click="generateOrders">Generate Orders</button>
  </div>
</template>


<script>
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.inventoryadministrator.com/api";

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
      editProduct: {}
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
        const user = response.data;
        this.userPermissions = user.permissions ? JSON.parse(user.permissions) : [];
        this.canSeeAll = !!user.can_see_all;
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    },
    async fetchInventory() {
      try {
        const response = await axios.get(`${API_BASE_URL}/inventory`);
        this.inventory = response.data;
        this.filterInventory();
        this.updateOwnersList();
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    },
    filterInventory() {
      if (this.canSeeAll) {
        this.filteredInventory = this.inventory;
      } else {
        this.filteredInventory = this.inventory.filter(item =>
          this.userPermissions.includes(item.owner)
        );
      }
    },
    updateOwnersList() {
      const ownerSet = new Set();
      this.inventory.forEach(item => {
        if (item.owner) {
          ownerSet.add(item.owner);
        }
      });
      this.owners = Array.from(ownerSet);
    },
    async addProduct() {
      try {
        const owner = this.selectedOwner === '__custom__' ? this.customOwner : this.selectedOwner;
        await axios.post(`${API_BASE_URL}/inventory`, {
          ...this.newProduct,
          owner: owner
        });
        alert('Product added!');
        this.newProduct = { product_name: '', store_name: '', article_number: '', stock_quantity: 0, min_threshold: 1, max_stock: 10, price: 0, owner: '' };
        this.selectedOwner = '';
        this.customOwner = '';
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
        await axios.put(`${API_BASE_URL}/inventory/${id}`, this.editProduct);
        this.editingId = null;
        await this.fetchInventory();
      } catch (error) {
        console.error('Error updating product:', error);
      }
    },
    async deleteItem(itemId) {
      if (confirm('Are you sure you want to delete this item?')) {
        try {
          await axios.delete(`${API_BASE_URL}/inventory/${itemId}`);
          await this.fetchInventory();
          alert('Item deleted successfully');
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      }
    },
    async generateOrders() {
      try {
        await axios.post(`${API_BASE_URL}/inventory/generate-orders`);
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

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.slide-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}


</style>
