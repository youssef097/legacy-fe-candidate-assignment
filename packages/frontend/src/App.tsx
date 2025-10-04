import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'

// Import components using aliases
import { WalletProvider } from '@context/WalletContext'
import { Layout } from '@components/ui/Layout'
import { HomePage } from '@components/pages/HomePage'
import { SignPage } from '@components/pages/SignPage'
import { HistoryPage } from '@components/pages/HistoryPage'

// Environment configuration
const DYNAMIC_ENVIRONMENT_ID = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || 'your-environment-id'

/**
 * Animated routes wrapper for smooth page transitions
 */
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign" element={<SignPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </AnimatePresence>
  )
}

/**
 * Main App component that sets up the application structure
 * - Configures Dynamic.xyz SDK for headless email authentication
 * - Provides wallet context to all child components
 * - Sets up routing for different pages with smooth transitions
 * - Uses completely custom UI (no Dynamic widget)
 */
function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WalletProvider>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </WalletProvider>
    </DynamicContextProvider>
  )
}

export default App
