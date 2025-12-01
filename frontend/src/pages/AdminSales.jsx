import React, { useEffect, useState, useRef, useMemo } from 'react'
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  Spinner,
  useToast,
  Badge,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  IconButton,
  Tooltip,
  HStack,
  VStack,
  Collapse,
  Divider,
  Checkbox,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Input,
  Select,
  CardHeader,
  Progress,
  Flex,
  Tag
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { DeleteIcon, ChevronDownIcon, ChevronUpIcon, DownloadIcon } from '@chakra-ui/icons'
import { FaShoppingCart, FaDollarSign, FaChartLine, FaCalendarAlt, FaBoxes, FaTrophy } from 'react-icons/fa'

const AdminSales = () => {
  const navigate = useNavigate()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSale, setExpandedSale] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedSales, setSelectedSales] = useState([])
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })
  const [statusFilter, setStatusFilter] = useState('all')
  const cancelRef = useRef()
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const cardBg = useColorModeValue('gray.50', 'gray.700')

  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) return navigate('/signin')
    try {
      const u = JSON.parse(raw)
      if (u.role !== 'admin') return navigate('/signin')
    } catch (e) {
      return navigate('/signin')
    }
    fetchSales()
  }, [navigate])

  const fetchSales = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/purchases', {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (res.ok) {
        setSales(data.data || [])
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to load sales',
          status: 'error',
          duration: 3000,
          isClosable: true
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/purchases/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Sale deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
        setSales(sales.filter(s => s._id !== deleteId))
        setDeleteId(null)
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to delete sale',
          status: 'error',
          duration: 3000,
          isClosable: true
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedSales.length === 0) return

    setIsDeleting(true)
    try {
      const token = localStorage.getItem('token')
      const deletePromises = selectedSales.map(saleId =>
        fetch(`/api/purchases/${saleId}`, {
          method: 'DELETE',
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
      )

      const results = await Promise.all(deletePromises)
      const allSuccessful = results.every(res => res.ok)

      if (allSuccessful) {
        toast({
          title: 'Success',
          description: `${selectedSales.length} sale(s) deleted successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true
        })
        setSales(sales.filter(s => !selectedSales.includes(s._id)))
        setSelectedSales([])
        setShowBulkDelete(false)
      } else {
        toast({
          title: 'Partial Success',
          description: 'Some sales could not be deleted',
          status: 'warning',
          duration: 3000,
          isClosable: true
        })
        fetchSales()
        setSelectedSales([])
        setShowBulkDelete(false)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSelectSale = (saleId) => {
    setSelectedSales(prev =>
      prev.includes(saleId)
        ? prev.filter(id => id !== saleId)
        : [...prev, saleId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedSales.length === sales.length) {
      setSelectedSales([])
    } else {
      setSelectedSales(sales.map(s => s._id))
    }
  }

  const toggleExpand = (saleId) => {
    setExpandedSale(expandedSale === saleId ? null : saleId)
  }

  const calculateTotal = (sale) => {
    if (sale.totalAmount) return sale.totalAmount
    if (sale.items && Array.isArray(sale.items)) {
      return sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }
    return 0
  }

  // Filtered sales based on date and status
  const filteredSales = useMemo(() => {
    let filtered = [...sales]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter)
    }

    // Date range filter
    if (dateFilter.start) {
      const startDate = new Date(dateFilter.start)
      filtered = filtered.filter(sale => new Date(sale.createdAt) >= startDate)
    }
    if (dateFilter.end) {
      const endDate = new Date(dateFilter.end)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(sale => new Date(sale.createdAt) <= endDate)
    }

    return filtered
  }, [sales, statusFilter, dateFilter])

  const totalRevenue = filteredSales.reduce((sum, s) => sum + calculateTotal(s), 0)
  const avgOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0
  const totalItems = filteredSales.reduce((sum, s) => sum + (s.items?.length || 0), 0)

  // Product performance analysis
  const productPerformance = useMemo(() => {
    const productMap = new Map()
    
    filteredSales.forEach(sale => {
      sale.items?.forEach(item => {
        const productName = item.product?.name || 'Unknown Product'
        const productId = item.product?._id || 'unknown'
        
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            name: productName,
            quantity: 0,
            revenue: 0
          })
        }
        
        const product = productMap.get(productId)
        product.quantity += item.quantity
        product.revenue += (item.price || item.product?.price || 0) * item.quantity
      })
    })
    
    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [filteredSales])

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Items', 'Total Amount', 'Status', 'Date']
    const rows = filteredSales.map(sale => [
      sale._id,
      sale.user?.name || '',
      sale.user?.email || '',
      sale.items?.length || 0,
      calculateTotal(sale).toFixed(2),
      sale.status || 'completed',
      new Date(sale.createdAt).toLocaleString()
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: 'Export Successful',
      description: 'Sales data exported to CSV',
      status: 'success',
      duration: 3000
    })
  }

  const clearFilters = () => {
    setDateFilter({ start: '', end: '' })
    setStatusFilter('all')
  }

  if (loading) {
    return (
      <Box maxW='1400px' mx='auto' mt={8} p={6}>
        <HStack justify="center" py={10}>
          <Spinner size='xl' />
          <Text ml={4}>Loading sales data...</Text>
        </HStack>
      </Box>
    )
  }

  return (
    <Box maxW='1400px' mx='auto' mt={8} p={6}>
      <VStack align='stretch' spacing={6}>
        {/* Header */}
        <HStack justify='space-between' flexWrap="wrap" gap={4}>
          <VStack align='start' spacing={1}>
            <Heading size='xl'>Sales Management</Heading>
            <Text color='gray.600'>View and manage all sales transactions</Text>
          </VStack>
          <HStack spacing={2} flexWrap="wrap">
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme='green'
              onClick={exportToCSV}
              borderRadius='xl'
              isDisabled={filteredSales.length === 0}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
            >
              Export CSV
            </Button>
            {selectedSales.length > 0 && (
              <Button
                colorScheme='red'
                leftIcon={<DeleteIcon />}
                onClick={() => setShowBulkDelete(true)}
                borderRadius='xl'
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg'
                }}
              >
                Delete ({selectedSales.length})
              </Button>
            )}
            <Button 
              colorScheme='blue' 
              onClick={fetchSales}
              borderRadius='xl'
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
            >
              Refresh
            </Button>
          </HStack>
        </HStack>

        {/* Filters Section */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <Icon as={FaCalendarAlt} color="blue.500" />
                <Heading size='md'>Filters</Heading>
              </HStack>
              {(dateFilter.start || dateFilter.end || statusFilter !== 'all') && (
                <Button size="sm" variant="ghost" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Start Date</Text>
                <Input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                  size="md"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>End Date</Text>
                <Input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                  size="md"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Status</Text>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="md"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </Box>
            </SimpleGrid>
            {(dateFilter.start || dateFilter.end || statusFilter !== 'all') && (
              <HStack mt={4} spacing={2}>
                <Text fontSize="sm" color="gray.600">Active filters:</Text>
                {dateFilter.start && (
                  <Tag colorScheme="blue" size="sm">
                    From: {new Date(dateFilter.start).toLocaleDateString()}
                  </Tag>
                )}
                {dateFilter.end && (
                  <Tag colorScheme="blue" size="sm">
                    To: {new Date(dateFilter.end).toLocaleDateString()}
                  </Tag>
                )}
                {statusFilter !== 'all' && (
                  <Tag colorScheme="purple" size="sm">
                    Status: {statusFilter}
                  </Tag>
                )}
              </HStack>
            )}
          </CardBody>
        </Card>

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <StatLabel>Total Sales</StatLabel>
                  <Icon as={FaShoppingCart} boxSize={6} color="blue.500" />
                </HStack>
                <StatNumber fontSize="3xl">{filteredSales.length}</StatNumber>
                <StatHelpText>
                  {sales.length !== filteredSales.length ? `of ${sales.length} total` : 'All time transactions'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <StatLabel>Total Revenue</StatLabel>
                  <Icon as={FaDollarSign} boxSize={6} color="green.500" />
                </HStack>
                <StatNumber fontSize="3xl" color="green.500">
                  ${totalRevenue.toFixed(2)}
                </StatNumber>
                <StatHelpText>Earnings from sales</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <StatLabel>Avg Order Value</StatLabel>
                  <Icon as={FaChartLine} boxSize={6} color="purple.500" />
                </HStack>
                <StatNumber fontSize="3xl" color="purple.500">
                  ${avgOrderValue.toFixed(2)}
                </StatNumber>
                <StatHelpText>{totalItems} items sold</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <StatLabel>Total Items</StatLabel>
                  <Icon as={FaBoxes} boxSize={6} color="orange.500" />
                </HStack>
                <StatNumber fontSize="3xl" color="orange.500">
                  {totalItems}
                </StatNumber>
                <StatHelpText>Products sold</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Top Products Section */}
        {productPerformance.length > 0 && (
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack>
                <Icon as={FaTrophy} color="yellow.500" boxSize={5} />
                <Heading size='md'>Top Selling Products</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {productPerformance.map((product, index) => (
                  <Box key={index}>
                    <Flex justify="space-between" mb={2}>
                      <HStack>
                        <Badge colorScheme={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'}>
                          #{index + 1}
                        </Badge>
                        <Text fontWeight="medium">{product.name}</Text>
                      </HStack>
                      <HStack spacing={4}>
                        <Text fontSize="sm" color="gray.600">
                          {product.quantity} sold
                        </Text>
                        <Text fontWeight="bold" color="green.500">
                          ${product.revenue.toFixed(2)}
                        </Text>
                      </HStack>
                    </Flex>
                    <Progress
                      value={(product.revenue / productPerformance[0].revenue) * 100}
                      colorScheme={index === 0 ? 'green' : 'blue'}
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Selection Badge */}
        {selectedSales.length > 0 && (
          <Badge colorScheme='blue' fontSize='md' px={4} py={2} borderRadius='full' alignSelf='start'>
            {selectedSales.length} sale(s) selected
          </Badge>
        )}

        {/* Sales Table */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>

            {filteredSales.length === 0 ? (
              <VStack py={10}>
                <Text fontSize='xl' color='gray.500'>
                  {sales.length === 0 ? 'No sales history found' : 'No sales match your filters'}
                </Text>
                <Text color='gray.400'>
                  {sales.length === 0 
                    ? 'Sales will appear here once customers make purchases' 
                    : 'Try adjusting your date range or status filter'}
                </Text>
                {sales.length > 0 && (
                  <Button size="sm" onClick={clearFilters} colorScheme="blue" mt={2}>
                    Clear Filters
                  </Button>
                )}
              </VStack>
            ) : (
              <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>
                <Checkbox
                  isChecked={selectedSales.length === filteredSales.length && filteredSales.length > 0}
                  isIndeterminate={selectedSales.length > 0 && selectedSales.length < filteredSales.length}
                  onChange={toggleSelectAll}
                  colorScheme='blue'
                />
              </Th>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Total Amount</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredSales.map(sale => (
              <React.Fragment key={sale._id}>
                <Tr>
                  <Td>
                    <Checkbox
                      isChecked={selectedSales.includes(sale._id)}
                      onChange={() => toggleSelectSale(sale._id)}
                      colorScheme='blue'
                    />
                  </Td>
                  <Td>
                    <Tooltip label='Click to view details'>
                      <HStack spacing={2} cursor='pointer' onClick={() => toggleExpand(sale._id)}>
                        <IconButton
                          size='xs'
                          icon={expandedSale === sale._id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                          variant='ghost'
                          aria-label='Expand'
                        />
                        <Text fontSize='sm' fontFamily='mono'>
                          {sale._id.substring(0, 8)}...
                        </Text>
                      </HStack>
                    </Tooltip>
                  </Td>
                  <Td>
                    <VStack align='start' spacing={0}>
                      <Text fontWeight='medium'>{sale.user?.name || '—'}</Text>
                      <Text fontSize='sm' color='gray.500'>
                        {sale.user?.email || '—'}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>{sale.items?.length || 0} item(s)</Td>
                  <Td fontWeight='bold'>${calculateTotal(sale).toFixed(2)}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        sale.status === 'completed' ? 'green' :
                        sale.status === 'pending' ? 'yellow' : 'red'
                      }
                    >
                      {sale.status || 'completed'}
                    </Badge>
                  </Td>
                  <Td>{new Date(sale.createdAt).toLocaleString()}</Td>
                  <Td>
                    <Tooltip label='Delete sale'>
                      <IconButton
                        size='sm'
                        colorScheme='red'
                        icon={<DeleteIcon />}
                        onClick={() => setDeleteId(sale._id)}
                        aria-label='Delete'
                      />
                    </Tooltip>
                  </Td>
                </Tr>
                <Tr>
                  <Td colSpan={8} p={0}>
                    <Collapse in={expandedSale === sale._id}>
                      <Box bg='gray.50' p={4} borderTop='1px' borderColor='gray.200'>
                        <Heading size='sm' mb={3}>Order Details</Heading>
                        <Divider mb={3} />
                        {sale.items && sale.items.length > 0 ? (
                          <Table size='sm' variant='simple'>
                            <Thead>
                              <Tr>
                                <Th>Product</Th>
                                <Th isNumeric>Quantity</Th>
                                <Th isNumeric>Price</Th>
                                <Th isNumeric>Subtotal</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {sale.items.map((item, idx) => (
                                <Tr key={idx}>
                                  <Td>{item.product?.name || 'Product deleted'}</Td>
                                  <Td isNumeric>{item.quantity}</Td>
                                  <Td isNumeric>${(item.price || item.product?.price || 0).toFixed(2)}</Td>
                                  <Td isNumeric fontWeight='medium'>
                                    ${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        ) : (
                          <Text color='gray.500'>No items in this order</Text>
                        )}
                      </Box>
                    </Collapse>
                  </Td>
                </Tr>
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deleteId}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteId(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Sale
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this sale record? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={handleDelete}
                ml={3}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={showBulkDelete}
        leastDestructiveRef={cancelRef}
        onClose={() => setShowBulkDelete(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius='2xl' mx={4}>
            <AlertDialogHeader
              fontSize='xl'
              fontWeight='bold'
              bgGradient='linear(to-r, red.500, pink.500)'
              color='white'
              borderTopRadius='2xl'
              py={4}
            >
              Delete Multiple Sales
            </AlertDialogHeader>

            <AlertDialogBody py={6}>
              <VStack spacing={3} align='start'>
                <Text>
                  Are you sure you want to delete <strong>{selectedSales.length}</strong> selected sale record(s)?
                </Text>
                <Text color='red.500' fontWeight='semibold'>
                  ⚠️ This action cannot be undone.
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button
                ref={cancelRef}
                onClick={() => setShowBulkDelete(false)}
                borderRadius='xl'
                variant='ghost'
              >
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={handleBulkDelete}
                isLoading={isDeleting}
                loadingText='Deleting...'
                borderRadius='xl'
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg'
                }}
              >
                Delete {selectedSales.length} Sale(s)
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default AdminSales
