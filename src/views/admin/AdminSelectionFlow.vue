<script setup>
import { ref, onMounted } from 'vue'
import { settingsApi } from '../../services/dutaPrimaApi'
import ToastNotification from '../../components/ToastNotification.vue'

const defaultSteps = [
  { id: 1, title: 'Pendaftaran Online', date: '15 Januari - 30 Januari 2024', desc: 'Isi formulir lengkap dan unggah foto terbaikmu untuk seleksi administrasi awal.', icon: '📝' },
  { id: 2, title: 'Seleksi Administrasi', date: '01 Februari - 05 Februari 2024', desc: 'Tim seleksi akan memverifikasi kelengkapan berkas dan kriteria dasar pendaftar.', icon: '✅' },
  { id: 3, title: 'Wawancara', date: '10 Februari 2024', desc: 'Tunjukkan kepribadian dan visimu di depan dewan juri melalui sesi wawancara.', icon: '👥' },
  { id: 4, title: 'Bakat', date: '11 Februari 2024', desc: 'Tampilkan bakat unik dan istimewamu di hadapan dewan juri.', icon: '🎭' },
  { id: 5, title: 'Grand Final', date: '25 Desember 2026', desc: 'Malam penganugerahan dan penentuan Duta Prima PGRI 05 terpilih.', icon: '🏆' },
]

const flowSteps = ref([...defaultSteps])
const toast = ref({ message: '', type: 'success', visible: false })

const loadSteps = async () => {
  try {
    const data = await settingsApi.getSelectionFlow()
    flowSteps.value = data.steps ?? [...defaultSteps]
  } catch (error) {
    console.error(error)
  }
}

const showToast = (message, type = 'success') => {
  toast.value = { message, type, visible: true }
  setTimeout(() => { toast.value.visible = false }, 3200)
}

const saveSteps = async () => {
  try {
    await settingsApi.updateSelectionFlow({ steps: flowSteps.value })
    showToast('Alur seleksi berhasil disimpan!', 'success')
  } catch (error) {
    showToast(error.message, 'error')
  }
}

const addStep = () => {
  const maxId = flowSteps.value.reduce((max, s) => Math.max(max, s.id), 0)
  flowSteps.value.push({
    id: maxId + 1,
    title: 'Tahap Baru',
    date: '',
    desc: '',
    icon: '📌',
  })
}

const removeStep = (index) => {
  flowSteps.value.splice(index, 1)
}

const moveUp = (index) => {
  if (index === 0) return
  const tmp = flowSteps.value[index]
  flowSteps.value.splice(index, 1)
  flowSteps.value.splice(index - 1, 0, tmp)
}

const moveDown = (index) => {
  if (index === flowSteps.value.length - 1) return
  const tmp = flowSteps.value[index]
  flowSteps.value.splice(index, 1)
  flowSteps.value.splice(index + 1, 0, tmp)
}

onMounted(loadSteps)
</script>

<template>
  <div class="space-y-6 max-w-4xl pb-12">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Manajemen Alur Seleksi</h2>
        <p class="text-gray-500 text-sm">Sesuaikan tahap, jadwal, dan deskripsi proses seleksi Duta.</p>
      </div>
      <button
        @click="addStep"
        class="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm shrink-0"
      >
        <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah Tahap
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
      <div class="space-y-6">
        <div
          v-for="(step, index) in flowSteps"
          :key="step.id"
          class="flex flex-col md:flex-row gap-6 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow bg-gray-50/50"
        >
          <!-- Icon + Urutan + Navigasi -->
          <div class="flex flex-row md:flex-col items-center justify-between md:justify-start gap-2 md:w-32 flex-shrink-0">
            <div class="flex flex-col items-center gap-2">
              <input
                v-model="step.icon"
                type="text"
                class="w-16 h-16 text-3xl text-center border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                title="Emoji Ikon"
              >
              <span class="text-xs font-semibold text-gray-400">Langkah {{ index + 1 }}</span>
            </div>
            <!-- Tombol urutan + hapus -->
            <div class="flex md:flex-col items-center gap-1">
              <button
                @click="moveUp(index)"
                :disabled="index === 0"
                class="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-400 disabled:opacity-30"
                title="Pindah ke atas"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
              </button>
              <button
                @click="moveDown(index)"
                :disabled="index === flowSteps.length - 1"
                class="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-400 disabled:opacity-30"
                title="Pindah ke bawah"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <button
                @click="removeStep(index)"
                class="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400 hover:text-red-600"
                title="Hapus Tahap"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>

          <!-- Fields -->
          <div class="flex-1 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Judul Tahapan</label>
                <input
                  v-model="step.title"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                >
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tanggal Pelaksanaan</label>
                <input
                  v-model="step.date"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg text-emerald-600 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                >
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Deskripsi Kegiatan</label>
              <textarea
                v-model="step.desc"
                rows="2"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div v-if="flowSteps.length === 0" class="text-center py-10 text-gray-400 text-sm italic">
          Belum ada tahap seleksi. Klik "Tambah Tahap" untuk menambahkan.
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end pt-4">
      <button @click="saveSteps" class="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        Simpan Alur Seleksi
      </button>
    </div>

    <div class="fixed bottom-6 right-6 z-50">
      <transition name="fade">
        <ToastNotification v-if="toast.visible" :message="toast.message" :type="toast.type"/>
      </transition>
    </div>
  </div>
</template>
