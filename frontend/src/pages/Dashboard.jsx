// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { settingsAPI } from '../services/api'
import { wsService } from '../services/api'
import Navbar from '../components/Navbar'
import TasksWidget from '../components/widgets/TasksWidget'
import TimerWidget from '../components/widgets/TimerWidget'
import AIChat from '../components/widgets/AIChat'
import StatsWidget from '../components/widgets/StatsWidget'
import QuickActionsWidget from '../components/widgets/QuickActionsWidget.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [enabledWidgets, setEnabledWidgets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEnabledWidgets()
    
    // Connect to WebSocket
    if (user?.id) {
      wsService.connect(user.id)
    }

    // Cleanup WebSocket on unmount
    return () => {
      wsService.disconnect()
    }
  }, [user?.id])

  const loadEnabledWidgets = async () => {
    try {
      const response = await settingsAPI.getEnabledWidgets()
      setEnabledWidgets(response.data.enabled_widgets || [])
    } catch (error) {
      console.error('Error loading enabled widgets:', error)
      // Default widgets if settings can't be loaded
      setEnabledWidgets(['tasks', 'timer', 'ai_chat', 'stats'])
    } finally {
      setLoading(false)
    }
  }

  const isWidgetEnabled = (widgetName) => {
    return enabledWidgets.includes(widgetName)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.full_name || user?.username}! 👋
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here's what's happening with your productivity today.
          </p>
        </div>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks and Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {isWidgetEnabled('tasks') && (
              <TasksWidget />
            )}
            
            {isWidgetEnabled('quick_actions') && (
              <QuickActionsWidget />
            )}
          </div>

          {/* Right Column - Timer, AI Chat, Stats */}
          <div className="space-y-6">
            {isWidgetEnabled('timer') && (
              <TimerWidget />
            )}
            
            {isWidgetEnabled('ai_chat') && (
              <AIChat />
            )}
            
            {isWidgetEnabled('stats') && (
              <StatsWidget />
            )}
          </div>
        </div>

        {/* If no widgets are enabled */}
        {enabledWidgets.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No widgets enabled
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enable some widgets in your settings to get started with productivity tracking.
            </p>
            <button
              onClick={() => window.location.href = '/settings'}
              className="btn-primary"
            >
              Go to Settings
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

