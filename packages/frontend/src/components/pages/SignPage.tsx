import React, { useState } from 'react'
import { CheckCircle, XCircle, Loader2, FileText, Shield, Copy, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@context/WalletContext'
import { useSignatureHistory } from '@hooks/useSignatureHistory'
import { config } from '@config'
import { PageTransition } from '@components/ui/PageTransition'

export const SignPage: React.FC = () => {
  const { connectionState, signMessage, address } = useWallet()
  const { addMessage } = useSignatureHistory()
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [isSigning, setIsSigning] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSignMessage = async () => {
    if (!message.trim()) {
      setError('Please enter a message to sign')
      return
    }

    if (connectionState !== 'connected') {
      setError('Please connect your wallet first')
      return
    }

    try {
      setIsSigning(true)
      setError(null)
      const sig = await signMessage(message.trim())
      setSignature(sig)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign message')
    } finally {
      setIsSigning(false)
    }
  }

  const handleVerifySignature = async () => {
    if (!signature || !message) {
      setError('Please sign a message first')
      return
    }

    try {
      setIsVerifying(true)
      setError(null)
      
      const response = await fetch(`${config.apiUrl}/api/verify-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          signature
        })
      })

      if (!response.ok) {
        throw new Error('Failed to verify signature')
      }

      const result = await response.json()
      setVerificationResult(result)
      
      if (result.isValid) {
        addMessage(
          message.trim(),
          signature,
          result.signer || address || 'Unknown',
          true
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify signature')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleReset = () => {
    setMessage('')
    setSignature('')
    setVerificationResult(null)
    setError(null)
  }

  const copySignature = () => {
    navigator.clipboard.writeText(signature)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-block mb-4">
            <FileText className="h-16 w-16 text-primary-600 dark:text-primary-400" strokeWidth={1.5} />
          </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Sign Message
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Sign a custom message with your Web3 wallet
        </p>
      </div>

      <AnimatePresence>
        {connectionState !== 'connected' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur-lg border border-yellow-200 dark:border-yellow-700/30 rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" />
              <p className="text-yellow-800 dark:text-yellow-300 font-medium">
                Please connect your wallet to sign messages
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-xl p-8"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <FileText className="h-6 w-6 mr-2 text-primary-600 dark:text-primary-400" />
          Enter Your Message
        </h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="w-full h-40 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent resize-none bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          disabled={connectionState !== 'connected'}
        />
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {message.length} characters
          </span>
          <button
            onClick={handleSignMessage}
            disabled={isSigning || connectionState !== 'connected' || !message.trim()}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-500 dark:to-blue-500 text-white rounded-xl hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-shadow"
          >
            {isSigning ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
              Sign Message
            </>
            )}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {signature && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-xl p-8"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
              Signature
            </h2>
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 font-mono text-sm break-all text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
              {signature}
              <button
                onClick={copySignature}
                className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-md"
                title="Copy signature"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleVerifySignature}
                disabled={isVerifying}
                className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-shadow"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Verify Signature
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium flex items-center"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg rounded-2xl border ${
              verificationResult.isValid
                ? 'border-green-200 dark:border-green-700/30'
                : 'border-red-200 dark:border-red-700/30'
            } shadow-xl p-8`}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              {verificationResult.isValid ? (
                <CheckCircle className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-6 w-6 mr-2 text-red-600 dark:text-red-400" />
              )}
              Verification Result
            </h2>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`flex items-center p-4 rounded-xl ${
                  verificationResult.isValid
                    ? 'bg-green-50/80 dark:bg-green-900/20'
                    : 'bg-red-50/80 dark:bg-red-900/20'
                } backdrop-blur-sm`}
              >
                {verificationResult.isValid ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                )}
                <span
                  className={`font-bold text-lg ${
                    verificationResult.isValid
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {verificationResult.isValid ? '✓ Valid Signature' : '✗ Invalid Signature'}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 space-y-2"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white">Signer:</strong>{' '}
                  <span className="font-mono text-xs">{verificationResult.signer}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white">Message:</strong>{' '}
                  {verificationResult.originalMessage}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-lg border border-red-200 dark:border-red-700/30 rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PageTransition>
  )
}
