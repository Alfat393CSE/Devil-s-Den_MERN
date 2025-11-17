import React, { useState } from 'react'
import { Box, Heading, Text, FormControl, Input, Textarea, Button, VStack, useToast } from '@chakra-ui/react'

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const toast = useToast()

  const handleSubmit = () => {
    toast({ title: 'Message sent', description: 'Thanks — we will get back to you shortly.', status: 'success', duration: 3000 })
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <Box p={6} maxW="700px" mx="auto">
      <Heading mb={4}>Contact</Heading>
      <Text mb={4}>Have a question? Send us a message and we’ll respond as soon as we can.</Text>
      <VStack spacing={3} align='stretch'>
        <FormControl>
          <Input placeholder='Your name' value={form.name} onChange={(e) => setForm(s => ({...s, name: e.target.value}))} />
        </FormControl>
        <FormControl>
          <Input placeholder='Your email' value={form.email} onChange={(e) => setForm(s => ({...s, email: e.target.value}))} />
        </FormControl>
        <FormControl>
          <Textarea placeholder='Message' value={form.message} onChange={(e) => setForm(s => ({...s, message: e.target.value}))} />
        </FormControl>
        <Button colorScheme='teal' onClick={handleSubmit}>Send Message</Button>
      </VStack>
    </Box>
  )
}

export default ContactPage
