// frontend/src/components/widgets/AIChat.jsx
import React, { useState, useRef, useEffect } from 'react'
import { aiAPI } from '../../services/api'
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  TrendingUp,
  Zap,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm your AI productivity assistant. I can help you manage tasks, analyze your productivity patterns, or just chat about your goals. What would you like to work on today?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const quickActions = [
    {
      icon: Lightbulb,
      label: "Get task suggestions",
      action: () => handleQuickAction("Give me some task suggestions based on my recent activity")
    },
    {
      icon: TrendingUp,
      label: "Analyze productivity",
      action: () => handleQuickAction("Analyze my productivity patterns and give me insights")
    },
    {
      icon: Zap,
      label: "Quick fact",
      action: () => handleQuickAction("Tell me an interesting fact about productivity or AI")
    }
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const response = await aiAPI.chat(messageText)
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (actionMessage) => {
    handleSendMessage(actionMessage)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: "Chat cleared! How can I help you today?",
        timestamp: new Date()
      }
    ])
    setShowSuggestions(true)
  }

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="widget-card h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-3">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Assistant
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Always ready to help
            </p>
          </div>
        </div>
        
        <button
          onClick={clearChat}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title="Clear chat"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.type === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'assistant' && (
                  <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-primary-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' 
                      ? 'text-primary-200' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {showSuggestions && messages.length <= 1 && (
        <div className="mb-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick actions:</p>
          <div className="grid gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center gap-2 p-2 text-left text-sm bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <action.icon className="h-4 w-4 text-primary-600" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about productivity..."
            className="input-field resize-none"
            rows="1"
            disabled={isLoading}
          />
        </div>
        
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isLoading}
          className="btn-primary flex items-center justify-center px-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default AIChat