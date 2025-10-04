import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express, { Express } from 'express'
import { ethers } from 'ethers'
import { signatureRoutes } from './signatureRoutes.js'
import { errorHandler } from '../middleware/errorHandler.js'

describe('Signature Routes Integration Tests', () => {
  let app: Express
  let testWallet: ethers.HDNodeWallet

  beforeAll(() => {
    // Create Express app with routes and middleware
    app = express()
    app.use(express.json())
    app.use('/api', signatureRoutes)
    app.use(errorHandler)

    // Create test wallet for signing
    testWallet = ethers.Wallet.createRandom()
  })

  describe('POST /api/verify-signature', () => {
    it('should verify a valid signature successfully', async () => {
      const message = 'Hello, Web3!'
      const signature = await testWallet.signMessage(message)

      const response = await request(app)
        .post('/api/verify-signature')
        .send({ message, signature })
        .expect(200)

      expect(response.body).toMatchObject({
        isValid: true,
        signer: testWallet.address,
        originalMessage: message,
      })
    })

    it('should reject invalid signature', async () => {
      const message = 'Hello, Web3!'
      const invalidSignature = '0x' + '0'.repeat(130)

      const response = await request(app)
        .post('/api/verify-signature')
        .send({ message, signature: invalidSignature })
        .expect(200)

      expect(response.body.isValid).toBe(false)
      expect(response.body.signer).toBe('')
    })

    it('should return 400 if message is missing', async () => {
      const response = await request(app)
        .post('/api/verify-signature')
        .send({ signature: '0x123abc' })
        .expect(400)

      expect(response.body).toMatchObject({
        error: 'Missing required fields',
        message: 'Both message and signature are required',
      })
    })

    it('should return 400 if signature is missing', async () => {
      const response = await request(app)
        .post('/api/verify-signature')
        .send({ message: 'Hello' })
        .expect(400)

      expect(response.body).toMatchObject({
        error: 'Missing required fields',
        message: 'Both message and signature are required',
      })
    })

    it('should return 400 if request body is empty', async () => {
      const response = await request(app)
        .post('/api/verify-signature')
        .send({})
        .expect(400)

      expect(response.body).toMatchObject({
        error: 'Missing required fields',
      })
    })

    it('should handle special characters in message', async () => {
      const message = '🚀 Special chars: @#$%^&*() 日本語'
      const signature = await testWallet.signMessage(message)

      const response = await request(app)
        .post('/api/verify-signature')
        .send({ message, signature })
        .expect(200)

      expect(response.body).toMatchObject({
        isValid: true,
        signer: testWallet.address,
        originalMessage: message,
      })
    })

    it('should handle very long messages', async () => {
      const message = 'A'.repeat(5000)
      const signature = await testWallet.signMessage(message)

      const response = await request(app)
        .post('/api/verify-signature')
        .send({ message, signature })
        .expect(200)

      expect(response.body.isValid).toBe(true)
      expect(response.body.signer).toBe(testWallet.address)
    })

    it('should recover signer address even with mismatched message', async () => {
      // ethers.verifyMessage will recover the signer who signed the differentMessage
      // The signature is valid, but signed for a different message
      const message = 'Original message'
      const differentMessage = 'Different message'
      const signature = await testWallet.signMessage(differentMessage)

      const response = await request(app)
        .post('/api/verify-signature')
        .send({ message, signature })
        .expect(200)

      // The verification will return valid because it successfully recovers an address
      // In production, you'd compare the recovered address with an expected address
      expect(response.body.isValid).toBe(true)
      expect(response.body.signer).toBeDefined()
      // The recovered signer won't match what you expect for 'Original message'
    })

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/verify-signature')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')

      // Express body-parser will return 400 for malformed JSON
      // However, without custom error handler it may return 500
      expect([400, 500]).toContain(response.status)
    })

    it('should accept optional type parameter', async () => {
      const message = 'Test message'
      const signature = await testWallet.signMessage(message)

      const response = await request(app)
        .post('/api/verify-signature')
        .send({ message, signature, type: 'SIMPLE' })
        .expect(200)

      expect(response.body.isValid).toBe(true)
    })

    it('should verify multiple different wallets', async () => {
      const wallet1 = ethers.Wallet.createRandom()
      const wallet2 = ethers.Wallet.createRandom()
      const message = 'Test message'

      const sig1 = await wallet1.signMessage(message)
      const sig2 = await wallet2.signMessage(message)

      const response1 = await request(app)
        .post('/api/verify-signature')
        .send({ message, signature: sig1 })
        .expect(200)

      const response2 = await request(app)
        .post('/api/verify-signature')
        .send({ message, signature: sig2 })
        .expect(200)

      expect(response1.body.isValid).toBe(true)
      expect(response2.body.isValid).toBe(true)
      expect(response1.body.signer).not.toBe(response2.body.signer)
      expect(response1.body.signer).toBe(wallet1.address)
      expect(response2.body.signer).toBe(wallet2.address)
    })
  })
})

