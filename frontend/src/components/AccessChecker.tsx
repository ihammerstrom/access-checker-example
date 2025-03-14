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
  Link,
  Button,
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'

interface AccessStatus {
  vpn_access: boolean
  production_group_access: boolean
  config_tool_access: boolean
  production_access_valid_until: string | null
}

interface ProfileStatus {
  needs_switch: boolean
  profile_status_message: string
  current_profile: string
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
  const [refreshing, setRefreshing] = useState(false)
  const toast = useToast()

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

  const handleRefreshAccess = async () => {
    setRefreshing(true)
    try {
      await axios.post(`http://localhost:8000/refresh-production-access/${username}`)
      toast({
        title: 'Success',
        description: 'Production access refreshed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      await checkStatus() // Refresh the status display
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.detail || 'Failed to refresh production access',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [environment])

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
          {accessStatus && (
            <VStack spacing={4} align="stretch">
              <HStack>
                <Circle size="16px" bg={accessStatus.vpn_access ? "green.500" : "red.500"} />
                <Text>VPN Access</Text>
                {!accessStatus.vpn_access && (
                  <Text as="i" color="gray.500">Please connect to the VPN</Text>
                )}
              </HStack>

              <HStack alignItems="flex-start">
                <Circle size="16px" bg={accessStatus.production_group_access ? "green.500" : "red.500"} mt={1} />
                <VStack align="flex-start" spacing={1}>
                  <Text>{environment === 'development' ? 'Development Group Access' : 'Production Group Access'}</Text>
                  {!accessStatus.production_group_access && environment === 'production' && (
                    <HStack spacing={2}>
                      <Text as="i" color="gray.500">
                        Request production group access:
                      </Text>
                      {accessStatus.production_access_valid_until === null && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={handleRefreshAccess}
                          isLoading={refreshing}
                          width="210px"
                        >
                          Refresh Access
                        </Button>
                      )}
                    </HStack>
                  )}
                </VStack>
              </HStack>

              <HStack>
                <Circle size="16px" bg={accessStatus.config_tool_access ? "green.500" : "red.500"} />
                <Text>Config Tool Access</Text>
                {!accessStatus.config_tool_access && (
                  <Text as="i" color="gray.500">
                    Request config tool access from the{' '}
                    <Link href="https://access.example.com" color="blue.500" isExternal>
                      access managment tool
                    </Link>
                  </Text>
                )}
              </HStack>
            </VStack>
          )}
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
          {profileStatus && (
            <Text 
              fontStyle="italic" 
              color={(environment === "production" ? profileStatus.current_profile === "prod" : profileStatus.current_profile === "dev") 
                ? "green.500" 
                : "red.500"
              }
            >
              {profileStatus.profile_status_message}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default AccessChecker 