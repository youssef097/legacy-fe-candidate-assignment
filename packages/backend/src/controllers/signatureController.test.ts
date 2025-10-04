import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { signatureController } from './signatureController.js'
import { signatureService } from '../services/signatureService.js'

// Mock the signature service
vi.mock('../services/signatureService.js', () => ({
  signatureService: {
    verifySignature: vi.fn(),
  },
}))

describe('SignatureController', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Setup mock request, response, and next function
    mockRequest = {
      body: {},
    }

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }

    mockNext = vi.fn()
  })

  describe('verifySignature', () => {
    it('should successfully verify a valid signature', async () => {
      const testMessage = 'Hello, Web3!'
      const testSignature = '0x123abc...'
      const testSigner = '0xabc123...'

      mockRequest.body = {
        message: testMessage,
        signature: testSignature,
      }

      // Mock successful verification
      const mockResult = {
        isValid: true,
        signer: testSigner,
        originalMessage: testMessage,
      }

      vi.mocked(signatureService.verifySignature).mockResolvedValue(mockResult)

      await signatureController.verifySignature(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(signatureService.verifySignature).toHaveBeenCalledWith({
        message: testMessage,
        signature: testSignature,
        type: undefined,
      })

      expect(mockResponse.json).toHaveBeenCalledWith(mockResult)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return 400 if message is missing', async () => {
      mockRequest.body = {
        signature: '0x123abc...',
      }

      await signatureController.verifySignature(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        message: 'Both message and signature are required',
      })
      expect(signatureService.verifySignature).not.toHaveBeenCalled()
    })

    it('should return 400 if signature is missing', async () => {
      mockRequest.body = {
        message: 'Hello, Web3!',
      }

      await signatureController.verifySignature(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        message: 'Both message and signature are required',
      })
      expect(signatureService.verifySignature).not.toHaveBeenCalled()
    })

    it('should return 400 if both message and signature are missing', async () => {
      mockRequest.body = {}

      await signatureController.verifySignature(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        message: 'Both message and signature are required',
      })
    })

    it('should handle optional type parameter', async () => {
      mockRequest.body = {
        message: 'Test message',
        signature: '0x123abc...',
        type: 'SIMPLE',
      }

      const mockResult = {
        isValid: true,
        signer: '0xabc...',
        originalMessage: 'Test message',
      }

      vi.mocked(signatureService.verifySignature).mockResolvedValue(mockResult)

      await signatureController.verifySignature(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(signatureService.verifySignature).toHaveBeenCalledWith({
        message: 'Test message',
        signature: '0x123abc...',
        type: 'SIMPLE',
      })

      expect(mockResponse.json).toHaveBeenCalledWith(mockResult)
    })

    it('should handle verification failure gracefully', async () => {
      mockRequest.body = {
        message: 'Test message',
        signature: 'invalid-signature',
      }

      const mockResult = {
        isValid: false,
        signer: '',
        originalMessage: 'Test message',
      }

      vi.mocked(signatureService.verifySignature).mockResolvedValue(mockResult)

      await signatureController.verifySignature(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.json).toHaveBeenCalledWith(mockResult)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should call next with error if service throws', async () => {
      mockRequest.body = {
        message: 'Test message',
        signature: '0x123abc...',
      }

      const testError = new Error('Service error')
      vi.mocked(signatureService.verifySignature).mockRejectedValue(testError)

      await signatureController.verifySignature(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith(testError)
      expect(mockResponse.json).not.toHaveBeenCalled()
    })

    it('should handle empty string values', async () => {
      mockRequest.body = {
        message: '',
        signature: '',
      }

      await signatureController.verifySignature(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      // Empty strings are falsy, so should return 400
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        message: 'Both message and signature are required',
      })
    })
  })
})

