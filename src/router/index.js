import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Users from '../views/Users.vue';
import Inventory from '../views/Inventory.vue';
import Orders from '../views/Orders.vue'; // 🆕 Importer Orders-siden

const routes = [
  { path: '/', component: Login },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    component: Users,
    meta: { requiresAuth: true },
  },
  {
    path: '/inventory',
    component: Inventory,
    meta: { requiresAuth: true },
  },
  {
    path: '/orders', // 🆕 Legger til Orders-siden i rutene
    component: Orders,
    meta: { requiresAuth: true },
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/');
  } else {
    next();
  }
});

export default router;
