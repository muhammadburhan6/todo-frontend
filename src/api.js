// Browser mein login token save karne ke liye ek fixed key.
const TOKEN_KEY = 'daymark_token'

// Token read, save aur delete karne ke simple helper functions.
export const authStore = {
  get() {
    return localStorage.getItem(TOKEN_KEY)
  },

  set(token) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY)
  },
}

// Saari backend requests isi function se guzarti hain.
export async function apiRequest(path, options = {}) {
  const token = authStore.get()

  const headers = {
    // JSON body ho to backend ko content type batate hain.
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    // Logged-in request ke saath JWT token bhejte hain.
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(path, { ...options, headers })

  // Kuch responses mein JSON na ho sakta hai, is liye safe parsing.
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    // 401 ka matlab session expire/invalid hai: token remove karke login dikhayein.
    if (response.status === 401 && token) {
      authStore.clear()
      window.dispatchEvent(new CustomEvent('daymark:unauthorized'))
    }

    const message = data?.message || 'Something went wrong. Please try again.'
    const requestError = new Error(message)
    requestError.status = response.status
    throw requestError
  }

  return data
}
