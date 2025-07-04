// frontend/src/hooks/useWebSocket.js
import { useEffect, useRef } from 'react'
import { wsService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export const useWebSocket = () => {
  const { user } = useAuth()
  const isConnected = useRef(false)

  useEffect(() => {
    if (user?.id && !isConnected.current) {
      wsService.connect(user.id)
      isConnected.current = true
    }

    return () => {
      if (isConnected.current) {
        wsService.disconnect()
        isConnected.current = false
      }
    }
  }, [user?.id])

  const subscribe = (eventType, callback) => {
    wsService.subscribe(eventType, callback)
  }

  const unsubscribe = (eventType, callback) => {
    wsService.unsubscribe(eventType, callback)
  }

  const send = (data) => {
    wsService.send(data)
  }

  return {
    subscribe,
    unsubscribe,
    send,
    isConnected: isConnected.current
  }
}