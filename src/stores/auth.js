import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { request } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(localStorage.getItem('isAdminLoggedIn') === 'true')
  const errorMsg = ref('')
  const loading = ref(false)

  const isAuthenticated = computed(() => isLoggedIn.value)

  async function login(username, password) {
    loading.value = true
    errorMsg.value = ''

    try {
      await request('/admin/login', {
        method: 'POST',
        body: { username, password },
      })

      localStorage.setItem('isAdminLoggedIn', 'true')
      isLoggedIn.value = true
      return true
    } catch (error) {
      errorMsg.value = error?.message || 'Username atau Password salah!'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    localStorage.removeItem('isAdminLoggedIn')
    isLoggedIn.value = false
  }

  return { isLoggedIn, isAuthenticated, errorMsg, loading, login, logout }
})
