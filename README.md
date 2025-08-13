# Take-Home Task: **Web3 Message Signer & Verifier**
React + Dynamic.xyz Headless Implementation (Frontend) | Node.js + Express (Backend)

## 🎯 Objective
Build a full-stack Web3 app that allows a user to:
1. Authenticate using a **Dynamic.xyz embedded wallet headless implementation https://docs.dynamic.xyz/headless/headless-email** ⚠️ Do not simply implement the Widget ⚠️
2. Enter and **sign a custom message** of the user's choosing
3. Send the signed message to a **Node.js + Express** backend
4. Backend verifies the signature and responds with validity + address

## 🔧 Requirements

### 🧩 Frontend (React 18+)
* Integrate Dynamic.xyz Embedded Wallet
* After authentication:
   * Show connected wallet address
   * Provide a form to input a custom message
   * Let user sign the message
   * Submit `{ message, signature }` to backend
* Show result from backend:
   * Whether the signature is valid
   * Which wallet signed it
* Allow signing multiple messages (show a local history)

**Note:** How you structure the React app is up to you — but the app complexity is high enough that good React patterns will shine through.

### 🌐 Backend (Node.js + Express – required)
* Create a REST API endpoint: `POST /verify-signature`
* Accept:
```json
{ "message": "string", "signature": "string" }
```
* Use `ethers.js` (or `viem`) to:
   * Recover the signer from the signature
   * Validate the signature
* Return:
```json
{ "isValid": true, "signer": "0xabc123...", "originalMessage": "..." }
```

## Behavior & Constraints
* Session state can be in-memory (no DB required)
* Message signing history should persist across React component state or localStorage
* No third-party signature validation services — use raw `ethers.js`, `viem` or similar in backend

## 🚀 Submission Guidelines
* Submit a **PR to the GitHub repo**
* Include:
   * Setup instructions for both frontend and backend in a README.md file
   * Notes on any trade-offs made or areas you'd improve
   * A test suite with all tests passing
* Bonus: Implement headless **multi-factor auth** to seucre the user https://docs.dynamic.xyz/headless/headless-mfa
* Bonus: Link to deployed version (e.g., Vercel frontend, Render backend)

## ✅ Evaluation Focus
| Area | Evaluated On |
|------|-------------|
| **React architecture** | Component design, state flow, hooks, separation of concerns |
| **Dynamic.xyz usage** | Clean login, wallet context management, signing flow |
| **Node.js + Express** | REST API correctness, signature validation logic, modularity |
| **Code quality** | Readability, organization, error handling, TypeScript use |
| **User experience** | Clear flows, responsive feedback, intuitive UI |
| **Extensibility** | Evidence of scalable thought (e.g., room for auth, roles, message types) |
| **Design** | Beautiful UX design skills are important to us. Make the app look and feel great |
