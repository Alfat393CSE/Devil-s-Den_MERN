import React, { useState } from 'react'
import { Box, Heading, FormControl, Input, Textarea, Button, useToast } from '@chakra-ui/react'
import { useProductStore } from '../store/product'

const SellPage = () => {
  const [form, setForm] = useState({ name: '', price: '', image: '', description: '' })
  const toast = useToast()
  const submitProduct = useProductStore(state => state.submitProduct)

  const handleSubmit = async () => {
    const { success, message } = await submitProduct({ name: form.name, price: Number(form.price), image: form.image, description: form.description })
    if (!success) return toast({ title: 'Error', description: message, status: 'error' })
    toast({ title: 'Submitted', description: 'Your product was submitted for review. Admin will approve it.', status: 'success' })
    setForm({ name: '', price: '', image: '', description: '' })
  }

  return (
    <Box p={6} maxW='700px' mx='auto'>
      <Heading mb={4}>Sell a product</Heading>
      <FormControl mb={3}>
        <Input placeholder='Product name' value={form.name} onChange={(e) => setForm(s => ({...s, name: e.target.value}))} />
      </FormControl>
      <FormControl mb={3}>
        <Input placeholder='Price' type='number' value={form.price} onChange={(e) => setForm(s => ({...s, price: e.target.value}))} />
      </FormControl>
      <FormControl mb={3}>
        <Input placeholder='Image URL' value={form.image} onChange={(e) => setForm(s => ({...s, image: e.target.value}))} />
      </FormControl>
      <FormControl mb={3}>
        <Textarea placeholder='Description' value={form.description} onChange={(e) => setForm(s => ({...s, description: e.target.value}))} />
      </FormControl>
      <Button colorScheme='teal' onClick={handleSubmit}>Submit for review</Button>
    </Box>
  )
}

export default SellPage
