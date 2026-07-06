import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/galeri-duta', name: 'gallery', component: () => import('../views/GalleryView.vue') },
  { path: '/daftar-duta', name: 'duta-list', component: () => import('../views/DutaListView.vue') },
  { path: '/pengumuman', name: 'pengumuman', component: () => import('../views/PengumumanView.vue') },
  { path: '/voting', name: 'voting', component: () => import('../views/VotingView.vue') },
  { path: '/pendaftaran', name: 'register', component: () => import('../views/RegisterView.vue') },
  
  // Admin Login
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../views/admin/AdminLogin.vue')
  },
  
  // Admin Routes
  {
    path: '/admin',
    component: () => import('../components/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('../views/admin/AdminDashboard.vue')
      },
      {
        path: 'gallery',
        name: 'admin-gallery',
        component: () => import('../views/admin/AdminGallery.vue')
      },
      {
        path: 'duta',
        name: 'admin-duta',
        component: () => import('../views/admin/AdminDuta.vue')
      },
      {
        path: 'registration-settings',
        name: 'admin-registration-settings',
        component: () => import('../views/admin/AdminRegistrationSettings.vue')
      },
      {
        path: 'selection-flow',
        name: 'admin-selection-flow',
        component: () => import('../views/admin/AdminSelectionFlow.vue')
      },
      {
        path: 'pendaftaran',
        name: 'admin-pendaftaran',
        component: () => import('../views/admin/AdminPendaftaran.vue')
      },
      {
        path: 'peserta-seleksi',
        name: 'admin-peserta-seleksi',
        component: () => import('../views/admin/AdminPesertaSeleksi.vue')
      },
      {
        path: 'kandidat-voting',
        name: 'admin-kandidat-voting',
        component: () => import('../views/admin/AdminKandidatVoting.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Route Guard for Admin
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true'
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'admin-login' })
  } else if (to.name === 'admin-login' && isLoggedIn) {
    next({ name: 'admin-dashboard' })
  } else {
    next()
  }
})

export default router
