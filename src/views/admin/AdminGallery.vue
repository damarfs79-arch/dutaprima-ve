<script setup>
import { ref, onMounted } from 'vue'
import { galleryApi } from '../../services/dutaPrimaApi'
import ConfirmModal from '../../components/ConfirmModal.vue'
import ToastNotification from '../../components/ToastNotification.vue'

const galleries = ref([])
const filter = ref('Semua')
const categories = ['Semua', 'Kegiatan', 'Prestasi', 'Sosial']

const isModalOpen = ref(false)
const deleteModalOpen = ref(false)
const deleteTargetId = ref(null)
const editId = ref(null)
const toast = ref({ message: '', type: 'success', visible: false })
const newPhoto = ref({ title: '', category: 'Kegiatan', image: null })

const loadGalleries = async () => {
  try {
    galleries.value = await galleryApi.getAll()
  } catch (error) {
    console.error(error)
  }
}

const deleteItem = async (id) => {
  deleteTargetId.value = id
  deleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTargetId.value) return

  try {
    await galleryApi.remove(deleteTargetId.value)
    galleries.value = galleries.value.filter(g => g.id !== deleteTargetId.value)
    showToast('Foto berhasil dihapus!', 'success')
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    deleteTargetId.value = null
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file && file.size > 3 * 1024 * 1024) {
    showToast('Ukuran foto melebihi 3MB!', 'error')
    e.target.value = ''
    newPhoto.value.image = null
    return
  }
  newPhoto.value.image = file
}

const openAddModal = () => {
  editId.value = null
  newPhoto.value = { title: '', category: 'Kegiatan', image: null }
  isModalOpen.value = true
}

const editItem = (item) => {
  editId.value = item.id
  newPhoto.value = { title: item.title, category: item.category, image: null }
  isModalOpen.value = true
}

const saveNewPhoto = async () => {
  if (newPhoto.value.title && (newPhoto.value.image || editId.value)) {
    try {
      if (editId.value) {
        const updated = await galleryApi.update(editId.value, {
          title: newPhoto.value.title,
          category: newPhoto.value.category,
          image: newPhoto.value.image,
          _method: 'PUT'
        })
        const index = galleries.value.findIndex(g => g.id === editId.value)
        if (index !== -1) galleries.value[index] = updated
        showToast('Foto berhasil diperbarui!', 'success')
      } else {
        const created = await galleryApi.create({
          title: newPhoto.value.title,
          category: newPhoto.value.category,
          image: newPhoto.value.image,
        })
        galleries.value.unshift(created)
        showToast('Foto berhasil ditambahkan!', 'success')
      }

      isModalOpen.value = false
      editId.value = null
      newPhoto.value = { title: '', category: 'Kegiatan', image: null }
    } catch (error) {
      showToast(error.message, 'error')
    }
  } else {
    showToast('Harap isi judul dan pilih foto!', 'error')
  }
}

const showToast = (message, type = 'success') => {
  toast.value = { message, type, visible: true }
  setTimeout(() => {
    toast.value.visible = false
  }, 3200)
}

onMounted(loadGalleries)
</script>

<template>
  <div class="space-y-6 relative">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Manajemen Galeri</h2>
        <p class="text-gray-500 text-sm">Kelola foto kegiatan, prestasi, dan sosial Duta Prima.</p>
      </div>
      <button @click="openAddModal" class="bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-orange/90 transition-colors flex items-center justify-center gap-2 shadow-sm">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Tambah Foto
      </button>
    </div>

    <!-- Filters -->
    <div class="flex gap-2 overflow-x-auto pb-2">
      <button 
        v-for="cat in categories" 
        :key="cat"
        @click="filter = cat"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
        :class="filter === cat ? 'bg-brand-orange text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th class="py-4 px-6 font-medium">Foto & Judul</th>
              <th class="py-4 px-6 font-medium">Kategori</th>
              <th class="py-4 px-6 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in galleries.filter(g => filter === 'Semua' || g.category === filter)" :key="item.id" class="hover:bg-gray-50 transition-colors">
              <td class="py-4 px-6">
                <div class="flex items-center gap-4">
                  <img :src="item.image" alt="" class="w-16 h-12 rounded-lg object-cover shadow-sm border border-gray-100">
                  <span class="font-medium text-gray-800">{{ item.title }}</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-amber/15 text-brand-orange">
                  {{ item.category }}
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="editItem(item)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button @click="deleteItem(item.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="galleries.filter(g => filter === 'Semua' || g.category === filter).length === 0">
              <td colspan="3" class="py-12 text-center text-gray-500">
                Tidak ada data galeri yang ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmModal
      :model-value="deleteModalOpen"
      title="Hapus Foto"
      message="Yakin ingin menghapus foto ini?"
      confirm-text="Hapus"
      cancel-text="Batal"
      @update:model-value="deleteModalOpen = $event"
      @confirm="confirmDelete"
    />

    <!-- Modal Tambah/Edit Foto -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="font-bold text-gray-800 text-lg">{{ editId ? 'Edit Foto Galeri' : 'Tambah Foto Galeri' }}</h3>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-red-500 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Judul / Teks</label>
            <input v-model="newPhoto.title" type="text" placeholder="Misal: Lomba Baca Puisi" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select v-model="newPhoto.category" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber transition-all bg-white">
              <option value="Kegiatan">Kegiatan</option>
              <option value="Prestasi">Prestasi</option>
              <option value="Sosial">Sosial</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Upload Foto Galeri (Maks 3MB)</label>
            <p v-if="editId" class="text-xs text-gray-500 mb-2">Biarkan kosong jika tidak ingin mengubah foto.</p>
            <input @change="handleFileChange" type="file" accept="image/*" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-amber/15 file:text-brand-orange hover:file:bg-brand-amber/25">
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button @click="isModalOpen = false" class="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">Batal</button>
          <button @click="saveNewPhoto" class="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-medium hover:bg-brand-orange/90 transition-colors shadow-sm">Simpan</button>
        </div>
      </div>
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
