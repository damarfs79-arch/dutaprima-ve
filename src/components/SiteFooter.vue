<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer style="background: #4A2E1A;" class="text-white/90">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <h3 class="font-display font-bold text-lg text-white mb-3 drop-shadow-sm">
          Duta SMK PGRI 05 JEMBER
        </h3>
        <p class="text-sm text-[#E5C9A8] leading-relaxed">
          Wadah apresiasi dan pengembangan diri bagi siswa-siswi terbaik
          SMK PGRI 05 Jember untuk berkontribusi bagi almamater dan bangsa.
        </p>
        <div class="flex gap-3 mt-5">
          <a
            v-for="(link, icon) in { mail: 'mailto:info@dutaprimapgri05.sch.id', instagram: 'https://www.instagram.com/duta.smkprima?igsh=bmE5Njd5YjVieTZy', tiktok: 'https://www.tiktok.com/@_duta.prima?_r=1&_t=ZS-97gtH1fWhHQ' }"
            :key="icon"
            :href="link"
            target="_blank"
            rel="noopener noreferrer"
            class="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-brand-brown transition-colors"
            :aria-label="icon"
          >
            <svg v-if="icon === 'mail'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <svg v-else-if="icon === 'instagram'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke-width="2" />
              <circle cx="12" cy="12" r="4" stroke-width="2" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59 2.6 2.6 0 0 1 .79.12V9.81a5.61 5.61 0 0 0-.79-.06A5.6 5.6 0 1 0 15.5 15.4V8.7a7.27 7.27 0 0 0 4.25 1.36V7a4.27 4.27 0 0 1-3.15-1.18z" />
            </svg>
          </a>
        </div>
      </div>

      <div>
        <h4 class="font-display font-semibold text-sm uppercase tracking-wide text-white mb-4 drop-shadow-sm">
          Tautan Cepat
        </h4>
        <ul class="space-y-2 text-sm text-white/80">
          <li><a href="#" class="text-[#FAC775] hover:text-white transition-colors">Visi &amp; Misi</a></li>
          <li><a href="#" class="text-[#FAC775] hover:text-white transition-colors">Kontak Kami</a></li>
          <li><a href="https://maps.app.goo.gl/RPUZHNQzFFaTeP128" target="_blank" rel="noopener noreferrer" class="text-[#FAC775] hover:text-white transition-colors">Lokasi Sekolah</a></li>
          <li><a href="#" class="text-[#FAC775] hover:text-white transition-colors">Kebijakan Privasi</a></li>
        </ul>
      </div>

      <div>
        <h4 class="font-display font-semibold text-sm uppercase tracking-wide text-white mb-4 drop-shadow-sm">
          Hubungi Kami
        </h4>
        <ul class="space-y-3 text-sm text-white/80">
          <li class="flex gap-2 items-start">
            <span class="mt-0.5">📍</span>
            <a href="https://maps.app.goo.gl/RPUZHNQzFFaTeP128" target="_blank" rel="noopener noreferrer" class="hover:text-[#FAC775] transition-colors">
              Jl. Krakatau No.60, Pd. Waluh, Kencong, Kec. Kencong, Kabupaten Jember, Jawa Timur 68167
            </a>
          </li>
          <li class="flex gap-2">
            <span>✉️</span>
            <span>info@dutaprimapgri05.sch.id</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-white/20 py-5 text-center text-xs text-white/60">
      &copy; {{ year }} Duta SMK PGRI 05 Jember. All Rights Reserved.
    </div>
  </footer>
</template>
