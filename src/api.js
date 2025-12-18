const API_BASE_URL = 'http://localhost:8000/api'

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('kanban-token')
}

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || 'An error occurred')
  }

  return response.json()
}

// Auth API
export const authAPI = {
  register: async (name, email, password) => {
    const data = await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    localStorage.setItem('kanban-token', data.access_token)
    localStorage.setItem('kanban-user', JSON.stringify(data.user))
    return data
  },

  login: async (email, password) => {
    const data = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('kanban-token', data.access_token)
    localStorage.setItem('kanban-user', JSON.stringify(data.user))
    return data
  },

  logout: () => {
    localStorage.removeItem('kanban-token')
    localStorage.removeItem('kanban-user')
  },

  getCurrentUser: async () => {
    return apiRequest('/me')
  },
}

// Boards API
export const boardsAPI = {
  getAll: async () => {
    return apiRequest('/boards')
  },

  getById: async (boardId) => {
    return apiRequest(`/boards/${boardId}`)
  },

  create: async (name) => {
    return apiRequest('/boards', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  update: async (boardId, name) => {
    return apiRequest(`/boards/${boardId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    })
  },

  delete: async (boardId) => {
    return apiRequest(`/boards/${boardId}`, {
      method: 'DELETE',
    })
  },
}

// Lists API
export const listsAPI = {
  create: async (boardId, title) => {
    return apiRequest(`/boards/${boardId}/lists`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
  },

  update: async (listId, title) => {
    return apiRequest(`/lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    })
  },

  delete: async (listId) => {
    return apiRequest(`/lists/${listId}`, {
      method: 'DELETE',
    })
  },
}

// Cards API
export const cardsAPI = {
  create: async (listId, content) => {
    return apiRequest(`/lists/${listId}/cards`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  },

  update: async (cardId, content) => {
    return apiRequest(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    })
  },

  delete: async (cardId) => {
    return apiRequest(`/cards/${cardId}`, {
      method: 'DELETE',
    })
  },

  move: async (cardId, targetListId, newPosition) => {
    return apiRequest(`/cards/${cardId}/move?target_list_id=${targetListId}&new_position=${newPosition}`, {
      method: 'PUT',
    })
  },
}

