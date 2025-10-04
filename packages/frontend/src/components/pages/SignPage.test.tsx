import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignPage } from './SignPage'
import * as WalletContext from '@context/WalletContext'
import * as SignatureHistoryHook from '@hooks/useSignatureHistory'

// Mock config
vi.mock('@config', () => ({
  config: {
    apiUrl: 'http://localhost:3001',
  },
}))

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

describe('SignPage', () => {
  const mockSignMessage = vi.fn()
  const mockAddMessage = vi.fn()
  const mockUseWallet = {
    connectionState: 'connected' as const,
    signMessage: mockSignMessage,
    address: '0x1234567890123456789012345678901234567890',
    connect: vi.fn(),
    disconnect: vi.fn(),
    error: null,
  }

  const mockUseSignatureHistory = {
    messages: [],
    isLoading: false,
    addMessage: mockAddMessage,
    clearHistory: vi.fn(),
    removeMessage: vi.fn(),
    getMessageById: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(WalletContext, 'useWallet').mockReturnValue(mockUseWallet)
    vi.spyOn(SignatureHistoryHook, 'useSignatureHistory').mockReturnValue(mockUseSignatureHistory)
    global.fetch = vi.fn()
  })

  describe('Initial Render', () => {
    it('should render the sign message form', () => {
      render(<SignPage />)

      expect(screen.getByText('Sign Message')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Sign Message/i })).toBeInTheDocument()
    })

    it('should show warning when wallet is not connected', () => {
      vi.spyOn(WalletContext, 'useWallet').mockReturnValue({
        ...mockUseWallet,
        connectionState: 'disconnected',
      })

      render(<SignPage />)

      expect(screen.getByText(/Please connect your wallet to sign messages/i)).toBeInTheDocument()
    })

    it('should disable textarea when wallet is not connected', () => {
      vi.spyOn(WalletContext, 'useWallet').mockReturnValue({
        ...mockUseWallet,
        connectionState: 'disconnected',
      })

      render(<SignPage />)

      const textarea = screen.getByPlaceholderText('Type your message here...')
      expect(textarea).toBeDisabled()
    })

    it('should show character count', () => {
      render(<SignPage />)

      expect(screen.getByText('0 characters')).toBeInTheDocument()
    })
  })

  describe('Message Input', () => {
    it('should update message input and character count', async () => {
      const user = userEvent.setup()
      render(<SignPage />)

      const textarea = screen.getByPlaceholderText('Type your message here...')
      await user.type(textarea, 'Hello Web3')

      expect(textarea).toHaveValue('Hello Web3')
      expect(screen.getByText('10 characters')).toBeInTheDocument()
    })

    it('should handle empty message input', async () => {
      const user = userEvent.setup()
      render(<SignPage />)

      const textarea = screen.getByPlaceholderText('Type your message here...')
      await user.type(textarea, 'Test')
      await user.clear(textarea)

      expect(textarea).toHaveValue('')
      expect(screen.getByText('0 characters')).toBeInTheDocument()
    })
  })

  describe('Sign Message', () => {
    it('should sign message successfully', async () => {
      const user = userEvent.setup()
      const testSignature = '0xabc123def456'
      mockSignMessage.mockResolvedValue(testSignature)

      render(<SignPage />)

      const textarea = screen.getByPlaceholderText('Type your message here...')
      await user.type(textarea, 'Test message')

      const signButton = screen.getByRole('button', { name: /Sign Message/i })
      await user.click(signButton)

      await waitFor(() => {
        expect(mockSignMessage).toHaveBeenCalledWith('Test message')
        expect(screen.getByText(/Signature/i)).toBeInTheDocument()
        expect(screen.getByText(testSignature)).toBeInTheDocument()
      })
    })

    it('should show error if message is empty', async () => {
      const user = userEvent.setup()
      render(<SignPage />)

      const signButton = screen.getByRole('button', { name: /Sign Message/i })
      await user.click(signButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a message to sign')).toBeInTheDocument()
      })
    })

    it('should show error if wallet is not connected', async () => {
      const user = userEvent.setup()
      vi.spyOn(WalletContext, 'useWallet').mockReturnValue({
        ...mockUseWallet,
        connectionState: 'disconnected',
      })

      render(<SignPage />)

      const textarea = screen.getByPlaceholderText('Type your message here...')
      await user.type(textarea, 'Test message')

      const signButton = screen.getByRole('button', { name: /Sign Message/i })
      await user.click(signButton)

      await waitFor(() => {
        expect(screen.getByText('Please connect your wallet first')).toBeInTheDocument()
      })
    })

    it('should handle signing errors', async () => {
      const user = userEvent.setup()
      mockSignMessage.mockRejectedValue(new Error('User rejected signature'))

      render(<SignPage />)

      const textarea = screen.getByPlaceholderText('Type your message here...')
      await user.type(textarea, 'Test message')

      const signButton = screen.getByRole('button', { name: /Sign Message/i })
      await user.click(signButton)

      await waitFor(() => {
        expect(screen.getByText('User rejected signature')).toBeInTheDocument()
      })
    })

    it('should trim whitespace from message', async () => {
      const user = userEvent.setup()
      mockSignMessage.mockResolvedValue('0xsignature')

      render(<SignPage />)

      const textarea = screen.getByPlaceholderText('Type your message here...')
      await user.type(textarea, '  Test message  ')

      const signButton = screen.getByRole('button', { name: /Sign Message/i })
      await user.click(signButton)

      await waitFor(() => {
        expect(mockSignMessage).toHaveBeenCalledWith('Test message')
      })
    })
  })

  describe('Verify Signature', () => {
    it('should verify signature successfully', async () => {
      const user = userEvent.setup()
      const testSignature = '0xabc123def456'
      mockSignMessage.mockResolvedValue(testSignature)

      const mockVerificationResponse = {
        isValid: true,
        signer: mockUseWallet.address,
        originalMessage: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockVerificationResponse,
      } as Response)

      render(<SignPage />)

      // Sign the message first
      const textarea = screen.getByPlaceholderText('Type your message here...')
      await user.type(textarea, 'Test message')

      const signButton = screen.getByRole('button', { name: /Sign Message/i })
      await user.click(signButton)

      await waitFor(() => {
        expect(screen.getByText(testSignature)).toBeInTheDocument()
      })

      // Verify the signature
      const verifyButton = screen.getByRole('button', { name: /Verify Signature/i })
      await user.click(verifyButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/verify-signature',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'Test message',
              signature: testSignature,
            }),
          })
        )

        expect(screen.getByText(/Valid Signature/i)).toBeInTheDocument()
        expect(mockAddMessage).toHaveBeenCalledWith(
          'Test message',
          testSignature,
          mockUseWallet.address,
          true
        )
      })
    })

    it('should handle invalid signature verification', async () => {
      const user = userEvent.setup()
      const testSignature = '0xabc123def456'
      mockSignMessage.mockResolvedValue(testSignature)

      const mockVerificationResponse = {
        isValid: false,
        signer: '',
        originalMessage: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockVerificationResponse,
      } as Response)

      render(<SignPage />)

      // Sign the message first
      const textarea = screen.getByPlaceholderText('Type your message here...')
      await user.type(textarea, 'Test message')

      const signButton = screen.getByRole('button', { name: /Sign Message/i })
      await user.click(signButton)

      await waitFor(() => {
        expect(screen.getByText(testSignature)).toBeInTheDocument()
      })

      // Verify the signature
      const verifyButton = screen.getByRole('button', { name: /Verify Signature/i })
      await user.click(verifyButton)

      await waitFor(() => {
        expect(screen.getByText(/Invalid Signature/i)).toBeInTheDocument()
      })
    })

    it('should handle verification API errors', async () => {
      const user = userEvent.setup()
      mockSignMessage.mockResolvedValue('0xsignature')

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      } as Response)

      render(<SignPage />)

      // Sign the message
      const textarea = screen.getByPlaceholderText('Type your message here...')
      await user.type(textarea, 'Test message')
      await user.click(screen.getByRole('button', { name: /Sign Message/i }))

      await waitFor(() => {
        expect(screen.getByText('0xsignature')).toBeInTheDocument()
      })

      // Try to verify
      const verifyButton = screen.getByRole('button', { name: /Verify Signature/i })
      await user.click(verifyButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to verify signature')).toBeInTheDocument()
      })
    })
  })

  describe('Copy Signature', () => {
    it('should copy signature to clipboard', async () => {
      const user = userEvent.setup()
      const testSignature = '0xabc123def456'
      mockSignMessage.mockResolvedValue(testSignature)
      const mockWriteText = vi.fn()
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      })

      render(<SignPage />)

      // Sign a message first
      const textarea = screen.getByPlaceholderText('Type your message here...')
      await user.type(textarea, 'Test message')
      await user.click(screen.getByRole('button', { name: /Sign Message/i }))

      await waitFor(() => {
        expect(screen.getByText(testSignature)).toBeInTheDocument()
      })

      // Find and click copy button
      const copyButton = screen.getByTitle('Copy signature')
      await user.click(copyButton)

      expect(mockWriteText).toHaveBeenCalledWith(testSignature)
    })
  })

  describe('Reset Functionality', () => {
    it('should reset form state', async () => {
      const user = userEvent.setup()
      mockSignMessage.mockResolvedValue('0xsignature')

      render(<SignPage />)

      // Sign a message
      const textarea = screen.getByPlaceholderText('Type your message here...')
      await user.type(textarea, 'Test message')
      await user.click(screen.getByRole('button', { name: /Sign Message/i }))

      await waitFor(() => {
        expect(screen.getByText('0xsignature')).toBeInTheDocument()
      })

      // Reset
      const resetButton = screen.getByRole('button', { name: /Reset/i })
      await user.click(resetButton)

      await waitFor(() => {
        expect(textarea).toHaveValue('')
        expect(screen.queryByText('0xsignature')).not.toBeInTheDocument()
      })
    })
  })
})

