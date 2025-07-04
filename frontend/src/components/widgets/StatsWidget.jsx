// frontend/src/components/widgets/StatsWidget.jsx
import React, { useState, useEffect } from 'react'
import { tasksAPI, timerAPI } from '../../services/api'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle,
  Calendar,
  Zap
} from 'lucide-react'

const StatsWidget = () => {
  const [stats, setStats] = useState({
    tasks: {
      total: 0,
      completed: 0,
      completion_rate: 0,
      overdue: 0
    },
    timer: {
      today_pomodoros: 0,
      today_focus_time: 0,
      productivity_score: 0
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [taskStatsResponse, timerStatsResponse] = await Promise.all([
        tasksAPI.getTaskStats(),
        timerAPI.getDailyStats()
      ])

      setStats({
        tasks: taskStatsResponse.data,
        timer: timerStatsResponse.data
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="widget-card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statItems = [
    {
      icon: Target,
      label: 'Task Completion',
      value: `${stats.tasks.completion_rate}%`,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      icon: CheckCircle,
      label: 'Tasks Completed',
      value: stats.tasks.completed,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      icon: Clock,
      label: 'Focus Time Today',
      value: `${Math.round(stats.timer.today_focus_time)}m`,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      icon: Zap,
      label: 'Pomodoros Today',
      value: stats.timer.today_pomodoros,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
    {
      icon: TrendingUp,
      label: 'Productivity Score',
      value: `${stats.timer.productivity_score}%`,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ]

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Productivity Stats
        </h3>
        <button
          onClick={loadStats}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <TrendingUp className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {statItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                <span className={`text-lg font-bold ${item.color}`}>
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Overview */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          This Week
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {stats.tasks.total}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total Tasks
            </div>
          </div>
          
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {stats.tasks.overdue}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Overdue
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsWidget