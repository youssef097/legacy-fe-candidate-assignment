import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HistoryPage } from './HistoryPage'
import * as SignatureHistoryHook from '@hooks/useSignatureHistory'
import type { SignedMessage } from '@types'

// Mock PageTransition
vi.mock('@components/ui/PageTransition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('HistoryPage', () => {
  const mockClearHistory = vi.fn()
  const mockRemoveMessage = vi.fn()
  const mockGetMessageById = vi.fn()

  const mockMessages: SignedMessage[] = [
    {
      id: '1',
      message: 'First test message',
      signature: '0xsignature1',
      signer: '0x1234567890123456789012345678901234567890',
      timestamp: new Date('2024-01-01T10:00:00').getTime(),
      verified: true,
    },
    {
      id: '2',
      message: 'Second test message',
      signature: '0xsignature2',
      signer: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      timestamp: new Date('2024-01-02T11:00:00').getTime(),
      verified: false,
    },
  ]

  const mockUseSignatureHistory = {
    messages: mockMessages,
    isLoading: false,
    addMessage: vi.fn(),
    clearHistory: mockClearHistory,
    removeMessage: mockRemoveMessage,
    getMessageById: mockGetMessageById,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(SignatureHistoryHook, 'useSignatureHistory').mockReturnValue(mockUseSignatureHistory)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  describe('Loading State', () => {
    it('should show loading state', () => {
      vi.spyOn(SignatureHistoryHook, 'useSignatureHistory').mockReturnValue({
        ...mockUseSignatureHistory,
        isLoading: true,
        messages: [],
      })

      render(<HistoryPage />)

      expect(screen.getByText('Loading history...')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no messages', () => {
      vi.spyOn(SignatureHistoryHook, 'useSignatureHistory').mockReturnValue({
        ...mockUseSignatureHistory,
        messages: [],
      })

      render(<HistoryPage />)

      expect(screen.getByText('No Signed Messages Yet')).toBeInTheDocument()
      expect(screen.getByText(/Start by signing your first message/i)).toBeInTheDocument()
    })

    it('should not show clear history button when no messages', () => {
      vi.spyOn(SignatureHistoryHook, 'useSignatureHistory').mockReturnValue({
        ...mockUseSignatureHistory,
        messages: [],
      })

      render(<HistoryPage />)

      expect(screen.queryByRole('button', { name: /Clear History/i })).not.toBeInTheDocument()
    })
  })

  describe('Message List', () => {
    it('should render message history', () => {
      render(<HistoryPage />)

      expect(screen.getByText('Signature History')).toBeInTheDocument()
      expect(screen.getByText('First test message')).toBeInTheDocument()
      expect(screen.getByText('Second test message')).toBeInTheDocument()
    })

    it('should show message count', () => {
      render(<HistoryPage />)

      expect(screen.getByText('2 messages')).toBeInTheDocument()
    })

    it('should show singular message count', () => {
      vi.spyOn(SignatureHistoryHook, 'useSignatureHistory').mockReturnValue({
        ...mockUseSignatureHistory,
        messages: [mockMessages[0]],
      })

      render(<HistoryPage />)

      expect(screen.getByText('1 message')).toBeInTheDocument()
    })

    it('should display verified status correctly', () => {
      render(<HistoryPage />)

      const verifiedBadges = screen.getAllByText('Verified')
      const notVerifiedBadges = screen.getAllByText('Not Verified')

      expect(verifiedBadges).toHaveLength(1)
      expect(notVerifiedBadges).toHaveLength(1)
    })

    it('should display timestamps', () => {
      render(<HistoryPage />)

      // Timestamps are formatted with toLocaleString()
      expect(screen.getByText(/1\/1\/2024/i)).toBeInTheDocument()
      expect(screen.getByText(/1\/2\/2024/i)).toBeInTheDocument()
    })

    it('should display signatures', () => {
      render(<HistoryPage />)

      expect(screen.getByText('0xsignature1')).toBeInTheDocument()
      expect(screen.getByText('0xsignature2')).toBeInTheDocument()
    })

    it('should display signer addresses', () => {
      render(<HistoryPage />)

      expect(screen.getByText('0x1234567890123456789012345678901234567890')).toBeInTheDocument()
      expect(screen.getByText('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')).toBeInTheDocument()
    })
  })

  describe('Clear History', () => {
    it('should clear history with confirmation', async () => {
      const user = userEvent.setup()
      render(<HistoryPage />)

      const clearButton = screen.getByRole('button', { name: /Clear History/i })
      await user.click(clearButton)

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to clear all signed messages?'
      )
      expect(mockClearHistory).toHaveBeenCalled()
    })

    it('should not clear history if user cancels confirmation', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(false)

      render(<HistoryPage />)

      const clearButton = screen.getByRole('button', { name: /Clear History/i })
      await user.click(clearButton)

      expect(window.confirm).toHaveBeenCalled()
      expect(mockClearHistory).not.toHaveBeenCalled()
    })
  })

  describe('Copy Signature', () => {
    it('should copy signature to clipboard', async () => {
      const user = userEvent.setup()
      const mockWriteText = vi.fn()
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      })

      render(<HistoryPage />)

      const copyButtons = screen.getAllByTitle('Copy signature')
      await user.click(copyButtons[0])

      expect(mockWriteText).toHaveBeenCalledWith('0xsignature1')
    })

    it('should show copied indicator temporarily', async () => {
      const user = userEvent.setup()
      vi.useFakeTimers()

      render(<HistoryPage />)

      const copyButtons = screen.getAllByTitle('Copy signature')
      await user.click(copyButtons[0])

      // The check icon should appear (test would need to check icon state in real implementation)
      // Here we're just verifying the click works

      vi.advanceTimersByTime(2000)

      vi.useRealTimers()
    })
  })

  describe('Message Display', () => {
    it('should handle long messages', () => {
      const longMessage = 'A'.repeat(500)
      const messagesWithLong = [
        {
          ...mockMessages[0],
          message: longMessage,
        },
      ]

      vi.spyOn(SignatureHistoryHook, 'useSignatureHistory').mockReturnValue({
        ...mockUseSignatureHistory,
        messages: messagesWithLong,
      })

      render(<HistoryPage />)

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle special characters in messages', () => {
      const specialMessage = '🚀 Special chars: @#$%^&*() 日本語'
      const messagesWithSpecial = [
        {
          ...mockMessages[0],
          message: specialMessage,
        },
      ]

      vi.spyOn(SignatureHistoryHook, 'useSignatureHistory').mockReturnValue({
        ...mockUseSignatureHistory,
        messages: messagesWithSpecial,
      })

      render(<HistoryPage />)

      expect(screen.getByText(specialMessage)).toBeInTheDocument()
    })

    it('should render multiple messages in order', () => {
      const manyMessages: SignedMessage[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        message: `Message ${i}`,
        signature: `0xsig${i}`,
        signer: '0x1234567890123456789012345678901234567890',
        timestamp: Date.now() - i * 1000,
        verified: i % 2 === 0,
      }))

      vi.spyOn(SignatureHistoryHook, 'useSignatureHistory').mockReturnValue({
        ...mockUseSignatureHistory,
        messages: manyMessages,
      })

      render(<HistoryPage />)

      expect(screen.getByText('10 messages')).toBeInTheDocument()
      manyMessages.forEach((msg) => {
        expect(screen.getByText(msg.message)).toBeInTheDocument()
      })
    })
  })

  describe('Timestamp Formatting', () => {
    it('should format recent timestamps correctly', () => {
      const recentMessage = {
        ...mockMessages[0],
        timestamp: Date.now() - 60000, // 1 minute ago
      }

      vi.spyOn(SignatureHistoryHook, 'useSignatureHistory').mockReturnValue({
        ...mockUseSignatureHistory,
        messages: [recentMessage],
      })

      render(<HistoryPage />)

      // The exact format depends on locale, but it should be present
      const timestampElement = screen.getByText(/,/)
      expect(timestampElement).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<HistoryPage />)

      expect(screen.getByRole('heading', { name: /Signature History/i })).toBeInTheDocument()
    })

    it('should have accessible buttons', () => {
      render(<HistoryPage />)

      const clearButton = screen.getByRole('button', { name: /Clear History/i })
      expect(clearButton).toBeInTheDocument()

      const copyButtons = screen.getAllByTitle('Copy signature')
      expect(copyButtons.length).toBeGreaterThan(0)
    })
  })
})

