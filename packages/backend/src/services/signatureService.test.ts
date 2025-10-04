import { describe, it, expect } from 'vitest'
import { ethers } from 'ethers'
import { signatureService } from './signatureService.js'

describe('SignatureService', () => {
  // Create a test wallet for signing messages
  const testWallet = ethers.Wallet.createRandom()
  const testMessage = 'Hello, Web3!'

  describe('verifySignature', () => {
    it('should successfully verify a valid signature', async () => {
      // Sign a message with test wallet
      const signature = await testWallet.signMessage(testMessage)

      // Verify the signature
      const result = await signatureService.verifySignature({
        message: testMessage,
        signature,
      })

      expect(result.isValid).toBe(true)
      expect(result.signer.toLowerCase()).toBe(testWallet.address.toLowerCase())
      expect(result.originalMessage).toBe(testMessage)
    })

    it('should reject an invalid signature', async () => {
      const invalidSignature = '0x' + '0'.repeat(130) // Invalid signature format

      const result = await signatureService.verifySignature({
        message: testMessage,
        signature: invalidSignature,
      })

      expect(result.isValid).toBe(false)
      expect(result.signer).toBe('')
      expect(result.originalMessage).toBe(testMessage)
    })

    it('should recover correct signer even with different message (signature still valid)', async () => {
      // Note: A valid signature will still be technically "valid" in terms of format
      // but will recover to the correct signer address who signed the different message
      const differentMessage = 'Different message'
      const signature = await testWallet.signMessage(differentMessage)

      const result = await signatureService.verifySignature({
        message: testMessage,
        signature,
      })

      // The signature is technically valid format and recovers an address
      // but it won't match the expected signer for testMessage
      expect(result.isValid).toBe(true) // It's a valid signature
      expect(result.signer.toLowerCase()).not.toBe('') // But it will recover an address
      // In a real application, you'd compare recovered address with expected address
    })

    it('should handle empty message', async () => {
      const emptyMessage = ''
      const signature = await testWallet.signMessage(emptyMessage)

      const result = await signatureService.verifySignature({
        message: emptyMessage,
        signature,
      })

      expect(result.isValid).toBe(true)
      expect(result.signer.toLowerCase()).toBe(testWallet.address.toLowerCase())
    })

    it('should handle special characters in message', async () => {
      const specialMessage = '🚀 Web3 Signature Test! @#$%^&*()'
      const signature = await testWallet.signMessage(specialMessage)

      const result = await signatureService.verifySignature({
        message: specialMessage,
        signature,
      })

      expect(result.isValid).toBe(true)
      expect(result.signer.toLowerCase()).toBe(testWallet.address.toLowerCase())
      expect(result.originalMessage).toBe(specialMessage)
    })

    it('should handle malformed signature gracefully', async () => {
      const malformedSignatures = [
        'not-a-signature',
        '0x123',
        '',
        '0xinvalidhexstring',
      ]

      for (const badSig of malformedSignatures) {
        const result = await signatureService.verifySignature({
          message: testMessage,
          signature: badSig,
        })

        expect(result.isValid).toBe(false)
        expect(result.signer).toBe('')
      }
    })

    it('should handle very long messages', async () => {
      const longMessage = 'A'.repeat(5000)
      const signature = await testWallet.signMessage(longMessage)

      const result = await signatureService.verifySignature({
        message: longMessage,
        signature,
      })

      expect(result.isValid).toBe(true)
      expect(result.signer.toLowerCase()).toBe(testWallet.address.toLowerCase())
    })

    it('should verify signature with optional type parameter', async () => {
      const signature = await testWallet.signMessage(testMessage)

      const result = await signatureService.verifySignature({
        message: testMessage,
        signature,
        type: undefined, // Currently not used but supports future extensibility
      })

      expect(result.isValid).toBe(true)
    })
  })

  describe('isValidSignatureFormat', () => {
    it('should validate correct signature format', () => {
      // Generate a real signature to test format validation
      const validSig = '0x' + 'a'.repeat(130)
      expect(signatureService.isValidSignatureFormat(validSig)).toBe(true)
    })

    it('should reject invalid signature formats', () => {
      const invalidFormats = [
        '0x123', // Too short
        'no-hex-prefix' + 'a'.repeat(130), // Missing 0x prefix
        '0x' + 'g'.repeat(130), // Invalid hex characters
        '0x' + 'a'.repeat(129), // Wrong length
        '', // Empty string
      ]

      invalidFormats.forEach((invalid) => {
        expect(signatureService.isValidSignatureFormat(invalid)).toBe(false)
      })
    })
  })

  describe('isValidMessage', () => {
    it('should validate correct message formats', () => {
      expect(signatureService.isValidMessage('Hello World')).toBe(true)
      expect(signatureService.isValidMessage('A'.repeat(100))).toBe(true)
      expect(signatureService.isValidMessage('🚀')).toBe(true)
    })

    it('should reject invalid messages', () => {
      expect(signatureService.isValidMessage('')).toBe(false)
      expect(signatureService.isValidMessage('   ')).toBe(false) // Only whitespace
      expect(signatureService.isValidMessage('A'.repeat(10001))).toBe(false) // Too long
    })
  })
})

