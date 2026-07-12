import { request } from './api'

function toFormData(payload) {
  const fd = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    // foto lama (string URL) gak dikirim ulang, cukup skip
    if (key === 'foto' && !(value instanceof File)) return

    // Support file_prestasi for Pendaftaran
    if (key === 'file_prestasi' && !(value instanceof File)) return
    if (key === 'foto_full' && !(value instanceof File)) return
    if (key === 'foto_half' && !(value instanceof File)) return
    if (key === 'image' && !(value instanceof File)) return

    fd.append(key, value)
  })
  return fd
}

// ── Simple in-memory cache untuk data statis ──────────────────────────────────
const _cache = new Map()
async function cachedRequest(key, path, ttlMs = 5 * 60 * 1000) {
  const hit = _cache.get(key)
  if (hit && Date.now() - hit.ts < ttlMs) return hit.data
  const data = await request(path)
  _cache.set(key, { data, ts: Date.now() })
  return data
}

// ── AbortController map: mencegah duplicate request in-flight ─────────────────
const _controllers = new Map()
function abortAndRequest(key, path) {
  if (_controllers.has(key)) _controllers.get(key).abort()
  const ctrl = new AbortController()
  _controllers.set(key, ctrl)
  return request(path, { signal: ctrl.signal }).finally(() => _controllers.delete(key))
}

// ==================== DASHBOARD ====================
export const dashboardApi = {
  getStats: () => request('/admin/stats'),
}

// ==================== SETTINGS ====================
export const settingsApi = {
  getRegistration: () => request('/settings/registration'),
  updateRegistration: (data) => request('/settings/registration', { method: 'PUT', body: data }),

  getSelectionFlow: () => request('/settings/selection-flow'),
  updateSelectionFlow: (data) => request('/settings/selection-flow', { method: 'PUT', body: data }),

  getMarquee: () => request('/settings/marquee'),
  updateMarquee: (data) => request('/settings/marquee', { method: 'PUT', body: data }),

  // Angkatan di-cache 5 menit karena jarang berubah
  getAngkatan: () => cachedRequest('angkatan', '/settings/angkatan'),
  updateAngkatan: (data) => {
    _cache.delete('angkatan') // invalidate cache saat update
    return request('/settings/angkatan', { method: 'PUT', body: data })
  },

  getVoting: () => request('/settings/voting'),
  updateVoting: (data) => request('/settings/voting', { method: 'PUT', body: data }),
}

// ==================== GALLERY ====================
export const galleryApi = {
  /** Untuk admin: ambil semua tanpa paginasi */
  getAll: () => request('/gallery'),

  /** Untuk public view: paginated, dengan AbortController agar tidak double-request */
  getPaginated: (page = 1, perPage = 12) =>
    abortAndRequest('gallery-page', `/gallery?paginate=1&page=${page}&per_page=${perPage}`),

  create: (data) => request('/gallery', { method: 'POST', body: toFormData(data) }),
  update: (id, data) => request(`/gallery/${id}`, { method: 'POST', body: toFormData(data) }),
  remove: (id) => request(`/gallery/${id}`, { method: 'DELETE' }),
}

// ==================== DUTA ====================
export const dutaApi = {
  /** Untuk admin: ambil semua tanpa paginasi */
  getAll: () => request('/duta'),

  /** Untuk public view: paginated */
  getPaginated: (page = 1, perPage = 12) =>
    abortAndRequest('duta-page', `/duta?paginate=1&page=${page}&per_page=${perPage}`),

  create: (data) => request('/duta', { method: 'POST', body: toFormData(data) }),
  update: (id, data) => request(`/duta/${id}`, { method: 'POST', body: toFormData(data) }),
  remove: (id) => request(`/duta/${id}`, { method: 'DELETE' }),
}

// ==================== PENDAFTARAN ====================
export const pendaftaranApi = {
  getAll: () => request('/pendaftaran'),
  getById: (id) => request(`/pendaftaran/${id}`),
  getUnreadCount: () => request('/pendaftaran/unread-count'),
  create: (data) => request('/pendaftaran', { method: 'POST', body: toFormData(data) }),
  remove: (id) => request(`/pendaftaran/${id}`, { method: 'DELETE' }),
}

// ==================== PESERTA SELEKSI ====================
export const pesertaSeleksiApi = {
  getAll: (status = null) => request(status ? `/peserta-seleksi?status=${status}` : '/peserta-seleksi'),
  create: (data) => request('/peserta-seleksi', { method: 'POST', body: data }),
  update: (id, data) => request(`/peserta-seleksi/${id}`, { method: 'PUT', body: data }),
  remove: (id) => request(`/peserta-seleksi/${id}`, { method: 'DELETE' }),
}

// ==================== KANDIDAT VOTING ====================
export const kandidatVotingApi = {
  getAll: () => request('/kandidat-voting'),
  create: (data) => request('/kandidat-voting', { method: 'POST', body: toFormData(data) }),
  update: (id, data) => request(`/kandidat-voting/${id}`, { method: 'POST', body: toFormData(data) }),
  remove: (id) => request(`/kandidat-voting/${id}`, { method: 'DELETE' }),
  vote: (id) => request(`/kandidat-voting/${id}/vote`, { method: 'POST' }),
  resetVotes: () => request('/kandidat-voting/reset', { method: 'POST' }),
}
