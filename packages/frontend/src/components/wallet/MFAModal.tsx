import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Loader2, CheckCircle, Copy, Trash2, Plus } from 'lucide-react'
import QRCodeUtil from 'qrcode'
import { MFADevice } from '@dynamic-labs/sdk-api-core'
import { AnimatedModal } from '../ui/AnimatedModal'
import { AnimatedView } from '../ui/AnimatedView'
import { OTPInput } from '../ui/OTPInput'

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

  // Generate QR code when mfaRegisterData changes
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

  const handleOtpSubmit = async (code?: string) => {
    const otpCode = code || otp.join('')
    if (otpCode.length !== otp.length) return

    try {
      setIsLoading(true)
      await onVerifyDevice(otpCode)
      setOtp(['', '', '', '', '', ''])
    } catch (err) {
      setOtp(['', '', '', '', '', ''])
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

  const getTitle = () => {
    switch (currentView) {
      case 'devices': return 'Multi-Factor Authentication'
      case 'qr-code': return 'Setup Authenticator'
      case 'otp': return 'Verify Identity'
      case 'backup-codes': return 'Save Backup Codes'
    }
  }

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      showBackground={isActiveView}
      isLoading={isLoading}
      footer={
        <p className={`text-xs text-center ${isActiveView ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'}`}>
          Powered by Dynamic.xyz MFA
        </p>
      }
    >
      <AnimatePresence mode="wait">
        {/* Device List View */}
        {currentView === 'devices' && (
          <AnimatedView
            key="devices"
            icon={Shield}
            title="Secure Your Account"
            description={
              <>
                Add an extra layer of security with
                <br />
                <span className="text-white font-medium">time-based one-time passwords</span>
              </>
            }
          >
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

            {/* Add device button */}
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
          </AnimatedView>
        )}

        {/* QR Code View */}
        {currentView === 'qr-code' && mfaRegisterData && (
          <AnimatedView
            key="qr-code"
            icon={Shield}
            title="Scan QR Code"
            description={
              <>
                Use Google Authenticator or Authy
                <br />
                to scan this <span className="text-white font-medium">QR code</span>
              </>
            }
          >
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
          </AnimatedView>
        )}

        {/* OTP Verification View */}
        {currentView === 'otp' && (
          <AnimatedView
            key="otp"
            icon={Shield}
            iconClassName="fill-current"
            title="Enter verification code"
            description={
              <>
                Enter the 6-digit code from your
                <br />
                <span className="text-white font-medium">authenticator app</span>
              </>
            }
          >
            <div className="mb-6">
              <OTPInput
                value={otp}
                onChange={setOtp}
                onComplete={handleOtpSubmit}
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
          </AnimatedView>
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
    </AnimatedModal>
  )
}
