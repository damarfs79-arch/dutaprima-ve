<script setup>
import { ref, onMounted, computed } from 'vue'
import { dashboardApi } from '../../services/dutaPrimaApi'
import VueApexCharts from 'vue3-apexcharts'

const stats = ref({
  totalDuta: 0,
  totalGallery: 0,
  totalRegistrations: 0,
  totalVisitors: 0,
})

const cards = [
  { label: 'Total Duta', key: 'totalDuta', color: 'text-blue-600', bg: 'bg-blue-100', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { label: 'Galeri', key: 'totalGallery', color: 'text-purple-600', bg: 'bg-purple-100', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Pendaftar', key: 'totalRegistrations', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Pengunjung', key: 'totalVisitors', color: 'text-amber-600', bg: 'bg-amber-100', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
]

// Area Chart (Mock data for visual polish)
const areaChartSeries = ref([{
  name: 'Pengunjung',
  data: [31, 40, 28, 51, 42, 109, 100]
}, {
  name: 'Pendaftar Baru',
  data: [11, 32, 45, 32, 34, 52, 41]
}])

const areaChartOptions = ref({
  chart: {
    height: 350,
    type: 'area',
    fontFamily: 'inherit',
    toolbar: { show: false }
  },
  colors: ['#f59e0b', '#10b981'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 90, 100]
    }
  },
  xaxis: {
    categories: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#6b7280' } }
  },
  yaxis: {
    labels: { style: { colors: '#6b7280' } }
  },
  grid: {
    borderColor: '#f3f4f6',
    strokeDashArray: 4,
  },
  legend: { position: 'top', horizontalAlign: 'right' }
})

// Donut Chart based on real stats
const donutChartSeries = computed(() => [
  stats.value.totalDuta || 0,
  stats.value.totalGallery || 0,
  stats.value.totalRegistrations || 0
])

const donutChartOptions = ref({
  chart: {
    type: 'donut',
    fontFamily: 'inherit',
  },
  labels: ['Duta', 'Galeri', 'Pendaftar'],
  colors: ['#3b82f6', '#8b5cf6', '#10b981'],
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          name: { show: true, color: '#6b7280' },
          value: {
            show: true,
            fontSize: '28px',
            fontWeight: 700,
            color: '#1f2937'
          },
          total: {
            show: true,
            showAlways: true,
            label: 'Total Data',
            color: '#9ca3af',
            formatter: function (w) {
              return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
            }
          }
        }
      }
    }
  },
  dataLabels: { enabled: false },
  legend: { position: 'bottom', markers: { radius: 12 } },
  stroke: { show: false },
  tooltip: {
    theme: 'light',
    y: { formatter: (val) => val + ' Item' }
  }
})

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
    <!-- Welcome Banner -->
    <div class="bg-gradient-to-r from-brand-amber/10 to-transparent p-6 sm:p-8 rounded-3xl border border-brand-amber/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
      <div class="relative z-10">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">Dashboard Overview</h2>
        <p class="text-gray-600 mt-2 text-sm sm:text-base max-w-lg">
          Pantau dan kelola seluruh statistik pendaftaran, galeri, dan duta terpilih dalam satu antarmuka yang elegan.
        </p>
      </div>
      <div class="hidden md:block relative z-10 p-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white">
        <svg class="w-16 h-16 text-brand-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <!-- Decorative element -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-brand-amber/20 rounded-full blur-3xl"></div>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div v-for="stat in cards" :key="stat.key" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow group relative overflow-hidden">
        <!-- Decoration -->
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-transparent to-gray-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        
        <div class="flex items-center gap-4 relative z-10">
          <div :class="`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-gray-800">{{ stats[stat.key] ?? 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Line Chart -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800">Aktivitas Mingguan</h3>
          <span class="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">7 Hari Terakhir</span>
        </div>
        <div class="min-h-[300px]">
          <VueApexCharts type="area" height="350" :options="areaChartOptions" :series="areaChartSeries" />
        </div>
      </div>

      <!-- Donut Chart -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="mb-4">
          <h3 class="text-lg font-bold text-gray-800">Proporsi Data</h3>
          <p class="text-sm text-gray-500">Distribusi keseluruhan data</p>
        </div>
        <div class="flex items-center justify-center min-h-[300px] pt-4">
          <VueApexCharts type="donut" width="100%" :options="donutChartOptions" :series="donutChartSeries" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure smooth font rendering in charts */
:deep(.apexcharts-text) {
  font-family: inherit !important;
}
:deep(.apexcharts-tooltip) {
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
}
</style>
