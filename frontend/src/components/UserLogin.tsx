import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  FormErrorMessage,
  Text,
} from '@chakra-ui/react'
import axios from 'axios'
import { API_BASE_URL } from '../config'

interface UserLoginProps {
  onLogin: (username: string) => void
}

const UserLogin = ({ onLogin }: UserLoginProps) => {
  const [username, setUsername] = useState('')
  const [users, setUsers] = useState<string[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users`)
        setUsers(response.data)
      } catch (err) {
        setError('Failed to load users. Please try again.')
      }
    }
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username) {
      setIsLoading(true)
      setError('')
      try {
        // Try to fetch the user's access status to validate the username
        await axios.get(`${API_BASE_URL}/access-status/${username}?environment=production`)
        onLogin(username)
      } catch (err) {
        setError('Failed to load user data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired isInvalid={!!error}>
          <FormLabel>Select User</FormLabel>
          <Text fontSize="sm" color="gray.500" mb={2}>
            Note: This is for demo purposes only. In production, we would use SSO etc authentication with proper auth tokens instead of passing the user's name to identify the user.
          </Text>
          <Select
            placeholder="Choose a user"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setError('')
            }}
          >
            {users.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>
        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={isLoading}
        >
          Continue
        </Button>
      </VStack>
    </Box>
  )
}

export default UserLogin 