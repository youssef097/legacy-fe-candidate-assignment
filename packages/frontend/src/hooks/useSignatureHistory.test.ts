import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSignatureHistory } from './useSignatureHistory'

describe('useSignatureHistory', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should start with empty messages array', () => {
      const { result } = renderHook(() => useSignatureHistory())

      expect(result.current.messages).toEqual([])
      expect(result.current.isLoading).toBe(false)
    })

    it('should load messages from localStorage on mount', () => {
      const storedMessages = [
        {
          id: '1',
          message: 'Test message',
          signature: '0x123abc',
          signer: '0xabc123',
          timestamp: Date.now(),
          verified: true,
        },
      ]

      localStorage.setItem('signedMessages', JSON.stringify(storedMessages))

      const { result } = renderHook(() => useSignatureHistory())

      expect(result.current.messages).toEqual(storedMessages)
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('signedMessages', 'invalid json')

      const { result } = renderHook(() => useSignatureHistory())

      expect(result.current.messages).toEqual([])
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('addMessage', () => {
    it('should add a new message', () => {
      const { result } = renderHook(() => useSignatureHistory())

      act(() => {
        result.current.addMessage(
          'Test message',
          '0x123abc',
          '0xsigner123',
          true
        )
      })

      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0]).toMatchObject({
        message: 'Test message',
        signature: '0x123abc',
        signer: '0xsigner123',
        verified: true,
      })
      expect(result.current.messages[0].id).toBeDefined()
      expect(result.current.messages[0].timestamp).toBeTypeOf('number')
    })

    it('should add messages in reverse chronological order (newest first)', () => {
      const { result } = renderHook(() => useSignatureHistory())

      act(() => {
        result.current.addMessage('First', '0x1', '0xA', true)
      })

      act(() => {
        result.current.addMessage('Second', '0x2', '0xB', true)
      })

      expect(result.current.messages).toHaveLength(2)
      expect(result.current.messages[0].message).toBe('Second')
      expect(result.current.messages[1].message).toBe('First')
    })

    it('should persist messages to localStorage', () => {
      const { result } = renderHook(() => useSignatureHistory())

      act(() => {
        result.current.addMessage('Test', '0x123', '0xabc', true)
      })

      const stored = localStorage.getItem('signedMessages')
      expect(stored).toBeDefined()

      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].message).toBe('Test')
    })

    it('should generate unique IDs for each message', () => {
      const { result } = renderHook(() => useSignatureHistory())

      act(() => {
        result.current.addMessage('Message 1', '0x1', '0xA', true)
        result.current.addMessage('Message 2', '0x2', '0xB', true)
        result.current.addMessage('Message 3', '0x3', '0xC', true)
      })

      const ids = result.current.messages.map((m) => m.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(3)
    })
  })

  describe('removeMessage', () => {
    it('should remove a message by ID', () => {
      const { result } = renderHook(() => useSignatureHistory())

      let messageId: string

      act(() => {
        result.current.addMessage('Message 1', '0x1', '0xA', true)
        result.current.addMessage('Message 2', '0x2', '0xB', true)
        messageId = result.current.messages[0].id
      })

      expect(result.current.messages).toHaveLength(2)

      act(() => {
        result.current.removeMessage(messageId)
      })

      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0].message).toBe('Message 1')
    })

    it('should persist removal to localStorage', () => {
      const { result } = renderHook(() => useSignatureHistory())

      let messageId: string

      act(() => {
        result.current.addMessage('Message 1', '0x1', '0xA', true)
        messageId = result.current.messages[0].id
      })

      act(() => {
        result.current.removeMessage(messageId)
      })

      const stored = localStorage.getItem('signedMessages')
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(0)
    })

    it('should do nothing if ID does not exist', () => {
      const { result } = renderHook(() => useSignatureHistory())

      act(() => {
        result.current.addMessage('Message', '0x1', '0xA', true)
      })

      const originalLength = result.current.messages.length

      act(() => {
        result.current.removeMessage('non-existent-id')
      })

      expect(result.current.messages).toHaveLength(originalLength)
    })
  })

  describe('clearHistory', () => {
    it('should clear all messages', () => {
      const { result } = renderHook(() => useSignatureHistory())

      act(() => {
        result.current.addMessage('Message 1', '0x1', '0xA', true)
        result.current.addMessage('Message 2', '0x2', '0xB', true)
        result.current.addMessage('Message 3', '0x3', '0xC', true)
      })

      expect(result.current.messages).toHaveLength(3)

      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.messages).toEqual([])
    })

    it('should persist clearing to localStorage', () => {
      const { result } = renderHook(() => useSignatureHistory())

      act(() => {
        result.current.addMessage('Message', '0x1', '0xA', true)
      })

      act(() => {
        result.current.clearHistory()
      })

      const stored = localStorage.getItem('signedMessages')
      const parsed = JSON.parse(stored!)
      expect(parsed).toEqual([])
    })
  })

  describe('getMessageById', () => {
    it('should retrieve a message by ID', () => {
      const { result } = renderHook(() => useSignatureHistory())

      let targetId!: string

      act(() => {
        result.current.addMessage('Message 1', '0x1', '0xA', true)
        result.current.addMessage('Message 2', '0x2', '0xB', true)
        targetId = result.current.messages[1].id
      })

      const message = result.current.getMessageById(targetId)

      expect(message).toBeDefined()
      expect(message?.message).toBe('Message 1')
    })

    it('should return undefined if ID does not exist', () => {
      const { result } = renderHook(() => useSignatureHistory())

      act(() => {
        result.current.addMessage('Message', '0x1', '0xA', true)
      })

      const message = result.current.getMessageById('non-existent-id')
      expect(message).toBeUndefined()
    })
  })

  describe('Persistence', () => {
    it('should persist changes across hook instances', () => {
      const { result: result1 } = renderHook(() => useSignatureHistory())

      act(() => {
        result1.current.addMessage('Persistent message', '0x123', '0xabc', true)
      })

      // Unmount and create new instance
      const { result: result2 } = renderHook(() => useSignatureHistory())

      expect(result2.current.messages).toHaveLength(1)
      expect(result2.current.messages[0].message).toBe('Persistent message')
    })

    it('should handle multiple messages with complex data', () => {
      const { result } = renderHook(() => useSignatureHistory())

      act(() => {
        result.current.addMessage(
          '🚀 Special chars: @#$%',
          '0x' + 'a'.repeat(130),
          '0xAbCdEf1234567890',
          true
        )
        result.current.addMessage(
          'Very long message: ' + 'A'.repeat(1000),
          '0x' + 'b'.repeat(130),
          '0x1234567890AbCdEf',
          false
        )
      })

      const stored = localStorage.getItem('signedMessages')
      const parsed = JSON.parse(stored!)

      expect(parsed).toHaveLength(2)
      expect(parsed[0].message).toContain('Very long message')
      expect(parsed[1].message).toContain('🚀')
    })
  })
})

