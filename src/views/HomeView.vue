<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const slides = [
  '/images/hero-1.jpg',
  '/images/hero-2.jpg'
]
const activeSlide = ref(0)
let slideInterval

onMounted(() => {
  slideInterval = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.length
  }, 5000)
})

onUnmounted(() => {
  clearInterval(slideInterval)
})

const pilars = [
  {
    icon: '🎓',
    title: 'Excellence in Academics & Soft Skills',
    desc: 'Kami percaya bahwa kecerdasan intelektual harus dibarengi dengan kemampuan komunikasi, manajemen waktu, dan penyelesaian masalah yang mumpuni.',
  },
]

const missions = [
  {
    title: 'Inovasi Berkelanjutan',
    desc: 'Menciptakan program kesiswaan yang adaptif terhadap perkembangan zaman dan teknologi.',
  },
  {
    title: 'Pengabdian Masyarakat',
    desc: 'Menginisiasi aksi nyata yang memberikan manfaat langsung bagi lingkungan sekitar sekolah.',
  },
  {
    title: 'Pengembangan Potensi',
    desc: 'Menyediakan platform bagi siswa untuk mengeksplorasi bakat di bidang non-akademik.',
  },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden min-h-[600px] flex items-center">
      <!-- Carousel Backgrounds -->
      <transition-group name="fade" tag="div">
        <div v-for="(slide, index) in slides" :key="slide" v-show="activeSlide === index" class="absolute inset-0 z-0">
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-10"></div>
          <img
            :src="slide"
            alt="Siswa Duta Prima"
            class="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </transition-group>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 z-20 w-full">
        <div class="mb-6">

        </div>
        <span class="inline-block bg-brand-amber text-brand-dark text-xs font-semibold px-3 py-1 rounded-full mb-5 shadow-sm">
          Program Kedutaan Siswa
        </span>
        <h1 class="font-display font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight max-w-xl drop-shadow-md">
          Mencetak Pemimpin Masa Depan Berkarakter Unggul
        </h1>
        <p class="text-gray-200 mt-5 max-w-md text-sm sm:text-base leading-relaxed drop-shadow-sm">
          Duta SMK PGRI 05 Jember adalah wadah bagi siswa-siswi terpilih untuk mengasah potensi kepemimpinan, kepedulian sosial, dan kecintaan terhadap almamater.
        </p>
        <div class="flex flex-wrap gap-4 mt-8 mb-12">
          <RouterLink
            to="/pendaftaran"
            class="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors shadow-lg hover:shadow-xl"
          >
            Daftar Sekarang
          </RouterLink>
          <a
            href="#pilar"
            class="border border-white/80 text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-white/10 hover:border-white transition-colors backdrop-blur-sm"
          >
            Pelajari Lebih Lanjut
          </a>
        </div>
        
        <!-- Minimalist Pagination -->
        <div class="flex items-center gap-2.5">
          <button 
            v-for="(_, index) in slides" 
            :key="index"
            @click="activeSlide = index"
            class="relative h-1.5 transition-all duration-500 rounded-full overflow-hidden"
            :class="activeSlide === index ? 'w-8 bg-brand-amber' : 'w-2.5 bg-white/40 hover:bg-white/60'"
            :aria-label="`Slide ${index + 1}`"
          >
          </button>
        </div>
      </div>
    </section>

    <!-- Pilar Utama -->
    <section id="pilar" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="font-display font-bold text-2xl sm:text-3xl text-brand-brown">Pilar Utama Kami</h2>
        <p class="text-gray-600 mt-3 text-sm sm:text-base">
          Dedikasi kami dalam membentuk karakter siswa melalui tiga aspek fundamental pengembangan diri.
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm border-t-4 border-t-brand-amber">
          <div class="w-12 h-12 rounded-xl bg-brand-amber/15 flex items-center justify-center text-2xl mb-5">
            🎓
          </div>
          <h3 class="font-display font-semibold text-lg text-brand-brown mb-2">
            Excellence in Academics & Soft Skills
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed mb-6">
            Kami percaya bahwa kecerdasan intelektual harus dibarengi dengan kemampuan komunikasi, manajemen waktu, dan penyelesaian masalah yang mumpuni. Duta Prima dibekali dengan pelatihan intensif untuk menjadi role model di sekolah.
          </p>
          <div class="rounded-xl bg-gray-100 h-40 sm:h-48 flex items-center justify-center text-gray-400 text-sm">
            Ilustrasi program akademik
          </div>
        </div>

        <div class="bg-brand-brown text-white rounded-2xl p-6 sm:p-8 flex flex-col">
          <div class="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl mb-5">
            🤝
          </div>
          <h3 class="font-display font-semibold text-lg mb-2">Social Care</h3>
          <p class="text-sm text-white/80 leading-relaxed flex-1">
            Kepedulian terhadap sesama adalah inti dari pengabdian kami. Melalui program bakti sosial dan aksi kemanusiaan, kami membangun empati.
          </p>
          <a href="#" class="inline-flex items-center gap-1 text-brand-amber font-semibold text-sm mt-6">
            Lihat Program <span>→</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Visi Misi -->
    <section class="bg-brand-lilac/40 py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-start">
        <div class="relative bg-white rounded-2xl p-8 sm:p-10 shadow-sm border-l-4 border-brand-orange overflow-hidden">
          <span class="absolute -top-2 right-4 text-7xl sm:text-8xl font-display font-extrabold text-gray-100 select-none">
            VIS
          </span>
          <p class="text-xs font-semibold tracking-wide text-brand-orange mb-3">VISI UTAMA</p>
          <p class="relative font-display font-bold text-xl sm:text-2xl text-brand-dark leading-snug">
            "Menjadi pionir penggerak prestasi dan karakter SMK PGRI 05 Jember yang berintegritas, kreatif, dan berdampak bagi masyarakat."
          </p>
          <div class="w-12 h-1 bg-brand-amber mt-6 rounded-full"></div>
        </div>

        <div>
          <h2 class="font-display font-bold text-2xl sm:text-3xl text-brand-brown mb-6">Misi Strategis</h2>
          <ul class="space-y-6">
            <li v-for="(m, i) in missions" :key="m.title" class="flex gap-4">
              <span class="w-8 h-8 rounded-full bg-brand-amber text-brand-dark font-semibold text-sm flex items-center justify-center shrink-0">
                {{ i + 1 }}
              </span>
              <div>
                <h3 class="font-semibold text-brand-dark">{{ m.title }}</h3>
                <p class="text-sm text-gray-600 mt-1 leading-relaxed">{{ m.desc }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Jargon Duta Prima -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div class="flex items-center justify-center gap-3 mb-6">
        <div class="h-px bg-gray-200 flex-1"></div>
        <h3 class="font-display font-bold text-xl text-brand-dark uppercase tracking-widest text-center">Jargon Duta Prima</h3>
        <div class="h-px bg-gray-200 flex-1"></div>
      </div>
      
      <div class="relative bg-gradient-to-br from-[#e5b362] to-[#c78b3a] rounded-3xl p-8 sm:p-10 shadow-xl text-center overflow-hidden group transition-transform duration-500 hover:-translate-y-1">
        <!-- Dekorasi background -->
        <div class="absolute -top-12 -right-12 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div class="absolute -bottom-12 -left-12 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        
        <p class="relative z-10 font-medium text-lg sm:text-xl lg:text-2xl leading-loose text-white drop-shadow-md italic">
          <span class="block mb-2">"Duta Prima, Dutanya SMK PGRI 5 Jember</span>
          <span class="block mb-2">Duta Prima, berprestasi, berkontribusi, menginspirasi</span>
          <span class="block font-bold text-[#fff7e6] text-xl sm:text-2xl lg:text-3xl mt-4">Duta Prima, Yak Kadek!"</span>
        </p>
      </div>
    </section>

    <!-- CTA -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div class="bg-[#4A2E1A] text-white rounded-3xl p-8 sm:p-12 grid md:grid-cols-2 gap-8 items-center overflow-hidden">
        <div>
          <h2 class="font-display font-extrabold text-2xl sm:text-3xl text-white leading-tight">
            Siap Menjadi Bagian dari Perubahan?
          </h2>
          <p class="text-white/85 mt-4 text-sm sm:text-base leading-relaxed">
            Pendaftaran Duta Prima Angkatan 2026/2027 telah dibuka. Jadilah wajah prestasi sekolah dan raih pengalaman kepemimpinan yang tak terlupakan.
          </p>
          <div class="flex flex-wrap gap-4 mt-7">
            <button class="bg-brand-amber text-brand-dark font-semibold px-6 py-3 rounded-full text-sm hover:bg-brand-amber/90 transition-colors">
              Unduh Panduan
            </button>
            <RouterLink
              to="/pendaftaran"
              class="bg-white text-brand-brown font-semibold px-6 py-3 rounded-full text-sm hover:bg-gray-100 transition-colors"
            >
              Daftar Sekarang
            </RouterLink>
          </div>
        </div>
        <div class="relative flex justify-center">
          <div class="w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-white/10 flex items-center justify-center">
            <span class="text-white/70 text-sm">Ilustrasi siswa</span>
          </div>
          <div class="absolute bottom-2 left-2 sm:left-6 bg-white rounded-xl px-4 py-2 shadow-lg flex items-center gap-2">
            <span class="text-brand-amber">⭐</span>
            <div>
              <p class="text-xs font-semibold text-brand-dark">Kuota Terbatas</p>
              <p class="text-[11px] text-gray-500">Sisa 15 Kursi</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
