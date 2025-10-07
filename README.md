# Web3 Wallet Signer Monorepo

A full-stack Web3 application for signing and verifying messages using Dynamic.xyz embedded wallets.

## 🌐 Live Demo

- **Frontend App**: [https://legacy-fe-candidate-assignment-back.vercel.app/](https://legacy-fe-candidate-assignment-back.vercel.app/)
- **Backend API**: [https://legacy-fe-candidate-assignment-backend-lzlt4fue8.vercel.app/](https://legacy-fe-candidate-assignment-backend-lzlt4fue8.vercel.app/)

> **Note**: The services are hosted on free tiers and may experience slower response times or cold starts.

## 🚀 [Deployment Guide](./DEPLOYMENT.md)

See the [complete deployment guide](./DEPLOYMENT.md) for step-by-step instructions on deploying to production (Vercel for frontend, Render for backend).

## 🏗️ Project Structure

This is a monorepo containing three packages:

```
packages/
├── shared/          # Shared types and interfaces
├── frontend/        # React + Vite frontend
└── backend/         # Node.js + Express backend
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   
   **Frontend** (`packages/frontend/.env.local`):
   ```bash
   cp packages/frontend/env.example packages/frontend/.env.local
   # Edit .env.local with your Dynamic.xyz environment ID
   ```
   
   **Backend** (`packages/backend/.env`):
   ```bash
   cp packages/backend/env.example packages/backend/.env
   # Edit .env with your configuration
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

   This will start both frontend (http://localhost:3000) and backend (http://localhost:3001) concurrently.

## 📦 Individual Package Commands

### Frontend
```bash
npm run dev:frontend    # Start frontend dev server
npm run build:frontend  # Build frontend for production
npm run test:frontend   # Run frontend tests
npm run lint:frontend   # Lint frontend code
```

### Backend
```bash
npm run dev:backend     # Start backend dev server
npm run build:backend  # Build backend for production
npm run test:backend    # Run backend tests
npm run lint:backend    # Lint backend code
```

### Shared
```bash
npm run build --workspace=shared  # Build shared types
```

## 🔧 Development

### Import Aliases

Both frontend and backend use import aliases for cleaner imports:

**Frontend aliases:**
- `@/` → `src/`
- `@components/` → `src/components/`
- `@hooks/` → `src/hooks/`
- `@services/` → `src/services/`
- `@context/` → `src/context/`
- `@types/` → `src/types/`
- `@utils/` → `src/utils/`
- `@shared/` → `../shared/src/`

**Backend aliases:**
- `@/` → `src/`
- `@controllers/` → `src/controllers/`
- `@services/` → `src/services/`
- `@middleware/` → `src/middleware/`
- `@routes/` → `src/routes/`
- `@types/` → `src/types/`
- `@utils/` → `src/utils/`
- `@shared/` → `../shared/src/`

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Dynamic.xyz SDK for Web3 wallet integration
- React Router for navigation

**Backend:**
- Node.js with Express
- TypeScript for type safety
- ethers.js for signature verification
- CORS, Helmet, and rate limiting for security

**Shared:**
- Common TypeScript interfaces
- API request/response types
- Wallet context types

## 🧪 Testing

This project includes comprehensive test suites for both frontend and backend using Vitest.

### Running Tests

**Run all tests:**
```bash
npm run test
```

**Run tests for specific package:**
```bash
npm run test:frontend    # Frontend tests
npm run test:backend     # Backend tests
```

**Run tests in watch mode:**
```bash
# Frontend (navigate to packages/frontend)
cd packages/frontend && npm test

# Backend (navigate to packages/backend)
cd packages/backend && npm test
```

**Run tests with coverage:**
```bash
# Frontend
cd packages/frontend && npm test -- --coverage

# Backend
cd packages/backend && npm test -- --coverage
```

**Run tests with UI (interactive mode):**
```bash
# Frontend
npm run test:ui --workspace=frontend

# Backend
npm run test:ui --workspace=backend
```

### Test Structure

#### Backend Tests

Located in `packages/backend/src/`:

- **`services/signatureService.test.ts`** - Tests for signature verification logic
  - Valid signature verification
  - Invalid signature handling
  - Edge cases (empty messages, special characters, long messages)
  - Signature format validation
  - Message validation

- **`controllers/signatureController.test.ts`** - Tests for API controller
  - Request validation
  - Error handling
  - Response formatting
  - Missing parameter handling

- **`routes/signatureRoutes.test.ts`** - Integration tests for API endpoints
  - End-to-end signature verification flow
  - HTTP status codes
  - Request/response validation
  - Error scenarios

#### Frontend Tests

Located in `packages/frontend/src/`:

- **`hooks/useSignatureHistory.test.ts`** - Tests for signature history hook
  - localStorage persistence
  - Adding/removing messages
  - Message retrieval
  - History clearing
  - Data corruption handling

- **`context/WalletContext.test.tsx`** - Tests for wallet context
  - Wallet connection states
  - Message signing functionality
  - Email authentication flow
  - Error handling
  - State transitions

- **`components/pages/SignPage.test.tsx`** - Tests for sign page component
  - Message input and validation
  - Signature generation
  - Signature verification
  - Copy to clipboard functionality
  - Error states and loading states

- **`components/pages/HistoryPage.test.tsx`** - Tests for history page component
  - Message list rendering
  - Empty state handling
  - Clear history functionality
  - Copy signature functionality
  - Timestamp formatting

### Test Configuration

Both packages use Vitest with the following setup:

**Backend:**
- Environment: Node.js
- Config: `packages/backend/vitest.config.ts`
- No DOM required

**Frontend:**
- Environment: jsdom (simulated browser)
- Config: `packages/frontend/vitest.config.ts`
- Setup file: `packages/frontend/src/test/setup.ts`
- Uses @testing-library/react for component testing

### Test Coverage

To generate coverage reports:

```bash
# Frontend coverage
cd packages/frontend && npm test -- --coverage

# Backend coverage
cd packages/backend && npm test -- --coverage
```

Coverage reports will be generated in:
- `packages/frontend/coverage/`
- `packages/backend/coverage/`

Open `coverage/index.html` in your browser to view detailed coverage reports.

### Writing Tests

**Backend test example:**
```typescript
import { describe, it, expect } from 'vitest'
import { signatureService } from './signatureService'

describe('SignatureService', () => {
  it('should verify valid signature', async () => {
    const result = await signatureService.verifySignature({
      message: 'test',
      signature: '0x...'
    })
    expect(result.isValid).toBe(true)
  })
})
```

**Frontend test example:**
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Continuous Integration

Tests are designed to run in CI/CD environments. Ensure all tests pass before submitting PRs:

```bash
npm run test        # Run all tests
npm run lint        # Run linting
npm run build       # Verify builds succeed
```

## 🏗️ Building

Build all packages:
```bash
npm run build
```

Build specific package:
```bash
npm run build:frontend
npm run build:backend
```

## 🚀 Deployment

### Frontend (Vercel)
1. Build the frontend: `npm run build:frontend`
2. Deploy the `packages/frontend/dist` folder to Vercel
3. Set environment variables in Vercel dashboard

### Backend (Render/Railway)
1. Build the backend: `npm run build:backend`
2. Deploy the `packages/backend` folder
3. Set environment variables in your hosting platform

## 📝 Environment Variables

### Frontend (.env.local)
```bash
VITE_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id
VITE_API_URL=http://localhost:3001
```

### Backend (.env)
```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🔍 Features

- **Wallet Connection**: Connect using Dynamic.xyz embedded wallets
- **Message Signing**: Sign custom messages with your Web3 wallet
- **Signature Verification**: Verify signatures on the backend using ethers.js
- **Message History**: Persist signed messages in localStorage
- **Responsive Design**: Beautiful, modern UI with Tailwind CSS
- **Type Safety**: Full TypeScript support across all packages
- **Import Aliases**: Clean import paths for better developer experience

## 🛠️ Development Tools

- **ESLint**: Code linting and formatting
- **TypeScript**: Static type checking
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Concurrently**: Run multiple npm scripts simultaneously

## 📚 API Documentation

### POST /api/verify-signature

Verify a message signature.

**Request:**
```json
{
  "message": "string",
  "signature": "string"
}
```

**Response:**
```json
{
  "isValid": boolean,
  "signer": "string",
  "originalMessage": "string"
}
```

## 🚀 Scalability & Future Enhancements

This application was architected with extensibility in mind. While the current implementation focuses on core functionality, the codebase includes scaffolding for future growth:

### 🔐 **Authentication & Authorization**
- **Current:** Wallet-based identification via Dynamic.xyz
- **Ready for:**
  - JWT-based session management
  - Role-based access control (RBAC) with User/Admin/Moderator roles
  - Permission-based API endpoints
  - Multi-tenant support

```typescript
// Types already defined in shared package
enum UserRole { USER, ADMIN, MODERATOR }
interface User { address, role, email, metadata }
```

### 🔐 **Multi-Factor Authentication (MFA)**
- **Current:** ✅ **FULLY IMPLEMENTED** - TOTP MFA with custom headless UI
  - Email OTP via Dynamic.xyz headless auth with custom UI
  - **TOTP authenticator app support** (Google Authenticator, Authy, etc.)
  - **Account-based MFA** (protects all logins)
  - **QR code + manual secret** for device setup
  - **Backup recovery codes** for account recovery
  - **Device management** via custom UI
  - **Automatic MFA flow handling** during login

- **Ready for:**
  - Passkeys (biometric authentication)
  - Action-based MFA (protect sensitive operations like signing)
  - SMS backup authentication

```typescript
// Fully implemented MFA with custom UI
import { useMFA } from '@/hooks/useMFA'
import { MFAModal } from '@components/wallet/MFAModal'

const {
  devices,              // List of registered MFA devices
  addDevice,            // Start TOTP device registration
  verifyDevice,         // Verify OTP code
  openModal,            // Open MFA settings
  backupCodes,          // Recovery codes
  hasMFAEnabled,        // Check MFA status
} = useMFA()

// WalletContext integration
const { openMFASettings, hasMFAEnabled } = useWallet()
```

**Implementation Details:**
- Custom `MFAModal` component with 4 views: devices, QR code, OTP input, backup codes
- `useMFA` hook for complete MFA state management
- Integrated with `WalletContext` for seamless user experience
- Auto-triggers during login via `useSyncMfaFlow`
- Prevention of modal spam with ref-based guards
- See [MFA_GUIDE.md](./MFA_GUIDE.md) for complete documentation

### 📝 **Message Type System**
- **Current:** Simple message signing
- **Ready for:**
  - EIP-712 typed data signing
  - EIP-191 personal sign
  - Message categorization and tagging
  - Priority-based message handling

```typescript
// Already scaffolded in shared types
enum MessageType { SIMPLE, EIP712_TYPED_DATA, PERSONAL_SIGN }
// Service comments show Strategy pattern for extensibility
```

### 💾 **Database Integration**
- **Current:** Client-side localStorage
- **Ready for:**
  - Repository pattern interfaces defined (`IMessageRepository`)
  - Easy migration to PostgreSQL, MongoDB, or IndexedDB
  - Query options for pagination, filtering, sorting
  - No business logic coupled to storage implementation

### 🔌 **Middleware Architecture**
- **Current:** Basic error handling and rate limiting
- **Ready for:**
  - Authentication middleware (`authenticate`)
  - Authorization middleware (`authorize(['admin'])`)
  - Request validation (`validateRequest(schema)`)
  - Audit logging (`auditLog`)
  - Request tracing and monitoring

```typescript
// Controller comments demonstrate full middleware pipeline
router.post('/verify', authenticate, authorize(['user']), validateRequest, auditLog, controller.verify)
```

### 🏗️ **API Versioning**
- **Current:** `/api` endpoints
- **Ready for:**
  - `/api/v1` prefix structure in place
  - Backward compatibility for future API changes
  - Per-version middleware and routing

### 📊 **Monitoring & Observability**
- **Ready for:**
  - Request context with tracing IDs
  - Structured logging
  - Performance metrics
  - Error tracking integration (Sentry, DataDog)

### 🧪 **Testing Infrastructure**
- **Ready for:**
  - Service layer separation enables easy unit testing
  - Repository pattern allows mock implementations
  - Controller/Service/Repository layers testable independently

## ⚖️ Trade-offs & Considerations

### Deployment
- **Backend on Render Free Tier**: The backend is deployed on Render's free tier, which may experience slower response times and cold starts after periods of inactivity. For production use, consider upgrading to a paid tier for better performance and reliability.


