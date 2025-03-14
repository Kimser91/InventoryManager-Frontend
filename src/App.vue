<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';
import AdminLayout from './layouts/AdminLayout.vue';

export default defineComponent({
  components: {
    AdminLayout,
  },
  setup() {
    const route = useRoute();

    // Sikrer at route og meta eksisterer, og fallback til 'div'
    const layout = computed(() => (route.meta?.requiresAuth ? AdminLayout : 'div'));

    return { layout };
  },
});
</script>
