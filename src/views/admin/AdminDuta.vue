<script setup>
import { ref, computed, onMounted } from 'vue'
import { dutaApi, settingsApi } from '../../services/dutaPrimaApi'
import ConfirmModal from '../../components/ConfirmModal.vue'
import ToastNotification from '../../components/ToastNotification.vue'

// ─── State ───────────────────────────────────────────────────────────────────
const dutaList    = ref([])
const filter      = ref('Semua')
const filterAngkatan = ref('Semua')
const searchQuery = ref('')
const classes     = ['Semua', 'Kelas X', 'Kelas XI', 'Kelas XII']
const angkatanList = ref([])

const isModalOpen    = ref(false)
const isEditMode     = ref(false)
const editTargetId   = ref(null)
const deleteModalOpen  = ref(false)
const deleteTargetId   = ref(null)
const toast = ref({ message: '', type: 'success', visible: false })

const manageAngkatanModalOpen = ref(false)
const newAngkatan = ref('')

const emptyForm = () => ({
  name: '', name_female: '',
  tingkat_kelas: '', jurusan_kelas: '', title: '',
  angkatan: '',
  photo: null, photo_couple: null, photo_female: null,
  visi: '', misi: '',
  visi_female: '', misi_female: '',
})
const form = ref(emptyForm())

const loading = ref(true)

// preview URLs
const preview = ref({ male: null, couple: null, female: null })

// ─── Load ─────────────────────────────────────────────────────────────────────
const loadDuta = async () => {
  loading.value = true
  try {
    const [dutaData, angkatanData] = await Promise.all([
      dutaApi.getAll(),
      settingsApi.getAngkatan()
    ])
    dutaList.value = dutaData || []
    angkatanList.value = (angkatanData || []).sort((a, b) => b - a)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
onMounted(loadDuta)

// ─── Filter ───────────────────────────────────────────────────────────────────
const filteredDuta = computed(() => {
  const data = Array.isArray(dutaList.value) ? dutaList.value : []
  return data.filter(d => {
    const mc = filter.value === 'Semua' || (d.kelas && d.kelas.toLowerCase().includes(filter.value.toLowerCase()))
    const ma = filterAngkatan.value === 'Semua' || d.angkatan == filterAngkatan.value
    const ms = d.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
               (d.name_female && d.name_female.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return mc && ma && ms
  })
})

// ─── Toast ────────────────────────────────────────────────────────────────────
const showToast = (message, type = 'success') => {
  toast.value = { message, type, visible: true }
  setTimeout(() => { toast.value.visible = false }, 3200)
}

// ─── Angkatan handler ────────────────────────────────────────────────────────
const saveAngkatanSettings = async (newList) => {
  try {
    const updated = await settingsApi.updateAngkatan({ angkatan_list: newList })
    angkatanList.value = updated.sort((a, b) => b - a)
    showToast('Daftar Angkatan berhasil diperbarui!', 'success')
  } catch (e) {
    showToast(e.message || 'Gagal menyimpan.', 'error')
  }
}

const addAngkatan = () => {
  const num = parseInt(newAngkatan.value)
  if (!num || isNaN(num)) {
    showToast('Angkatan harus berupa angka valid!', 'error')
    return
  }
  if (angkatanList.value.includes(num)) {
    showToast('Angkatan sudah ada!', 'error')
    return
  }
  const newList = [...angkatanList.value, num]
  saveAngkatanSettings(newList)
  newAngkatan.value = ''
}

const removeAngkatan = (num) => {
  const list = Array.isArray(angkatanList.value) ? angkatanList.value : []
  const newList = list.filter(a => a !== num)
  saveAngkatanSettings(newList)
}

// ─── File handler ─────────────────────────────────────────────────────────────
const handleFile = (e, key) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 50 * 1024 * 1024) {
    showToast('Ukuran foto melebihi 50MB!', 'error')
    e.target.value = ''
    return
  }
  form.value[key] = file
  preview.value[key === 'photo' ? 'male' : key === 'photo_female' ? 'female' : 'couple'] = URL.createObjectURL(file)
}

// ─── Open Modal ───────────────────────────────────────────────────────────────
const openAdd = () => {
  isEditMode.value = false
  editTargetId.value = null
  form.value = emptyForm()
  preview.value = { male: null, couple: null, female: null }
  isModalOpen.value = true
}

const openEdit = (duta) => {
  isEditMode.value = true
  editTargetId.value = duta.id
  form.value = {
    name: duta.name || '',
    name_female: duta.name_female || '',
    tingkat_kelas: duta.kelas ? duta.kelas.split(' ')[0] : '',
    jurusan_kelas: duta.kelas ? duta.kelas.split(' ').slice(1).join(' ') : '',
    title: duta.title || '',
    angkatan: duta.angkatan || '',
    photo: null, photo_couple: null, photo_female: null,
    visi: duta.visi || '',
    misi: duta.misi || '',
    visi_female: duta.visi_female || '',
    misi_female: duta.misi_female || '',
  }
  preview.value = {
    male:   duta.photo        || null,
    couple: duta.photo_couple || null,
    female: duta.photo_female || null,
  }
  isModalOpen.value = true
}

// ─── Save ─────────────────────────────────────────────────────────────────────
const saveDuta = async () => {
  if (!form.value.name || !form.value.title) {
    showToast('Harap isi Nama Putra dan Gelar!', 'error')
    return
  }
  try {
    const payload = {
      name: form.value.name,
      name_female: form.value.name_female || '',
      kelas: `${form.value.tingkat_kelas} ${form.value.jurusan_kelas}`.trim(),
      title: form.value.title,
      angkatan: form.value.angkatan || '',
      visi: form.value.visi || '',
      misi: form.value.misi || '',
      visi_female: form.value.visi_female || '',
      misi_female: form.value.misi_female || '',
      photo: form.value.photo,
      photo_couple: form.value.photo_couple,
      photo_female: form.value.photo_female
    }

    if (isEditMode.value) {
      const updated = await dutaApi.update(editTargetId.value, payload)
      const idx = dutaList.value.findIndex(d => d.id === editTargetId.value)
      if (idx !== -1) dutaList.value[idx] = updated
      showToast('Data Duta berhasil diperbarui!', 'success')
    } else {
      const created = await dutaApi.create(payload)
      dutaList.value.unshift(created)
      showToast('Pasangan Duta berhasil ditambahkan!', 'success')
    }
    isModalOpen.value = false
  } catch (e) {
    showToast(e.message || 'Terjadi kesalahan.', 'error')
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────
const deleteItem = (id) => { deleteTargetId.value = id; deleteModalOpen.value = true }
const confirmDelete = async () => {
  if (!deleteTargetId.value) return
  try {
    await dutaApi.remove(deleteTargetId.value)
    const data = Array.isArray(dutaList.value) ? dutaList.value : []
    dutaList.value = data.filter(d => d.id !== deleteTargetId.value)
    showToast('Duta berhasil dihapus!', 'success')
  } catch (e) { showToast(e.message, 'error') }
  finally { deleteTargetId.value = null }
}
</script>

<template>
  <div class="space-y-6 relative">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Daftar Duta Siswa</h2>
        <p class="text-gray-500 text-sm">Kelola pasangan duta (Putra & Putri) Duta Prima.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button @click="manageAngkatanModalOpen = true" class="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          Kelola Angkatan
        </button>
        <button @click="openAdd" class="bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-orange/90 transition-colors flex items-center gap-2 shadow-sm">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Tambah Pasangan
        </button>
      </div>
    </div>

    <!-- Filter & Search -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <select v-model="filter" class="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 bg-white">
          <option v-for="c in classes" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="filterAngkatan" class="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 bg-white">
          <option value="Semua">Semua Angkatan</option>
          <option v-for="a in angkatanList" :key="a" :value="a">Angkatan {{ a }}</option>
        </select>
      </div>
      <div class="relative w-full md:w-64">
        <input v-model="searchQuery" type="text" placeholder="Cari nama duta..."
          class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber transition-all">
        <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </div>

    <!-- Table (Desktop only) -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th class="py-4 px-6 font-medium">Pasangan Duta</th>
              <th class="py-4 px-6 font-medium">Kelas</th>
              <th class="py-4 px-6 font-medium">Angkatan</th>
              <th class="py-4 px-6 font-medium">Gelar</th>
              <th class="py-4 px-6 font-medium">Visi</th>
              <th class="py-4 px-6 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="duta in filteredDuta" :key="duta.id" class="hover:bg-gray-50 transition-colors">
              <!-- Profil -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-4">
                  <!-- Foto stack -->
                  <div class="relative shrink-0 w-14 h-14">
                    <template v-if="duta.photo_couple">
                      <img :src="duta.photo_couple" alt="" class="w-14 h-14 rounded-full object-cover border-2 border-brand-amber/30 shadow"/>
                    </template>
                    <template v-else>
                      <img v-if="duta.photo" :src="duta.photo" alt="" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow absolute top-0 left-0 z-10"/>
                      <div v-else class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm absolute top-0 left-0 z-10 border-2 border-white shadow">♂</div>
                      <img v-if="duta.photo_female" :src="duta.photo_female" alt="" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow absolute bottom-0 right-0"/>
                      <div v-else class="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm absolute bottom-0 right-0 border-2 border-white shadow">♀</div>
                    </template>
                  </div>
                  <!-- Nama -->
                  <div>
                    <p class="font-bold text-gray-800 text-sm">{{ duta.name }}</p>
                    <p v-if="duta.name_female" class="text-gray-500 text-xs mt-0.5">{{ duta.name_female }}</p>
                    <p v-else class="text-gray-300 text-xs mt-0.5 italic">— (belum ada pasangan)</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{{ duta.kelas }}</span>
              </td>
              <td class="py-4 px-6 text-gray-600 text-sm">{{ duta.angkatan ? 'Angkatan ' + duta.angkatan : '—' }}</td>
              <td class="py-4 px-6 text-gray-600 text-sm">{{ duta.title }}</td>
              <td class="py-4 px-6 text-gray-500 text-sm max-w-[200px]">
                <p v-if="duta.visi" class="truncate" :title="duta.visi">{{ duta.visi }}</p>
                <span v-else class="text-gray-300 italic text-xs">—</span>
              </td>
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEdit(duta)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="deleteItem(duta.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <svg class="w-8 h-8 animate-spin text-brand-orange" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  <span class="text-sm text-gray-400 animate-pulse font-medium">Memuat data...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredDuta.length === 0">
              <td colspan="6" class="py-12 text-center text-gray-400 text-sm">Tidak ada data duta.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Card View (Mobile only) -->
    <div class="grid grid-cols-1 gap-4 md:hidden">
      <div v-if="loading" class="p-8 flex flex-col items-center justify-center space-y-3">
        <svg class="w-8 h-8 animate-spin text-brand-orange" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
        <span class="text-sm text-gray-400 animate-pulse font-medium">Memuat data...</span>
      </div>
      <div v-else-if="filteredDuta.length === 0" class="p-8 text-center text-gray-400 text-sm">
        Tidak ada data duta.
      </div>
      <div v-for="duta in filteredDuta" :key="duta.id" class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
        <div class="flex items-center gap-4">
          <!-- Foto stack -->
          <div class="relative shrink-0 w-12 h-12">
            <template v-if="duta.photo_couple">
              <img :src="duta.photo_couple" alt="" class="w-12 h-12 rounded-full object-cover border-2 border-brand-amber/30 shadow"/>
            </template>
            <template v-else>
              <img v-if="duta.photo" :src="duta.photo" alt="" class="w-8 h-8 rounded-full object-cover border-2 border-white shadow absolute top-0 left-0 z-10"/>
              <div v-else class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs absolute top-0 left-0 z-10 border-2 border-white shadow">♂</div>
              <img v-if="duta.photo_female" :src="duta.photo_female" alt="" class="w-8 h-8 rounded-full object-cover border-2 border-white shadow absolute bottom-0 right-0"/>
              <div v-else class="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs absolute bottom-0 right-0 border-2 border-white shadow">♀</div>
            </template>
          </div>
          <div>
            <p class="font-bold text-gray-800 text-sm">{{ duta.name }}</p>
            <p v-if="duta.name_female" class="text-gray-500 text-xs mt-0.5">{{ duta.name_female }}</p>
            <p v-else class="text-gray-300 text-xs mt-0.5 italic">— (belum ada pasangan)</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span class="font-semibold block text-[10px] text-gray-400 uppercase">Kelas</span>
            <span class="px-2 py-0.5 rounded bg-gray-100 text-gray-600 inline-block mt-0.5">{{ duta.kelas }}</span>
          </div>
          <div>
            <span class="font-semibold block text-[10px] text-gray-400 uppercase">Angkatan</span>
            <span class="inline-block mt-0.5">{{ duta.angkatan ? 'Angkatan ' + duta.angkatan : '—' }}</span>
          </div>
          <div class="col-span-2">
            <span class="font-semibold block text-[10px] text-gray-400 uppercase">Gelar</span>
            <span class="inline-block mt-0.5 text-brand-orange font-medium">{{ duta.title }}</span>
          </div>
          <div v-if="duta.visi" class="col-span-2">
            <span class="font-semibold block text-[10px] text-gray-400 uppercase">Visi</span>
            <p class="mt-0.5 text-gray-500 text-xs line-clamp-2" :title="duta.visi">{{ duta.visi }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button @click="openEdit(duta)" class="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg transition-colors font-medium">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit
          </button>
          <button @click="deleteItem(duta.id)" class="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-100 rounded-lg transition-colors font-medium">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Hapus
          </button>
        </div>
      </div>
      <div v-if="filteredDuta.length === 0" class="bg-white p-8 text-center text-gray-400 text-sm border border-gray-100 rounded-xl">
        Tidak ada data duta.
      </div>
    </div>


    <!-- ══════════════ MODAL TAMBAH / EDIT ══════════════ -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl mb-10">

        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center"
          :class="isEditMode ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gradient-to-r from-brand-amber/10 to-brand-orange/10'">
          <div>
            <h3 class="font-bold text-gray-800 text-lg">
              {{ isEditMode ? '✏️ Edit Pasangan Duta' : '➕ Tambah Pasangan Duta' }}
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">Isi data pasangan duta Putra & Putri</p>
          </div>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-red-500 transition-colors p-1">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-6 space-y-5">

          <!-- ── FOTO BERPASANGAN ── -->
          <div class="bg-amber-50/70 border border-amber-100 rounded-xl p-4 space-y-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">💑</span>
              <h4 class="font-bold text-amber-800 text-sm">Foto Berpasangan (ditampilkan secara default)</h4>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-200 bg-amber-100 flex items-center justify-center shrink-0">
                <img v-if="preview.couple" :src="preview.couple" class="w-full h-full object-cover"/>
                <span v-else class="text-2xl">👫</span>
              </div>
              <div class="flex-1">
                <label class="block text-xs font-semibold text-amber-700 mb-1">Upload Foto Berpasangan (Tanpa Batas Ukuran)</label>
                <input @change="e => handleFile(e, 'photo_couple')" type="file" accept="image/*"
                  class="w-full text-xs border border-amber-200 rounded-lg bg-white file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"/>
                <p v-if="isEditMode && preview.couple" class="text-[10px] text-amber-600 mt-1">Kosongkan jika tidak ingin mengganti foto.</p>
              </div>
            </div>
          </div>

          <!-- ── PUTRA & PUTRI ── -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Putra -->
            <div class="bg-blue-50/60 border border-blue-100 rounded-xl p-4 space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-base">👦</span>
                <h4 class="font-bold text-blue-800 text-sm">Duta Putra</h4>
              </div>
              <div class="flex justify-center">
                <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200 bg-blue-100 flex items-center justify-center">
                  <img v-if="preview.male" :src="preview.male" class="w-full h-full object-cover"/>
                  <span v-else class="text-2xl text-blue-300">♂</span>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-blue-700 mb-1">Nama Lengkap *</label>
                <input v-model="form.name" type="text" placeholder="Misal: Damar Setyawan"
                  class="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 bg-white"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-blue-700 mb-1">Foto Sendiri (Tanpa Batas Ukuran)</label>
                <input @change="e => handleFile(e, 'photo')" type="file" accept="image/*"
                  class="w-full text-xs border border-blue-200 rounded-lg bg-white file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-blue-700 mb-1">Visi Putra <span class="text-blue-400 font-normal">(Opsional)</span></label>
                <textarea v-model="form.visi" rows="2" placeholder="Visi Putra"
                  class="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none bg-white"></textarea>
              </div>
              <div>
                <label class="block text-xs font-semibold text-blue-700 mb-1">Misi Putra <span class="text-blue-400 font-normal">(Opsional)</span></label>
                <textarea v-model="form.misi" rows="2" placeholder="Misi Putra"
                  class="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none bg-white"></textarea>
              </div>
            </div>

            <!-- Putri -->
            <div class="bg-pink-50/60 border border-pink-100 rounded-xl p-4 space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-base">👧</span>
                <h4 class="font-bold text-pink-800 text-sm">Duta Putri</h4>
              </div>
              <div class="flex justify-center">
                <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-200 bg-pink-100 flex items-center justify-center">
                  <img v-if="preview.female" :src="preview.female" class="w-full h-full object-cover"/>
                  <span v-else class="text-2xl text-pink-300">♀</span>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-pink-700 mb-1">Nama Lengkap</label>
                <input v-model="form.name_female" type="text" placeholder="Misal: Yasmin Aulia"
                  class="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 bg-white"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-pink-700 mb-1">Foto Sendiri (Tanpa Batas Ukuran)</label>
                <input @change="e => handleFile(e, 'photo_female')" type="file" accept="image/*"
                  class="w-full text-xs border border-pink-200 rounded-lg bg-white file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200 cursor-pointer"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-pink-700 mb-1">Visi Putri <span class="text-pink-400 font-normal">(Opsional)</span></label>
                <textarea v-model="form.visi_female" rows="2" placeholder="Visi Putri"
                  class="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 resize-none bg-white"></textarea>
              </div>
              <div>
                <label class="block text-xs font-semibold text-pink-700 mb-1">Misi Putri <span class="text-pink-400 font-normal">(Opsional)</span></label>
                <textarea v-model="form.misi_female" rows="2" placeholder="Misi Putri"
                  class="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 resize-none bg-white"></textarea>
              </div>
            </div>
          </div>

          <!-- ── INFO UMUM ── -->
          <hr class="border-gray-100"/>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Kelas & Jurusan *</label>
              <div class="grid grid-cols-2 gap-2">
                <select v-model="form.tingkat_kelas" required class="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 bg-white">
                  <option value="" disabled>Kelas</option>
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
                <input v-model="form.jurusan_kelas" type="text" required placeholder="Cth: RPL 1" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 bg-white"/>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Angkatan</label>
              <select v-model="form.angkatan" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 bg-white">
                <option v-for="a in angkatanList" :key="a" :value="a">Angkatan {{ a }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Gelar / Kategori *</label>
              <input v-model="form.title" type="text" placeholder="Misal: Duta Literasi 2025"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50"/>
            </div>
          </div>


        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button @click="isModalOpen = false" class="px-5 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            Batal
          </button>
          <button @click="saveDuta"
            class="px-5 py-2 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            :class="isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brand-orange hover:bg-brand-orange/90'">
            {{ isEditMode ? '💾 Simpan Perubahan' : '💾 Tambah Duta' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════ MODAL KELOLA ANGKATAN ══════════════ -->
    <div v-if="manageAngkatanModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 class="font-bold text-gray-800 text-lg">Kelola Daftar Angkatan</h3>
          <button @click="manageAngkatanModalOpen = false" class="text-gray-400 hover:text-red-500 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex gap-2">
            <input v-model="newAngkatan" type="number" placeholder="Angkatan Baru (misal: 26)" @keyup.enter="addAngkatan"
              class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50"/>
            <button @click="addAngkatan" class="bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-orange/90 transition-colors">
              Tambah
            </button>
          </div>
          <div class="border border-gray-100 rounded-lg divide-y divide-gray-100 mt-4 max-h-60 overflow-y-auto">
            <div v-for="a in angkatanList" :key="a" class="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors">
              <span class="text-sm font-medium text-gray-700">Angkatan {{ a }}</span>
              <button @click="removeAngkatan(a)" class="text-red-500 hover:text-red-700 text-sm font-medium p-1 transition-colors" title="Hapus Angkatan">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
            <div v-if="!angkatanList.length" class="px-4 py-4 text-center text-sm text-gray-400 italic">
              Belum ada angkatan.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete -->
    <ConfirmModal
      :model-value="deleteModalOpen"
      title="Hapus Duta"
      message="Yakin ingin menghapus pasangan Duta ini? Tindakan ini tidak bisa dibatalkan."
      confirm-text="Hapus"
      cancel-text="Batal"
      @update:model-value="deleteModalOpen = $event"
      @confirm="confirmDelete"
    />

    <!-- Toast -->
    <div class="fixed bottom-6 right-6 z-[60]">
      <transition name="fade">
        <ToastNotification v-if="toast.visible" :message="toast.message" :type="toast.type"/>
      </transition>
    </div>
  </div>
</template>
