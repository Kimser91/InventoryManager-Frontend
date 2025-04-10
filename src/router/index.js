import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

import Dashboard from '@/views/Dashboard.vue'
import Inventory from '@/views/Inventory.vue'
import Users from '@/views/Users.vue'
import Orders from '@/views/Orders.vue'
import Requested from '@/views/RequestedProducts.vue'
import ScanProduct from '@/views/ScanProduct.vue'

const routes = [
  {
    path: '/',
    component: AdminLayout,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('admin.token');
      if (!token) {
        window.location.href = 'https://inventoryadministrator.com/login';
      } else {
        next();
      }
    },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', component: Dashboard },
      { path: 'inventory', component: Inventory },
      { path: 'users', component: Users },
      { path: 'orders', component: Orders },
      { path: 'requested', component: Requested},
      { path: 'scan', name: 'Scan Product', component: ScanProduct},
    ],
    
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})



export default router;
