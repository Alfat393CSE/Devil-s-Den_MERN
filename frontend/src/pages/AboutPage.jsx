import React from 'react'
import { Box, Heading, Text, SimpleGrid, Avatar, VStack } from '@chakra-ui/react'

const team = [
  { name: 'Alice Admin', role: 'Founder' },
  { name: 'Bob Builder', role: 'Developer' },
  { name: 'Carla Designer', role: 'Designer' },
]

const AboutPage = () => {
  return (
    <Box p={6} maxW="1000px" mx="auto">
      <Box mb={6} p={6} borderRadius='md' bgGradient='linear(to-r, teal.50, white)'>
        <Heading>About Us</Heading>
        <Text mt={2} color='gray.600'>We build simple, clear examples to help you learn how a full-stack MERN app fits together.</Text>
      </Box>

      <Heading size='md' mb={4}>Our Team</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {team.map((t) => (
          <Box key={t.name} p={4} borderWidth='1px' borderRadius='md' bg='white' boxShadow='sm'>
            <VStack>
              <Avatar name={t.name} />
              <Heading size='sm'>{t.name}</Heading>
              <Text color='gray.500'>{t.role}</Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default AboutPage
