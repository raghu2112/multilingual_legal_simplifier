import API from './authApi'

export const uploadDocument = async (file, language = 'English') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('language', language)
  const { data } = await API.post('/api/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const getHistory = async () => {
  const { data } = await API.get('/api/document/history')
  return data
}

export const getDocument = async (id) => {
  const { data } = await API.get(`/api/document/${id}`)
  return data
}

export const deleteDocument = async (id) => {
  const { data } = await API.delete(`/api/document/${id}`)
  return data
}

export const downloadDocument = async (id) => {
  const response = await API.get(`/api/document/${id}/download`, {
    responseType: 'blob'
  })
  
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  
  const disposition = response.headers['content-disposition']
  let filename = 'document'
  if (disposition && disposition.indexOf('filename="') !== -1) {
    filename = disposition.split('filename="')[1].split('"')[0]
  }
  
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const streamChat = async (id, messages, onChunk) => {
  const token = localStorage.getItem('le_token')
  let apiUrl = 'http://localhost:8000/api'
  if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL
  }

  const response = await fetch(`${apiUrl}/document/${id}/chat`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ messages })
  })

  if (!response.ok) {
    throw new Error('Failed to start chat stream.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    if (chunk) onChunk(chunk)
  }
}
