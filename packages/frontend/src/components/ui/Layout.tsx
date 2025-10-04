import React, { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Wallet, FileText, History, LogOut, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import { useWallet } from '@context/WalletContext'
import { BackgroundPlus } from './BackgroundPlus'

// Utility function for className merging
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

interface LayoutProps {
  children: ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const { connectionState, address, disconnect, connect } = useWallet()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/sign', label: 'Sign', icon: FileText },
    { path: '/history', label: 'History', icon: History },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 transition-colors relative overflow-hidden">
      <BackgroundPlus
        plusColor="#8b5cf6"
        plusSize={80}
        fade={true}
        className="opacity-30"
      />

      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-6">
        <div className="flex items-center gap-3 bg-white/10 dark:bg-gray-900/30 border border-gray-200/20 dark:border-gray-700/30 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path

            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors',
                  'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400',
                  isActive && 'text-primary-600 dark:text-primary-400'
                )}
              >
                <span className="hidden md:inline">{label}</span>
                <span className="md:hidden">
                  <Icon size={18} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full bg-primary-500/10 dark:bg-primary-400/10 rounded-full -z-10"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-600 dark:bg-primary-400 rounded-t-full">
                      <div className="absolute w-12 h-6 bg-primary-500/20 dark:bg-primary-400/20 rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-primary-500/20 dark:bg-primary-400/20 rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-primary-500/20 dark:bg-primary-400/20 rounded-full blur-sm top-0 left-2" />
                    </div>
                  </motion.div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="fixed top-0 right-0 z-50 pt-6 pr-6">
        <div className="flex items-center gap-2 bg-white/10 dark:bg-gray-900/30 border border-gray-200/20 dark:border-gray-700/30 backdrop-blur-lg rounded-full shadow-lg px-3 py-2">
          {connectionState === 'connected' && address ? (
            <>
              <div className="hidden sm:flex items-center px-3 py-1 bg-white/10 dark:bg-gray-800/50 rounded-full">
                <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors"
                title="Disconnect wallet"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={connect}
              className="flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-full hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm font-medium"
            >
              <Wallet className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Connect</span>
            </button>
          )}
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {children}
      </main>

     
    </div>
  )
}
