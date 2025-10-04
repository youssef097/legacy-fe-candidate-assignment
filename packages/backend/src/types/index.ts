export interface SignatureVerificationRequest {
  message: string
  signature: string
  type?: MessageType
}

export interface SignatureVerificationResponse {
  isValid: boolean
  signer: string
  originalMessage: string
}

export enum MessageType {
  SIMPLE = 'simple',
  EIP712_TYPED_DATA = 'eip712',
  PERSONAL_SIGN = 'personal_sign'
}

