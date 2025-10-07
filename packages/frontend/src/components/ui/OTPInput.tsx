import React, { useRef } from 'react'
import { motion } from 'framer-motion'

interface OTPInputProps {
  length?: number
  value: string[]
  onChange: (value: string[]) => void
  onComplete?: (code: string) => void
  disabled?: boolean
  autoFocus?: boolean
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, inputValue: string) => {
    if (inputValue.length > 1) return

    const newValue = [...value]
    newValue[index] = inputValue
    onChange(newValue)

    // Auto-focus next input
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits are entered
    if (inputValue && index === length - 1 && newValue.every(digit => digit)) {
      onComplete?.(newValue.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length }).map((_, index) => (
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
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            className="w-12 h-12 text-center text-xl font-semibold bg-white/50 dark:bg-white/10 border-2 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:bg-white dark:focus:bg-white/20 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all duration-200 rounded-xl shadow-sm backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder=""
            autoFocus={autoFocus && index === 0}
          />
        </motion.div>
      ))}
    </div>
  )
}

