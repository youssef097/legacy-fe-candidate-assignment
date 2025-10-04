import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Loader2, CheckCircle, Zap } from 'lucide-react'

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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Handle email submission
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

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits are entered
    if (value && index === otp.length - 1 && newOtp.every(digit => digit)) {
      handleVerificationSubmit(newOtp.join(''))
    }
  }

  // Handle backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle verification code submission
  const handleVerificationSubmit = async (code?: string) => {
    const otpCode = code || otp.join('')
    if (otpCode.length !== otp.length) return

    try {
      setIsLoading(true)
      await onVerificationSubmit(otpCode)
    } catch (err) {
      // Clear OTP on error and focus first input
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend OTP
  const handleResendOtp = async () => {
    setOtp(['', '', '', '', '', ''])
    await onEmailSubmit(email)
  }

  // Reset form when modal closes
  const handleClose = () => {
    setEmail('')
    setOtp(['', '', '', '', '', ''])
    setIsLoading(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden transition-colors"
          >
        <AnimatePresence>
          {(authStep === 'email' || authStep === 'verification') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-0 pointer-events-none"
            >
              <img
                src="https://media.giphy.com/media/xJT7pzbviKNqTqF1Ps/giphy.gif"
                alt="Tunnel animation"
                className="w-full h-full object-cover opacity-30 dark:opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-primary-600/80 via-primary-800/90 to-gray-900/95 dark:from-blue-600/80 dark:via-blue-800/90 dark:to-black/95" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`relative z-10 flex items-center justify-between p-6 ${(authStep === 'email' || authStep === 'verification') ? 'border-b border-white/10' : 'border-b border-gray-200 dark:border-gray-700'}`}>
          <h2 className={`text-xl font-semibold ${(authStep === 'email' || authStep === 'verification') ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
            {authStep === 'email' && 'Connect Your Wallet'}
            {authStep === 'verification' && 'Verify Your Email'}
            {authStep === 'creating' && 'Creating Your Wallet'}
          </h2>
          <button
            onClick={handleClose}
            className={`transition-colors ${(authStep === 'email' || authStep === 'verification') ? 'text-white/70 hover:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            disabled={isLoading || authStep === 'creating'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={`relative z-10 p-6 ${(authStep === 'email' || authStep === 'verification') ? 'bg-transparent' : 'dark:bg-gray-800'}`}>
          <AnimatePresence mode="wait">
            {authStep === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="py-2"
              >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 0.6, bounce: 0.5 }}
                  className="w-10 h-10 mx-auto mb-4 text-white"
                >
                  <Mail className="w-full h-full stroke-current" strokeWidth={2} />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-xl font-semibold text-white mb-3"
                >
                  Welcome to Web3 Signer
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-white/80 text-sm leading-relaxed"
                >
                  Enter your email to create or access
                  <br />
                  your <span className="text-white font-medium">embedded wallet</span>
                </motion.p>
              </div>

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
            </motion.div>
            )}

          {authStep === 'verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="py-2"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 0.6, bounce: 0.5 }}
                  className="w-10 h-10 mx-auto mb-4 text-white"
                >
                  <Zap className="w-full h-full fill-current" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="text-xl font-semibold text-white mb-3"
                >
                  Enter verification code
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-white/80 text-sm leading-relaxed"
                >
                  We emailed you a verification code to
                  <br />
                  <span className="text-white font-medium">{email}</span>
                </motion.p>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                      delay: index * 0.05
                    }}
                    className="relative"
                  >
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={isLoading}
                      className="w-12 h-12 text-center text-xl font-semibold bg-white/50 dark:bg-white/10 border-2 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:bg-white dark:focus:bg-white/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 rounded-xl shadow-sm backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder=""
                      autoFocus={index === 0}
                    />
                  </motion.div>
                ))}
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
            </motion.div>
          )}

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
        </div>

        <div className={`relative z-10 px-6 py-4 ${(authStep === 'email' || authStep === 'verification') ? 'bg-transparent border-t border-white/10' : 'bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700'}`}>
          <p className={`text-xs text-center ${(authStep === 'email' || authStep === 'verification') ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'}`}>
            Powered by Dynamic.xyz Embedded Wallets
          </p>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

