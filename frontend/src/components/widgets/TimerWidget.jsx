// frontend/src/components/widgets/TimerWidget.jsx
import React, { useState, useEffect, useRef } from 'react'
import { timerAPI } from '../../services/api'
import { wsService } from '../../services/api'
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw,
  Clock,
  Coffee,
  Target
} from 'lucide-react'
import toast from 'react-hot-toast'

const TimerWidget = () => {
  const [timerState, setTimerState] = useState({
    isRunning: false,
    timeLeft: 25 * 60, // 25 minutes in seconds
    totalTime: 25 * 60,
    type: 'pomodoro', // pomodoro, break, custom
    sessionId: null
  })
  const [settings, setSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15
  })
  const [stats, setStats] = useState({
    todayPomodoros: 0,
    todayFocusTime: 0
  })
  const [selectedTask, setSelectedTask] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    loadSettings()
    loadTodayStats()
    
    // Subscribe to WebSocket timer updates
    wsService.subscribe('timer_update', handleTimerUpdate)
    
    return () => {
      wsService.unsubscribe('timer_update', handleTimerUpdate)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          if (prev.timeLeft <= 1) {
            handleTimerComplete()
            return { ...prev, timeLeft: 0, isRunning: false }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 }
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState.isRunning])

  const loadSettings = async () => {
    try {
      const response = await timerAPI.getPomodoroSettings()
      setSettings({
        workDuration: response.data.work_duration,
        breakDuration: response.data.break_duration,
        longBreakDuration: response.data.long_break_duration
      })
    } catch (error) {
      console.error('Error loading timer settings:', error)
    }
  }

  const loadTodayStats = async () => {
    try {
      const response = await timerAPI.getDailyStats()
      setStats({
        todayPomodoros: response.data.completed_pomodoros,
        todayFocusTime: response.data.pomodoro_time_minutes
      })
    } catch (error) {
      console.error('Error loading today stats:', error)
    }
  }

  const handleTimerUpdate = (data) => {
    // Handle real-time timer updates from WebSocket
    console.log('Timer update received:', data)
  }

  const startTimer = async () => {
    try {
      const sessionData = {
        session_type: timerState.type,
        duration_planned: timerState.totalTime,
        task_id: selectedTask?.id || null,
        task_title: selectedTask?.title || null
      }

      const response = await timerAPI.createSession(sessionData)
      
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        sessionId: response.data.id
      }))

      toast.success(`${timerState.type === 'pomodoro' ? 'Focus' : 'Break'} session started!`)
    } catch (error) {
      console.error('Error starting timer:', error)
      toast.error('Failed to start timer')
    }
  }

  const pauseTimer = () => {
    setTimerState(prev => ({ ...prev, isRunning: false }))
  }

  const stopTimer = async () => {
    if (timerState.sessionId) {
      try {
        await timerAPI.updateSession(timerState.sessionId, {
          duration_actual: timerState.totalTime - timerState.timeLeft,
          was_completed: false,
          ended_at: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error updating session:', error)
      }
    }

    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.totalTime,
      sessionId: null
    }))

    toast.success('Timer stopped')
  }

  const resetTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.totalTime,
      sessionId: null
    }))
  }

  const handleTimerComplete = async () => {
    if (timerState.sessionId) {
      try {
        await timerAPI.updateSession(timerState.sessionId, {
          duration_actual: timerState.totalTime,
          was_completed: true,
          ended_at: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error updating session:', error)
      }
    }

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: `Your ${timerState.type} session is finished.`,
        icon: '/favicon.ico'
      })
    }

    // Play sound (optional)
    const audio = new Audio('/notification.mp3')
    audio.play().catch(() => {}) // Ignore errors if audio can't play

    toast.success(`${timerState.type === 'pomodoro' ? 'Focus' : 'Break'} session completed!`)
    
    // Auto-switch to break/work
    if (timerState.type === 'pomodoro') {
      setTimerMode('break')
    } else {
      setTimerMode('pomodoro')
    }

    loadTodayStats()
  }

  const setTimerMode = (mode) => {
    let duration
    switch (mode) {
      case 'pomodoro':
        duration = settings.workDuration * 60
        break
      case 'break':
        duration = settings.breakDuration * 60
        break
      case 'long-break':
        duration = settings.longBreakDuration * 60
        break
      default:
        duration = 25 * 60
    }

    setTimerState({
      isRunning: false,
      timeLeft: duration,
      totalTime: duration,
      type: mode,
      sessionId: null
    })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return ((timerState.totalTime - timerState.timeLeft) / timerState.totalTime) * 100
  }

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  return (
    <div className="widget-card">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Focus Timer
        </h3>

        {/* Timer Display */}
        <div className="relative mb-8">
          <svg className="w-48 h-48 mx-auto transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - getProgressPercentage() / 100)}`}
              className={`transition-all duration-1000 ${
                timerState.type === 'pomodoro' 
                  ? 'text-red-500' 
                  : 'text-green-500'
              }`}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="timer-display">
              {formatTime(timerState.timeLeft)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {timerState.type === 'pomodoro' ? 'Focus Time' : 'Break Time'}
            </div>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center gap-3 mb-6">
          {!timerState.isRunning ? (
            <button
              onClick={startTimer}
              className="btn-primary flex items-center"
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </button>
          )}
          
          <button
            onClick={stopTimer}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </button>
          
          <button
            onClick={resetTimer}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>

        {/* Timer Mode Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTimerMode('pomodoro')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              timerState.type === 'pomodoro'
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Target className="h-4 w-4 mx-auto mb-1" />
            Focus ({settings.workDuration}m)
          </button>
          
          <button
            onClick={() => setTimerMode('break')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              timerState.type === 'break'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Coffee className="h-4 w-4 mx-auto mb-1" />
            Break ({settings.breakDuration}m)
          </button>
        </div>

        {/* Today's Stats */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Today's Progress
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.todayPomodoros}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Pomodoros
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(stats.todayFocusTime)}m
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Focus Time
              </div>
            </div>
          </div>
        </div>

        {/* Notification Permission */}
        {'Notification' in window && Notification.permission === 'default' && (
          <button
            onClick={requestNotificationPermission}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700"
          >
            Enable notifications for timer alerts
          </button>
        )}
      </div>
    </div>
  )
}

export default TimerWidget

