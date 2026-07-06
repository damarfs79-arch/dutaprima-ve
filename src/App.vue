<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import SiteFooter from './components/SiteFooter.vue'

const route = useRoute()
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})
</script>

<template>
  <div v-if="isAdminRoute" class="min-h-screen bg-gray-50 font-body text-brand-dark">
    <router-view />
  </div>
  <div v-else class="min-h-screen flex flex-col bg-white font-body text-brand-dark">
    <NavBar />
    <main class="flex-1">
      <router-view />
    </main>
    <SiteFooter />
  </div>
</template>
