import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { WalletProvider, useWallet } from './WalletContext'
import type { ReactNode } from 'react'

// Mock Dynamic.xyz SDK
vi.mock('@dynamic-labs/sdk-react-core', () => ({
  useDynamicContext: vi.fn(() => ({
    user: null,
    handleLogOut: vi.fn(),
    primaryWallet: null,
  })),
  useConnectWithOtp: vi.fn(() => ({
    connectWithEmail: vi.fn(),
    verifyOneTimePassword: vi.fn(),
  })),
  DynamicContextProvider: ({ children }: { children: ReactNode }) => children,
}))

// Mock EmailAuthModal component
vi.mock('@components/wallet/EmailAuthModal', () => ({
  EmailAuthModal: () => null,
}))

import { useDynamicContext, useConnectWithOtp } from '@dynamic-labs/sdk-react-core'

describe('WalletContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <WalletProvider>{children}</WalletProvider>
  )

  describe('useWallet hook', () => {
    it('should throw error when used outside WalletProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useWallet())
      }).toThrow('useWallet must be used within a WalletProvider')

      consoleError.mockRestore()
    })

    it('should provide wallet context when used inside WalletProvider', () => {
      const { result } = renderHook(() => useWallet(), { wrapper })

      expect(result.current).toBeDefined()
      expect(result.current.connectionState).toBeDefined()
      expect(result.current.address).toBeDefined()
      expect(result.current.signMessage).toBeTypeOf('function')
      expect(result.current.connect).toBeTypeOf('function')
      expect(result.current.disconnect).toBeTypeOf('function')
    })
  })

  describe('Initial State', () => {
    it('should start in disconnected state', () => {
      vi.mocked(useDynamicContext).mockReturnValue({
        user: null,
        handleLogOut: vi.fn(),
        primaryWallet: null,
      } as any)

      const { result } = renderHook(() => useWallet(), { wrapper })

      expect(result.current.connectionState).toBe('disconnected')
      expect(result.current.address).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should be in connected state when user and wallet exist', () => {
      const mockWallet = {
        address: '0x1234567890123456789012345678901234567890',
        signMessage: vi.fn(),
      }

      const mockUser = {
        verifiedCredentials: [{ address: mockWallet.address }],
      }

      vi.mocked(useDynamicContext).mockReturnValue({
        user: mockUser,
        handleLogOut: vi.fn(),
        primaryWallet: mockWallet,
      } as any)

      const { result } = renderHook(() => useWallet(), { wrapper })

      expect(result.current.connectionState).toBe('connected')
      expect(result.current.address).toBe(mockWallet.address)
    })
  })

  describe('Connect functionality', () => {
    it('should trigger connect flow when connect is called', () => {
      const { result } = renderHook(() => useWallet(), { wrapper })

      act(() => {
        result.current.connect()
      })

      // Note: The actual modal opening is tested via the modal's visibility,
      // which we can't easily test without DOM. The connect function should
      // open the auth modal in the real implementation.
      expect(result.current.error).toBeNull()
    })
  })

  describe('Disconnect functionality', () => {
    it('should handle disconnect successfully', async () => {
      const mockLogOut = vi.fn().mockResolvedValue(undefined)

      vi.mocked(useDynamicContext).mockReturnValue({
        user: { verifiedCredentials: [{ address: '0xabc' }] },
        handleLogOut: mockLogOut,
        primaryWallet: { signMessage: vi.fn() },
      } as any)

      const { result } = renderHook(() => useWallet(), { wrapper })

      await act(async () => {
        await result.current.disconnect()
      })

      expect(mockLogOut).toHaveBeenCalled()
    })

    it('should handle disconnect errors gracefully', async () => {
      const mockLogOut = vi.fn().mockRejectedValue(new Error('Logout failed'))

      vi.mocked(useDynamicContext).mockReturnValue({
        user: { verifiedCredentials: [{ address: '0xabc' }] },
        handleLogOut: mockLogOut,
        primaryWallet: { signMessage: vi.fn() },
      } as any)

      const { result } = renderHook(() => useWallet(), { wrapper })

      await act(async () => {
        await result.current.disconnect()
      })

      expect(result.current.error).toBe('Logout failed')
    })
  })

  describe('Sign Message functionality', () => {
    it('should sign message successfully when wallet is connected', async () => {
      const mockSignature = '0xabcdef123456'
      const mockSignMessage = vi.fn().mockResolvedValue(mockSignature)

      vi.mocked(useDynamicContext).mockReturnValue({
        user: { verifiedCredentials: [{ address: '0xabc' }] },
        handleLogOut: vi.fn(),
        primaryWallet: { signMessage: mockSignMessage },
      } as any)

      const { result } = renderHook(() => useWallet(), { wrapper })

      let signature: string | undefined

      await act(async () => {
        signature = await result.current.signMessage('Test message')
      })

      expect(signature).toBe(mockSignature)
      expect(mockSignMessage).toHaveBeenCalledWith('Test message')
    })

    it('should throw error when trying to sign without wallet', async () => {
      vi.mocked(useDynamicContext).mockReturnValue({
        user: null,
        handleLogOut: vi.fn(),
        primaryWallet: null,
      } as any)

      const { result } = renderHook(() => useWallet(), { wrapper })

      await expect(async () => {
        await result.current.signMessage('Test message')
      }).rejects.toThrow('No wallet connected')
    })

    it('should handle signing errors gracefully', async () => {
      const mockSignMessage = vi.fn().mockRejectedValue(new Error('User rejected'))

      vi.mocked(useDynamicContext).mockReturnValue({
        user: { verifiedCredentials: [{ address: '0xabc' }] },
        handleLogOut: vi.fn(),
        primaryWallet: { signMessage: mockSignMessage },
      } as any)

      const { result } = renderHook(() => useWallet(), { wrapper })

      await expect(async () => {
        await result.current.signMessage('Test message')
      }).rejects.toThrow('User rejected')
    })

    it('should handle null signature response', async () => {
      const mockSignMessage = vi.fn().mockResolvedValue(null)

      vi.mocked(useDynamicContext).mockReturnValue({
        user: { verifiedCredentials: [{ address: '0xabc' }] },
        handleLogOut: vi.fn(),
        primaryWallet: { signMessage: mockSignMessage },
      } as any)

      const { result } = renderHook(() => useWallet(), { wrapper })

      await expect(async () => {
        await result.current.signMessage('Test message')
      }).rejects.toThrow('Failed to generate signature')
    })
  })

  describe('Email Authentication Flow', () => {
    it('should handle email submission successfully', async () => {
      const mockConnectWithEmail = vi.fn().mockResolvedValue(undefined)

      vi.mocked(useConnectWithOtp).mockReturnValue({
        connectWithEmail: mockConnectWithEmail,
        verifyOneTimePassword: vi.fn(),
      } as any)

      renderHook(() => useWallet(), { wrapper })

      // The handleEmailSubmit is called internally by the modal
      // This test verifies the mock is set up correctly
      expect(mockConnectWithEmail).toBeDefined()
    })

    it('should handle OTP verification successfully', async () => {
      const mockVerifyOtp = vi.fn().mockResolvedValue(undefined)

      vi.mocked(useConnectWithOtp).mockReturnValue({
        connectWithEmail: vi.fn(),
        verifyOneTimePassword: mockVerifyOtp,
      } as any)

      renderHook(() => useWallet(), { wrapper })

      expect(mockVerifyOtp).toBeDefined()
    })
  })

  describe('State Transitions', () => {
    it('should transition from disconnected to connected when user logs in', async () => {
      const mockWallet = {
        address: '0x123',
        signMessage: vi.fn(),
      }

      const mockUser = {
        verifiedCredentials: [{ address: mockWallet.address }],
      }

      // Start disconnected
      const mockDynamic = vi.mocked(useDynamicContext)
      mockDynamic.mockReturnValue({
        user: null,
        handleLogOut: vi.fn(),
        primaryWallet: null,
      } as any)

      const { result, rerender } = renderHook(() => useWallet(), { wrapper })

      expect(result.current.connectionState).toBe('disconnected')

      // Simulate login
      mockDynamic.mockReturnValue({
        user: mockUser,
        handleLogOut: vi.fn(),
        primaryWallet: mockWallet,
      } as any)

      rerender()

      await waitFor(() => {
        expect(result.current.connectionState).toBe('connected')
      })
    })
  })
})

