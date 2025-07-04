/* React JS file for AuthContext */
// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          await verifyToken()
        } catch (error) {
          console.log('Token verification failed, clearing token')
          logout()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [token])

  const verifyToken = async () => {
    try {
      const response = await authAPI.verifyToken()
      if (response.data.valid) {
        // Get user profile
        const userResponse = await authAPI.getProfile()
        setUser(userResponse.data)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      // Don't show error toast during initial load
      throw error
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      const { access_token } = response.data
      
      localStorage.setItem('token', access_token)
      setToken(access_token)
      
      // Get user profile
      try {
        const userResponse = await authAPI.getProfile()
        setUser(userResponse.data)
      } catch (profileError) {
        // If profile fetch fails, create a basic user object
        setUser({
          email: email,
          username: email.split('@')[0],
          full_name: email.split('@')[0]
        })
      }
      
      toast.success('Welcome back!')
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      let message = 'Login failed'
      
      if (error.response?.status === 401) {
        message = 'Invalid email or password'
      } else if (error.response?.data?.detail) {
        message = error.response.data.detail
      } else if (error.code === 'ECONNREFUSED' || !error.response) {
        message = 'Cannot connect to server. Please check if the backend is running.'
      }
      
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      await authAPI.register(userData)
      toast.success('Account created successfully! Please log in.')
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      let message = 'Registration failed'
      
      if (error.response?.data?.detail) {
        message = error.response.data.detail
      } else if (error.code === 'ECONNREFUSED' || !error.response) {
        message = 'Cannot connect to server. Please check if the backend is running.'
      }
      
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
