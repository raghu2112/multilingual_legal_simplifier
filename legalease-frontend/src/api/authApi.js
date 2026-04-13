import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('le_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const registerUser = async (name, email, password) => {
  const { data } = await API.post('/api/auth/register', { name, email, password })
  return data
}

export const loginUser = async (email, password) => {
  const { data } = await API.post('/api/auth/login', { email, password })
  return data
}

export const getMe = async () => {
  const { data } = await API.get('/api/auth/me')
  return data
}

export const deleteAccount = async () => {
  const { data } = await API.delete('/api/auth/me')
  return data
}

export const requestPasswordReset = async (email) => {
  const { data } = await API.post('/api/auth/forgot-password', { email })
  return data
}

export const resetPassword = async (token, new_password) => {
  const { data } = await API.post('/api/auth/reset-password', { token, new_password })
  return data
}

export default API
