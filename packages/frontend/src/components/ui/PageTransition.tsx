import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * Smooth page transition wrapper
 * Provides instant, slick transitions when navigating between pages
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.15,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  )
}

