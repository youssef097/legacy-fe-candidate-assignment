import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Loader2, CheckCircle, Copy, Trash2, Plus } from 'lucide-react'
import QRCodeUtil from 'qrcode'
import { MFADevice } from '@dynamic-labs/sdk-api-core'

interface MfaRegisterData {
  uri: string
  secret: string
}

interface MFAModalProps {
  isOpen: boolean
  onClose: () => void
  devices: MFADevice[]
  onAddDevice: () => Promise<MfaRegisterData>
  onDeleteDevice: (deviceId: string) => Promise<void>
  onRefreshDevices: () => Promise<void>
  onVerifyDevice: (code: string) => Promise<void>
  backupCodes: string[]
  onAcknowledgeBackupCodes: () => void
  mfaRegisterData: MfaRegisterData | null
  currentView: 'devices' | 'qr-code' | 'otp' | 'backup-codes'
  onViewChange: (view: 'devices' | 'qr-code' | 'otp' | 'backup-codes') => void
  error: string | null
}

export const MFAModal: React.FC<MFAModalProps> = ({
  isOpen,
  onClose,
  devices,
  onAddDevice,
  onDeleteDevice,
  onRefreshDevices,
  onVerifyDevice,
  backupCodes,
  onAcknowledgeBackupCodes,
  mfaRegisterData,
  currentView,
  onViewChange,
  error
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (mfaRegisterData?.uri) {
      QRCodeUtil.toDataURL(mfaRegisterData.uri, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Failed to generate QR code:', err))
    }
  }, [mfaRegisterData])

  const handleAddDevice = async () => {
    try {
      setIsLoading(true)
      await onAddDevice()
    } catch (err) {
      console.error('Failed to add device:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to remove this MFA device?')) {
      return
    }
    
    try {
      setIsLoading(true)
      await onDeleteDevice(deviceId)
      await onRefreshDevices()
    } catch (err) {
      console.error('Failed to delete device:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (value && index === otp.length - 1 && newOtp.every(digit => digit)) {
      handleOtpSubmit(newOtp.join(''))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpSubmit = async (code?: string) => {
    const otpCode = code || otp.join('')
    if (otpCode.length !== otp.length) return

    try {
      setIsLoading(true)
      await onVerifyDevice(otpCode)
      setOtp(['', '', '', '', '', ''])
    } catch (err) {
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopySecret = async () => {
    if (!mfaRegisterData?.secret) return
    
    try {
      await navigator.clipboard.writeText(mfaRegisterData.secret)
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    } catch (err) {
      console.error('Failed to copy secret:', err)
    }
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const handleClose = () => {
    setOtp(['', '', '', '', '', ''])
    setIsLoading(false)
    setCopiedSecret(false)
    setCopiedCode(null)
    onClose()
  }

  const isActiveView = currentView === 'devices' || currentView === 'qr-code' || currentView === 'otp'

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
              {isActiveView && (
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

            <div className={`relative z-10 flex items-center justify-between p-6 ${isActiveView ? 'border-b border-white/10' : 'border-b border-gray-200 dark:border-gray-700'}`}>
              <h2 className={`text-xl font-semibold ${isActiveView ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {currentView === 'devices' && 'Multi-Factor Authentication'}
                {currentView === 'qr-code' && 'Setup Authenticator'}
                {currentView === 'otp' && 'Verify Identity'}
                {currentView === 'backup-codes' && 'Save Backup Codes'}
              </h2>
              <button
                onClick={handleClose}
                className={`transition-colors ${isActiveView ? 'text-white/70 hover:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className={`relative z-10 p-6 ${isActiveView ? 'bg-transparent' : 'dark:bg-gray-800'}`}>
              <AnimatePresence mode="wait">
                {/* Device List View */}
                {currentView === 'devices' && (
                  <motion.div
                    key="devices"
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
                        <Shield className="w-full h-full stroke-current" strokeWidth={2} />
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="text-xl font-semibold text-white mb-3"
                      >
                        Secure Your Account
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="text-white/80 text-sm leading-relaxed"
                      >
                        Add an extra layer of security with
                        <br />
                        <span className="text-white font-medium">time-based one-time passwords</span>
                      </motion.p>
                    </div>

                    {/* Device list */}
                    {devices.length > 0 ? (
                      <div className="space-y-3 mb-6">
                        <h3 className="text-sm font-medium text-white/90 text-center">
                          Registered Devices
                        </h3>
                        {devices.map((device) => (
                          <motion.div
                            key={device.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                          >
                            <div className="flex items-center gap-3">
                              <Shield className="h-5 w-5 text-green-400" />
                              <div>
                                <p className="text-sm font-medium text-white">
                                  Authenticator App
                                </p>
                                <p className="text-xs text-white/70">
                                  {device.verified ? 'Verified' : 'Pending verification'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const deviceId = device.id
                                if (deviceId) handleDeleteDevice(deviceId)
                              }}
                              disabled={isLoading || !device.id}
                              className="p-2 text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Manage devices via Dynamic dashboard"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 mb-6">
                        <Shield className="h-12 w-12 text-white/40 mx-auto mb-3" />
                        <p className="text-sm text-white/70">
                          No MFA devices registered yet
                        </p>
                      </div>
                    )}

                    {/* Add device button - only allow one TOTP device */}
                    {devices.length === 0 && (
                      <button
                        onClick={handleAddDevice}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl transition-colors shadow-lg border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Setting up...
                          </>
                        ) : (
                          <>
                            <Plus className="h-5 w-5" />
                            Add Authenticator App
                          </>
                        )}
                      </button>
                    )}

                    {error && (
                      <div className="mt-4 p-3 bg-red-900/30 border border-red-400/50 rounded-lg backdrop-blur-sm">
                        <p className="text-sm text-red-200 text-center">{error}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* QR Code View */}
                {currentView === 'qr-code' && mfaRegisterData && (
                  <motion.div
                    key="qr-code"
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
                        <Shield className="w-full h-full stroke-current" strokeWidth={2} />
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="text-xl font-semibold text-white mb-3"
                      >
                        Scan QR Code
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="text-white/80 text-sm leading-relaxed"
                      >
                        Use Google Authenticator or Authy
                        <br />
                        to scan this <span className="text-white font-medium">QR code</span>
                      </motion.p>
                    </div>

                    {qrCodeDataUrl && (
                      <div className="flex justify-center mb-6">
                        <div className="p-4 bg-white rounded-lg shadow-lg">
                          <img
                            src={qrCodeDataUrl}
                            alt="TOTP QR Code"
                            className="w-48 h-48"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 mb-6">
                      <p className="text-xs text-white/70 text-center">
                        Can't scan? Enter this code manually:
                      </p>
                      <div className="flex items-center gap-2 p-3 bg-white/10 border-2 border-white/20 rounded-xl backdrop-blur-sm">
                        <code className="flex-1 text-sm font-mono text-white break-all text-center">
                          {mfaRegisterData.secret}
                        </code>
                        <button
                          onClick={handleCopySecret}
                          className="flex-shrink-0 p-2 text-white/70 hover:text-white transition-colors"
                          title="Copy secret"
                        >
                          {copiedSecret ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => onViewChange('otp')}
                      className="w-full flex items-center justify-center px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl transition-colors shadow-lg border border-white/30 font-medium"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Continue
                    </button>
                  </motion.div>
                )}

                {/* OTP Verification View */}
                {currentView === 'otp' && (
                  <motion.div
                    key="otp"
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
                        <Shield className="w-full h-full fill-current" />
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
                        Enter the 6-digit code from your
                        <br />
                        <span className="text-white font-medium">authenticator app</span>
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

                    <AnimatePresence>
                      {!isLoading && otp.every(digit => digit) && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => handleOtpSubmit()}
                          className="w-full flex items-center justify-center px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg transition-colors shadow-lg border border-white/30"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify and Continue
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Backup Codes View */}
                {currentView === 'backup-codes' && (
                  <motion.div
                    key="backup-codes"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        MFA Setup Complete!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Save these backup codes in a secure location. Each code can only be used once.
                      </p>
                    </div>

                    {/* Backup codes grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {backupCodes.map((code, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative group"
                        >
                          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm text-center text-gray-900 dark:text-white">
                            {code}
                          </div>
                          <button
                            onClick={() => handleCopyCode(code)}
                            className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded shadow-sm"
                            title="Copy code"
                          >
                            {copiedCode === code ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                            )}
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Warning */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-xs text-amber-800 dark:text-amber-400">
                        ⚠️ Store these codes securely. You won't be able to see them again.
                      </p>
                    </div>

                    {/* Acknowledge button */}
                    <button
                      onClick={() => {
                        onAcknowledgeBackupCodes()
                        handleClose()
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <CheckCircle className="h-5 w-5" />
                      I've Saved My Backup Codes
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`relative z-10 px-6 py-4 ${isActiveView ? 'bg-transparent border-t border-white/10' : 'bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700'}`}>
              <p className={`text-xs text-center ${isActiveView ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'}`}>
                Powered by Dynamic.xyz MFA
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

