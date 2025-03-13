import { useState } from 'react'
import { ChakraProvider, Box, Container, Heading, Text, HStack, Avatar, Flex } from '@chakra-ui/react'
import { theme } from '@chakra-ui/react'
import { AccessChecker, UserLogin } from './components'

function App() {
  const [username, setUsername] = useState<string>('')

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
                <Text fontSize="sm" color="gray.600">
                  {username}
                </Text>
              </HStack>
            )}
          </Flex>
          
          {!username ? (
            <UserLogin onLogin={setUsername} />
          ) : (
            <AccessChecker username={username} />
          )}
        </Container>
      </Box>
    </ChakraProvider>
  )
}

export default App
