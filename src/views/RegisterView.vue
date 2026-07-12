<script setup>
import { ref, onMounted } from 'vue'
import { settingsApi, pendaftaranApi } from '../services/dutaPrimaApi'

const steps = ref([])
const isPageLoading = ref(true)

const requirements = [
  'Siswa/Siswi aktif kelas X & Xl SMK PGRI 5 JEMBER',
  'Sopan dan santun berpenampilan menarik',
  'Mampu berkomunikasi dengan baik dan percaya diri.',
  'Berkomitmen menjalankan tugas selama periode masa menjabat.',
  'Mampu menjalankan tugas selama periode masa menjabat',
  'Siap berkolaborasi/berkontribusi dalam kegiatan apapun',
]

const registrationSettings = ref(null)

const loadSettings = async () => {
  isPageLoading.value = true
  try {
    const dataFlow = await settingsApi.getSelectionFlow()
    if (dataFlow && dataFlow.steps) {
      steps.value = dataFlow.steps
    }
    const dataMarquee = await settingsApi.getMarquee()
    if (dataMarquee) {
      registrationSettings.value = dataMarquee
    }
  } catch (error) {
    console.error('Gagal memuat pengaturan:', error)
  } finally {
    isPageLoading.value = false
  }
}

onMounted(loadSettings)

const form = ref({
  nama: '',
  kelas: '',
  jurusan: '',
  ttl: '',
  bakat: '',
  prestasi: '',
  motivasi: '',
  whatsapp: '',
  instagram: '',
  tiktok: '',
  setuju: false,
})

const submitted = ref(false)

// === Validasi Upload ===
const maxSizeMB = 50
const maxSizeBytes = maxSizeMB * 1024 * 1024

// Foto Full Body
const fileNameFull = ref('')
const draggingFull = ref(false)
const fileFull = ref(null)
const errorFull = ref('')

// Foto Setengah Body
const fileNameHalf = ref('')
const draggingHalf = ref(false)
const fileHalf = ref(null)
const errorHalf = ref('')

// Bukti Prestasi
const fileNamePrestasi = ref('')
const draggingPrestasi = ref(false)
const filePrestasi = ref(null)
const errorPrestasi = ref('')

function validateAndSet(file, nameRef, fileRef, errorRef) {
  if (!file) return
  if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
    errorRef.value = 'Format harus JPG, PNG, atau PDF.'
    return
  }
  if (file.size > maxSizeBytes) {
    errorRef.value = `Ukuran maksimal ${maxSizeMB} MB.`
    return
  }
  errorRef.value = ''
  nameRef.value = file.name
  fileRef.value = file
}

function handleFileFull(e) {
  validateAndSet(e.target.files[0], fileNameFull, fileFull, errorFull)
}
function onDropFull(e) {
  draggingFull.value = false
  validateAndSet(e.dataTransfer.files[0], fileNameFull, fileFull, errorFull)
}

function handleFileHalf(e) {
  validateAndSet(e.target.files[0], fileNameHalf, fileHalf, errorHalf)
}
function onDropHalf(e) {
  draggingHalf.value = false
  validateAndSet(e.dataTransfer.files[0], fileNameHalf, fileHalf, errorHalf)
}

function handleFilePrestasi(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > maxSizeBytes) {
    errorPrestasi.value = `Ukuran maksimal ${maxSizeMB} MB.`
    return
  }
  errorPrestasi.value = ''
  fileNamePrestasi.value = file.name
  filePrestasi.value = file
}
function onDropPrestasi(e) {
  draggingPrestasi.value = false
  handleFilePrestasi(e)
}

const isLoading = ref(false)

async function submitForm() {
  if (!form.value.setuju) {
    alert('Harap centang konfirmasi kesediaan menjadi Duta Prima.')
    return
  }
  if (!form.value.nama || !form.value.kelas || !form.value.jurusan || !form.value.ttl || !form.value.bakat || !form.value.whatsapp) {
    alert('Harap isi semua field yang diwajibkan (termasuk Nomor WhatsApp).')
    return
  }
  if (!fileFull.value) { errorFull.value = 'Foto full body wajib diunggah.'; return }
  if (!fileHalf.value) { errorHalf.value = 'Foto setengah body wajib diunggah.'; return }
  
  isLoading.value = true
  
  try {
    const payload = {
      nama: form.value.nama,
      nama_kelas_jurusan: `${form.value.kelas} ${form.value.jurusan}`.trim(),
      ttl: form.value.ttl || '',
      bakat: form.value.bakat || '',
      prestasi: form.value.prestasi || '',
      motivasi: form.value.motivasi || '',
      whatsapp: form.value.whatsapp || '',
      instagram: form.value.instagram || '',
      tiktok: form.value.tiktok || '',
      foto_full: fileFull.value,
      foto_half: fileHalf.value,
    }
    if (filePrestasi.value) payload.file_prestasi = filePrestasi.value
    
    await pendaftaranApi.create(payload)
    
    submitted.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error('Gagal mendaftar:', error)
    alert(error.message || 'Gagal mengirim pendaftaran, silakan coba lagi.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div>
    <!-- Marquee Kuota -->
    <div v-if="registrationSettings?.pendaftaran_show" class="bg-brand-amber/10 border-y border-brand-amber/30 overflow-hidden py-3">
      <div class="marquee-track flex whitespace-nowrap">
        <span
          v-for="n in 4"
          :key="n"
          class="flex items-center gap-3 text-xs sm:text-sm font-semibold text-brand-brown uppercase tracking-wide px-6"
        >
          {{ registrationSettings.pendaftaran_text }} <span>•</span>
        </span>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div v-if="isPageLoading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <svg class="w-10 h-10 animate-spin text-brand-orange" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
        <p class="text-sm text-gray-400 animate-pulse font-medium">Memuat formulir...</p>
      </div>

      <template v-else>
        <span class="inline-block bg-brand-amber text-brand-dark text-xs font-semibold px-3 py-1 rounded-full mb-5">
          Pendaftaran Duta 2026
        </span>
        <h1 class="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-brand-dark max-w-2xl leading-tight">
          Wujudkan Potensimu Menjadi Representasi Terbaik Sekolah
        </h1>
        <p class="text-gray-600 mt-4 max-w-2xl text-sm sm:text-base leading-relaxed">
          Pilih jalanmu untuk menginspirasi rekan sebaya dan mengharumkan nama SMK PGRI 05 Jember melalui program Duta Prima.
        </p>

        <div class="grid lg:grid-cols-2 gap-10 mt-12">
      <!-- Alur Seleksi -->
      <div>
        <h2 class="font-display font-bold text-xl text-brand-brown mb-6">Alur Seleksi</h2>
        <ol class="relative border-l-2 border-brand-amber/40 pl-8 space-y-8">
          <li v-for="step in steps" :key="step.title" class="relative">
            <span class="absolute -left-[42px] top-0 w-8 h-8 rounded-full bg-brand-brown text-white flex items-center justify-center text-sm">
              {{ step.icon }}
            </span>
            <h3 class="font-semibold text-brand-dark">{{ step.title }}</h3>
            <p class="text-xs text-brand-orange font-medium mt-0.5">{{ step.date }}</p>
            <p class="text-sm text-gray-600 mt-1.5 leading-relaxed">{{ step.desc }}</p>
          </li>
        </ol>

        <div class="bg-brand-lilac/40 border border-brand-lilacdark/20 rounded-xl p-5 mt-10">
          <h3 class="font-semibold text-brand-dark flex items-center gap-2 mb-3">ℹ️ Persyaratan Umum</h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li v-for="req in requirements" :key="req" class="flex gap-2">
              <span class="text-brand-orange">✓</span>
              <span>{{ req }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 h-fit">
        <h2 class="font-display font-bold text-xl text-brand-dark mb-6">Formulir Pendaftaran Online</h2>

        <div v-if="submitted" class="text-center py-8">
          <p class="text-5xl mb-4">🎉</p>
          <h3 class="font-display font-bold text-2xl text-brand-brown mb-2">Terima Kasih!</h3>
          <h4 class="font-display font-semibold text-lg text-brand-dark">Pendaftaran Berhasil Terkirim</h4>
          <p class="text-sm text-gray-600 mt-2 mb-8 leading-relaxed max-w-md mx-auto">
            Data Anda telah masuk ke sistem kami. Silakan pantau terus informasi dari sekolah dan tunggu kabar selanjutnya untuk tahap seleksi lebih lanjut.
          </p>
          
          <div class="relative bg-gradient-to-br from-[#e5b362] to-[#c78b3a] rounded-3xl p-6 sm:p-8 shadow-xl text-center overflow-hidden group transition-transform duration-500 hover:-translate-y-1 mt-4">
            <!-- Dekorasi background -->
            <div class="absolute -top-10 -right-10 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div class="absolute -bottom-10 -left-10 w-24 h-24 bg-black opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <p class="relative z-10 font-medium text-base sm:text-lg leading-loose text-white drop-shadow-md italic">
              <span class="block mb-2">"Duta Prima, Dutanya SMK PGRI 5 Jember</span>
              <span class="block mb-2">Duta Prima, berprestasi, berkontribusi, menginspirasi</span>
              <span class="block font-bold text-[#fff7e6] text-lg sm:text-xl mt-3">Duta Prima, Yak Kadek!"</span>
            </p>
          </div>
          
          <button @click="submitted = false; form = {nama: '', kelas: '', jurusan: '', ttl: '', bakat: '', prestasi: '', motivasi: '', setuju: false}; fileFull = null; fileNameFull = ''; fileHalf = null; fileNameHalf = ''; filePrestasi = null; fileNamePrestasi = ''" class="mt-8 text-sm text-brand-orange font-semibold hover:underline">
            ← Kembali ke halaman awal
          </button>
        </div>

        <form v-else class="space-y-5" @submit.prevent="submitForm">
          <div>
            <label class="block text-sm font-medium text-brand-dark mb-1.5">Nama Lengkap</label>
            <input
              v-model="form.nama"
              type="text"
              required
              placeholder="Masukkan nama sesuai raport"
              class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
            />
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-brand-dark mb-1.5">Kelas & Jurusan</label>
              <div class="grid grid-cols-2 gap-2">
                <select v-model="form.kelas" required class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange bg-white">
                  <option value="" disabled>Kelas</option>
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
                <input v-model="form.jurusan" type="text" required placeholder="Cth: RPL 1" class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-dark mb-1.5">TTL (Tempat, Tanggal Lahir)</label>
              <input
                v-model="form.ttl"
                type="text"
                required
                placeholder="Contoh: Jember, 1 Januari 2007"
                class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-brand-dark mb-1.5">Nomor WhatsApp</label>
            <input
              v-model="form.whatsapp"
              type="text"
              required
              placeholder="Contoh: 081234567890"
              class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
            />
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-brand-dark mb-1.5">Username Instagram</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">@</span>
                <input
                  v-model="form.instagram"
                  type="text"
                  placeholder="username_ig"
                  class="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-dark mb-1.5">Username TikTok</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">@</span>
                <input
                  v-model="form.tiktok"
                  type="text"
                  placeholder="username_tiktok"
                  class="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-brand-dark mb-1.5">Bakat</label>
            <input
              v-model="form.bakat"
              type="text"
              required
              placeholder="Contoh: Menyanyi, Public Speaking, Menari, dll"
              class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-brand-dark mb-1.5">Visi Misi / Motivasi Bergabung <span class="text-gray-400 font-normal">(Opsional)</span></label>
            <textarea
              v-model="form.motivasi"
              rows="3"
              placeholder="Apa tujuan dan alasan Anda mengikuti seleksi Duta?"
              class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-brand-dark mb-1.5">Prestasi yang Pernah Diperoleh</label>
            <textarea
              v-model="form.prestasi"
              rows="3"
              placeholder="Sebutkan prestasi yang pernah diraih (akademik/non-akademik)"
              class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-brand-dark mb-1.5">Upload Bukti Prestasi (opsional)</label>
            <label
              class="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl py-6 px-4 cursor-pointer transition-colors"
              :class="draggingPrestasi ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-200'"
              @dragover.prevent="draggingPrestasi = true"
              @dragleave.prevent="draggingPrestasi = false"
              @drop.prevent="onDropPrestasi"
            >
              <span class="text-2xl mb-1"></span>
              <span class="font-medium text-sm text-brand-dark">
                {{ fileNamePrestasi || 'Klik atau seret bukti prestasi ke sini' }}
              </span>
              <span class="text-xs text-gray-500 mt-1">Format JPG, PNG, atau PDF (Tanpa Batas Ukuran).</span>
              <input type="file" accept="image/png, image/jpeg, application/pdf" class="hidden" @change="handleFilePrestasi" />
            </label>
            <p v-if="errorPrestasi" class="text-xs text-red-500 mt-1">{{ errorPrestasi }}</p>
          </div>

          <!-- Foto Full Body -->
          <div>
            <label class="block text-sm font-medium text-brand-dark mb-1.5">Unggah Foto Full Body (4x6)</label>
            <label
              class="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl py-8 px-4 cursor-pointer transition-colors"
              :class="draggingFull ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-200'"
              @dragover.prevent="draggingFull = true"
              @dragleave.prevent="draggingFull = false"
              @drop.prevent="onDropFull"
            >
              <span class="text-3xl mb-2"></span>
              <span class="font-medium text-sm text-brand-dark">
                {{ fileNameFull || 'Klik atau seret foto full body ke sini' }}
              </span>
              <span class="text-xs text-gray-500 mt-1">Format JPG, PNG, atau PDF (Tanpa Batas Ukuran).</span>
              <input type="file" accept="image/png, image/jpeg, application/pdf" class="hidden" @change="handleFileFull" />
            </label>
            <p v-if="errorFull" class="text-xs text-red-500 mt-1">{{ errorFull }}</p>
          </div>

          <!-- Foto Setengah Body -->
          <div>
            <label class="block text-sm font-medium text-brand-dark mb-1.5">Unggah Foto Setengah Body (3x4)</label>
            <label
              class="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl py-8 px-4 cursor-pointer transition-colors"
              :class="draggingHalf ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-200'"
              @dragover.prevent="draggingHalf = true"
              @dragleave.prevent="draggingHalf = false"
              @drop.prevent="onDropHalf"
            >
              <span class="text-3xl mb-2"></span>
              <span class="font-medium text-sm text-brand-dark">
                {{ fileNameHalf || 'Klik atau seret foto setengah body ke sini' }}
              </span>
              <span class="text-xs text-gray-500 mt-1">Format JPG, PNG, atau PDF (Tanpa Batas Ukuran).</span>
              <input type="file" accept="image/png, image/jpeg, application/pdf" class="hidden" @change="handleFileHalf" />
            </label>
            <p v-if="errorHalf" class="text-xs text-red-500 mt-1">{{ errorHalf }}</p>
          </div>

          <label class="flex items-start gap-2.5 text-sm text-gray-600">
            <input v-model="form.setuju" type="checkbox" required class="mt-1 accent-brand-orange" />
            Saya menyatakan bahwa data yang saya isi adalah benar dan saya bersedia mengikuti seluruh tahapan seleksi Duta Prima dengan penuh tanggung jawab.
          </label>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-brand-orange hover:bg-brand-orange/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full text-sm transition-colors flex items-center justify-center gap-2"
          >
            {{ isLoading ? '⏳ Sedang Mengirim Data...' : '➤ Kirim Pendaftaran' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-5">
          Butuh bantuan? <a href="https://wa.me/6281232282940" target="_blank" rel="noopener noreferrer" class="text-brand-orange font-semibold">Hubungi Panitia</a>
        </p>
      </div>
      </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.marquee-track {
  animation: marquee-scroll 22s linear infinite;
}

@keyframes marquee-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
