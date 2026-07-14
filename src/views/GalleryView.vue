<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { galleryApi } from '../services/dutaPrimaApi'

const filters = ['Semua', 'Kegiatan', 'Prestasi', 'Sosial']
const active = ref('Semua')

// ── State Paginasi ────────────────────────────────────────────────────────────
const items = ref([])
const currentPage = ref(0)
const lastPage = ref(1)
const loading = ref(false)
const error = ref('')

// ── Sentinel element untuk IntersectionObserver ───────────────────────────────
const sentinel = ref(null)
let observer = null

const filtered = computed(() => {
  const data = Array.isArray(items.value) ? items.value : []
  return active.value === 'Semua' ? data : data.filter((i) => i.category === active.value)
})

// Fetch halaman berikutnya
async function loadMore() {
  if (loading.value || currentPage.value >= lastPage.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await galleryApi.getPaginated(currentPage.value + 1, 12)
    if (!res) return // request di-abort (navigasi cepat)
    items.value.push(...(Array.isArray(res.data) ? res.data : []))
    currentPage.value = res.current_page
    lastPage.value = res.last_page
  } catch (err) {
    error.value = 'Gagal memuat galeri. Coba lagi nanti.'
  } finally {
    loading.value = false
  }
}

// Reset saat filter berubah (hanya reset tampilan, bukan re-fetch — data sudah ada)
watch(active, () => {
  // Tidak perlu re-fetch, filter dilakukan client-side dari data yang sudah ter-paginate
})

// Setup IntersectionObserver
function setupObserver() {
  if (!sentinel.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadMore()
    },
    { rootMargin: '200px' } // trigger 200px sebelum sentinel kelihatan
  )
  observer.observe(sentinel.value)
}

onMounted(async () => {
  await loadMore() // load halaman pertama
  setupObserver()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

// Helper: pilih src terbaik (WebP jika ada, fallback original)
function imgSrc(item) {
  return item.image_thumb || item.image_webp || item.image
}
</script>

<template>
  <div>
    <section class="max-w-3xl mx-auto px-4 sm:px-6 text-center pt-16 pb-10">
      <h1 class="font-display font-bold text-3xl sm:text-4xl text-brand-dark">Galeri Kebanggaan</h1>
      <p class="text-gray-600 mt-4 text-sm sm:text-base leading-relaxed">
        Mengabadikan setiap momen perjuangan, prestasi, dan dedikasi Duta Prima dalam mengharumkan nama almamater.
      </p>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <!-- Filter Tabs -->
      <div class="flex flex-wrap justify-center gap-3 mb-10">
        <button
          v-for="f in filters"
          :key="f"
          @click="active = f"
          class="px-5 py-2 rounded-full text-sm font-medium border transition-colors"
          :class="
            active === f
              ? 'bg-brand-brown text-white border-brand-brown'
              : 'bg-white text-gray-600 border-gray-200 hover:border-brand-brown'
          "
        >
          {{ f }}
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-center text-sm text-red-500 py-6">{{ error }}</div>

      <!-- Grid -->
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="item in filtered"
          :key="item.id"
          v-memo="[item.id, item.image_thumb, item.title]"
          class="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100"
        >
          <img
            :src="imgSrc(item)"
            :alt="item.title"
            loading="lazy"
            decoding="async"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6"
          >
            <span class="text-brand-amber text-xs font-semibold uppercase tracking-wider mb-1">
              {{ item.category }}
            </span>
            <h3 class="text-white font-display font-semibold text-lg leading-tight">
              {{ item.title }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && filtered.length === 0" class="text-center text-gray-400 text-sm py-16">
        Belum ada foto di kategori ini.
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-4">
        <div
          v-for="n in 3"
          :key="'sk-' + n"
          class="rounded-2xl aspect-[4/3] bg-gray-100 animate-pulse"
        />
      </div>

      <!-- Sentinel (trigger infinite scroll) -->
      <div ref="sentinel" class="h-4" aria-hidden="true" />

      <!-- End of content indicator -->
      <p
        v-if="!loading && currentPage >= lastPage && items.length > 0"
        class="text-center text-xs text-gray-300 mt-6"
      >
        ✓ Semua foto sudah ditampilkan
      </p>
    </section>
  </div>
</template>
