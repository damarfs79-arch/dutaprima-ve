<script setup>
import { ref, onMounted } from 'vue'
import { settingsApi } from '../../services/dutaPrimaApi'
import ToastNotification from '../../components/ToastNotification.vue'

const settings = ref({
  pendaftaran_show: true,
  pendaftaran_text: 'Segera daftarkan diri anda. Sisa kuota 30!',
  pengumuman_show: true,
  pengumuman_text: 'Menunggu Hasil Seleksi? Tetap Semangat Dan Berikan Yang Terbaik!',
  voting_text1: 'Pantau Terus Pengumuman Ini Untuk Update Terbaru Duta Prima 2026',
  voting_text2: 'Pemilihan Duta Favorit Akan Ditutup Pada 30 November 2026',
})

const toast = ref({ message: '', type: 'success', visible: false })
const isSaving = ref(false)

const showToast = (message, type = 'success') => {
  toast.value = { message, type, visible: true }
  setTimeout(() => { toast.value.visible = false }, 3200)
}

const loadSettings = async () => {
  try {
    const data = await settingsApi.getMarquee()
    if (data) settings.value = { ...settings.value, ...data }
  } catch (error) {
    console.error('Gagal memuat pengaturan marquee:', error)
  }
}

const saveSettings = async () => {
  isSaving.value = true
  try {
    await settingsApi.updateMarquee(settings.value)
    showToast('Pengaturan marquee berhasil disimpan!', 'success')
  } catch (error) {
    showToast(error.message || 'Gagal menyimpan.', 'error')
  } finally {
    isSaving.value = false
  }
}

onMounted(loadSettings)
</script>

<template>
  <div class="space-y-6 max-w-3xl pb-12">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Setting Marquee</h2>
      <p class="text-gray-500 text-sm mt-1">Atur teks berjalan yang ditampilkan di setiap halaman web publik.</p>
    </div>

    <!-- Halaman Pendaftaran -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h3 class="font-semibold text-gray-800">📝 Halaman Pendaftaran</h3>
          <p class="text-xs text-gray-500 mt-0.5">Teks berjalan di atas form pendaftaran</p>
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="settings.pendaftaran_show" class="w-5 h-5 rounded accent-brand-amber">
          <span class="text-sm font-medium text-gray-600">Tampilkan</span>
        </label>
      </div>
      <div class="p-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Teks Marquee</label>
        <input
          v-model="settings.pendaftaran_text"
          type="text"
          :disabled="!settings.pendaftaran_show"
          class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber disabled:bg-gray-100 disabled:text-gray-400 transition-all"
          placeholder="Contoh: Segera daftar, kuota terbatas!"
        />
      </div>
    </div>

    <!-- Halaman Pengumuman -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h3 class="font-semibold text-gray-800">📢 Halaman Pengumuman</h3>
          <p class="text-xs text-gray-500 mt-0.5">Teks berjalan di halaman hasil seleksi</p>
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="settings.pengumuman_show" class="w-5 h-5 rounded accent-brand-amber">
          <span class="text-sm font-medium text-gray-600">Tampilkan</span>
        </label>
      </div>
      <div class="p-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Teks Marquee</label>
        <input
          v-model="settings.pengumuman_text"
          type="text"
          :disabled="!settings.pengumuman_show"
          class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber disabled:bg-gray-100 disabled:text-gray-400 transition-all"
          placeholder="Contoh: Selamat kepada peserta yang lolos..."
        />
      </div>
    </div>

    <!-- Halaman Voting -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 class="font-semibold text-gray-800">🏆 Halaman Voting</h3>
        <p class="text-xs text-gray-500 mt-0.5">Dua teks berjalan di halaman voting duta favorit (selalu tampil)</p>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Teks Marquee 1</label>
          <input
            v-model="settings.voting_text1"
            type="text"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber transition-all"
            placeholder="Contoh: Pantau terus update terbaru Duta Prima 2026"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Teks Marquee 2</label>
          <input
            v-model="settings.voting_text2"
            type="text"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber transition-all"
            placeholder="Contoh: Voting ditutup 30 November 2026"
          />
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end pt-2">
      <button
        @click="saveSettings"
        :disabled="isSaving"
        class="bg-brand-orange text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-orange/90 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg v-if="!isSaving" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        {{ isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Marquee' }}
      </button>
    </div>

    <div class="fixed bottom-6 right-6 z-50">
      <transition name="fade">
        <ToastNotification
          v-if="toast.visible"
          :message="toast.message"
          :type="toast.type"
        />
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
