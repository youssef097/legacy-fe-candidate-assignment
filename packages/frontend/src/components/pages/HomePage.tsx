import React from 'react'
import { Link } from 'react-router-dom'
import { Wallet, FileText, History, ArrowRight, Sparkles, Shield } from 'lucide-react'
import { useWallet } from '@context/WalletContext'
import { PageTransition } from '@components/ui/PageTransition'

export const HomePage: React.FC = () => {
  const { connectionState, address, connect, openMFASettings, hasMFAEnabled } = useWallet()

  const features = [
    {
      title: 'Sign Messages',
      description: 'Sign custom messages with your Web3 wallet using cryptographic signatures',
      icon: FileText,
      path: '/sign',
      gradient: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-400'
    },
    {
      title: 'View History',
      description: 'Browse and manage all your previously signed messages and verifications',
      icon: History,
      path: '/history',
      gradient: 'from-purple-500 to-pink-500',
      iconColor: 'text-purple-400'
    }
  ]

  return (
    <PageTransition>
      <div className="space-y-12">
        <div className="text-center">
        <div className="inline-block mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500/20 dark:bg-primary-400/20 blur-3xl rounded-full"></div>
            <Wallet className="h-20 w-20 text-primary-600 dark:text-primary-400 relative" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400">
          Web3 Message Signer
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Sign and verify messages using your Web3 wallet with Dynamic.xyz embedded wallets.
          <br />
          <span className="font-medium text-gray-900 dark:text-white">Secure, simple, and decentralized.</span>
        </p>

        <div className="space-y-4">
          {connectionState === 'connected' && address ? (
            <>
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 dark:bg-gray-900/30 backdrop-blur-lg shadow-lg border border-gray-200/20 dark:border-gray-700/30">
                <Wallet className="h-5 w-5 mr-3 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Connected: {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
              
              {/* MFA Settings Button */}
              <div className="flex justify-center">
                <button
                  onClick={openMFASettings}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-full border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-400/50 dark:hover:border-primary-600/50 transition-all shadow-sm hover:shadow-md"
                >
                  <Shield className={`h-4 w-4 ${hasMFAEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {hasMFAEnabled ? 'MFA Enabled' : 'Enable MFA'}
                  </span>
                  {hasMFAEnabled && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={connect}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-500 dark:to-blue-500 text-white rounded-full hover:shadow-lg transition-all text-base font-medium shadow-md"
            >
              <Wallet className="h-5 w-5 mr-2" />
              Connect Your Wallet
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.path}
              to={feature.path}
              className="group block relative overflow-hidden p-8 bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-lg hover:border-primary-300/50 dark:hover:border-primary-600/50 transition-colors duration-150"
            >
              <div className="relative flex items-start">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-md`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="ml-5 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-600" />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Sparkles className="h-6 w-6 mr-2 text-primary-600 dark:text-primary-400" />
          Getting Started
        </h2>
        <div className="space-y-4">
          {[
            'Connect your wallet using Dynamic.xyz embedded wallet',
            'Enable Multi-Factor Authentication (MFA) for enhanced security',
            'Navigate to the Sign Message page to create your first signature',
            'View your signature history and verification results'
          ].map((step, index) => (
            <div
              key={index}
              className="flex items-start p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-200/30 dark:border-gray-700/30"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">
                {index + 1}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </PageTransition>
  )
}
