// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import TasksWidget from '../components/widgets/TasksWidget'
import TimerWidget from '../components/widgets/TimerWidget'
import AIChat from '../components/widgets/AIChat'
import StatsWidget from '../components/widgets/StatsWidget'
import QuickActionsWidget from '../components/widgets/QuickActionsWidget'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [enabledWidgets, setEnabledWidgets] = useState(['tasks', 'timer', 'ai_chat', 'stats', 'quick_actions'])
  const [loading, setLoading] = useState(false) // Changed to false for immediate render

  useEffect(() => {
    loadEnabledWidgets()
  }, [user?.id])

  const loadEnabledWidgets = async () => {
    try {
      // Try to load from API, but don't block UI if it fails
      const response = await settingsAPI.getEnabledWidgets()
      setEnabledWidgets(response.data.enabled_widgets || [])
      
      // For now, use default widgets
      // setEnabledWidgets(['tasks', 'timer', 'ai_chat', 'stats', 'quick_actions'])
    } catch (error) {
      console.log('Settings API not available, using defaults')
      // Default widgets if settings can't be loaded
      setEnabledWidgets(['tasks', 'timer', 'ai_chat', 'stats', 'quick_actions'])
    } finally {
      setLoading(false)
    }
  }

  const isWidgetEnabled = (widgetName) => {
    return enabledWidgets.includes(widgetName)
  }

  const renderWidget = (widgetName) => {
    if (!isWidgetEnabled(widgetName)) return null

    switch (widgetName) {
      case 'tasks':
        return <TasksWidget key="tasks" />
      case 'timer':
        return <TimerWidget key="timer" />
      case 'ai_chat':
        return <AIChat key="ai_chat" />
      case 'stats':
        return <StatsWidget key="stats" />
      case 'quick_actions':
        return <QuickActionsWidget key="quick_actions" />
      default:
        return null
    }
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
            Welcome back, {user?.full_name || user?.username || 'User'}! 👋
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here's what's happening with your productivity today.
          </p>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions Widget */}
          {renderWidget('quick_actions')}
          
          {/* Timer Widget */}
          {renderWidget('timer')}
          
          {/* Stats Widget */}
          {renderWidget('stats')}
          
          {/* Tasks Widget */}
          <div className="md:col-span-2 lg:col-span-1">
            {renderWidget('tasks')}
          </div>
          
          {/* AI Chat Widget */}
          <div className="md:col-span-2 lg:col-span-2">
            {renderWidget('ai_chat')}
          </div>
        </div>

        {/* If no widgets are enabled, show a message */}
        {enabledWidgets.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No widgets enabled
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Go to settings to enable widgets for your dashboard.
              </p>
              <button
                onClick={() => window.location.href = '/settings'}
                className="btn-primary"
              >
                Go to Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

