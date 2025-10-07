import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface AnimatedViewProps {
  icon: LucideIcon
  iconClassName?: string
  title: string
  description: string | React.ReactNode
  children?: React.ReactNode
}

export const AnimatedView: React.FC<AnimatedViewProps> = ({
  icon: Icon,
  iconClassName = 'stroke-current',
  title,
  description,
  children
}) => {
  return (
    <motion.div
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
          <Icon className={`w-full h-full ${iconClassName}`} strokeWidth={2} />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-xl font-semibold text-white mb-3"
        >
          {title}
        </motion.h3>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-white/80 text-sm leading-relaxed"
        >
          {description}
        </motion.div>
      </div>
      {children}
    </motion.div>
  )
}

