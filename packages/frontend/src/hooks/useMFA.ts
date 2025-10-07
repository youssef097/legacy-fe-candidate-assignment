import { useState, useEffect, useCallback, useRef } from 'react'
import { useMfa, useIsLoggedIn, useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { MFADevice } from '@dynamic-labs/sdk-api-core'

interface MfaRegisterData {
  uri: string
  secret: string
}

type MfaView = 'devices' | 'qr-code' | 'otp' | 'backup-codes'

export const useMFA = () => {
  const {
    addDevice: addDeviceDynamic,
    authDevice,
    getUserDevices,
    getRecoveryCodes,
    completeAcknowledgement
  } = useMfa()
  
  const isLogged = useIsLoggedIn()
  const { userWithMissingInfo } = useDynamicContext()

  const [devices, setDevices] = useState<MFADevice[]>([])
  const [mfaRegisterData, setMfaRegisterData] = useState<MfaRegisterData | null>(null)
  const [currentView, setCurrentView] = useState<MfaView>('devices')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const handlingMfaFlow = useRef(false)
  const mfaFlowHandled = useRef(false)

  const refreshDevices = useCallback(async () => {
    if (!isLogged || handlingMfaFlow.current) return

    try {
      handlingMfaFlow.current = true
      const userDevices = await getUserDevices()
      setDevices(userDevices)
    } catch (err) {
      console.error('Failed to fetch MFA devices:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch devices')
    } finally {
      handlingMfaFlow.current = false
    }
  }, [isLogged, getUserDevices])

  const hasInitializedDevices = useRef(false)
  
  useEffect(() => {
    if (isLogged && !hasInitializedDevices.current) {
      hasInitializedDevices.current = true
      refreshDevices()
    } else if (!isLogged) {
      setDevices([])
      setMfaRegisterData(null)
      setBackupCodes([])
      setError(null)
      setIsModalOpen(false)
      mfaFlowHandled.current = false
      handlingMfaFlow.current = false
      hasInitializedDevices.current = false
    }
  }, [isLogged, refreshDevices])

  useEffect(() => {
    const checkMfaRequired = async () => {
      if (userWithMissingInfo?.scope?.includes('requiresAdditionalAuth') && !mfaFlowHandled.current) {
        mfaFlowHandled.current = true
        setError(null)
        setMfaRegisterData(null)
        setCurrentView('otp')
        setIsModalOpen(true)
      }
    }
    
    checkMfaRequired()
  }, [userWithMissingInfo])

  const addDevice = async (): Promise<MfaRegisterData> => {
    try {
      setError(null)
      const { uri, secret } = await addDeviceDynamic()
      const registerData = { secret, uri }
      setMfaRegisterData(registerData)
      setCurrentView('qr-code')
      return registerData
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add device'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  const verifyDevice = async (code: string): Promise<void> => {
    try {
      setError(null)
      await authDevice(code)
      const codes = await getRecoveryCodes()
      setBackupCodes(codes)
      setCurrentView('backup-codes')
      await refreshDevices()
      mfaFlowHandled.current = false
      handlingMfaFlow.current = false
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid verification code'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  const deleteDevice = async (_deviceId: string): Promise<void> => {
    try {
      setError(null)
      throw new Error('Device deletion must be done through the Dynamic dashboard.')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete device'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  const acknowledgeBackupCodes = (): void => {
    completeAcknowledgement()
    setCurrentView('devices')
    setMfaRegisterData(null)
    setBackupCodes([])
  }

  const openModal = async (): Promise<void> => {
    setError(null)
    setCurrentView('devices')
    setIsModalOpen(true)
    
    if (devices.length === 0 && isLogged) {
      await refreshDevices()
    }
  }

  const closeModal = (): void => {
    setIsModalOpen(false)
    setError(null)
    setTimeout(() => {
      setMfaRegisterData(null)
      setCurrentView('devices')
    }, 300)
  }

  return {
    devices,
    addDevice,
    verifyDevice,
    deleteDevice,
    refreshDevices,
    isModalOpen,
    openModal,
    closeModal,
    mfaRegisterData,
    currentView,
    setCurrentView,
    backupCodes,
    acknowledgeBackupCodes,
    error,
    clearError: () => setError(null)
  }
}

