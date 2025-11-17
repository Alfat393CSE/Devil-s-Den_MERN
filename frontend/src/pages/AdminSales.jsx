import React, { useEffect, useState } from 'react'
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

const AdminSales = () => {
  const navigate = useNavigate()
  const [sales, setSales] = useState([])

  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) return navigate('/signin')
    try { const u = JSON.parse(raw); if (u.role !== 'admin') return navigate('/signin') } catch (e) { return navigate('/signin') }
    fetchSales()
  }, [navigate])

  const fetchSales = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/purchases', { headers: { Authorization: token ? `Bearer ${token}` : '' } })
    const data = await res.json()
    if (res.ok) setSales(data.data || [])
  }

  return (
    <Box maxW='1000px' mx='auto' p={6} bg='white' rounded='md' shadow='sm'>
      <Heading mb={4}>Sales</Heading>
      <Text mb={4}>Recent purchases recorded in the system.</Text>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Product</Th>
            <Th>Price</Th>
            <Th>Buyer</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sales.map(s => (
            <Tr key={s._id}>
              <Td>{s.product ? s.product.name : '—'}</Td>
              <Td>${s.product ? s.product.price : s.price}</Td>
              <Td>{s.buyer ? (s.buyer.name || s.buyer.email) : '—'}</Td>
              <Td>{new Date(s.createdAt).toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default AdminSales
