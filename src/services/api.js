const API_PREFIX = '/api'

async function request(path, { method = 'GET', body, headers = {}, signal, ...options } = {}) {
  const fetchOptions = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'same-origin',
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
