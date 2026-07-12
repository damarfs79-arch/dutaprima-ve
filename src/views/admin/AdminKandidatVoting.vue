<script setup>
import { ref, onMounted, computed } from 'vue'
import { kandidatVotingApi, settingsApi } from '../../services/dutaPrimaApi'
import VueApexCharts from 'vue3-apexcharts'

const daftar = ref([])
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Modal tambah/edit
const showModal = ref(false)
const isEdit = ref(false)
const form = ref({ id: null, nama: '', kategori: '', popularitas: 'Sedang', suara: 0, foto: null })
const fotoPreview = ref(null)
const saving = ref(false)

// Modal konfirmasi hapus
const showDeleteConfirm = ref(false)
const deleteTargetId = ref(null)

// Modal konfirmasi reset
const showResetConfirm = ref(false)

// Pengaturan Waktu Voting
const showSettingModal = ref(false)
const savingSetting = ref(false)
const votingSettingForm = ref({ end_time: '' })

// Data untuk Grafik
const chartOptions = computed(() => {
  // Sort the data locally for the chart to show highest votes first
  const sorted = [...daftar.value].sort((a, b) => b.suara - a.suara)
  return {
    chart: {
      type: 'bar',
      fontFamily: 'inherit',
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: { enabled: true, speed: 350 }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: true,
        barHeight: '65%',
        distributed: true,
        dataLabels: { position: 'bottom' }
      }
    },
    colors: [
      '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#f97316'
    ],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: "horizontal",
        shadeIntensity: 0.5,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 100]
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        fontSize: '13px',
        fontFamily: 'inherit',
        fontWeight: 'bold',
        colors: ['#fff']
      },
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex] + " — " + val + " Suara"
      },
      offsetX: 15,
      dropShadow: { enabled: true, top: 1, left: 1, blur: 1, opacity: 0.45 }
    },
    xaxis: {
      categories: sorted.map(k => k.nama),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { show: false }
    },
    grid: { show: false, padding: { left: -10, right: 0, top: -10, bottom: -10 } },
    legend: { show: false },
    tooltip: {
      theme: 'light',
      style: { fontSize: '13px' },
      y: { formatter: (val) => val + ' Suara' }
    }
  }
})

const chartSeries = computed(() => {
  const sorted = [...daftar.value].sort((a, b) => b.suara - a.suara)
  return [{
    name: 'Total Suara',
    data: sorted.map(k => k.suara)
  }]
})

async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const [daftarRes, settingRes] = await Promise.all([
      kandidatVotingApi.getAll(),
      settingsApi.getVoting()
    ])
    daftar.value = daftarRes
    if (settingRes && settingRes.end_time) {
      // Input datetime-local expects format YYYY-MM-DDThh:mm
      votingSettingForm.value.end_time = settingRes.end_time.substring(0, 16)
    }
  } catch (err) {
    errorMsg.value = 'Gagal memuat data.'
  } finally {
    loading.value = false
  }
}

function openTambah() {
  isEdit.value = false
  form.value = { id: null, nama: '', kategori: '', popularitas: 'Sedang', suara: 0, foto: null }
  fotoPreview.value = null
  showModal.value = true
}

function openEdit(item) {
  isEdit.value = true
  form.value = { ...item, foto: null } // foto null biar gak kirim url lama
  fotoPreview.value = item.foto // tampilkan preview foto lama
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function handleFotoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  form.value.foto = file
  fotoPreview.value = URL.createObjectURL(file)
}

async function submitForm() {
  saving.value = true
  errorMsg.value = ''
  form.value.suara = parseInt(form.value.suara) || 0
  try {
    if (isEdit.value) {
      const updated = await kandidatVotingApi.update(form.value.id, form.value)
      const idx = daftar.value.findIndex((k) => k.id === form.value.id)
      if (idx !== -1) daftar.value[idx] = updated
    } else {
      const created = await kandidatVotingApi.create(form.value)
      daftar.value.unshift(created)
    }
    showModal.value = false
  } catch (err) {
    errorMsg.value = err.message || 'Gagal menyimpan data.'
  } finally {
    saving.value = false
  }
}

function confirmDelete(id) {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

async function doDelete() {
  try {
    await kandidatVotingApi.remove(deleteTargetId.value)
    daftar.value = daftar.value.filter((k) => k.id !== deleteTargetId.value)
  } catch (err) {
    errorMsg.value = 'Gagal menghapus data.'
  } finally {
    showDeleteConfirm.value = false
    deleteTargetId.value = null
  }
}

async function doReset() {
  try {
    await kandidatVotingApi.resetVotes()
    // Otomatis hapus batas waktu voting agar kembali terbuka
    await settingsApi.updateVoting({ end_time: null })
    votingSettingForm.value.end_time = ''

    daftar.value = daftar.value.map((k) => ({ ...k, suara: 0 }))
    successMsg.value = 'Semua suara berhasil direset dan sesi voting dibuka kembali.'
    setTimeout(() => (successMsg.value = ''), 4000)
  } catch (err) {
    errorMsg.value = 'Gagal mereset suara.'
  } finally {
    showResetConfirm.value = false
  }
}

async function saveVotingSetting() {
  savingSetting.value = true
  errorMsg.value = ''
  try {
    // If end_time is empty, we send null to clear it
    let isoTime = null
    if (votingSettingForm.value.end_time) {
      // Create date object and convert to ISO string so the backend handles it properly
      const dt = new Date(votingSettingForm.value.end_time)
      isoTime = dt.toISOString()
    }
    
    await settingsApi.updateVoting({ end_time: isoTime })
    successMsg.value = 'Pengaturan waktu voting berhasil disimpan.'
    setTimeout(() => (successMsg.value = ''), 3000)
    showSettingModal.value = false
  } catch (err) {
    errorMsg.value = 'Gagal menyimpan pengaturan waktu.'
  } finally {
    savingSetting.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Kandidat Voting</h1>
      <div class="flex gap-2">
        <button
          @click="showSettingModal = true"
          class="border border-brand-amber/50 text-brand-orange hover:bg-brand-amber/10 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          ⏱️ Setting Waktu
        </button>
        <button
          @click="showResetConfirm = true"
          class="border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          Reset Suara
        </button>
        <button
          @click="openTambah"
          class="bg-brand-orange hover:bg-brand-orange/90 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          + Tambah Kandidat
        </button>
      </div>
    </div>

    <div v-if="errorMsg" class="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{{ errorMsg }}</div>
    <div v-if="successMsg" class="bg-brand-amber/15 text-brand-orange text-sm px-4 py-3 rounded-lg mb-4">{{ successMsg }}</div>

    <!-- Grafik Suara -->
    <div v-if="daftar.length > 0 && !loading" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <h2 class="text-lg font-bold text-gray-800 mb-2">Statistik Suara Sementara</h2>
      <p class="text-sm text-gray-500 mb-4">Perolehan suara kandidat secara real-time berdasarkan ranking.</p>
      <div class="min-h-[250px]">
        <VueApexCharts type="bar" height="300" :options="chartOptions" :series="chartSeries" />
      </div>
    </div>

    <!-- Grid Kandidat -->
    <p v-if="loading" class="text-center text-sm text-gray-400 py-10">Memuat data...</p>
    <p v-else-if="daftar.length === 0" class="text-center text-sm text-gray-400 py-10">Belum ada kandidat.</p>
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="(item, index) in daftar"
        :key="item.id"
        class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
      >
        <!-- Foto -->
        <div class="relative aspect-[4/5] bg-gray-100">
          <img v-if="item.foto" :src="item.foto" :alt="item.nama" class="absolute inset-0 w-full h-full object-cover" />
          <div v-else class="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl">📷</div>
          <div class="absolute top-2 left-2 bg-brand-brown text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            #{{ String(index + 1).padStart(2, '0') }}
          </div>
        </div>

        <div class="p-4">
          <h3 class="font-semibold text-gray-800 text-sm">{{ item.nama }}</h3>
          <p class="text-xs text-gray-500 mt-0.5">{{ item.kategori }}</p>
          <div class="flex items-center justify-between mt-3 text-xs">
            <span class="text-gray-400">Suara</span>
            <span class="font-bold text-gray-800">{{ item.suara.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex items-center justify-between text-xs mt-1">
            <span class="text-gray-400">Popularitas</span>
            <span class="font-semibold text-brand-orange">{{ item.popularitas }}</span>
          </div>
          <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              @click="openEdit(item)"
              class="flex-1 text-xs font-semibold text-brand-orange hover:text-brand-dark py-1.5 border border-brand-amber/30 rounded-lg hover:bg-brand-amber/10 transition-colors"
            >
              Edit
            </button>
            <button
              @click="confirmDelete(item.id)"
              class="flex-1 text-xs font-semibold text-red-500 hover:text-red-700 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Tambah/Edit -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 class="text-lg font-bold text-gray-800 mb-5">
          {{ isEdit ? 'Edit Kandidat' : 'Tambah Kandidat' }}
        </h2>

        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- Foto Preview -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Foto Kandidat</label>
            <label class="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-4 px-3 cursor-pointer hover:border-brand-amber transition-colors">
              <img v-if="fotoPreview" :src="fotoPreview" class="w-24 h-24 rounded-xl object-cover mb-2" />
              <span v-else class="text-3xl mb-2">📷</span>
              <span class="text-xs text-gray-500">Klik untuk pilih foto</span>
              <input type="file" accept="image/*" class="hidden" @change="handleFotoChange" :required="!isEdit" />
            </label>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Nama</label>
            <input
              v-model="form.nama"
              type="text"
              required
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Kategori</label>
            <input
              v-model="form.kategori"
              type="text"
              required
              placeholder="cth: Calon Duta Favorit"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Popularitas</label>
            <select
              v-model="form.popularitas"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber"
            >
              <option>Tinggi</option>
              <option>Sedang</option>
              <option>Meningkat</option>
              <option>Stabil</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Jumlah Suara Awal</label>
            <input
              v-model.number="form.suara"
              type="number"
              min="0"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber"
            />
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeModal" class="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" :disabled="saving" class="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60">
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="showDeleteConfirm = false">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
        <p class="text-sm text-gray-600 mb-6">Yakin mau hapus kandidat ini?</p>
        <div class="flex gap-3">
          <button @click="showDeleteConfirm = false" class="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50">Batal</button>
          <button @click="doDelete" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm">Hapus</button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Reset Suara -->
    <div v-if="showResetConfirm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="showResetConfirm = false">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
        <p class="text-lg font-bold text-gray-800 mb-2">Reset Semua Suara?</p>
        <p class="text-sm text-gray-500 mb-6">Semua suara kandidat akan dikembalikan ke 0. Tindakan ini tidak dapat dibatalkan.</p>
        <div class="flex gap-3">
          <button @click="showResetConfirm = false" class="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50">Batal</button>
          <button @click="doReset" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm">Ya, Reset</button>
        </div>
      </div>
    </div>

    <!-- Modal Setting Waktu Voting -->
    <div v-if="showSettingModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="showSettingModal = false">
      <div class="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl">
        <h2 class="text-lg font-bold text-gray-800 mb-2">Setting Waktu Voting</h2>
        <p class="text-sm text-gray-500 mb-5">Atur kapan batas akhir voting. Jika kosong, voting akan terus berjalan.</p>
        
        <form @submit.prevent="saveVotingSetting" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-600 mb-2">Batas Akhir Voting (Selesai)</label>
            <input 
              v-model="votingSettingForm.end_time" 
              type="datetime-local" 
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber transition-shadow"
            />
          </div>
          
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showSettingModal = false" class="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" :disabled="savingSetting" class="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 transition-colors">
              {{ savingSetting ? 'Menyimpan...' : 'Simpan Pengaturan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
