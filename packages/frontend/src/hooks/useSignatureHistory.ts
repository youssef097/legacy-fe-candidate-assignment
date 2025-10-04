import { useState, useEffect, useCallback } from 'react'
import type { SignedMessage } from '@web3-signer/shared'

const STORAGE_KEY = 'signedMessages'

export const useSignatureHistory = () => {
  const [messages, setMessages] = useState<SignedMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedMessages = JSON.parse(stored) as SignedMessage[]
        setMessages(parsedMessages)
      }
    } catch (error) {
      console.error('Failed to load signed messages from localStorage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } catch (error) {
        console.error('Failed to save signed messages to localStorage:', error)
      }
    }
  }, [messages, isLoading])

  const addMessage = useCallback((
    message: string,
    signature: string,
    signer: string,
    verified: boolean
  ) => {
    const newMessage: SignedMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      message,
      signature,
      signer,
      timestamp: Date.now(),
      verified
    }

    setMessages((prev) => [newMessage, ...prev])
  }, [])

  const clearHistory = useCallback(() => {
    setMessages([])
  }, [])

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
  }, [])

  const getMessageById = useCallback((id: string): SignedMessage | undefined => {
    return messages.find((msg) => msg.id === id)
  }, [messages])

  return {
    messages,
    isLoading,
    addMessage,
    clearHistory,
    removeMessage,
    getMessageById
  }
}

