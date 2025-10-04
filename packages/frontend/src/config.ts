// Environment variables configuration
// These variables are loaded from .env files and used throughout the application

export const config = {
  // Backend API URL - defaults to localhost in development
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // Dynamic.xyz environment ID for wallet connections
  dynamicEnvironmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || '',
  
  // Whether the app is running in development mode
  isDevelopment: import.meta.env.DEV,
  
  // App metadata
  appName: 'Web3 Wallet Signer',
  appVersion: '1.0.0',
} as const

// Type-safe environment variable access
export type AppConfig = typeof config
