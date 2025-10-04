import { Router } from 'express'
import { signatureController } from '../controllers/signatureController.js'

const router = Router()

router.post('/verify-signature', signatureController.verifySignature)

export { router as signatureRoutes }
