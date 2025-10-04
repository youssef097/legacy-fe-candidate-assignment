import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useDynamicContext, useConnectWithOtp } from '@dynamic-labs/sdk-react-core'
import type { WalletConnectionState } from '@types'
import { EmailAuthModal } from '@components/wallet/EmailAuthModal'

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export interface WalletContextType {
  connectionState: WalletConnectionState
  address: string | null
  signMessage: (message: string) => Promise<string>
  connect: () => void
  disconnect: () => Promise<void>
  error: string | null
}

interface WalletProviderProps {
  children: ReactNode
}

type AuthStep = 'email' | 'verification' | 'creating'

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { 
    user, 
    handleLogOut,
    primaryWallet
  } = useDynamicContext()

  const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp()

  const [connectionState, setConnectionState] = useState<WalletConnectionState>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authStep, setAuthStep] = useState<AuthStep>('email')

  useEffect(() => {
    console.log('Auth state changed:', { hasUser: !!user, hasPrimaryWallet: !!primaryWallet })
    
    if (user && primaryWallet) {
      console.log('User authenticated successfully!')
      setConnectionState('connected')
      setError(null)
      setIsAuthModalOpen(false)
      setAuthStep('email')
    } else if (!user) {
      setConnectionState('disconnected')
    }
  }, [user, primaryWallet])

  const connect = () => {
    setError(null)
    setAuthStep('email')
    setIsAuthModalOpen(true)
  }

  const handleEmailSubmit = async (email: string) => {
    try {
      setError(null)
      console.log('Sending OTP to:', email)
      await connectWithEmail(email)
      console.log('OTP sent successfully')
      setAuthStep('verification')
    } catch (err) {
      console.error('Failed to send OTP:', err)
      setError(err instanceof Error ? err.message : 'Failed to send verification code')
      setAuthStep('email')
    }
  }

  const handleVerificationSubmit = async (code: string) => {
    try {
      setError(null)
      setAuthStep('creating')
      
      console.log('Verifying OTP code...')
      await verifyOneTimePassword(code)
      console.log('OTP verified successfully')
    } catch (err) {
      console.error('OTP verification failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Invalid verification code'
      setError(errorMessage)
      setAuthStep('verification')
      throw new Error(errorMessage)
    }
  }

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false)
    setAuthStep('email')
    setError(null)
  }

  const disconnect = async () => {
    try {
      await handleLogOut()
      setConnectionState('disconnected')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet')
    }
  }

  const signMessage = async (message: string): Promise<string> => {
    if (!primaryWallet) {
      throw new Error('No wallet connected')
    }

    try {
      const signature = await primaryWallet.signMessage(message)
      if (!signature) {
        throw new Error('Failed to generate signature')
      }
      return signature
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to sign message')
    }
  }

  const contextValue: WalletContextType = {
    connectionState,
    address: (user?.verifiedCredentials?.[0]?.address as string) || null,
    signMessage,
    connect,
    disconnect,
    error
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
      <EmailAuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        onEmailSubmit={handleEmailSubmit}
        onVerificationSubmit={handleVerificationSubmit}
        authStep={authStep}
        error={error}
      />
    </WalletContext.Provider>
  )
}

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
