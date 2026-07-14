const API_PREFIX = import.meta.env.VITE_API_URL || '/api'

async function request(path, { method = 'GET', body, headers = {}, signal, ...options } = {}) {
  const fetchOptions = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
    ...(signal ? { signal } : {}),
    ...options,
  }

  if (body !== undefined) {
    if (body instanceof FormData) {
      fetchOptions.body = body
      delete fetchOptions.headers['Content-Type']
    } else {
      fetchOptions.body = JSON.stringify(body)
    }
  }

  let response
  try {
    response = await fetch(`${API_PREFIX}${path}`, fetchOptions)
  } catch (err) {
    // Request dibatalkan via AbortController — bukan error nyata
    if (err.name === 'AbortError') return null
    throw err
  }
  let data = null
  try {
    const text = await response.text()
    data = text ? JSON.parse(text) : null
    
    // Auto-fix URL gambar untuk Hostinger
    // Karena di Hostinger storage:link tidak bisa dibuat, kita paksa URL ke /storage/app/public/
    if (data) {
      const backendUrl = API_PREFIX.replace(/\/api$/, '')
      const isProd = import.meta.env.PROD
      
      const fixUrls = (obj) => {
        if (typeof obj === 'string' && obj.startsWith('/storage/')) {
          // Di production hostinger, langsung akses /storage/app/public/
          // Di lokal, akses normal via symlink /storage/
          const path = obj.split('/storage/')[1]
          return isProd 
            ? `${backendUrl}/storage/app/public/${path}`
            : `${backendUrl}/storage/${path}`
        }
        if (Array.isArray(obj)) {
          return obj.map(fixUrls)
        }
        if (obj !== null && typeof obj === 'object') {
          for (const key in obj) {
            obj[key] = fixUrls(obj[key])
          }
        }
        return obj
      }
      data = fixUrls(data)
    }
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Terjadi kesalahan server (Error ${response.status}).`)
    }
    data = null
  }

  if (!response.ok) {
    const message = data?.message || data?.error || `Terjadi kesalahan saat memanggil API (Status ${response.status}).`
    throw new Error(message)
  }

  return data
}

export { request }
