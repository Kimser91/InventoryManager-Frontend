/*import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '../layouts/AdminLayout.vue';
import Dashboard from '../views/Dashboard.vue';
import Users from '../views/Users.vue';
import Inventory from '../views/Inventory.vue';
import Orders from '../views/Orders.vue'; 
import Test from '../views/Test.vue';
console.log("jeg er i router")
const routes = [
  { path: '/', component: AdminLayout, children: [
    { path: 'test', component: Test },
    { path: 'dashboard', component: Dashboard  },
    { path: 'users', component: Users },
    { path: 'inventory', component: Inventory  },
    { path: 'orders', component: Orders }
  ] }
];

console.log("my routes", routes);
const router = createRouter({
  history: createWebHistory(),
  routes,
});

/*router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  console.log("token i router", token)
  console.log(to.path)
  if (to.meta.requiresAuth && !token) {
    next('/');
  } else {
    console.log("jeg sender deg videre")
    next();
  }
});*/

//export default router;


import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

import Dashboard from '@/views/Dashboard.vue'
import Inventory from '@/views/Inventory.vue'
import Users from '@/views/Users.vue'
import Orders from '@/views/Orders.vue'

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
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})



export default router;
