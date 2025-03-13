import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  FormErrorMessage,
} from '@chakra-ui/react'
import axios from 'axios'

interface UserLoginProps {
  onLogin: (username: string) => void
}

const UserLogin = ({ onLogin }: UserLoginProps) => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      setIsLoading(true)
      setError('')
      try {
        // Try to fetch the user's access status to validate the username
        await axios.get(`http://localhost:8000/access-status/${username.trim()}`)
        onLogin(username.trim())
      } catch (err) {
        setError('Username not found. Please check and try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired isInvalid={!!error}>
          <FormLabel>Username</FormLabel>
          <Input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setError('')
            }}
            placeholder="Enter your username"
          />
          <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>
        <Button 
          type="submit" 
          colorScheme="blue" 
          isLoading={isLoading}
          disabled={!username.trim()}
        >
          Continue
        </Button>
      </VStack>
    </Box>
  )
}

export default UserLogin 