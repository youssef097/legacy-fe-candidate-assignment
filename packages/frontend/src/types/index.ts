export type WalletConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'

export interface SignedMessage {
  id: string
  message: string
  signature: string
  signer: string
  timestamp: number
  verified: boolean
}

