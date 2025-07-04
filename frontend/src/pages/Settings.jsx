// frontend/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { settingsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import { 
  Save, 
  User, 
  Bell, 
  Palette, 
  Clock, 
  Brain,
  LayoutDashboard as Widgets,
  Globe
} from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    enabled_widgets: ['tasks', 'timer', 'ai_chat', 'stats'],
    theme: 'light',
    work_hours_start: '09:00',
    work_hours_end: '17:00',
    pomodoro_work_duration: 25,
    pomodoro_break_duration: 5,
    pomodoro_long_break_duration: 15,
    enable_notifications: true,
    enable_sounds: true,
    ai_personality: 'helpful',
    domains_of_interest: ['AI/ML', 'productivity', 'technology']
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const availableWidgets = [
    { id: 'tasks', name: 'Tasks', description: 'Manage your tasks and to-dos' },
    { id: 'timer', name: 'Focus Timer', description: 'Pomodoro timer for focus sessions' },
    { id: 'ai_chat', name: 'AI Assistant', description: 'Chat with your AI productivity helper' },
    { id: 'stats', name: 'Statistics', description: 'View your productivity metrics' },
    { id: 'quick_actions', name: 'Quick Actions', description: 'Fast access to common actions' },
    { id: 'calendar', name: 'Calendar', description: 'View your schedule and events' },
    { id: 'feeds', name: 'Knowledge Feeds', description: 'Stay updated with relevant content' }
  ]

  const aiPersonalities = [
    { id: 'helpful', name: 'Helpful', description: 'Balanced and informative responses' },
    { id: 'friendly', name: 'Friendly', description: 'Warm and encouraging tone' },
    { id: 'professional', name: 'Professional', description: 'Business-focused and formal' },
    { id: 'casual', name: 'Casual', description: 'Relaxed and conversational' }
  ]

  const interestDomains = [
    'AI/ML', 'Data Science', 'Productivity', 'Technology', 'Business', 
    'Health & Wellness', 'Finance', 'Education', 'Science', 'Arts & Culture'
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getSettings()
      setSettings(response.data)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsAPI.updateSettings(settings)
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleWidgetToggle = (widgetId) => {
    setSettings(prev => ({
      ...prev,
      enabled_widgets: prev.enabled_widgets.includes(widgetId)
        ? prev.enabled_widgets.filter(w => w !== widgetId)
        : [...prev.enabled_widgets, widgetId]
    }))
  }

  const handleDomainToggle = (domain) => {
    setSettings(prev => ({
      ...prev,
      domains_of_interest: prev.domains_of_interest.includes(domain)
        ? prev.domains_of_interest.filter(d => d !== domain)
        : [...prev.domains_of_interest, domain]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Customize your EunoiaFlow experience
          </p>
        </div>

        <div className="space-y-8">
          {/* Widgets Configuration */}
          <div className="widget-card">
            <div className="flex items-center mb-6">
              <Widgets className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dashboard Widgets
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableWidgets.map((widget) => (
                <div key={widget.id} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {widget.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {widget.description}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleWidgetToggle(widget.id)}
                    className={`ml-3 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      settings.enabled_widgets.includes(widget.id)
                        ? 'bg-primary-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                        settings.enabled_widgets.includes(widget.id)
                          ? 'translate-x-5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Timer Settings */}
          <div className="widget-card">
            <div className="flex items-center mb-6">
              <Clock className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Timer Settings
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.pomodoro_work_duration}
                  onChange={(e) => setSettings({...settings, pomodoro_work_duration: parseInt(e.target.value)})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.pomodoro_break_duration}
                  onChange={(e) => setSettings({...settings, pomodoro_break_duration: parseInt(e.target.value)})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Long Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.pomodoro_long_break_duration}
                  onChange={(e) => setSettings({...settings, pomodoro_long_break_duration: parseInt(e.target.value)})}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* AI Assistant Settings */}
          <div className="widget-card">
            <div className="flex items-center mb-6">
              <Brain className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Assistant
              </h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  AI Personality
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiPersonalities.map((personality) => (
                    <button
                      key={personality.id}
                      onClick={() => setSettings({...settings, ai_personality: personality.id})}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        settings.ai_personality === personality.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {personality.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {personality.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Domains of Interest
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestDomains.map((domain) => (
                    <button
                      key={domain}
                      onClick={() => handleDomainToggle(domain)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        settings.domains_of_interest.includes(domain)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="widget-card">
            <div className="flex items-center mb-6">
              <Bell className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Enable Notifications
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about timer completions and task reminders
                  </p>
                </div>
                <button
                  onClick={() => setSettings({...settings, enable_notifications: !settings.enable_notifications})}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    settings.enable_notifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      settings.enable_notifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Sound Alerts
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Play sounds for timer and task notifications
                  </p>
                </div>
                <button
                  onClick={() => setSettings({...settings, enable_sounds: !settings.enable_sounds})}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    settings.enable_sounds ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      settings.enable_sounds ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings