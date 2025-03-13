import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Select,
  HStack,
  Circle,
} from '@chakra-ui/react'
import axios from 'axios'

interface AccessStatus {
  vpn_access: boolean
  production_group_access: boolean
  config_tool_access: boolean
  production_access_valid_until: string | null
}

interface ProfileStatus {
  current_profile: string
  is_production: boolean
  needs_switch: boolean
}

interface AccessCheckerProps {
  username: string
}

export const AccessChecker = ({ username }: AccessCheckerProps) => {
  const [environment, setEnvironment] = useState<string>('production')
  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null)
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const [accessResponse, profileResponse] = await Promise.all([
        axios.get<AccessStatus>(`http://localhost:8000/access-status/${username}?environment=${environment}`),
        axios.get<ProfileStatus>(`http://localhost:8000/profile-status/${username}?environment=${environment}`)
      ])
      setAccessStatus(accessResponse.data)
      setProfileStatus(profileResponse.data)
    } catch (err) {
      setError('Failed to fetch status. Please try again.')
      console.error('Error fetching status:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [environment])

  const getStatusColor = (status: boolean) => status ? "green.500" : "red.500"

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="blue.500" />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start" pt={8}>
      <Box 
        bg="white" 
        boxShadow="md" 
        borderRadius="md" 
        p={8} 
        width="100%" 
        maxW="600px"
      >
        <HStack spacing={4} mb={8}>
          <Text>Environment</Text>
          <Select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            width="200px"
          >
            <option value="development">Development</option>
            <option value="production">Production</option>
          </Select>
        </HStack>

        <Box mb={8}>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Access Checklist
          </Text>
          <VStack align="stretch" spacing={3}>
            {accessStatus && (
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Circle size="16px" bg={getStatusColor(accessStatus.vpn_access || false)} />
                  <Text>VPN Access</Text>
                  {!accessStatus.vpn_access && (
                    <Text as="i" color="gray.500">Please connect to the VPN</Text>
                  )}
                </HStack>

                <HStack alignItems="flex-start">
                  <Circle size="16px" bg={getStatusColor(accessStatus.production_group_access || false)} mt={1} />
                  <VStack align="flex-start" spacing={1}>
                    <Text>Production Group Access</Text>
                    {!accessStatus.production_group_access && (
                      <Text as="i" color="gray.500">
                        {environment === 'production' 
                          ? 'Request production group access from your manager'
                          : 'Request development group access from your manager'}
                      </Text>
                    )}
                  </VStack>
                </HStack>

                <HStack>
                  <Circle size="16px" bg={getStatusColor(accessStatus.config_tool_access || false)} />
                  <Text>Config Tool Access</Text>
                  {!accessStatus.config_tool_access && (
                    <Text as="i" color="gray.500">Request config tool access from your manager</Text>
                  )}
                </HStack>
              </VStack>
            )}
          </VStack>
          {environment === 'production' && accessStatus?.production_access_valid_until && (
            <Text mt={4} fontStyle="italic" color="gray.500">
              Production access valid until: {new Date(accessStatus.production_access_valid_until).toLocaleString()}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Tool Profile Checker
          </Text>
          <Text fontStyle="italic" color="gray.500">
            You are currently using the {profileStatus?.current_profile} profile. 
            {profileStatus?.needs_switch && ' Once access is granted, please switch to prod (link).'}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export default AccessChecker 