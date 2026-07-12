<script setup>
import { ref, computed, onMounted } from 'vue'
import { pesertaSeleksiApi } from '../../services/dutaPrimaApi'

const daftar = ref([])
const loading = ref(false)
const errorMsg = ref('')
const activeTab = ref('lolos') // 'lolos' | 'tidak_lolos'

// Modal tambah/edit
const showModal = ref(false)
const isEdit = ref(false)
const form = ref({ id: null, nama: '', kelas: '', status: 'lolos', keterangan: '', wawancara: '', bakat: '' })
const saving = ref(false)

// Modal konfirmasi hapus
const showDeleteConfirm = ref(false)
const deleteTargetId = ref(null)

const filtered = computed(() => daftar.value.filter((p) => p.status === activeTab.value))

async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    daftar.value = await pesertaSeleksiApi.getAll()
  } catch (err) {
    errorMsg.value = 'Gagal memuat data peserta. Cek koneksi ke API.'
  } finally {
    loading.value = false
  }
}

function openTambah() {
  isEdit.value = false
  form.value = { id: null, nama: '', kelas: '', status: activeTab.value, keterangan: '', wawancara: '', bakat: '' }
  showModal.value = true
}

function openEdit(peserta) {
  isEdit.value = true
  form.value = { ...peserta }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function submitForm() {
  saving.value = true
  errorMsg.value = ''
  try {
    if (isEdit.value) {
      const updated = await pesertaSeleksiApi.update(form.value.id, form.value)
      const idx = daftar.value.findIndex((p) => p.id === form.value.id)
      if (idx !== -1) daftar.value[idx] = updated
    } else {
      const created = await pesertaSeleksiApi.create(form.value)
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
    await pesertaSeleksiApi.remove(deleteTargetId.value)
    daftar.value = daftar.value.filter((p) => p.id !== deleteTargetId.value)
  } catch (err) {
    errorMsg.value = 'Gagal menghapus data.'
  } finally {
    showDeleteConfirm.value = false
    deleteTargetId.value = null
  }
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Peserta Seleksi</h1>
      <button
        @click="openTambah"
        class="bg-brand-orange hover:bg-brand-orange/90 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors w-full sm:w-auto text-center"
      >
        + Tambah Peserta
      </button>
    </div>

    <div v-if="errorMsg" class="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
      {{ errorMsg }}
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-5">
      <button
        @click="activeTab = 'lolos'"
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        :class="activeTab === 'lolos' ? 'bg-brand-amber/15 text-brand-orange' : 'text-gray-500 hover:bg-gray-50'"
      >
        Lolos ({{ daftar.filter((p) => p.status === 'lolos').length }})
      </button>
      <button
        @click="activeTab = 'tidak_lolos'"
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        :class="activeTab === 'tidak_lolos' ? 'bg-brand-amber/15 text-brand-orange' : 'text-gray-500 hover:bg-gray-50'"
      >
        Tidak Lolos ({{ daftar.filter((p) => p.status === 'tidak_lolos').length }})
      </button>
    </div>

    <!-- Tabel -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Mobile Cards -->
      <div class="block md:hidden divide-y divide-gray-100">
        <div v-if="loading" class="p-8 flex flex-col items-center justify-center space-y-3">
          <svg class="w-8 h-8 animate-spin text-brand-orange" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
          <span class="text-sm text-gray-400 animate-pulse font-medium">Memuat data...</span>
        </div>
        <div v-else-if="filtered.length === 0" class="p-8 text-center text-gray-400">Belum ada data.</div>
        <div
          v-for="p in filtered"
          :key="'m-' + p.id"
          class="p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-800 text-sm">{{ p.nama }}</p>
              <p class="text-xs text-gray-500 mt-1">Kelas: {{ p.kelas }}</p>
              <p v-if="p.keterangan" class="text-xs text-gray-400 mt-0.5">{{ p.keterangan }}</p>
              <p v-else class="text-xs text-gray-300 mt-0.5 italic">Tidak ada keterangan</p>
              <div class="mt-2 text-xs text-gray-500">
                <p>Wawancara: {{ p.wawancara || '-' }}</p>
                <p>Bakat: {{ p.bakat || '-' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button @click="openEdit(p)" class="text-brand-orange hover:text-brand-dark text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-brand-amber/30 hover:bg-brand-amber/10 transition-colors">
                Edit
              </button>
              <button @click="confirmDelete(p.id)" class="text-red-500 hover:text-red-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th class="px-6 py-4 font-medium">Nama</th>
              <th class="px-6 py-4 font-medium">Kelas</th>
              <th class="px-6 py-4 font-medium">Wawancara</th>
              <th class="px-6 py-4 font-medium">Bakat</th>
              <th class="px-6 py-4 font-medium">Keterangan</th>
              <th class="px-6 py-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <svg class="w-8 h-8 animate-spin text-brand-orange" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  <span class="text-sm text-gray-400 animate-pulse font-medium">Memuat data...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filtered.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-gray-400">Belum ada data.</td>
            </tr>
            <tr
              v-for="p in filtered"
              :key="p.id"
              class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
            >
              <td class="px-6 py-4 font-semibold text-gray-800">{{ p.nama }}</td>
              <td class="px-6 py-4 text-gray-500">{{ p.kelas }}</td>
              <td class="px-6 py-4 text-gray-500">{{ p.wawancara || '-' }}</td>
              <td class="px-6 py-4 text-gray-500">{{ p.bakat || '-' }}</td>
              <td class="px-6 py-4 text-gray-500">{{ p.keterangan || '-' }}</td>
              <td class="px-6 py-4 text-right space-x-2">
                <button @click="openEdit(p)" class="text-brand-orange hover:text-brand-dark text-xs font-semibold">
                  Edit
                </button>
                <button @click="confirmDelete(p.id)" class="text-red-500 hover:text-red-700 text-xs font-semibold">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Tambah/Edit -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl">
        <h2 class="text-lg font-bold text-gray-800 mb-5">
          {{ isEdit ? 'Edit Peserta' : 'Tambah Peserta' }}
        </h2>

        <form @submit.prevent="submitForm" class="space-y-4">
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
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Kelas</label>
            <input
              v-model="form.kelas"
              type="text"
              required
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Status</label>
            <select
              v-model="form.status"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber"
            >
              <option value="lolos">Lolos</option>
              <option value="tidak_lolos">Tidak Lolos</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Wawancara</label>
            <input
              v-model="form.wawancara"
              type="text"
              placeholder="Nilai/Komentar Wawancara"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Bakat</label>
            <input
              v-model="form.bakat"
              type="text"
              placeholder="Nilai/Komentar Bakat"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Keterangan (opsional)</label>
            <input
              v-model="form.keterangan"
              type="text"
              placeholder="cth: Lolos Tahap Selanjutnya"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber"
            />
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60"
            >
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="showDeleteConfirm = false"
    >
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
        <p class="text-sm text-gray-600 mb-6">Yakin mau hapus data peserta ini?</p>
        <div class="flex gap-3">
          <button
            @click="showDeleteConfirm = false"
            class="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            @click="doDelete"
            class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
