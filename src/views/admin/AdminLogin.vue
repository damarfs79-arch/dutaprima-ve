<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const password = ref('')
const showPassword = ref(false)

const errorMsg = ref('')

const handleLogin = async () => {
  const success = await auth.login(username.value, password.value)

  if (success) {
    router.push('/admin/dashboard')
  } else {
    errorMsg.value = auth.errorMsg
  }
}
</script>


<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div class="text-center mb-8">
                <img
          :src="'/images/logo-duta.png'"
          alt="Logo Duta Prima"
          class="w-9 h-9 rounded-full object-cover border border-brand-amber bg-white"
        />
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-amber to-brand-orange inline-block mb-2">Duta Prima</h1>
        <p class="text-gray-500 font-medium">Login Admin Dashboard</p>
      </div>

      <div v-if="errorMsg" class="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
        {{ errorMsg }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input 
            v-model="username"
            type="text" 
            placeholder="Masukkan username" 
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber transition-all bg-gray-50 focus:bg-white"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div class="relative">
            <input 
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan password" 
              class="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber transition-all bg-gray-50 focus:bg-white"
              required
            >
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          class="w-full bg-brand-orange text-white font-semibold py-3 rounded-xl hover:bg-brand-orange/90 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          Masuk ke Dashboard
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </form>

      <div class="mt-8 text-center">
        <router-link to="/" class="text-sm text-gray-500 hover:text-brand-orange transition-colors">
          &larr; Kembali ke halaman publik
        </router-link>
      </div>
    </div>
  </div>
</template>