import { Request, Response, NextFunction } from 'express'
import { signatureService } from '@services/signatureService'
import type { SignatureVerificationRequest, SignatureVerificationResponse } from '../types'

/**
 * Signature verification controller
 * 
 * Future middleware pipeline could include:
 * - authenticate: Verify JWT/session
 * - authorize: Check user permissions
 * - validateRequest: Schema validation (Zod/Joi)
 * - rateLimit: Per-user rate limiting
 * - auditLog: Track all signature verifications
 * 
 * Example route with full middleware:
 * router.post('/verify', authenticate, authorize(['user']), validateRequest(schema), auditLog, verifySignature)
 */
export const signatureController = {
  async verifySignature(req: Request, res: Response, next: NextFunction) {
    try {
      // Future: Extract user from req.user (populated by auth middleware)
      // const user = req.user as User;
      
      const { message, signature, type }: SignatureVerificationRequest = req.body
      
      if (!message || !signature) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Both message and signature are required'
        })
      }

      const result: SignatureVerificationResponse = await signatureService.verifySignature({
        message,
        signature,
        type
      })

      // Future: Save to database via repository pattern
      // if (result.isValid && user) {
      //   await messageRepository.save({
      //     id: uuidv4(),
      //     message,
      //     signature,
      //     signer: result.signer,
      //     timestamp: Date.now(),
      //     verified: true,
      //     type: type || MessageType.SIMPLE
      //   });
      // }

      res.json(result)
    } catch (error) {
      next(error)
    }
  }
}
