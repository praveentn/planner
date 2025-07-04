// frontend/src/services/api.js
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => 
    apiClient.post('/api/auth/login', { email, password }),
  
  register: (userData) => 
    apiClient.post('/api/auth/register', userData),
  
  getProfile: () => 
    apiClient.get('/api/auth/me'),
  
  verifyToken: () => 
    apiClient.get('/api/auth/verify-token'),
}

// Tasks API
export const tasksAPI = {
  getTasks: (params = {}) => 
    apiClient.get('/api/tasks', { params }),
  
  getTask: (id) => 
    apiClient.get(`/api/tasks/${id}`),
  
  createTask: (taskData) => 
    apiClient.post('/api/tasks', taskData),
  
  updateTask: (id, taskData) => 
    apiClient.put(`/api/tasks/${id}`, taskData),
  
  deleteTask: (id) => 
    apiClient.delete(`/api/tasks/${id}`),
  
  toggleTask: (id) => 
    apiClient.post(`/api/tasks/${id}/toggle`),
  
  getTodayTasks: () => 
    apiClient.get('/api/tasks/today'),
  
  getOverdueTasks: () => 
    apiClient.get('/api/tasks/overdue'),
  
  getTaskStats: () => 
    apiClient.get('/api/tasks/stats'),
  
  getProjects: () => 
    apiClient.get('/api/tasks/projects/list'),
  
  getTags: () => 
    apiClient.get('/api/tasks/tags/list'),
}

// Timer API
export const timerAPI = {
  getSessions: (params = {}) => 
    apiClient.get('/api/timer/sessions', { params }),
  
  createSession: (sessionData) => 
    apiClient.post('/api/timer/sessions', sessionData),
  
  updateSession: (id, sessionData) => 
    apiClient.put(`/api/timer/sessions/${id}`, sessionData),
  
  deleteSession: (id) => 
    apiClient.delete(`/api/timer/sessions/${id}`),
  
  getTodaySessions: () => 
    apiClient.get('/api/timer/sessions/today'),
  
  getDailyStats: (date) => 
    apiClient.get('/api/timer/stats/daily', { params: { date } }),
  
  getWeeklyStats: (weeksBack = 0) => 
    apiClient.get('/api/timer/stats/weekly', { params: { weeks_back: weeksBack } }),
  
  getPomodoroSettings: () => 
    apiClient.get('/api/timer/settings/pomodoro'),
}

// AI API
export const aiAPI = {
  chat: (message, context = {}) => 
    apiClient.post('/api/ai/chat', { message, context }),
  
  getTaskSuggestions: () => 
    apiClient.post('/api/ai/task-suggestions'),
  
  analyzeProductivity: () => 
    apiClient.post('/api/ai/analyze-productivity'),
  
  getQuickFact: () => 
    apiClient.post('/api/ai/quick-fact'),
}

// Feeds API
export const feedsAPI = {
  getFeedItems: (params = {}) => 
    apiClient.get('/api/feeds', { params }),
  
  updateFeedItem: (id, updateData) => 
    apiClient.put(`/api/feeds/${id}`, updateData),
  
  getCategories: () => 
    apiClient.get('/api/feeds/categories'),
  
  getFeedStats: () => 
    apiClient.get('/api/feeds/stats'),
}

// Settings API
export const settingsAPI = {
  getSettings: () => 
    apiClient.get('/api/settings'),
  
  updateSettings: (settingsData) => 
    apiClient.put('/api/settings', settingsData),
  
  getEnabledWidgets: () => 
    apiClient.get('/api/settings/widgets'),
  
  updateEnabledWidgets: (widgets) => 
    apiClient.put('/api/settings/widgets', { enabled_widgets: widgets }),
}

// WebSocket service
export class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
    this.listeners = new Map()
  }

  connect(userId) {
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/${userId}`
    
    try {
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.reconnect(userId)
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
    }
  }

  reconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => this.connect(userId), this.reconnectInterval)
    }
  }

  handleMessage(data) {
    const { type } = data
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => callback(data))
    }
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType).add(callback)
  }

  unsubscribe(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback)
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
  }
}

export const wsService = new WebSocketService()

export default apiClient