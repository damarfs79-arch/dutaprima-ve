<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { pendaftaranApi } from '../services/dutaPrimaApi'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route  = useRoute()
const authStore = useAuthStore()

const unreadCount = ref(0)
let pollInterval  = null
let inactivityTimer = null
const INACTIVITY_LIMIT = 3 * 60 * 1000 // 3 minutes

const openDropdown = ref(false)
const dropdownRef = ref(null)
const isSidebarOpen = ref(false)

const menuItems = [
  { name: 'Dashboard',           path: '/admin/dashboard',             icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  {
    name: 'Data Duta',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    children: [
      { name: 'Galeri Duta', path: '/admin/gallery' },
      { name: 'Daftar Duta', path: '/admin/duta' },
    ]
  },
  { name: 'List Pendaftar',      path: '/admin/pendaftaran',           icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { name: 'Peserta Seleksi',     path: '/admin/peserta-seleksi',       icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Kandidat Voting',     path: '/admin/kandidat-voting',       icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { name: 'Setting Marquee', path: '/admin/registration-settings', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { name: 'Alur Seleksi',        path: '/admin/selection-flow',        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
]

const pageTitle = computed(() => {
  for (const item of menuItems) {
    if (item.children) {
      const child = item.children.find(c => route.path.startsWith(c.path))
      if (child) return child.name
    } else if (route.path.startsWith(item.path)) {
      return item.name
    }
  }
  return 'Dashboard'
})

function isDropdownActive(item) {
  return item.children && item.children.some(c => route.path.startsWith(c.path))
}

function handleClickOutside(e) {
  if (dropdownRef.value) {
    const elements = Array.isArray(dropdownRef.value) ? dropdownRef.value : [dropdownRef.value]
    const isClickInside = elements.some(el => el && el.contains && el.contains(e.target))
    if (!isClickInside) {
      openDropdown.value = false
    }
  }
}

const loadUnreadCount = async () => {
  try {
    const res = await pendaftaranApi.getUnreadCount()
    unreadCount.value = res.count
  } catch {
    // ignore
  }
}

const handleLogout = async (auto = false) => {
  await authStore.logout()
  if (auto) {
    alert('Sesi Anda telah berakhir karena tidak ada aktivitas selama 3 menit. Silakan login kembali.')
  }
  router.push('/admin/login')
}

const resetInactivityTimer = () => {
  if (inactivityTimer) clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => {
    handleLogout(true)
  }, INACTIVITY_LIMIT)
}

const setupInactivityTracking = () => {
  window.addEventListener('mousemove', resetInactivityTimer)
  window.addEventListener('keydown', resetInactivityTimer)
  window.addEventListener('click', resetInactivityTimer)
  window.addEventListener('scroll', resetInactivityTimer)
  resetInactivityTimer()
}

const cleanupInactivityTracking = () => {
  window.removeEventListener('mousemove', resetInactivityTimer)
  window.removeEventListener('keydown', resetInactivityTimer)
  window.removeEventListener('click', resetInactivityTimer)
  window.removeEventListener('scroll', resetInactivityTimer)
  if (inactivityTimer) clearTimeout(inactivityTimer)
}

onMounted(() => {
  loadUnreadCount()
  pollInterval = setInterval(loadUnreadCount, 15000)
  document.addEventListener('click', handleClickOutside)
  setupInactivityTracking()
})

onUnmounted(() => {
  clearInterval(pollInterval)
  document.removeEventListener('click', handleClickOutside)
  cleanupInactivityTracking()
})

// handleLogout defined above
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <!-- Sidebar Mobile Overlay -->
    <div v-if="isSidebarOpen" class="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden" @click="isSidebarOpen = false"></div>

    <!-- Sidebar -->
    <aside :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col']">
      <RouterLink @click="isSidebarOpen = false" to="/admin/dashboard" class="h-16 flex items-center gap-2 px-6 border-b border-gray-200">
                <img
          :src="'/images/logo-duta.png'"
          alt="Logo Duta Prima"
          class="w-9 h-9 rounded-full object-cover border border-brand-amber bg-white"
        />
        <span class="font-display font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-brand-amber to-brand-orange">
          Duta Prima
        </span>
        <span class="ml-auto px-2 py-0.5 text-[10px] font-semibold bg-brand-amber/15 text-brand-orange rounded-full">Admin</span>
      </RouterLink>
      
      <div class="flex-1 overflow-y-auto py-4">
        <nav class="px-3 space-y-1">
          <template v-for="item in menuItems" :key="item.name">
            <!-- Dropdown item -->
            <div v-if="item.children" ref="dropdownRef" class="relative">
              <button
                @click="openDropdown = !openDropdown"
                class="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200"
                :class="isDropdownActive(item)
                  ? 'bg-brand-amber/10 text-brand-orange'
                  : 'text-gray-600 hover:bg-brand-amber/5 hover:text-brand-dark'"
              >
                <span class="flex items-center">
                  <svg class="w-5 h-5 mr-3" :class="[isDropdownActive(item) ? 'text-brand-orange' : 'text-gray-400']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                  </svg>
                  {{ item.name }}
                </span>
                <svg
                  class="w-3.5 h-3.5 transition-transform duration-200"
                  :class="openDropdown ? 'rotate-180' : ''"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <!-- Children -->
              <transition
                enter-active-class="transition ease-out duration-150"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-2"
              >
                <div v-show="openDropdown" class="mt-1 ml-4 space-y-0.5">
                  <router-link
                    v-for="child in item.children"
                    :key="child.name"
                    :to="child.path"
                    @click="openDropdown = false; isSidebarOpen = false"
                    class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                    :class="route.path.startsWith(child.path)
                      ? 'bg-brand-amber/10 text-brand-orange'
                      : 'text-gray-500 hover:bg-brand-amber/5 hover:text-brand-dark'"
                  >
                    {{ child.name }}
                  </router-link>
                </div>
              </transition>
            </div>
            <!-- Regular item -->
            <router-link
              v-else
              :to="item.path"
              @click="isSidebarOpen = false"
              class="flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="[
                route.path.startsWith(item.path)
                  ? 'bg-brand-amber/10 text-brand-orange'
                  : 'text-gray-600 hover:bg-brand-amber/5 hover:text-brand-dark'
              ]"
            >
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-3" :class="[route.path.startsWith(item.path) ? 'text-brand-orange' : 'text-gray-400']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                </svg>
                {{ item.name }}
              </span>
              <!-- Badge notifikasi untuk List Pendaftar -->
              <span
                v-if="item.path === '/admin/pendaftaran' && unreadCount > 0"
                class="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </router-link>
          </template>
        </nav>
      </div>

      <div class="p-4 border-t border-gray-200 space-y-2">
        <button @click="handleLogout" class="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
        <router-link to="/" class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Web Publik
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Header -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center">
          <button @click="isSidebarOpen = !isSidebarOpen" class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-amber">
            <span class="sr-only">Buka sidebar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 class="ml-4 md:ml-0 text-xl font-semibold text-brand-dark font-display">
            {{ pageTitle }}
          </h1>
        </div>
        
        <div class="flex items-center">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-amber to-brand-orange flex items-center justify-center text-white font-bold text-sm shadow-sm">
              A
            </div>
            <span class="text-sm font-medium text-gray-700 hidden sm:block">Admin User</span>
          </div>
        </div>
      </header>

      <!-- Main Scrollable Area -->
      <main class="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
