// frontend/src/components/widgets/QuickActionsWidget.jsx
import React, { useState } from 'react'
import { tasksAPI, aiAPI } from '../../services/api'
import { 
  Plus, 
  Zap, 
  Brain, 
  Coffee,
  Target,
  Lightbulb,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

const QuickActionsWidget = () => {
  const [loading, setLoading] = useState({})

  const handleQuickAction = async (actionType) => {
    setLoading({ ...loading, [actionType]: true })
    
    try {
      switch (actionType) {
        case 'quick_task':
          await handleQuickTask()
          break
        case 'ai_suggestions':
          await handleAISuggestions()
          break
        case 'productivity_analysis':
          await handleProductivityAnalysis()
          break
        case 'quick_fact':
          await handleQuickFact()
          break
        default:
          break
      }
    } catch (error) {
      console.error(`Error with ${actionType}:`, error)
      toast.error('Action failed. Please try again.')
    } finally {
      setLoading({ ...loading, [actionType]: false })
    }
  }

  const handleQuickTask = async () => {
    const title = prompt('Enter a quick task:')
    if (title && title.trim()) {
      await tasksAPI.createTask({ 
        title: title.trim(), 
        priority: 'medium' 
      })
      toast.success('Quick task created!')
      // Refresh tasks in parent component
      window.dispatchEvent(new CustomEvent('refreshTasks'))
    }
  }

  const handleAISuggestions = async () => {
    const response = await aiAPI.getTaskSuggestions()
    if (response.data.suggestions?.length > 0) {
      const suggestions = response.data.suggestions.slice(0, 3).join('\n• ')
      toast.success(`AI Suggestions:\n• ${suggestions}`, { duration: 6000 })
    } else {
      toast.info('No new suggestions at the moment!')
    }
  }

  const handleProductivityAnalysis = async () => {
    const response = await aiAPI.analyzeProductivity()
    if (response.data.analysis) {
      // Show analysis in a more user-friendly way
      toast.success('Productivity analysis complete! Check the AI chat for details.', { duration: 4000 })
      
      // Dispatch event to show analysis in AI chat
      window.dispatchEvent(new CustomEvent('showAIAnalysis', { 
        detail: response.data.analysis 
      }))
    }
  }

  const handleQuickFact = async () => {
    const response = await aiAPI.getQuickFact()
    if (response.data.fact) {
      toast(response.data.fact, { 
        duration: 6000,
        icon: '💡',
        style: {
          maxWidth: '400px'
        }
      })
    }
  }

  const quickActions = [
    {
      id: 'quick_task',
      icon: Plus,
      label: 'Quick Task',
      description: 'Add a task instantly',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => handleQuickAction('quick_task')
    },
    {
      id: 'ai_suggestions',
      icon: Brain,
      label: 'AI Suggestions',
      description: 'Get task recommendations',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => handleQuickAction('ai_suggestions')
    },
    {
      id: 'productivity_analysis',
      icon: TrendingUp,
      label: 'Productivity Analysis',
      description: 'Analyze your patterns',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => handleQuickAction('productivity_analysis')
    },
    {
      id: 'quick_fact',
      icon: Lightbulb,
      label: 'Quick Fact',
      description: 'Learn something new',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      action: () => handleQuickAction('quick_fact')
    }
  ]

  return (
    <div className="widget-card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            disabled={loading[action.id]}
            className={`p-4 rounded-lg text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${action.color}`}
          >
            <div className="flex flex-col items-center text-center">
              {loading[action.id] ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
              ) : (
                <action.icon className="h-6 w-6 mb-2" />
              )}
              
              <span className="font-medium text-sm mb-1">
                {action.label}
              </span>
              
              <span className="text-xs opacity-90">
                {action.description}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Additional Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-3">
          <button className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Target className="h-5 w-5 text-red-500 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Start Focus</span>
          </button>
          
          <button className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Coffee className="h-5 w-5 text-green-500 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Take Break</span>
          </button>
          
          <button className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Zap className="h-5 w-5 text-yellow-500 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Quick Note</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuickActionsWidget