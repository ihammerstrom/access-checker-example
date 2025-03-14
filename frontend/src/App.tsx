import { useState, useEffect } from 'react'
import { ChakraProvider, Box, Container, Heading, Text, HStack, Avatar, Flex, Select, useToast } from '@chakra-ui/react'
import { theme } from '@chakra-ui/react'
import { AccessChecker, UserLogin } from './components'
import axios from 'axios'

function App() {
  const [username, setUsername] = useState<string>('')
  const [users, setUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/users')
        setUsers(response.data)
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to load users',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }
    fetchUsers()
  }, [])

  const handleUserChange = async (newUsername: string) => {
    if (newUsername === username) return // Don't update if same user selected
    
    setIsLoading(true)
    try {
      await axios.get(`http://localhost:8000/access-status/${newUsername}?environment=production`)
      setUsername(newUsername)
      toast({
        title: 'Success',
        description: `Switched to user: ${newUsername}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ChakraProvider theme={theme}>
      <Box bg="white" minH="100vh">
        <Container maxW="480px" pt={16}>
          <Flex justify="space-between" align="center" mb={12}>
            <Heading as="h1" size="xl">
              On Call Access Checker
            </Heading>
            {username && (
              <HStack spacing={2}>
                <Avatar size="sm" name={username} bg="blue.500" color="white" />
                <Select
                  size="sm"
                  value={username}
                  onChange={(e) => handleUserChange(e.target.value)}
                  width="150px"
                  isDisabled={isLoading}
                >
                  {users.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </Select>
              </HStack>
            )}
          </Flex>
          
          {!username ? (
            <UserLogin onLogin={setUsername} />
          ) : (
            <AccessChecker key={username} username={username} />
          )}
        </Container>
      </Box>
    </ChakraProvider>
  )
}

export default App
