<script setup>
import { ref, onMounted } from 'vue'
import { pendaftaranApi } from '../../services/dutaPrimaApi'
import html2pdf from 'html2pdf.js'

const list      = ref([])
const loading   = ref(true)
const selected  = ref(null)
const showModal = ref(false)
const deleting  = ref(false)
const openingDetailId = ref(null)

const loadList = async () => {
  loading.value = true
  try {
    list.value = await pendaftaranApi.getAll()
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const openDetail = async (item) => {
  if (openingDetailId.value) return
  openingDetailId.value = item.id
  try {
    selected.value = await pendaftaranApi.getById(item.id)
    // tandai baca di lokal juga
    const idx = list.value.findIndex(d => d.id === item.id)
    if (idx !== -1) list.value[idx].is_read = true
    showModal.value = true
  } catch {
    // ignore
  } finally {
    openingDetailId.value = null
  }
}

const closeModal = () => {
  showModal.value = false
  selected.value  = null
}

const hapus = async (id) => {
  if (!confirm('Yakin ingin menghapus data pendaftar ini?')) return
  deleting.value = true
  try {
    await pendaftaranApi.remove(id)
    list.value = list.value.filter(d => d.id !== id)
    closeModal()
  } catch {
    alert('Gagal menghapus data.')
  } finally {
    deleting.value = false
  }
}

const formatDate = (str) =>
  new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })


const unreadCount = ref(0)
const countUnread = () => {
  unreadCount.value = list.value.filter(d => !d.is_read).length
}

const unduhPDF = () => {
  if (!selected.value) return
  
  const element = document.getElementById('pdf-content')
  const opt = {
    margin:       0.5,
    filename:     `Pendaftaran_${selected.value.nama.replace(/\s+/g, '_')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  }
  
  html2pdf().set(opt).from(element).save()
}

onMounted(async () => {
  await loadList()
  countUnread()
})
</script>

<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">List Pendaftar</h2>
        <p class="text-gray-500 text-sm mt-1">
          {{ list.length }} pendaftar
          <span v-if="unreadCount > 0" class="ml-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
            {{ unreadCount }} belum dibaca
          </span>
        </p>
      </div>
      <button @click="loadList" class="inline-flex items-center gap-2 text-sm text-brand-orange hover:text-brand-orange/80 font-medium">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        Refresh
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="p-10 text-center text-gray-400">
        <svg class="w-8 h-8 animate-spin mx-auto mb-3 text-brand-amber" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
        Memuat data...
      </div>
      <div v-else-if="list.length === 0" class="p-12 text-center text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Belum ada pendaftar.
      </div>
      <div v-else>
        <!-- Mobile Cards (visible on small screens only) -->
        <div class="block md:hidden divide-y divide-gray-100">
          <div
            v-for="item in list"
            :key="'m-' + item.id"
            @click="openDetail(item)"
            class="p-4 cursor-pointer transition-colors active:bg-gray-100"
            :class="!item.is_read ? 'bg-orange-50/40' : 'hover:bg-gray-50'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span v-if="!item.is_read" class="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                  <span class="font-semibold text-gray-800 text-sm truncate">{{ item.nama }}</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ item.nama_kelas_jurusan }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ item.ttl }}</p>
              </div>
              <div class="flex flex-col items-end gap-2 shrink-0">
                <span v-if="!item.is_read"
                  class="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  🔔 Baru
                </span>
                <span v-else
                  class="inline-flex items-center gap-1 bg-gray-100 text-gray-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
                  ✓ Dibaca
                </span>
                <span class="text-[10px] text-gray-400">{{ formatDate(item.created_at) }}</span>
              </div>
            </div>
            <div class="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-50">
              <button @click.stop="openDetail(item)"
                :disabled="openingDetailId === item.id"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-3 rounded-lg transition-colors text-center disabled:opacity-75 disabled:cursor-wait">
                <span v-if="openingDetailId === item.id">Memuat...</span>
                <span v-else>Lihat Detail</span>
              </button>
              <button @click.stop="hapus(item.id)"
                class="w-full bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold py-3 rounded-lg transition-colors text-center">
                Hapus
              </button>
            </div>
          </div>
          <div v-if="list.length === 0" class="p-8 text-center text-gray-400 text-sm">
            Belum ada pendaftar.
          </div>
        </div>

        <!-- Desktop Table (hidden on small screens) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-left border-b border-gray-100">
              <tr>
                <th class="px-6 py-3 font-medium">Nama</th>
                <th class="px-6 py-3 font-medium">Kelas & Jurusan</th>
                <th class="px-6 py-3 font-medium">TTL</th>
                <th class="px-6 py-3 font-medium">Tanggal Daftar</th>
                <th class="px-6 py-3 font-medium">Status</th>
                <th class="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="item in list"
                :key="item.id"
                @click="openDetail(item)"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
                :class="!item.is_read ? 'bg-orange-50/40' : ''"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span v-if="!item.is_read" class="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                    <span class="font-semibold text-gray-800">{{ item.nama }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ item.nama_kelas_jurusan }}</td>
                <td class="px-6 py-4 text-gray-600">{{ item.ttl }}</td>
                <td class="px-6 py-4 text-gray-500">{{ formatDate(item.created_at) }}</td>
                <td class="px-6 py-4">
                  <span v-if="!item.is_read"
                    class="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                    🔔 Baru
                  </span>
                  <span v-else
                    class="inline-flex items-center gap-1 bg-gray-100 text-gray-400 text-xs font-medium px-2.5 py-1 rounded-full">
                    ✓ Dibaca
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click.stop="hapus(item.id)"
                    class="text-red-500 hover:text-red-700 text-xs font-semibold hover:underline transition-colors">
                    Hapus
                  </button>
                </td>
              </tr>
              <tr v-if="list.length === 0">
                <td colspan="6" class="py-12 text-center text-gray-400 text-sm">Belum ada pendaftar.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ══ MODAL DETAIL ══ -->
    <div v-if="showModal && selected"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeModal">
      <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        <!-- Header modal -->
        <div class="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 class="text-lg font-bold text-gray-800">Detail Pendaftar</h3>
            <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(selected.created_at) }}</p>
          </div>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl p-1 hover:bg-gray-100 rounded-full transition-colors">✕</button>
        </div>

        <!-- Body -->
        <div id="pdf-content" class="p-4 sm:p-6 space-y-6 bg-white">

          <!-- Info grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div class="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <p class="text-gray-400 text-xs mb-1">Nama Lengkap</p>
              <p class="font-bold text-gray-800">{{ selected.nama }}</p>
            </div>
            <div class="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <p class="text-gray-400 text-xs mb-1">Kelas & Jurusan</p>
              <p class="font-semibold text-gray-800">{{ selected.nama_kelas_jurusan }}</p>
            </div>
            <div class="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <p class="text-gray-400 text-xs mb-1">TTL</p>
              <p class="font-semibold text-gray-800">{{ selected.ttl }}</p>
            </div>
            <div class="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <p class="text-gray-400 text-xs mb-1">WhatsApp</p>
              <p class="font-semibold text-brand-orange flex items-center gap-1">
                <a :href="`https://wa.me/${selected.whatsapp?.replace(/^0/, '62')}`" target="_blank" class="hover:underline">
                  {{ selected.whatsapp || '—' }}
                </a>
              </p>
            </div>
            <div class="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <p class="text-gray-400 text-xs mb-1">Instagram</p>
              <p class="font-semibold text-gray-800">
                <a v-if="selected.instagram" :href="`https://instagram.com/${selected.instagram.replace('@', '')}`" target="_blank" class="hover:text-brand-orange hover:underline">
                  @{{ selected.instagram.replace('@', '') }}
                </a>
                <span v-else>—</span>
              </p>
            </div>
            <div class="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <p class="text-gray-400 text-xs mb-1">TikTok</p>
              <p class="font-semibold text-gray-800">
                <a v-if="selected.tiktok" :href="`https://tiktok.com/@${selected.tiktok.replace('@', '')}`" target="_blank" class="hover:text-brand-orange hover:underline">
                  @{{ selected.tiktok.replace('@', '') }}
                </a>
                <span v-else>—</span>
              </p>
            </div>
            <div class="bg-gray-50 p-3 sm:p-4 rounded-xl sm:col-span-2 lg:col-span-3">
              <p class="text-gray-400 text-xs mb-1">Tanggal Daftar</p>
              <p class="font-semibold text-gray-800">{{ formatDate(selected.created_at) }}</p>
            </div>
          </div>

          <!-- Data Lainnya -->
          <div class="space-y-4">
            <div>
              <p class="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Bakat</p>
              <p class="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                {{ selected.bakat || '—' }}
              </p>
            </div>
            <div>
              <p class="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Prestasi yang Pernah Diperoleh</p>
              <p class="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                {{ selected.prestasi || '—' }}
              </p>
            </div>
            <div v-if="selected.file_prestasi">
              <p class="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Bukti Prestasi</p>
              <img :src="selected.file_prestasi_b64 || selected.file_prestasi" alt="Bukti Prestasi" crossorigin="anonymous"
                class="w-full h-auto max-h-64 object-contain rounded-xl border border-gray-100 shadow-sm bg-gray-50"/>
            </div>
            <div>
              <p class="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Motivasi Bergabung</p>
              <p class="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                {{ selected.motivasi || '—' }}
              </p>
            </div>
          </div>

          <!-- Foto -->
          <div>
            <p class="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Foto Pendaftar</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p class="text-gray-400 text-xs mb-2">Foto Full Body</p>
                <img v-if="selected.foto_full" :src="selected.foto_full_b64 || selected.foto_full" alt="Foto Full Body" crossorigin="anonymous"
                  class="w-full h-auto sm:h-64 object-contain rounded-xl border border-gray-100 shadow-sm bg-gray-50"/>
                <div v-else class="w-full h-48 sm:h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-sm">Tidak ada foto</div>
              </div>
              <div>
                <p class="text-gray-400 text-xs mb-2">Foto Setengah Body</p>
                <img v-if="selected.foto_half" :src="selected.foto_half_b64 || selected.foto_half" alt="Foto Setengah Body" crossorigin="anonymous"
                  class="w-full h-auto sm:h-64 object-contain rounded-xl border border-gray-100 shadow-sm bg-gray-50"/>
                <div v-else class="w-full h-48 sm:h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-sm">Tidak ada foto</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 sm:p-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3">
          <button @click="closeModal" class="text-sm text-gray-500 hover:text-gray-700 font-medium">
            ← Kembali ke daftar
          </button>
          
          <div class="flex items-center gap-3">
            <button @click="unduhPDF"
              class="bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-semibold px-4 py-2.5 rounded-full transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Unduh PDF
            </button>
            <button :disabled="deleting" @click="hapus(selected.id)"
              class="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm">
              {{ deleting ? 'Menghapus...' : '🗑️ Hapus Pendaftar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
