<script setup>
import { ref, onMounted } from 'vue'
import { dashboardApi } from '../../services/dutaPrimaApi'

const stats = ref({
  totalDuta: 0,
  totalGallery: 0,
  totalRegistrations: 0,
  totalVisitors: 0,
})

const cards = [
  { label: 'Total Duta', key: 'totalDuta' },
  { label: 'Galeri', key: 'totalGallery' },
  { label: 'Pendaftar', key: 'totalRegistrations' },
  { label: 'Pengunjung', key: 'totalVisitors' },
]

const loadStats = async () => {
  try {
    stats.value = await dashboardApi.getStats()
  } catch {
    // ignore for now
  }
}

onMounted(loadStats)
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Selamat Datang di Dashboard Admin</h2>
        <p class="text-gray-500 mt-1">Kelola semua data Duta Prima dari satu tempat.</p>
      </div>
      <div class="hidden sm:block">
        <svg class="w-24 h-24 text-brand-amber/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in cards" :key="stat.key" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-brand-amber/15 text-brand-orange flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats[stat.key] ?? 0 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
