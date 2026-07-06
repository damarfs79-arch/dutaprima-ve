<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { dutaApi, settingsApi } from '../services/dutaPrimaApi'

const route = useRoute()
const open = ref(false)
const showPengumumanMenu = ref(false)
const showDutaMenu = ref(false)
const dropdownRef = ref(null)
const dropdownDutaRef = ref(null)

const dutas = ref([])
const angkatanList = ref([])

const links = [
  { to: '/', label: 'Beranda' },
  { to: '/galeri-duta', label: 'Galeri Duta' },
  { to: '/pendaftaran', label: 'Pendaftaran' },
]

const isActive = (path) => route.path === path
const isPengumumanActive = () => route.path === '/pengumuman' || route.path === '/voting'
const isDutaActive = () => route.path === '/daftar-duta'

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    showPengumumanMenu.value = false
  }
  if (dropdownDutaRef.value && !dropdownDutaRef.value.contains(e.target)) {
    showDutaMenu.value = false
  }
}

onMounted(async () => {
  try {
    const [dutaData, angkatanData] = await Promise.all([
      dutaApi.getAll(),
      settingsApi.getAngkatan()
    ])
    dutas.value = dutaData
    angkatanList.value = angkatanData.sort((a, b) => b - a)
  } catch (e) {}
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <header class="sticky top-0 z-50 bg-gradient-to-r from-[#e5b362] to-[#c78b3a] shadow-md border-b border-[#b57a2e]">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2 shrink-0" @click="open = false">
        <img
          :src="'/images/logo-duta.png'"
          alt="Logo Duta Prima"
          class="w-9 h-9 rounded-full object-cover border border-brand-amber bg-white"
        />
        <span class="font-display font-bold text-lg sm:text-xl text-white drop-shadow-sm">
          Duta Prima
        </span>
      </RouterLink>

      <!-- Desktop Nav -->
      <ul class="hidden md:flex items-center gap-8 text-sm font-medium">
        <li v-for="link in links" :key="link.to">
          <RouterLink
            :to="link.to"
            class="pb-1 border-b-2 transition-colors"
            :class="
              isActive(link.to)
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-white/80 hover:text-white hover:border-white/50'
            "
          >
            {{ link.label }}
          </RouterLink>
        </li>

        <!-- Dropdown Daftar Duta -->
        <li class="relative" ref="dropdownDutaRef">
          <button
            @click="showDutaMenu = !showDutaMenu; showPengumumanMenu = false"
            class="flex items-center gap-1 pb-1 border-b-2 transition-colors"
            :class="isDutaActive()
              ? 'border-white text-white font-semibold'
              : 'border-transparent text-white/80 hover:text-white hover:border-white/50'"
          >
            Daftar Duta
            <svg
              class="w-3.5 h-3.5 transition-transform"
              :class="showDutaMenu ? 'rotate-180' : ''"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>
          </button>

          <transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div
              v-show="showDutaMenu"
              class="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 max-h-60 overflow-y-auto"
            >
              <RouterLink
                v-for="angkatan in angkatanList"
                :key="angkatan"
                :to="'/daftar-duta?angkatan=' + angkatan"
                @click="showDutaMenu = false"
                class="block px-4 py-2 text-sm text-brand-dark hover:bg-brand-amber/10 hover:text-brand-orange transition-colors"
                :class="route.query.angkatan == angkatan || (route.path === '/daftar-duta' && !route.query.angkatan && angkatan === angkatanList[0]) ? 'font-semibold text-brand-orange' : ''"
              >
                  Angkatan {{ angkatan }}
              </RouterLink>
            </div>
          </transition>
        </li>

        <!-- Dropdown Pengumuman -->
        <li class="relative" ref="dropdownRef">
          <button
            @click="showPengumumanMenu = !showPengumumanMenu; showDutaMenu = false"
            class="flex items-center gap-1 pb-1 border-b-2 transition-colors"
            :class="isPengumumanActive()
              ? 'border-white text-white font-semibold'
              : 'border-transparent text-white/80 hover:text-white hover:border-white/50'"
          >
            Pengumuman
            <svg
              class="w-3.5 h-3.5 transition-transform"
              :class="showPengumumanMenu ? 'rotate-180' : ''"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>
          </button>

          <transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div
              v-show="showPengumumanMenu"
              class="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50"
            >
              <RouterLink
                to="/pengumuman"
                @click="showPengumumanMenu = false"
                class="block px-4 py-2.5 text-sm text-brand-dark hover:bg-brand-amber/10 hover:text-brand-orange transition-colors"
                :class="route.path === '/pengumuman' ? 'font-semibold text-brand-orange' : ''"
              >
                  Hasil Seleksi
              </RouterLink>
              <RouterLink
                to="/voting"
                @click="showPengumumanMenu = false"
                class="block px-4 py-2.5 text-sm text-brand-dark hover:bg-brand-amber/10 hover:text-brand-orange transition-colors"
                :class="route.path === '/voting' ? 'font-semibold text-brand-orange' : ''"
              >
                 Voting Duta
              </RouterLink>
            </div>
          </transition>
        </li>
      </ul>

      <button
        class="md:hidden p-2 -mr-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        @click="open = !open"
        aria-label="Buka menu"
      >
        <svg v-if="!open" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </nav>

    <!-- Mobile Menu -->
    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="open" class="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="block py-2 text-sm font-medium"
          :class="isActive(link.to) ? 'text-brand-orange' : 'text-gray-700'"
          @click="open = false"
        >
          {{ link.label }}
        </RouterLink>
        <div class="border-t border-gray-100 pt-2">
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 px-1">Daftar Duta</p>
          <RouterLink v-for="a in angkatanList" :key="a" :to="'/daftar-duta?angkatan=' + a" class="block py-2 text-sm font-medium" :class="route.query.angkatan == a || (route.path === '/daftar-duta' && !route.query.angkatan && a === angkatanList[0]) ? 'text-brand-orange' : 'text-gray-700'" @click="open = false">
            Angkatan {{ a }}
          </RouterLink>
        </div>

        <!-- Mobile Pengumuman sub-links -->
        <div class="border-t border-gray-100 pt-2">
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 px-1">Pengumuman</p>
          <RouterLink to="/pengumuman" class="block py-2 text-sm font-medium" :class="route.path === '/pengumuman' ? 'text-brand-orange' : 'text-gray-700'" @click="open = false">
            Hasil Seleksi
          </RouterLink>
          <RouterLink to="/voting" class="block py-2 text-sm font-medium" :class="route.path === '/voting' ? 'text-brand-orange' : 'text-gray-700'" @click="open = false">
            Voting Duta
          </RouterLink>
        </div>
      </div>
    </transition>
  </header>
</template>
