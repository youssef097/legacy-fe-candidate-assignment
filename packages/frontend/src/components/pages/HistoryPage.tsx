import React, { useState } from 'react'
import { History, CheckCircle, XCircle, Clock, Copy, Trash2, Archive } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSignatureHistory } from '@hooks/useSignatureHistory'
import { PageTransition } from '@components/ui/PageTransition'

export const HistoryPage: React.FC = () => {
  const { messages: signedMessages, isLoading, clearHistory: clearHistoryFn } = useSignatureHistory()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all signed messages?')) {
      clearHistoryFn()
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const copySignature = (signature: string, id: string) => {
    navigator.clipboard.writeText(signature)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="inline-block"
            >
              <History className="h-12 w-12 text-primary-600 dark:text-primary-400" />
            </motion.div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading history...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center mb-2">
              <Archive className="h-12 w-12 text-primary-600 dark:text-primary-400 mr-3" strokeWidth={1.5} />
            </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Signature History
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            View all your previously signed messages
            {signedMessages.length > 0 && (
              <span className="ml-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-semibold">
                {signedMessages.length} {signedMessages.length === 1 ? 'message' : 'messages'}
              </span>
            )}
          </p>
        </div>
        {signedMessages.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-md transition-shadow font-medium flex items-center"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Clear History
          </button>
        )}
      </div>

      {signedMessages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-xl p-12 text-center"
        >
          <History className="h-20 w-20 text-gray-400 dark:text-gray-600 mx-auto mb-6" strokeWidth={1.5} />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No Signed Messages Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
            Start by signing your first message on the Sign page
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {signedMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
                className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-lg p-6 overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center"
                  >
                    {message.verified ? (
                      <div className="flex items-center px-4 py-2 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                        <span className="font-semibold text-green-700 dark:text-green-400 text-sm">
                          Verified
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center px-4 py-2 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm rounded-full">
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                        <span className="font-semibold text-red-700 dark:text-red-400 text-sm">
                          Not Verified
                        </span>
                      </div>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm px-3 py-2 rounded-full"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {formatTimestamp(message.timestamp)}
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                      <span className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mr-2"></span>
                      Message
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 leading-relaxed border border-gray-200 dark:border-gray-700">
                      {message.message}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                      <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-2"></span>
                      Signer
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 font-mono text-sm bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      {message.signer}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                      <span className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full mr-2"></span>
                      Signature
                    </h4>
                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-700 dark:text-gray-300 font-mono text-xs break-all pr-12">
                        {message.signature}
                      </p>
                      <button
                        onClick={() => copySignature(message.signature, message.id)}
                        className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-md"
                        title="Copy signature"
                      >
                        {copiedId === message.id ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
