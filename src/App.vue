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

    // Sikre at route eksisterer og unngå feil ved undefined meta
    const layout = computed(() => {
      return route?.meta?.requiresAuth ? AdminLayout : 'div';
    });

    return { layout };
  },
});
</script>
