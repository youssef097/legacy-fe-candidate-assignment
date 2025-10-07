import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface AnimatedModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  showBackground?: boolean
  isLoading?: boolean
  footer?: React.ReactNode
  children: React.ReactNode
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  title,
  showBackground = false,
  isLoading = false,
  footer,
  children
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden transition-colors"
          >
            {/* Animated Background */}
            <AnimatePresence>
              {showBackground && (
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

            {/* Header */}
            <div className={`relative z-10 flex items-center justify-between p-6 ${showBackground ? 'border-b border-white/10' : 'border-b border-gray-200 dark:border-gray-700'}`}>
              <h2 className={`text-xl font-semibold ${showBackground ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {title}
              </h2>
              <button
                onClick={onClose}
                className={`transition-colors ${showBackground ? 'text-white/70 hover:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className={`relative z-10 p-6 ${showBackground ? 'bg-transparent' : 'dark:bg-gray-800'}`}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className={`relative z-10 px-6 py-4 ${showBackground ? 'bg-transparent border-t border-white/10' : 'bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700'}`}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

