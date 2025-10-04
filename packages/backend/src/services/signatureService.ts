import { ethers } from 'ethers'
import type { SignatureVerificationRequest, SignatureVerificationResponse, MessageType } from '@web3-signer/shared'

/**
 * Signature verification service
 * 
 * Current: Supports simple message signing (ethers.signMessage)
 * Future extensibility:
 * - EIP-712 typed data signing
 * - Multi-signature verification
 * - Signature caching for performance
 * 
 * Architecture note: Could use Strategy pattern for different signature types:
 * Map<MessageType, SignatureStrategy> to handle each verification method
 */
export const signatureService = {
  /**
   * Verify a signature
   * Currently handles simple personal_sign messages
   * 
   * @param request - Signature verification request with optional type field
   * @returns Verification result with signer address
   */
  async verifySignature(request: SignatureVerificationRequest): Promise<SignatureVerificationResponse> {
    const { message, signature, type } = request

    // Future: Switch based on message type
    // switch(type) {
    //   case MessageType.EIP712_TYPED_DATA: return this.verifyEIP712(request)
    //   case MessageType.PERSONAL_SIGN: return this.verifyPersonalSign(request)
    //   default: return this.verifySimple(request)
    // }

    try {
      const messageHash = ethers.hashMessage(message)
      const recoveredAddress = ethers.verifyMessage(message, signature)
      const isValid = ethers.verifyMessage(message, signature) === recoveredAddress

      return {
        isValid,
        signer: recoveredAddress,
        originalMessage: message
      }
    } catch (error) {
      console.error('Signature verification error:', error)
      
      return {
        isValid: false,
        signer: '',
        originalMessage: message
      }
    }
  },

  isValidSignatureFormat(signature: string): boolean {
    const signatureRegex = /^0x[a-fA-F0-9]{130}$/
    return signatureRegex.test(signature)
  },

  isValidMessage(message: string): boolean {
    return message.trim().length > 0 && message.length <= 10000
  }
}
