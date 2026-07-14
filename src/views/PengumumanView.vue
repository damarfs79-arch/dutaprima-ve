<script setup>
import { ref, computed, onMounted } from 'vue'
import { pesertaSeleksiApi, settingsApi } from '../services/dutaPrimaApi'

const activeTab = ref('lolos')

const daftar = ref([])
const loading = ref(false)
const errorMsg = ref('')
const marqueeText = ref('Menunggu Hasil Seleksi? Tetap Semangat Dan Berikan Yang Terbaik!')
const marqueeShow = ref(true)

const daftarAktif = computed(() =>
  Array.isArray(daftar.value) ? daftar.value.filter((p) => p.status === activeTab.value) : []
)



async function fetchData() {
  loading.value = true
  try {
    daftar.value = (await pesertaSeleksiApi.getAll()) || []
  } catch (e) {
    console.error('Gagal memuat data peserta seleksi:', e)
    errorMsg.value = 'Gagal memuat data pengumuman.'
  } finally {
    loading.value = false
  }
}

async function loadMarquee() {
  try {
    const data = await settingsApi.getMarquee()
    if (data) {
      marqueeText.value = data.pengumuman_text || marqueeText.value
      marqueeShow.value = data.pengumuman_show !== undefined ? data.pengumuman_show : true
    }
  } catch (e) {
    console.error('Gagal memuat marquee:', e)
  }
}

onMounted(() => {
  fetchData()
  loadMarquee()
})
</script>

<template>
  <div>
    <!-- MARQUEE -->
    <div v-if="marqueeShow" class="marquee-wrapper bg-brand-amber/10 border-y border-brand-amber/30 overflow-hidden py-3">
      <div class="marquee-track flex whitespace-nowrap">
        <span
          v-for="n in 4"
          :key="n"
          class="flex items-center gap-3 text-xs sm:text-sm font-semibold text-brand-brown uppercase tracking-wide px-6"
        >
          {{ marqueeText }} <span>✨</span>
        </span>
      </div>
    </div>

    <!-- Hero -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-10 text-center">
      <span class="inline-block bg-brand-amber text-brand-dark text-xs font-semibold px-3 py-1 rounded-full mb-5 shadow-sm">
        Pengumuman
      </span>
      <h1 class="font-display font-extrabold text-brand-dark text-3xl sm:text-4xl lg:text-5xl leading-tight">
        Pengumuman Hasil Seleksi <span class="text-brand-orange">Duta Prima</span>
      </h1>
      <p class="text-gray-600 mt-5 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
        Selamat kepada para kandidat yang telah menunjukkan dedikasi luar biasa. Hari ini kita merayakan semangat keunggulan SMK PGRI 05 Jember.
      </p>
    </section>

    <!-- Konten Pengumuman -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid lg:grid-cols-[280px_1fr] gap-6 items-start">
      <!-- Sidebar tab -->
      <div class="space-y-6">
        <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p class="text-xs font-semibold tracking-wide text-gray-400 mb-4">PENGUMUMAN</p>
          <div class="space-y-2">
            <button
              class="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors bg-brand-brown text-white"
            >
              <span>✓</span>
              Peserta Lolos
              <span class="ml-auto text-xs font-normal opacity-70">
                {{ (daftar || []).filter(p => p.status === 'lolos').length }}
              </span>
            </button>
          </div>
        </div>

        <div class="bg-brand-lilac/20 border border-brand-lilac rounded-2xl p-5">
          <p class="text-xs font-semibold tracking-wide text-brand-brown mb-2">ⓘ INFORMASI</p>
          <p class="text-xs text-gray-600 leading-relaxed">
            Hasil seleksi bersifat mutlak dan tidak dapat diganggu gugat. Silakan hubungi panitia untuk informasi lebih lanjut.
          </p>
        </div>
      </div>

      <!-- Tabel peserta -->
      <div class="space-y-6">
        <div class="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-display font-bold text-lg sm:text-xl text-brand-dark">
              Daftar Peserta Terpilih
            </h2>
            <span class="bg-brand-amber/20 text-brand-brown text-xs font-semibold px-3 py-1 rounded-full">
              {{ daftarAktif.length }} Peserta
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th class="pb-3 font-medium">No</th>
                  <th class="pb-3 font-medium">Nama</th>
                  <th class="pb-3 font-medium">Kelas</th>
                  <th class="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="4" class="py-12">
                    <div class="flex flex-col items-center justify-center space-y-3">
                      <svg class="w-8 h-8 animate-spin text-brand-orange" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                      <span class="text-sm text-gray-400 animate-pulse font-medium">Memuat data...</span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="errorMsg">
                  <td colspan="4" class="py-8 text-center text-sm text-red-500">{{ errorMsg }}</td>
                </tr>
                <tr v-else-if="daftarAktif.length === 0">
                  <td colspan="4" class="py-8 text-center text-sm text-gray-400">Belum ada data.</td>
                </tr>
                <tr
                  v-for="(p, index) in daftarAktif"
                  :key="p.id"
                  class="border-b border-gray-50 last:border-0"
                >
                  <td class="py-4 font-semibold text-brand-orange">
                    {{ String(index + 1).padStart(2, '0') }}
                  </td>
                  <td class="py-4 font-display font-semibold text-brand-dark">{{ p.nama }}</td>
                  <td class="py-4 text-gray-500">{{ p.kelas }}</td>
                  <td class="py-4 text-right">
                    <span
                      class="text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide bg-brand-amber/15 text-brand-brown"
                    >
                      {{ p.keterangan || 'Lolos Tahap Selanjutnya' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.marquee-track {
  width: max-content;
  animation: marquee-scroll 18s linear infinite;
}
@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
</style>
