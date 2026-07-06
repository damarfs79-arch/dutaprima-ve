<script setup>
import { ref, computed, onMounted } from 'vue'
import { kandidatVotingApi, settingsApi } from '../services/dutaPrimaApi'

const marqueeText1 = ref('Pantau Terus Pengumuman Ini Untuk Update Terbaru Duta Prima 2026')
const marqueeText2 = ref('Pemilihan Duta Favorit Akan Ditutup Pada 30 November 2026')

const kandidat = ref([])
const loading = ref(false)
const errorMsg = ref('')

// Simpan kandidat id yang sudah dipilih
const sudahVote = ref(
  JSON.parse(localStorage.getItem('duta_prima_voted_ids') || '[]').map(id => String(id))
)

const hasVotedAny = computed(() => sudahVote.value.length > 0)

function hasVotedFor(id) {
  return sudahVote.value.includes(String(id))
}

async function fetchKandidat() {
  loading.value = true
  errorMsg.value = ''
  try {
    kandidat.value = await kandidatVotingApi.getAll()
  } catch (err) {
    errorMsg.value = 'Gagal memuat data kandidat.'
  } finally {
    loading.value = false
  }
}

// Urut otomatis berdasarkan suara terbanyak
const kandidatUrut = computed(() =>
  [...kandidat.value].sort((a, b) => b.suara - a.suara)
)

async function vote(item) {
  if (hasVotedAny.value) return
  try {
    const updated = await kandidatVotingApi.vote(item.id)
    const idx = kandidat.value.findIndex((k) => k.id === item.id)
    if (idx !== -1) kandidat.value[idx] = updated

    sudahVote.value.push(String(item.id))
    localStorage.setItem('duta_prima_voted_ids', JSON.stringify(sudahVote.value))
  } catch (err) {
    errorMsg.value = 'Gagal mengirim vote, coba lagi.'
  }
}

onMounted(() => {
  fetchKandidat()
  settingsApi.getMarquee().then(data => {
    if (data) {
      marqueeText1.value = data.voting_text1 || marqueeText1.value
      marqueeText2.value = data.voting_text2 || marqueeText2.value
    }
  }).catch(() => {})
})
</script>

<template>
  <div>
    <!-- Marquee -->
    <div class="bg-brand-amber/10 border-y border-brand-amber/30 overflow-hidden py-3">
      <div class="marquee-track flex whitespace-nowrap">
        <span
          v-for="n in 4"
          :key="n"
          class="flex items-center gap-3 text-xs sm:text-sm font-semibold text-brand-brown uppercase tracking-wide px-6"
        >
          {{ marqueeText1 }} <span>•</span> {{ marqueeText2 }}
        </span>
      </div>
    </div>

    <!-- Hero -->
    <section class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 text-center">
      <span class="inline-block bg-brand-amber text-brand-dark text-xs font-semibold px-3 py-1 rounded-full mb-5 shadow-sm">
        Voting
      </span>
      <h1 class="font-display font-extrabold text-brand-dark text-3xl sm:text-4xl lg:text-5xl leading-tight">
        Voting Duta <span class="text-brand-orange">Favorit 2026</span>
      </h1>
      <p class="text-gray-600 mt-5 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
        Suara Anda menentukan siapa yang akan menjadi representasi keunggulan dan inspirasi bagi generasi mendatang. Berikan dukungan Anda kepada kandidat terbaik sekarang.
      </p>
    </section>

    <!-- Grid Kandidat -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <p v-if="loading" class="text-center text-sm text-gray-400 py-10">Memuat kandidat...</p>
      <p v-else-if="errorMsg" class="text-center text-sm text-red-500 py-10">{{ errorMsg }}</p>
      <p v-else-if="kandidatUrut.length === 0" class="text-center text-sm text-gray-400 py-10">
        Belum ada kandidat voting.
      </p>
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(item, index) in kandidatUrut"
          :key="item.id"
          class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- Foto -->
          <div class="relative aspect-[4/5] bg-gray-100">
            <img :src="item.foto" :alt="item.nama" class="absolute inset-0 w-full h-full object-cover" />
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <span class="inline-flex items-center gap-1.5 text-white text-xs font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-amber"></span>
                Popularitas: {{ item.popularitas }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="p-5 sm:p-6">
            <h3 class="font-display font-bold text-lg text-brand-dark">{{ item.nama }}</h3>
            <p class="text-sm font-semibold text-brand-orange mt-1">{{ item.kategori }}</p>

            <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm">
              <div>
                <p class="text-[11px] text-gray-400 uppercase tracking-wide">Total Suara</p>
                <p class="font-bold text-brand-dark">{{ item.suara.toLocaleString('id-ID') }} Suara</p>
              </div>
              <div class="text-right">
                <p class="text-[11px] text-gray-400 uppercase tracking-wide">Peringkat</p>
                <p class="font-bold text-brand-brown">#{{ String(index + 1).padStart(2, '0') }}</p>
              </div>
            </div>

            <button
              @click="vote(item)"
              :disabled="hasVotedAny"
              class="w-full mt-5 flex items-center justify-center gap-2 bg-brand-brown hover:bg-brand-brown/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full text-sm transition-colors"
            >
              <span>☑</span>
              {{ hasVotedFor(item.id) ? 'Terima Kasih!' : 'Vote Sekarang' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-brand-lilac/20 py-16 sm:py-20 text-center">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="font-display font-bold text-xl sm:text-2xl text-brand-dark mb-4">
          Ingin Menjadi Bagian dari Kami?
        </h2>
        <p class="text-sm text-gray-600 mb-8 leading-relaxed">
          Daftarkan diri Anda untuk angkatan berikutnya dan jadilah inspirasi bagi sesama.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a
            href="#"
            class="bg-brand-brown text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-brand-brown/90 transition-colors"
          >
            Hubungi Panitia
          </a>
          <RouterLink
            to="/pendaftaran"
            class="border border-brand-brown text-brand-brown font-semibold px-6 py-3 rounded-full text-sm hover:bg-brand-brown/5 transition-colors"
          >
            Daftar Sekarang
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.marquee-track {
  width: max-content;
  animation: marquee-scroll 22s linear infinite;
}
@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
</style>
