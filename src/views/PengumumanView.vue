<script setup>
import { ref, computed, onMounted } from 'vue'
import { pesertaSeleksiApi, settingsApi } from '../services/dutaPrimaApi'

const activeTab = ref('lolos')

const daftar = ref([])
const loading = ref(false)
const marqueeText = ref('Menunggu Hasil Seleksi? Tetap Semangat Dan Berikan Yang Terbaik!')
const marqueeShow = ref(true)

const daftarAktif = computed(() =>
  daftar.value.filter((p) => p.status === activeTab.value)
)

const informasiLanjutan = [
  'Verifikasi berkas fisik di ruang Kesiswaan.',
  'Pembekalan finalis minggu depan.',
]

async function fetchData() {
  loading.value = true
  try {
    daftar.value = await pesertaSeleksiApi.getAll()
  } catch (e) {
    console.error('Gagal memuat data peserta seleksi:', e)
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
        Pengumuman Hasil Seleksi <span class="text-brand-orange">Duta Prima 2026</span>
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
                {{ daftar.filter(p => p.status === 'lolos').length }}
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
                  <td colspan="4" class="py-8 text-center text-sm text-gray-400">Memuat data...</td>
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

        <div class="grid md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-6">
            <div class="bg-brand-lilac/10 rounded-2xl p-6 sm:p-8">
              <p class="text-xs font-semibold tracking-wide text-brand-orange mb-3">✨ SELAMAT BERGABUNG!</p>
              <p class="text-sm text-gray-600 italic leading-relaxed">
                "Selamat kepada seluruh peserta yang lolos! Teruslah berkarya, persiapkan dirimu sebaik mungkin untuk tahapan selanjutnya, dan jadilah inspirasi!"
              </p>
            </div>
            <div class="bg-gray-50/80 rounded-2xl p-6 sm:p-8">
              <p class="text-xs font-semibold tracking-wide text-gray-500 mb-3">💪 TETAP SEMANGAT!</p>
              <p class="text-sm text-gray-600 italic leading-relaxed">
                "Bagi yang belum lolos pada seleksi kali ini, jangan patah semangat. Terima kasih atas partisipasi dan usahamu. Jadikan pengalaman ini sebagai langkah awal untuk terus berkembang!"
              </p>
            </div>
          </div>

          <div class="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 class="font-display font-bold text-brand-dark mb-4">Informasi Lanjutan</h3>
            <ul class="space-y-3 mb-6">
              <li v-for="(info, i) in informasiLanjutan" :key="i" class="flex gap-3 text-sm text-gray-600">
                <span class="w-6 h-6 rounded-full bg-brand-amber/20 text-brand-brown font-semibold text-xs flex items-center justify-center shrink-0">
                  {{ i + 1 }}
                </span>
                {{ info }}
              </li>
            </ul>
            <button class="w-full bg-brand-brown text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-brand-brown/90 transition-colors">
              Download Panduan Lengkap
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Jargon Duta Prima -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div class="relative bg-gradient-to-br from-[#e5b362] to-[#c78b3a] rounded-3xl p-8 sm:p-10 shadow-xl text-center overflow-hidden group transition-transform duration-500 hover:-translate-y-1">
        <div class="absolute -top-12 -right-12 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div class="absolute -bottom-12 -left-12 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <p class="relative z-10 font-medium text-lg sm:text-xl lg:text-2xl leading-loose text-white drop-shadow-md italic">
          <span class="block mb-2">"Duta Prima, Dutanya SMK PGRI 5 Jember</span>
          <span class="block mb-2">Duta Prima, berprestasi, berkontribusi, menginspirasi</span>
          <span class="block font-bold text-[#fff7e6] text-xl sm:text-2xl lg:text-3xl mt-4">Duta Prima, Yak Kadek!"</span>
        </p>
      </div>
    </section>

    <!-- CTA penutup -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
      <h2 class="font-display font-bold text-xl sm:text-2xl text-brand-dark mb-6">
        Ingin tahu lebih banyak tentang Duta Prima?
      </h2>
      <div class="flex flex-wrap justify-center gap-4">
        <a
          href="#"
          class="border border-brand-brown text-brand-brown font-semibold px-6 py-3 rounded-full text-sm hover:bg-brand-brown/5 transition-colors"
        >
          Hubungi Panitia
        </a>
        <RouterLink
          to="/galeri-duta"
          class="bg-brand-lilac/30 text-brand-brown font-semibold px-6 py-3 rounded-full text-sm hover:bg-brand-lilac/50 transition-colors"
        >
          Lihat Galeri Duta
        </RouterLink>
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
