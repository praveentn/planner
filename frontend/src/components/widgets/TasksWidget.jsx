// frontend/src/components/widgets/TasksWidget.jsx
import React, { useState, useEffect } from 'react'
import { tasksAPI } from '../../services/api'
import { 
  Plus, 
  Check, 
  Clock, 
  AlertCircle, 
  Calendar,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react'
import toast from 'react-hot-toast'

const TasksWidget = () => {
  const [tasks, setTasks] = useState([])
  const [todayTasks, setTodayTasks] = useState([])
  const [overdueTasks, setOverdueTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  })
  const [filter, setFilter] = useState('all') // all, today, overdue, completed
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadTasks()
    loadTodayTasks()
    loadOverdueTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getTasks({ limit: 50 })
      setTasks(response.data)
    } catch (error) {
      console.error('Error loading tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const loadTodayTasks = async () => {
    try {
      const response = await tasksAPI.getTodayTasks()
      setTodayTasks(response.data)
    } catch (error) {
      console.error('Error loading today tasks:', error)
    }
  }

  const loadOverdueTasks = async () => {
    try {
      const response = await tasksAPI.getOverdueTasks()
      setOverdueTasks(response.data)
    } catch (error) {
      console.error('Error loading overdue tasks:', error)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    
    if (!newTask.title.trim()) {
      toast.error('Task title is required')
      return
    }

    try {
      const taskData = {
        ...newTask,
        due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null
      }
      
      await tasksAPI.createTask(taskData)
      toast.success('Task created successfully!')
      
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: ''
      })
      setShowNewTaskForm(false)
      
      // Reload tasks
      loadTasks()
      loadTodayTasks()
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    }
  }

  const handleToggleTask = async (taskId) => {
    try {
      await tasksAPI.toggleTask(taskId)
      toast.success('Task updated!')
      
      // Reload tasks
      loadTasks()
      loadTodayTasks()
      loadOverdueTasks()
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300'
      case 'medium':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getFilteredTasks = () => {
    let filteredTasks = tasks

    switch (filter) {
      case 'today':
        filteredTasks = todayTasks
        break
      case 'overdue':
        filteredTasks = overdueTasks
        break
      case 'completed':
        filteredTasks = tasks.filter(task => task.is_completed)
        break
      case 'pending':
        filteredTasks = tasks.filter(task => !task.is_completed)
        break
      default:
        filteredTasks = tasks
    }

    if (searchTerm) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filteredTasks
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredTasks = getFilteredTasks()

  if (loading) {
    return (
      <div className="widget-card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="widget-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tasks
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tasks.filter(t => !t.is_completed).length} pending, {overdueTasks.length} overdue
          </p>
        </div>
        
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {todayTasks.length}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Today</div>
        </div>
        
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {overdueTasks.length}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">Overdue</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {tasks.filter(t => t.is_completed).length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Done</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Tasks</option>
          <option value="today">Due Today</option>
          <option value="overdue">Overdue</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <form onSubmit={handleCreateTask}>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="input-field"
                autoFocus
              />
              
              <textarea
                placeholder="Description (optional)..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="input-field"
                rows="2"
              />
              
              <div className="flex gap-4">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="input-field"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                
                <input
                  type="datetime-local"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTaskForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Clock className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filter !== 'all' ? 'No tasks match your criteria' : 'No tasks yet'}
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => setShowNewTaskForm(true)}
                className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
              >
                Create your first task
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${task.is_completed ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.is_completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                  }`}
                >
                  {task.is_completed && <Check className="h-3 w-3" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-medium ${
                        task.is_completed 
                          ? 'line-through text-gray-500 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h4>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        
                        {task.due_date && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {formatDate(task.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TasksWidget