<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dutaApi, settingsApi } from '../services/dutaPrimaApi'

const route = useRoute()
const router = useRouter()

const dutas = ref([])
const isLoading = ref(true)
const spotlightId = ref(null)
const isClicked = ref(false) // false = tampil foto berpasangan, true = tampil foto sendiri-sendiri
const selectedAngkatan = ref(route.query.angkatan || null)

const angkatanList = ref([])

watch(angkatanList, (list) => {
  if (!selectedAngkatan.value && list.length > 0) {
    selectedAngkatan.value = list[0]
  }
}, { immediate: true })

const filteredDutas = computed(() => {
  const data = Array.isArray(dutas.value) ? dutas.value : []
  if (!selectedAngkatan.value) {
    return angkatanList.value.length ? data.filter(d => d.angkatan == angkatanList.value[0]) : data
  }
  return data.filter(d => d.angkatan == selectedAngkatan.value)
})

watch(() => route.query.angkatan, (newVal) => {
  selectedAngkatan.value = newVal || (angkatanList.value.length ? angkatanList.value[0] : null)
})

watch(selectedAngkatan, (newVal) => {
  spotlightId.value = null
  if (newVal && String(route.query.angkatan) !== String(newVal)) {
    router.push({ query: { ...route.query, angkatan: newVal } })
  }
})

const loadDuta = async () => {
  isLoading.value = true
  try {
    const [dutaData, angkatanData] = await Promise.all([
      dutaApi.getAll(),
      settingsApi.getAngkatan()
    ])
    dutas.value = dutaData || []
    angkatanList.value = (angkatanData || []).sort((a, b) => b - a)
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}
onMounted(loadDuta)

const spotlight = computed(() => {
  if (!filteredDutas.value.length) return null
  if (spotlightId.value !== null) {
    return filteredDutas.value.find(d => d.id === spotlightId.value) || filteredDutas.value[0]
  }
  return filteredDutas.value[0]
})

// Klik kartu → ganti spotlight + ke mode foto berpasangan (standby)
function selectSpotlight(duta) {
  if (spotlight.value && spotlight.value.id === duta.id) {
    // Klik duta yang sama → toggle mode
    isClicked.value = !isClicked.value
  } else {
    spotlightId.value = duta.id
    isClicked.value = false // reset ke standby saat ganti duta
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Klik foto utama → toggle mode
function toggleMode() {
  isClicked.value = !isClicked.value
}

const otherDutas = computed(() =>
  filteredDutas.value.filter(d => !spotlight.value || d.id !== spotlight.value.id)
)

function getPhoto(duta) {
  return duta.photo && duta.photo.trim() !== ''
    ? duta.photo
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(duta.name || 'Duta')}&background=7c4d2a&color=fff&size=400`
}

function getPhotoFemale(duta) {
  return duta.photo_female && duta.photo_female.trim() !== ''
    ? duta.photo_female
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(duta.name_female || 'Putri')}&background=c06080&color=fff&size=400`
}

function getPhotoCouple(duta) {
  return duta.photo_couple && duta.photo_couple.trim() !== ''
    ? duta.photo_couple
    : null
}

/** Untuk kartu grid: pakai thumbnail WebP agar hemat bandwidth */
function getThumbCouple(duta) {
  return duta.photo_couple_thumb || duta.photo_couple_webp || getPhotoCouple(duta)
}
function getThumbPhoto(duta) {
  return duta.photo_thumb || duta.photo_webp || getPhoto(duta)
}
</script>

<template>
  <div class="bg-white min-h-screen">

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-32 space-y-4">
      <svg class="w-10 h-10 animate-spin text-brand-orange" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
      <p class="text-gray-500 text-sm animate-pulse font-medium">Memuat data duta...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!dutas.length" class="flex flex-col items-center justify-center py-32">
      <p class="text-gray-400 text-sm italic">Belum ada data duta yang tersedia.</p>
    </div>



    <div v-if="dutas.length && !spotlight" class="flex items-center justify-center py-20 text-gray-400 text-sm italic">
      Belum ada data duta untuk angkatan ini.
    </div>

    <template v-if="dutas.length && spotlight">

      <!-- ════════════════════════════════════════════
           SPOTLIGHT SECTION
      ════════════════════════════════════════════ -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

        <!-- Hint kecil -->
        <p class="text-center text-xs text-gray-400 mb-6 tracking-wide">
          {{ isClicked ? '👆 Klik foto untuk kembali ke tampilan berpasangan' : '👆 Klik foto untuk melihat profil masing-masing' }}
        </p>

        <transition name="spot" mode="out-in">

          <!-- ── MODE STANDBY: Foto Berpasangan ── -->
          <div v-if="!isClicked" :key="'couple-' + spotlight.id"
            class="flex flex-col md:flex-row items-start gap-10 md:gap-16">

            <!-- Foto berpasangan (klik → pisah) -->
            <div class="relative shrink-0 self-center md:self-start cursor-pointer group" @click="toggleMode">
              <div class="absolute -top-4 -left-4 w-28 h-28 opacity-20 pointer-events-none"
                style="background-image: radial-gradient(circle, #c09060 1.5px, transparent 1.5px); background-size: 12px 12px;"></div>

              <template v-if="getPhotoCouple(spotlight)">
                <img :src="getPhotoCouple(spotlight)" :alt="spotlight.name + ' & ' + spotlight.name_female"
                  loading="eager" decoding="async"
                  class="relative w-64 sm:w-72 md:w-80 object-cover rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                  style="aspect-ratio: 4/3;" />
              </template>
              <template v-else>
                <!-- Jika tidak ada foto couple, tumpuk dua avatar -->
                <div class="relative w-64 sm:w-72 h-64 sm:h-72">
                  <img :src="getPhoto(spotlight)" :alt="spotlight.name"
                    loading="eager" decoding="async"
                    class="absolute top-0 left-0 w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover shadow-lg border-4 border-white transition-transform duration-300 group-hover:scale-[1.02]"/>
                  <img v-if="spotlight.name_female" :src="getPhotoFemale(spotlight)" :alt="spotlight.name_female"
                    loading="eager" decoding="async"
                    class="absolute bottom-0 right-0 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover shadow-lg border-4 border-white transition-transform duration-300 group-hover:scale-[1.02]"/>
                </div>
              </template>

              <!-- Overlay hint -->
              <div class="absolute inset-0 rounded-2xl bg-brand-dark/0 group-hover:bg-brand-dark/10 transition-colors duration-300 flex items-center justify-center">
                <span class="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-brand-dark text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                  Klik untuk lihat profil →
                </span>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 pt-0 md:pt-4">
              <p class="text-xs font-semibold tracking-widest text-brand-orange uppercase mb-3">
                Duta Prima SMK PGRI 05 Jember
              </p>
              <h1 class="font-display font-extrabold text-3xl sm:text-4xl text-brand-dark leading-tight">
                {{ spotlight.name }}
                <span v-if="spotlight.name_female" class="text-brand-brown"> & {{ spotlight.name_female }}</span>
              </h1>
              <p class="text-sm text-gray-500 mt-1">🏫 <span class="font-medium text-brand-brown">{{ spotlight.kelas }}</span></p>

              <div class="w-12 h-1 bg-brand-amber rounded-full mt-5 mb-5"></div>

              <span class="inline-flex items-center gap-1 bg-brand-amber/15 text-brand-brown text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-amber/30">
                🏅 {{ spotlight.title || 'Duta Prima' }}
              </span>

              <p v-if="spotlight.visi || spotlight.visi_female || spotlight.misi || spotlight.misi_female" class="mt-4 text-gray-500 text-sm leading-relaxed italic">
                Klik "Lihat profil masing-masing" untuk melihat Visi dan Misi dari masing-masing Duta.
              </p>
              <p v-else class="mt-4 text-gray-500 text-sm leading-relaxed italic">
                "Berdedikasi membawa nama baik SMK PGRI 05 Jember dengan prestasi dan integritas."
              </p>

              <button @click="toggleMode" class="mt-6 inline-flex items-center gap-2 text-sm text-brand-orange font-semibold hover:underline">
                Lihat profil masing-masing →
              </button>
            </div>
          </div>

          <!-- ── MODE KLIK: Foto Sendiri-sendiri ── -->
          <div v-else :key="'split-' + spotlight.id">
            <div class="flex flex-col md:flex-row items-start gap-10 md:gap-16 mb-6">

              <!-- Tombol kembali -->
              <button @click="toggleMode"
                class="absolute top-4 right-4 md:static inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-brown transition-colors">
                ← Kembali ke tampilan berpasangan
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">

              <!-- Kartu PUTRA -->
              <div class="flex flex-col items-center sm:items-start gap-4 sm:flex-row">
                <div class="relative shrink-0">
                  <div class="absolute -top-3 -left-3 w-20 h-20 opacity-20 pointer-events-none"
                    style="background-image: radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px); background-size: 10px 10px;"></div>
                  <img :src="getPhoto(spotlight)" :alt="spotlight.name"
                    loading="eager" decoding="async"
                    class="relative w-48 sm:w-56 object-cover rounded-2xl shadow-lg border-4 border-blue-100"
                    style="aspect-ratio: 3/4;"/>
                  <span class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow whitespace-nowrap">
                    👦 Duta Putra
                  </span>
                </div>
                <div class="pt-2">
                  <h2 class="font-display font-bold text-xl text-brand-dark">{{ spotlight.name }}</h2>
                  <p class="text-xs text-gray-400 mt-1">🏫 {{ spotlight.kelas }}</p>
                  <span class="mt-2 inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
                    🏅 {{ spotlight.title || 'Duta Prima' }}
                  </span>
                  <div v-if="spotlight.visi" class="mt-4">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Visi</p>
                    <p class="text-sm text-gray-600 leading-relaxed">{{ spotlight.visi }}</p>
                  </div>
                  <div v-if="spotlight.misi" class="mt-3">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Misi</p>
                    <p class="text-sm text-gray-600 leading-relaxed">{{ spotlight.misi }}</p>
                  </div>
                </div>
              </div>

              <!-- Divider vertikal -->
              <div class="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-100"></div>

              <!-- Kartu PUTRI -->
              <div v-if="spotlight.name_female" class="flex flex-col items-center sm:items-start gap-4 sm:flex-row">
                <div class="relative shrink-0">
                  <div class="absolute -top-3 -left-3 w-20 h-20 opacity-20 pointer-events-none"
                    style="background-image: radial-gradient(circle, #ec4899 1.5px, transparent 1.5px); background-size: 10px 10px;"></div>
                  <img :src="getPhotoFemale(spotlight)" :alt="spotlight.name_female"
                    loading="eager" decoding="async"
                    class="relative w-48 sm:w-56 object-cover rounded-2xl shadow-lg border-4 border-pink-100"
                    style="aspect-ratio: 3/4;"/>
                  <span class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow whitespace-nowrap">
                    👧 Duta Putri
                  </span>
                </div>
                <div class="pt-2">
                  <h2 class="font-display font-bold text-xl text-brand-dark">{{ spotlight.name_female }}</h2>
                  <p class="text-xs text-gray-400 mt-1">🏫 {{ spotlight.kelas }}</p>
                  <span class="mt-2 inline-block bg-pink-50 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full border border-pink-100">
                    🏅 {{ spotlight.title || 'Duta Prima' }}
                  </span>
                  <div v-if="spotlight.visi_female" class="mt-4">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Visi</p>
                    <p class="text-sm text-gray-600 leading-relaxed">{{ spotlight.visi_female }}</p>
                  </div>
                  <div v-if="spotlight.misi_female" class="mt-3">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Misi</p>
                    <p class="text-sm text-gray-600 leading-relaxed">{{ spotlight.misi_female }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="flex items-center justify-center text-gray-300 text-sm italic">
                Belum ada data Duta Putri
              </div>

            </div>

            <!-- Kembali -->
            <div class="flex justify-center mt-8">
              <button @click="toggleMode" class="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium px-5 py-2.5 rounded-full border border-gray-200 transition-colors">
                ← Kembali ke tampilan berpasangan
              </button>
            </div>
          </div>

        </transition>

        <!-- ── JARGON CONTAINER ── -->

        <div class="mt-16 max-w-3xl mx-auto">
          <div class="flex items-center justify-center gap-3 mb-5">
            <div class="h-px bg-gray-200 flex-1"></div>
            <h3 class="font-display font-bold text-xl text-brand-dark uppercase tracking-widest text-center">Jargon Duta Prima</h3>
            <div class="h-px bg-gray-200 flex-1"></div>
          </div>
          
          <div class="relative bg-gradient-to-br from-[#e5b362] to-[#c78b3a] rounded-3xl p-8 sm:p-10 shadow-xl text-center overflow-hidden group transition-transform duration-500 hover:-translate-y-1">
            <!-- Dekorasi background -->
            <div class="absolute -top-12 -right-12 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div class="absolute -bottom-12 -left-12 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <p class="relative z-10 font-medium text-lg sm:text-xl lg:text-2xl leading-loose text-white drop-shadow-md italic">
              <span class="block mb-2">"Duta Prima, Dutanya SMK PGRI 5 Jember</span>
              <span class="block mb-2">Duta Prima, berprestasi, berkontribusi, menginspirasi</span>
              <span class="block font-bold text-[#fff7e6] text-xl sm:text-2xl lg:text-3xl mt-4">Duta Prima, Yak Kadek!"</span>
            </p>
          </div>
        </div>
      </section>

      <!-- ════════════════════════════════════════════
           DUTA LAINNYA
      ════════════════════════════════════════════ -->
      <section v-if="otherDutas.length" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 class="text-center font-display font-bold text-2xl text-brand-dark mb-10">Duta Lainnya</h2>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-5">
          <article
            v-for="duta in otherDutas"
            :key="duta.id"
            @click="selectSpotlight(duta)"
            class="group relative bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <!-- Badge -->
            <div class="absolute top-2 left-2 z-10 flex gap-1.5">
              <span class="bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded" v-if="duta.angkatan">{{ duta.angkatan }}</span>
              <span class="bg-gray-700/80 text-white text-[10px] font-medium px-2 py-0.5 rounded">{{ duta.kelas }}</span>
            </div>

            <!-- Foto: couple jika ada, fallback putra -->
            <div class="overflow-hidden aspect-[4/3]">
              <img
                :src="getThumbCouple(duta) || getThumbPhoto(duta)"
                :alt="duta.name"
                loading="lazy"
                decoding="async"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <!-- Info -->
            <div class="p-3">
              <h3 class="font-bold text-sm text-brand-dark leading-snug">{{ duta.name }}</h3>
              <p v-if="duta.name_female" class="text-xs text-gray-400 mt-0.5">{{ duta.name_female }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ duta.title || 'Duta Prima' }}</p>
            </div>
          </article>
        </div>
      </section>

    </template>
  </div>
</template>

<style scoped>
.spot-enter-active,
.spot-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.spot-enter-from { opacity: 0; transform: translateX(16px); }
.spot-leave-to   { opacity: 0; transform: translateX(-16px); }
</style>
