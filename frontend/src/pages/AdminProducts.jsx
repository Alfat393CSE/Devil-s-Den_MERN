import React, { useEffect, useState, useRef } from 'react'
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Input, useDisclosure } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

const AdminProducts = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [submissions, setSubmissions] = useState([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [rejectTarget, setRejectTarget] = useState(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) return navigate('/signin')
    try { const u = JSON.parse(raw); if (u.role !== 'admin') return navigate('/signin') } catch (e) { return navigate('/signin') }
    fetchSubmissions()
  }, [navigate])

  const fetchSubmissions = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/products/submissions', { headers: { Authorization: token ? `Bearer ${token}` : '' } })
    const data = await res.json()
    if (res.ok) setSubmissions(data.data || [])
  }

  const handleApprove = async (id) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/products/${id}/approve`, { method: 'PATCH', headers: { Authorization: token ? `Bearer ${token}` : '' } })
    const data = await res.json()
    if (!res.ok) return toast({ title: 'Error', description: data.message, status: 'error' })
    toast({ title: 'Approved', description: 'Product approved and now visible in shop', status: 'success' })
    fetchSubmissions()
  }

  const openRejectModal = (id) => {
    setRejectTarget(id)
    setReason('')
    onOpen()
  }

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/products/${rejectTarget}/reject`, { method: 'PATCH', headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: data.message, status: 'error' })
    } else {
      toast({ title: 'Rejected', description: 'Product rejected and submitter notified', status: 'info' })
      fetchSubmissions()
    }
    onClose()
    setRejectTarget(null)
    setReason('')
  }

  return (
    <Box maxW='1000px' mx='auto' p={6} bg='white' rounded='md' shadow='sm'>
      <Heading mb={4}>Submitted Products</Heading>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Price</Th>
            <Th>Submitted By</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {submissions.map(s => (
            <Tr key={s._id}>
              <Td>{s.name}</Td>
              <Td>${s.price}</Td>
              <Td>{s.submittedBy ? s.submittedBy.name || s.submittedBy.email : '—'}</Td>
              <Td>
                <Button size='sm' colorScheme='green' mr={2} onClick={() => handleApprove(s._id)}>Approve</Button>
                <Button size='sm' colorScheme='red' onClick={() => openRejectModal(s._id)}>Reject</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Submission</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder='Reason for rejection (optional)' value={reason} onChange={(e) => setReason(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={() => { onClose(); setRejectTarget(null); setReason(''); }}>Cancel</Button>
            <Button colorScheme='red' onClick={handleRejectConfirm}>Reject</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default AdminProducts
