import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Loader2, CheckCircle, Zap } from 'lucide-react'
import { AnimatedModal } from '../ui/AnimatedModal'
import { AnimatedView } from '../ui/AnimatedView'
import { OTPInput } from '../ui/OTPInput'

interface EmailAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onEmailSubmit: (email: string) => Promise<void>
  onVerificationSubmit: (code: string) => Promise<void>
  authStep: 'email' | 'verification' | 'creating'
  error: string | null
}

export const EmailAuthModal: React.FC<EmailAuthModalProps> = ({
  isOpen,
  onClose,
  onEmailSubmit,
  onVerificationSubmit,
  authStep,
  error
}) => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      setIsLoading(true)
      await onEmailSubmit(email.trim())
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (code?: string) => {
    const otpCode = code || otp.join('')
    if (otpCode.length !== otp.length) return

    try {
      setIsLoading(true)
      await onVerificationSubmit(otpCode)
    } catch (err) {
      setOtp(['', '', '', '', '', ''])
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setOtp(['', '', '', '', '', ''])
    await onEmailSubmit(email)
  }

  const handleClose = () => {
    setEmail('')
    setOtp(['', '', '', '', '', ''])
    setIsLoading(false)
    onClose()
  }

  const getTitle = () => {
    switch (authStep) {
      case 'email': return 'Connect Your Wallet'
      case 'verification': return 'Verify Your Email'
      case 'creating': return 'Creating Your Wallet'
    }
  }

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      showBackground={authStep === 'email' || authStep === 'verification'}
      isLoading={isLoading || authStep === 'creating'}
      footer={
        <p className={`text-xs text-center ${(authStep === 'email' || authStep === 'verification') ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'}`}>
          Powered by Dynamic.xyz Embedded Wallets
        </p>
      }
    >
      <AnimatePresence mode="wait">
        {/* Email Step */}
        {authStep === 'email' && (
          <AnimatedView
            key="email"
            icon={Mail}
            title="Welcome to Web3 Signer"
            description={
              <>
                Enter your email to create or access
                <br />
                your <span className="text-white font-medium">embedded wallet</span>
              </>
            }
          >
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 text-center text-white placeholder-white/50 bg-white/10 border-2 border-white/20 rounded-xl focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-400/50 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-red-200 text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full flex items-center justify-center px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl transition-colors shadow-lg border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Sending verification code...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Continue with Email
                  </>
                )}
              </button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mt-6 text-center"
            >
              <p className="text-white/50 text-xs leading-relaxed">
                By continuing, you agree to our{' '}
                <button className="text-white/70 hover:text-white underline transition-colors">
                  Terms of Service
                </button>{' '}
                &{' '}
                <button className="text-white/70 hover:text-white underline transition-colors">
                  Privacy Policy
                </button>
              </p>
            </motion.div>
          </AnimatedView>
        )}

        {/* Verification Step */}
        {authStep === 'verification' && (
          <AnimatedView
            key="verification"
            icon={Zap}
            iconClassName="fill-current"
            title="Enter verification code"
            description={
              <>
                We emailed you a verification code to
                <br />
                <span className="text-white font-medium">{email}</span>
              </>
            }
          >
            <div className="mb-6">
              <OTPInput
                value={otp}
                onChange={setOtp}
                onComplete={handleVerificationSubmit}
                disabled={isLoading}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6 p-3 bg-red-900/30 border border-red-400/50 rounded-lg backdrop-blur-sm"
                >
                  <p className="text-sm text-red-200 text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading && (
              <div className="flex items-center justify-center mb-6">
                <Loader2 className="h-5 w-5 text-white animate-spin mr-2" />
                <span className="text-sm text-white/80">Verifying...</span>
              </div>
            )}

            <div className="text-center mb-6">
              <span className="text-white/70 text-sm">Didn't get the code? </span>
              <button
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-white hover:text-white/90 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline"
              >
                Resend
              </button>
            </div>

            <AnimatePresence>
              {!isLoading && otp.every(digit => digit) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleVerificationSubmit()}
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg transition-colors shadow-lg border border-white/30"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify and Connect
                </motion.button>
              )}
            </AnimatePresence>
          </AnimatedView>
        )}

        {/* Creating Step */}
        {authStep === 'creating' && (
          <motion.div
            key="creating"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-4 py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Loader2 className="h-12 w-12 mx-auto text-primary-600 dark:text-primary-400 animate-spin" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <p className="text-gray-900 dark:text-white font-medium mb-1">Creating your wallet...</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will only take a moment
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedModal>
  )
}
