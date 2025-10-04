/**
 * Shared types and interfaces for the Web3 Wallet Signer application
 * This package contains common type definitions used by both frontend and backend
 */

// Message types for future extensibility
export enum MessageType {
  SIMPLE = 'simple',
  EIP712_TYPED_DATA = 'eip712',
  PERSONAL_SIGN = 'personal_sign'
}

// User roles for future RBAC implementation
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

// API Request/Response types for signature verification
export interface SignatureVerificationRequest {
  /** The message that was signed */
  message: string;
  /** The signature to verify */
  signature: string;
  /** Optional: Message type for future support of different signature schemes */
  type?: MessageType;
}

export interface SignatureVerificationResponse {
  /** Whether the signature is valid */
  isValid: boolean;
  /** The address of the signer */
  signer: string;
  /** The original message that was signed */
  originalMessage: string;
}

// Wallet connection states
export type WalletConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

// Message signing history item
export interface SignedMessage {
  /** Unique identifier for the message */
  id: string;
  /** The message content */
  message: string;
  /** The signature */
  signature: string;
  /** The signer's address */
  signer: string;
  /** Timestamp when the message was signed */
  timestamp: number;
  /** Whether the signature was verified by the backend */
  verified: boolean;
  /** Message type for supporting different signature schemes */
  type?: MessageType;
  /** Optional metadata for categorization and filtering */
  metadata?: {
    category?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
  };
}

// Dynamic.xyz wallet context types
export interface WalletContextType {
  /** Current connection state */
  connectionState: WalletConnectionState;
  /** Connected wallet address */
  address: string | null;
  /** Sign a message with the connected wallet */
  signMessage: (message: string) => Promise<string>;
  /** Connect to wallet */
  connect: () => Promise<void>;
  /** Disconnect from wallet */
  disconnect: () => Promise<void>;
  /** Error message if any */
  error: string | null;
}

// API Error response
export interface ApiError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Additional error details */
  details?: any;
}

// Environment configuration
export interface AppConfig {
  /** Backend API URL */
  apiUrl: string;
  /** Dynamic.xyz environment ID */
  dynamicEnvironmentId: string;
  /** Whether the app is running in development mode */
  isDevelopment: boolean;
}

// User type for future authentication and authorization
export interface User {
  /** User's wallet address (primary identifier) */
  address: string;
  /** User role for RBAC */
  role: UserRole;
  /** Email address (if available from Dynamic.xyz) */
  email?: string;
  /** User metadata */
  metadata?: {
    displayName?: string;
    createdAt?: number;
    lastLogin?: number;
  };
  /** MFA settings (for future Dynamic.xyz MFA integration) */
  mfa?: {
    enabled: boolean;
    methods: ('totp' | 'passkey')[];
    requiredForActions?: ('sign' | 'transfer' | 'export')[];
  };
}

// Repository pattern interfaces for future database integration
// Currently using localStorage, but these interfaces allow easy migration to:
// - IndexedDB for client-side
// - PostgreSQL/MongoDB for server-side
export interface IMessageRepository {
  /** Save a signed message */
  save(message: SignedMessage): Promise<void>;
  /** Find message by ID */
  findById(id: string): Promise<SignedMessage | null>;
  /** Find all messages by signer address */
  findByAddress(address: string, options?: QueryOptions): Promise<SignedMessage[]>;
  /** Delete a message */
  delete(id: string): Promise<void>;
  /** Count messages by address */
  count(address: string): Promise<number>;
}

// Query options for future pagination and filtering
export interface QueryOptions {
  /** Pagination: limit results */
  limit?: number;
  /** Pagination: offset */
  offset?: number;
  /** Filter by message type */
  type?: MessageType;
  /** Filter by date range */
  dateRange?: {
    from: number;
    to: number;
  };
  /** Sort order */
  sortBy?: 'timestamp' | 'verified';
  sortOrder?: 'asc' | 'desc';
}

// Middleware context for future request processing
export interface RequestContext {
  /** Authenticated user (populated by auth middleware) */
  user?: User;
  /** Request ID for tracing */
  requestId?: string;
  /** Client IP address */
  ipAddress?: string;
}
