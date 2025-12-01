import React, { useEffect, useState, useRef } from 'react'
import { 
  Box, 
  Heading, 
  Button, 
  useToast, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton, 
  Input, 
  useDisclosure,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Text,
  VStack,
  HStack,
  Badge,
  Textarea,
  useColorModeValue,
  Spinner,
  Divider,
  Avatar,
  IconButton,
  Tooltip
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { CheckIcon, CloseIcon } from '@chakra-ui/icons'

const AdminProducts = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [rejectTarget, setRejectTarget] = useState(null)
  const [reason, setReason] = useState('')

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) return navigate('/signin')
    try { const u = JSON.parse(raw); if (u.role !== 'admin') return navigate('/signin') } catch (e) { return navigate('/signin') }
    fetchSubmissions()
  }, [navigate])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/products/submissions', { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      const data = await res.json()
      if (res.ok) setSubmissions(data.data || [])
      else throw new Error(data.message)
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to load submissions', status: 'error', duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/products/${id}/approve`, { method: 'PATCH', headers: { Authorization: token ? `Bearer ${token}` : '' } })
    const data = await res.json()
    if (!res.ok) return toast({ title: 'Error', description: data.message, status: 'error', duration: 3000 })
    toast({ title: 'Approved', description: 'Product approved and now visible in shop', status: 'success', duration: 3000 })
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
      toast({ title: 'Error', description: data.message, status: 'error', duration: 3000 })
    } else {
      toast({ title: 'Rejected', description: 'Product rejected and submitter notified', status: 'info', duration: 3000 })
      fetchSubmissions()
    }
    onClose()
    setRejectTarget(null)
    setReason('')
  }

  if (loading) {
    return (
      <Box maxW='1400px' mx='auto' mt={8} p={6}>
        <HStack justify="center" py={10}>
          <Spinner size='xl' />
          <Text ml={4}>Loading submissions...</Text>
        </HStack>
      </Box>
    )
  }

  return (
    <Box maxW='1400px' mx='auto' mt={8} p={6}>
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size='xl'>Review Product Submissions</Heading>
          <Text color="gray.600">Approve or reject products submitted by users</Text>
        </VStack>
        <Button onClick={fetchSubmissions} colorScheme="blue">Refresh</Button>
      </HStack>

      {submissions.length === 0 ? (
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack py={10}>
              <Text fontSize="xl" color="gray.500">No pending product submissions</Text>
              <Text color="gray.400">All products have been reviewed</Text>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {submissions.map(product => (
            <Card key={product._id} bg={cardBg} borderWidth="1px" borderColor={borderColor} overflow="hidden">
              <Image 
                src={product.image} 
                alt={product.name}
                h="200px"
                w="100%"
                objectFit="cover"
                fallbackSrc="https://via.placeholder.com/400x300?text=No+Image"
              />
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Heading size="md" noOfLines={2}>{product.name}</Heading>
                  
                  <HStack justify="space-between">
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      ${product.price.toFixed(2)}
                    </Text>
                    <Badge colorScheme="blue" fontSize="sm">
                      Stock: {product.stock || 0}
                    </Badge>
                  </HStack>

                  {product.description && (
                    <Text color="gray.600" fontSize="sm" noOfLines={3}>
                      {product.description}
                    </Text>
                  )}

                  <Divider />

                  <HStack>
                    <Avatar size="sm" name={product.submittedBy?.name || 'User'} />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {product.submittedBy?.name || 'Unknown User'}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {product.submittedBy?.email || 'No email'}
                      </Text>
                    </VStack>
                  </HStack>

                  <Text fontSize="xs" color="gray.500">
                    Submitted: {new Date(product.createdAt).toLocaleDateString()}
                  </Text>

                  <HStack spacing={2} pt={2}>
                    <Tooltip label="Approve Product">
                      <Button 
                        leftIcon={<CheckIcon />}
                        colorScheme='green' 
                        flex={1}
                        onClick={() => handleApprove(product._id)}
                      >
                        Approve
                      </Button>
                    </Tooltip>
                    <Tooltip label="Reject Product">
                      <Button 
                        leftIcon={<CloseIcon />}
                        colorScheme='red' 
                        flex={1}
                        onClick={() => openRejectModal(product._id)}
                      >
                        Reject
                      </Button>
                    </Tooltip>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Product Submission</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Provide a reason for rejection (optional). The submitter will be notified.
              </Text>
              <Textarea 
                placeholder='e.g., Product does not meet quality standards, inappropriate content, etc.' 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={() => { onClose(); setRejectTarget(null); setReason(''); }}>Cancel</Button>
            <Button colorScheme='red' onClick={handleRejectConfirm}>Confirm Rejection</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default AdminProducts
