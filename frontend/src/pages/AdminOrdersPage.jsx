import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Image,
  Spinner,
  Center,
  Icon,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  useToast,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Input,
  SimpleGrid,
  Progress,
  Flex
} from '@chakra-ui/react';
import { useOrderStore } from '../store/order';
import { FaShoppingBag, FaCheckCircle, FaClock, FaTimesCircle, FaDollarSign } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const { orders, loading, fetchAllOrders, approveOrder, rejectOrder, fetchOrderStats } = useOrderStore();
  
  // All useColorModeValue hooks must be at the top level
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const blueBg = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.700', 'gray.200');
  const greenBg = useColorModeValue('green.50', 'green.900');
  const yellowBg = useColorModeValue('yellow.50', 'yellow.900');
  const redBg = useColorModeValue('red.50', 'red.900');
  const grayBg = useColorModeValue('gray.100', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const hoverBgAlt = useColorModeValue('gray.50', 'gray.700');
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) return navigate('/signin');
    try {
      const u = JSON.parse(user);
      if (u.role !== 'admin') return navigate('/');
    } catch (e) {
      return navigate('/signin');
    }

    loadOrders();
    loadStats();
  }, [navigate]);

  const loadOrders = async () => {
    const filterObj = {};
    if (selectedStatus && selectedStatus !== 'all') {
      filterObj.status = selectedStatus;
    }
    if (filters.startDate) filterObj.startDate = filters.startDate;
    if (filters.endDate) filterObj.endDate = filters.endDate;
    await fetchAllOrders(filterObj);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    loadOrders();
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '' });
    setSelectedStatus('all');
    fetchAllOrders({});
  };

  const loadStats = async () => {
    const result = await fetchOrderStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  const handleApprove = async (orderId) => {
    const result = await approveOrder(orderId);
    if (result.success) {
      toast({
        title: 'Order Approved',
        description: 'Order has been approved successfully',
        status: 'success',
        duration: 3000
      });
      loadStats();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        status: 'error',
        duration: 3000
      });
    }
  };

  const openRejectModal = (orderId) => {
    setRejectTarget(orderId);
    setRejectionReason('');
    onOpen();
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    onDetailsOpen();
  };

  const getPaymentMethodBadge = (method) => {
    const methodConfig = {
      'bKash': { colorScheme: 'pink', icon: '💳' },
      'Nagad': { colorScheme: 'orange', icon: '💳' },
      'Rocket': { colorScheme: 'purple', icon: '💳' },
      'Card': { colorScheme: 'blue', icon: '💳' },
      'Cash on Delivery': { colorScheme: 'green', icon: '💵' }
    };

    const config = methodConfig[method] || { colorScheme: 'gray', icon: '💳' };

    return (
      <Badge colorScheme={config.colorScheme} px={2} py={1} borderRadius="md" fontSize="xs">
        {config.icon} {method}
      </Badge>
    );
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    
    const result = await rejectOrder(rejectTarget, rejectionReason);
    if (result.success) {
      toast({
        title: 'Order Rejected',
        description: 'Order has been rejected and user notified',
        status: 'info',
        duration: 3000
      });
      loadStats();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        status: 'error',
        duration: 3000
      });
    }
    
    onClose();
    setRejectTarget(null);
    setRejectionReason('');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { colorScheme: 'yellow', text: 'Pending' },
      approved: { colorScheme: 'green', text: 'Approved' },
      rejected: { colorScheme: 'red', text: 'Rejected' },
      cancelled: { colorScheme: 'gray', text: 'Cancelled' },
      completed: { colorScheme: 'blue', text: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge colorScheme={config.colorScheme} px={2} py={1} borderRadius="md">
        {config.text}
      </Badge>
    );
  };

  const handleTabChange = (index) => {
    const statuses = ['all', 'pending', 'approved', 'rejected', 'cancelled'];
    const status = statuses[index];
    setSelectedStatus(status);
    
    const filterObj = {};
    if (status !== 'all') filterObj.status = status;
    if (filters.startDate) filterObj.startDate = filters.startDate;
    if (filters.endDate) filterObj.endDate = filters.endDate;
    fetchAllOrders(filterObj);
  };

  if (loading && !orders.length) {
    return (
      <Center minH="100vh" bg={pageBg}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500">Loading orders...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} py={8}>
      <Container maxW="1400px">
        {/* Header with enhanced styling */}
        <VStack spacing={8} mb={10}>
          <Box textAlign="center" w="full">
            <HStack justify="center" spacing={4} mb={3}>
              <Box 
                p={3} 
                bg={blueBg} 
                borderRadius="xl"
                boxShadow="lg"
              >
                <Icon as={FaShoppingBag} boxSize={10} color="blue.500" />
              </Box>
              <Heading
                size="2xl"
                bgGradient="linear(to-r, blue.400, purple.600, pink.500)"
                bgClip="text"
                fontWeight="black"
                letterSpacing="tight"
              >
                Order Management
              </Heading>
            </HStack>
            <Text 
              fontSize="lg" 
              color={textColor}
              fontWeight="medium"
            >
              Track, manage, and analyze all customer orders in one place
            </Text>
          </Box>

          {/* Statistics */}
          {stats && (
            <>
              <Box 
                w="full"
                bg={bgColor}
                p={8}
                borderRadius="2xl"
                border="1px"
                borderColor={borderColor}
                shadow="2xl"
                transition="all 0.3s"
                _hover={{ shadow: '3xl', transform: 'translateY(-2px)' }}
              >
                <Heading size="md" mb={6} color={headingColor}>
                  📊 Overall Statistics
                </Heading>
                <StatGroup>
                  <Stat>
                    <StatLabel>Total Orders</StatLabel>
                    <StatNumber>{stats.totalOrders}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Pending</StatLabel>
                    <StatNumber color="yellow.500">{stats.pendingOrders}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Approved</StatLabel>
                    <StatNumber color="green.500">{stats.approvedOrders}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Rejected</StatLabel>
                    <StatNumber color="red.500">{stats.rejectedOrders}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Cancelled</StatLabel>
                    <StatNumber color="gray.500">{stats.cancelledOrders}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Revenue</StatLabel>
                    <StatNumber color="blue.500">${stats.totalRevenue.toFixed(2)}</StatNumber>
                    <StatHelpText>From approved orders</StatHelpText>
                  </Stat>
                </StatGroup>
              </Box>

              {/* Visual Status Distribution */}
              <Box
                bg={bgColor}
                p={8}
                borderRadius="2xl"
                border="1px"
                borderColor={borderColor}
                shadow="2xl"
                transition="all 0.3s"
                _hover={{ shadow: '3xl', transform: 'translateY(-2px)' }}
              >
                <HStack mb={6}>
                  <Box w={1} h={6} bg="blue.500" borderRadius="full" />
                  <Heading size="md" color={headingColor}>
                    📈 Order Status Distribution
                  </Heading>
                </HStack>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium">Pending</Text>
                    <Text fontSize="sm" color="yellow.500" fontWeight="bold">
                      {stats.totalOrders > 0 ? ((stats.pendingOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                    </Text>
                  </Flex>
                  <Progress
                    value={stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}
                    colorScheme="yellow"
                    size="lg"
                    borderRadius="full"
                  />
                </Box>

                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium">Approved</Text>
                    <Text fontSize="sm" color="green.500" fontWeight="bold">
                      {stats.totalOrders > 0 ? ((stats.approvedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                    </Text>
                  </Flex>
                  <Progress
                    value={stats.totalOrders > 0 ? (stats.approvedOrders / stats.totalOrders) * 100 : 0}
                    colorScheme="green"
                    size="lg"
                    borderRadius="full"
                  />
                </Box>

                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium">Rejected</Text>
                    <Text fontSize="sm" color="red.500" fontWeight="bold">
                      {stats.totalOrders > 0 ? ((stats.rejectedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                    </Text>
                  </Flex>
                  <Progress
                    value={stats.totalOrders > 0 ? (stats.rejectedOrders / stats.totalOrders) * 100 : 0}
                    colorScheme="red"
                    size="lg"
                    borderRadius="full"
                  />
                </Box>

                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium">Cancelled</Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="bold">
                      {stats.totalOrders > 0 ? ((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                    </Text>
                  </Flex>
                  <Progress
                    value={stats.totalOrders > 0 ? (stats.cancelledOrders / stats.totalOrders) * 100 : 0}
                    colorScheme="gray"
                    size="lg"
                    borderRadius="full"
                  />
                </Box>
              </VStack>
            </Box>

            {/* Revenue and Success Metrics */}
            <Box
              bg={bgColor}
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              shadow="sm"
            >
              <Heading size="sm" mb={4}>Performance Metrics</Heading>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center" p={4} bg={greenBg} borderRadius="md">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.600">Success Rate</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      {stats.totalOrders > 0 
                        ? ((stats.approvedOrders / stats.totalOrders) * 100).toFixed(1)
                        : 0}%
                    </Text>
                  </VStack>
                  <Icon as={FaCheckCircle} boxSize={8} color="green.500" />
                </Flex>

                <Flex justify="space-between" align="center" p={4} bg={blueBg} borderRadius="md">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.600">Average Order Value</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                      ${stats.approvedOrders > 0 
                        ? (stats.totalRevenue / stats.approvedOrders).toFixed(2)
                        : '0.00'}
                    </Text>
                  </VStack>
                  <Icon as={FaDollarSign} boxSize={8} color="blue.500" />
                </Flex>

                <Flex justify="space-between" align="center" p={4} bg={yellowBg} borderRadius="md">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.600">Pending Review</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                      {stats.pendingOrders}
                    </Text>
                  </VStack>
                  <Icon as={FaClock} boxSize={8} color="yellow.500" />
                </Flex>
              </VStack>
            </Box>
            </>
          )}

          {/* Date Range Filters */}
          <Box
            bg={bgColor}
            p={8}
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            shadow="2xl"
            transition="all 0.3s"
            _hover={{ shadow: '3xl' }}
          >
            <VStack spacing={6} align="stretch">
              <HStack>
                <Box w={1} h={6} bg="teal.500" borderRadius="full" />
                <Heading size="md" color={headingColor}>
                  🗓️ Filter by Date Range
                </Heading>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <Text fontSize="sm" mb={2} fontWeight="medium">Start Date</Text>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    size="md"
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" mb={2} fontWeight="medium">End Date</Text>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    size="md"
                  />
                </Box>
              </SimpleGrid>
              <HStack spacing={3} justify="flex-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  size="md"
                  colorScheme="gray"
                  leftIcon={<Icon as={FaTimesCircle} />}
                  _hover={{ bg: hoverBg, transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                >
                  Clear Filters
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={applyFilters}
                  size="md"
                  leftIcon={<Icon as={FaCheckCircle} />}
                  bgGradient="linear(to-r, blue.400, blue.600)"
                  _hover={{ bgGradient: 'linear(to-r, blue.500, blue.700)', transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                  boxShadow="md"
                >
                  Apply Filters
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Quick Overview - Recent Activity */}
          {orders.length > 0 && (
            <Box
              bg={bgColor}
              p={8}
              borderRadius="2xl"
              border="1px"
              borderColor={borderColor}
              shadow="2xl"
              transition="all 0.3s"
              _hover={{ shadow: '3xl' }}
            >
              <HStack justify="space-between" mb={6}>
                <HStack>
                  <Box w={1} h={6} bg="orange.500" borderRadius="full" />
                  <Heading size="md" color={headingColor}>
                    ⚡ Recent Order Activity
                  </Heading>
                </HStack>
                <Badge 
                  colorScheme="blue" 
                  fontSize="md" 
                  px={4} 
                  py={2} 
                  borderRadius="full"
                  boxShadow="md"
                >
                  {orders.length} Total Orders
                </Badge>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Box p={4} bg={yellowBg} borderRadius="md" borderLeft="4px" borderColor="yellow.500">
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Icon as={FaClock} color="yellow.500" />
                      <Text fontSize="xs" fontWeight="medium" color="gray.600">PENDING</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                      {orders.filter(o => o.status === 'pending').length}
                    </Text>
                    <Text fontSize="xs" color="gray.500">Awaiting approval</Text>
                  </VStack>
                </Box>

                <Box p={4} bg={greenBg} borderRadius="md" borderLeft="4px" borderColor="green.500">
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Icon as={FaCheckCircle} color="green.500" />
                      <Text fontSize="xs" fontWeight="medium" color="gray.600">APPROVED</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                      {orders.filter(o => o.status === 'approved').length}
                    </Text>
                    <Text fontSize="xs" color="gray.500">Successfully processed</Text>
                  </VStack>
                </Box>

                <Box p={4} bg={redBg} borderRadius="md" borderLeft="4px" borderColor="red.500">
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Icon as={FaTimesCircle} color="red.500" />
                      <Text fontSize="xs" fontWeight="medium" color="gray.600">REJECTED</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="red.600">
                      {orders.filter(o => o.status === 'rejected').length}
                    </Text>
                    <Text fontSize="xs" color="gray.500">Not approved</Text>
                  </VStack>
                </Box>

                <Box p={4} bg={grayBg} borderRadius="md" borderLeft="4px" borderColor="gray.500">
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Icon as={FaTimesCircle} color="gray.500" />
                      <Text fontSize="xs" fontWeight="medium" color="gray.600">CANCELLED</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.600">
                      {orders.filter(o => o.status === 'cancelled').length}
                    </Text>
                    <Text fontSize="xs" color="gray.500">User cancelled</Text>
                  </VStack>
                </Box>
              </SimpleGrid>

              {/* Total Revenue from Current View */}
              <Box mt={4} p={4} bg={blueBg} borderRadius="md">
                <Flex justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Revenue from Current View</Text>
                    <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                      ${orders
                        .filter(o => o.status === 'approved')
                        .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
                        .toFixed(2)}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      From {orders.filter(o => o.status === 'approved').length} approved orders
                    </Text>
                  </VStack>
                  <Icon as={FaDollarSign} boxSize={12} color="blue.400" opacity={0.3} />
                </Flex>
              </Box>
            </Box>
          )}
        </VStack>

        {/* Orders Tabs */}
        <Box 
          bg={bgColor} 
          borderRadius="2xl" 
          border="1px" 
          borderColor={borderColor} 
          overflow="hidden"
          shadow="2xl"
          transition="all 0.3s"
          _hover={{ shadow: '3xl' }}
        >
          <Tabs onChange={handleTabChange} variant="enclosed" colorScheme="blue">
            <TabList borderBottom="2px" borderColor={borderColor}>
              <Tab 
                _selected={{ 
                  color: 'blue.500', 
                  borderColor: 'blue.500',
                  borderBottomColor: bgColor,
                  fontWeight: 'bold'
                }}
                _hover={{ bg: hoverBgAlt }}
                transition="all 0.2s"
              >
                All Orders
              </Tab>
              <Tab 
                _selected={{ 
                  color: 'yellow.500', 
                  borderColor: 'yellow.500',
                  borderBottomColor: bgColor,
                  fontWeight: 'bold'
                }}
                _hover={{ bg: hoverBgAlt }}
                transition="all 0.2s"
              >
                ⏳ Pending
              </Tab>
              <Tab 
                _selected={{ 
                  color: 'green.500', 
                  borderColor: 'green.500',
                  borderBottomColor: bgColor,
                  fontWeight: 'bold'
                }}
                _hover={{ bg: hoverBgAlt }}
                transition="all 0.2s"
              >
                ✅ Approved
              </Tab>
              <Tab 
                _selected={{ 
                  color: 'red.500', 
                  borderColor: 'red.500',
                  borderBottomColor: bgColor,
                  fontWeight: 'bold'
                }}
                _hover={{ bg: hoverBgAlt }}
                transition="all 0.2s"
              >
                ❌ Rejected
              </Tab>
              <Tab 
                _selected={{ 
                  color: 'gray.500', 
                  borderColor: 'gray.500',
                  borderBottomColor: bgColor,
                  fontWeight: 'bold'
                }}
                _hover={{ bg: hoverBgAlt }}
                transition="all 0.2s"
              >
                🚫 Cancelled
              </Tab>
            </TabList>

            <TabPanels>
              {[0, 1, 2, 3, 4].map((tabIndex) => (
                <TabPanel key={tabIndex} p={0}>
                  {orders.length === 0 ? (
                    <Box p={12} textAlign="center">
                      <Icon as={FaShoppingBag} boxSize={16} color="gray.300" mb={4} />
                      <Heading size="md" mb={2} color="gray.500">
                        No orders found
                      </Heading>
                      <Text color="gray.400">
                        {selectedStatus === 'pending' && 'No pending orders at the moment'}
                        {selectedStatus === 'approved' && 'No approved orders yet'}
                        {selectedStatus === 'rejected' && 'No rejected orders'}
                        {selectedStatus === 'cancelled' && 'No cancelled orders'}
                        {selectedStatus === 'all' && 'No orders have been placed yet'}
                      </Text>
                    </Box>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple" size="md">
                        <Thead bg={hoverBgAlt}>
                          <Tr>
                            <Th fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Order ID</Th>
                            <Th fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Customer</Th>
                            <Th fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Items</Th>
                            <Th fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Payment Method</Th>
                            <Th isNumeric fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Total</Th>
                            <Th fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Date</Th>
                            <Th fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Status</Th>
                            <Th fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {orders.map((order) => (
                            <Tr 
                              key={order._id}
                              _hover={{ bg: hoverBgAlt }}
                              transition="all 0.2s"
                            >
                              <Td fontFamily="mono" fontSize="sm" fontWeight="bold" color="blue.500">
                                #{order._id.slice(-6).toUpperCase()}
                              </Td>
                              <Td>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="semibold">
                                    {order.user?.name || order.user?.username || 'Unknown'}
                                  </Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {order.user?.email}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td>
                                <Text>{order.items.length} items</Text>
                                {order.items.slice(0, 2).map((item, idx) => (
                                  <Text key={idx} fontSize="xs" color="gray.500">
                                    {item.product?.name} (x{item.quantity})
                                  </Text>
                                ))}
                                {order.items.length > 2 && (
                                  <Text fontSize="xs" color="gray.400">
                                    +{order.items.length - 2} more
                                  </Text>
                                )}
                              </Td>
                              <Td>
                                {getPaymentMethodBadge(order.paymentMethod)}
                                {order.paymentDetails?.transactionId && (
                                  <Text fontSize="xs" color="gray.500" mt={1}>
                                    TxID: {order.paymentDetails.transactionId.slice(0, 10)}...
                                  </Text>
                                )}
                              </Td>
                              <Td isNumeric fontWeight="bold" color="blue.500">
                                ${order.totalAmount.toFixed(2)}
                              </Td>
                              <Td fontSize="sm">
                                {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                              </Td>
                              <Td>{getStatusBadge(order.status)}</Td>
                              <Td>
                                <VStack align="start" spacing={2}>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    colorScheme="blue"
                                    onClick={() => openOrderDetails(order)}
                                    fontSize="xs"
                                  >
                                    📄 View Details
                                  </Button>
                                  {order.status === 'pending' && (
                                    <HStack spacing={2}>
                                      <Button
                                        size="xs"
                                        colorScheme="green"
                                        onClick={() => handleApprove(order._id)}
                                        leftIcon={<Icon as={FaCheckCircle} />}
                                        _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                                        transition="all 0.2s"
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="xs"
                                        colorScheme="red"
                                        onClick={() => openRejectModal(order._id)}
                                        leftIcon={<Icon as={FaTimesCircle} />}
                                        _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                                        transition="all 0.2s"
                                      >
                                        Reject
                                      </Button>
                                    </HStack>
                                  )}
                                </VStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>

        {/* Order Details Modal */}
        <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="4xl" isCentered scrollBehavior="inside">
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent borderRadius="xl" shadow="2xl" maxH="90vh">
            <ModalHeader 
              bgGradient="linear(to-r, blue.500, purple.600)" 
              color="white"
              borderTopRadius="xl"
              py={4}
            >
              <HStack>
                <Icon as={FaShoppingBag} />
                <Text>Order Details</Text>
                {selectedOrder && (
                  <Badge colorScheme="white" variant="outline" fontSize="md" px={3} py={1}>
                    #{selectedOrder._id.slice(-6).toUpperCase()}
                  </Badge>
                )}
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody py={6}>
              {selectedOrder && (
                <VStack align="stretch" spacing={6}>
                  {/* Order Status and Date */}
                  <Box p={4} bg={hoverBgAlt} borderRadius="md">
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.500" mb={1}>Status</Text>
                        {getStatusBadge(selectedOrder.status)}
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500" mb={1}>Order Date</Text>
                        <Text fontWeight="semibold">
                          {format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm')}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500" mb={1}>Total Amount</Text>
                        <Text fontWeight="bold" fontSize="xl" color="blue.500">
                          ${selectedOrder.totalAmount.toFixed(2)}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  {/* Customer Information */}
                  <Box>
                    <Heading size="sm" mb={3} color={headingColor}>
                      👤 Customer Information
                    </Heading>
                    <Box p={4} bg={blueBg} borderRadius="md" borderLeft="4px" borderColor="blue.500">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Name</Text>
                          <Text fontWeight="semibold">
                            {selectedOrder.user?.name || selectedOrder.user?.username || 'Unknown'}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Email</Text>
                          <Text fontWeight="semibold">{selectedOrder.user?.email}</Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  </Box>

                  {/* Shipping Address */}
                  <Box>
                    <Heading size="sm" mb={3} color={headingColor}>
                      📦 Shipping Address
                    </Heading>
                    <Box p={4} bg={greenBg} borderRadius="md" borderLeft="4px" borderColor="green.500">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Full Name</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress?.fullName}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Phone</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress?.phone}</Text>
                        </Box>
                        <Box gridColumn={{ md: 'span 2' }}>
                          <Text fontSize="sm" color="gray.500">Street Address</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress?.street}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">City</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress?.city}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">State</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress?.state || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">ZIP Code</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress?.zipCode}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Country</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress?.country}</Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  </Box>

                  {/* Payment Information */}
                  <Box>
                    <Heading size="sm" mb={3} color={headingColor}>
                      💳 Payment Information
                    </Heading>
                    <Box p={4} bg={yellowBg} borderRadius="md" borderLeft="4px" borderColor="yellow.500">
                      <VStack align="stretch" spacing={3}>
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={1}>Payment Method</Text>
                          {getPaymentMethodBadge(selectedOrder.paymentMethod)}
                        </Box>
                        {selectedOrder.paymentDetails?.transactionId && (
                          <Box p={3} bg="yellow.100" borderRadius="md" border="2px dashed" borderColor="yellow.400">
                            <Text fontSize="sm" color="gray.600" mb={1}>Transaction ID</Text>
                            <Text fontWeight="bold" fontSize="lg" color="gray.800" fontFamily="mono">
                              {selectedOrder.paymentDetails.transactionId}
                            </Text>
                          </Box>
                        )}
                        {selectedOrder.paymentDetails?.senderNumber && (
                          <Box>
                            <Text fontSize="sm" color="gray.500">Sender Number</Text>
                            <Text fontWeight="semibold">{selectedOrder.paymentDetails.senderNumber}</Text>
                          </Box>
                        )}
                        {selectedOrder.paymentDetails?.receiverNumber && (
                          <Box>
                            <Text fontSize="sm" color="gray.500">Receiver Number</Text>
                            <Text fontWeight="semibold">{selectedOrder.paymentDetails.receiverNumber}</Text>
                          </Box>
                        )}
                        {selectedOrder.paymentDetails?.paymentNote && (
                          <Box>
                            <Text fontSize="sm" color="gray.500">Payment Note</Text>
                            <Text fontWeight="semibold">{selectedOrder.paymentDetails.paymentNote}</Text>
                          </Box>
                        )}
                        <Box>
                          <Text fontSize="sm" color="gray.500">Payment Status</Text>
                          <Badge colorScheme={selectedOrder.paymentStatus === 'verified' ? 'green' : 'yellow'}>
                            {selectedOrder.paymentStatus}
                          </Badge>
                        </Box>
                      </VStack>
                    </Box>
                  </Box>

                  {/* Order Items */}
                  <Box>
                    <Heading size="sm" mb={3} color={headingColor}>
                      🛍️ Order Items ({selectedOrder.items.length})
                    </Heading>
                    <VStack align="stretch" spacing={3}>
                      {selectedOrder.items.map((item, idx) => (
                        <Box key={idx} p={4} bg={hoverBgAlt} borderRadius="md" border="1px" borderColor={borderColor}>
                          <HStack spacing={4}>
                            {item.product?.image && (
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                boxSize="60px"
                                objectFit="cover"
                                borderRadius="md"
                              />
                            )}
                            <Box flex={1}>
                              <Text fontWeight="semibold">{item.product?.name || 'Product Name'}</Text>
                              <HStack spacing={4} mt={1}>
                                <Text fontSize="sm" color="gray.500">Qty: {item.quantity}</Text>
                                <Text fontSize="sm" color="gray.500">Price: ${item.price.toFixed(2)}</Text>
                                <Text fontSize="sm" fontWeight="bold" color="blue.500">
                                  Total: ${(item.quantity * item.price).toFixed(2)}
                                </Text>
                              </HStack>
                            </Box>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>

                  {/* Admin Notes and Rejection Reason */}
                  {(selectedOrder.adminNotes || selectedOrder.rejectionReason) && (
                    <Box>
                      <Heading size="sm" mb={3} color={headingColor}>
                        📝 Admin Notes
                      </Heading>
                      <Box p={4} bg={redBg} borderRadius="md" borderLeft="4px" borderColor="red.500">
                        {selectedOrder.rejectionReason && (
                          <Box mb={selectedOrder.adminNotes ? 3 : 0}>
                            <Text fontSize="sm" color="gray.500">Rejection Reason</Text>
                            <Text fontWeight="semibold" color="red.600">{selectedOrder.rejectionReason}</Text>
                          </Box>
                        )}
                        {selectedOrder.adminNotes && (
                          <Box>
                            <Text fontSize="sm" color="gray.500">Admin Notes</Text>
                            <Text fontWeight="semibold">{selectedOrder.adminNotes}</Text>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Approval Information */}
                  {selectedOrder.approvedBy && (
                    <Box>
                      <Heading size="sm" mb={3} color={headingColor}>
                        ✅ Approval Information
                      </Heading>
                      <Box p={4} bg={greenBg} borderRadius="md" borderLeft="4px" borderColor="green.500">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Approved By</Text>
                            <Text fontWeight="semibold">
                              {selectedOrder.approvedBy?.name || selectedOrder.approvedBy?.username || 'Admin'}
                            </Text>
                          </Box>
                          {selectedOrder.approvedAt && (
                            <Box>
                              <Text fontSize="sm" color="gray.500">Approved At</Text>
                              <Text fontWeight="semibold">
                                {format(new Date(selectedOrder.approvedAt), 'MMM dd, yyyy HH:mm')}
                              </Text>
                            </Box>
                          )}
                        </SimpleGrid>
                      </Box>
                    </Box>
                  )}

                  {/* Action Buttons for Pending Orders */}
                  {selectedOrder.status === 'pending' && (
                    <HStack spacing={4} justify="center" pt={4}>
                      <Button
                        colorScheme="green"
                        size="lg"
                        leftIcon={<Icon as={FaCheckCircle} />}
                        onClick={() => {
                          handleApprove(selectedOrder._id);
                          onDetailsClose();
                        }}
                        _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                        transition="all 0.2s"
                      >
                        Approve Order
                      </Button>
                      <Button
                        colorScheme="red"
                        size="lg"
                        leftIcon={<Icon as={FaTimesCircle} />}
                        onClick={() => {
                          onDetailsClose();
                          openRejectModal(selectedOrder._id);
                        }}
                        _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                        transition="all 0.2s"
                      >
                        Reject Order
                      </Button>
                    </HStack>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter bg={hoverBgAlt} borderBottomRadius="xl">
              <Button
                variant="ghost"
                onClick={onDetailsClose}
                _hover={{ bg: grayBg }}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Reject Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent borderRadius="xl" shadow="2xl">
            <ModalHeader 
              bgGradient="linear(to-r, red.500, pink.500)" 
              color="white"
              borderTopRadius="xl"
              py={4}
            >
              <HStack>
                <Icon as={FaTimesCircle} />
                <Text>Reject Order</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody py={6}>
              <VStack align="stretch" spacing={4}>
                <Text fontWeight="medium" color={headingColor}>
                  Please provide a reason for rejecting this order:
                </Text>
                <Textarea
                  placeholder="Enter rejection reason (optional but recommended)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  borderRadius="md"
                  focusBorderColor="red.400"
                  _focus={{ shadow: 'md' }}
                />
              </VStack>
            </ModalBody>
            <ModalFooter bg={hoverBgAlt} borderBottomRadius="xl">
              <Button
                variant="ghost"
                mr={3}
                onClick={() => {
                  onClose();
                  setRejectTarget(null);
                  setRejectionReason('');
                }}
                _hover={{ bg: grayBg }}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleRejectConfirm}
                leftIcon={<Icon as={FaTimesCircle} />}
                _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                Reject Order
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Order Details Modal */}
        <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="4xl" scrollBehavior="inside">
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent borderRadius="xl" shadow="2xl">
            <ModalHeader 
              bgGradient="linear(to-r, blue.500, purple.500)" 
              color="white"
              borderTopRadius="xl"
              py={4}
            >
              <HStack>
                <Icon as={FaShoppingBag} />
                <Text>Order Details</Text>
                {selectedOrder && (
                  <Badge colorScheme="white" variant="solid" fontSize="sm" ml={2}>
                    #{selectedOrder._id.slice(-6).toUpperCase()}
                  </Badge>
                )}
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody py={6}>
              {selectedOrder && (
                <VStack align="stretch" spacing={6}>
                  {/* Status and Date */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box p={4} bg={blueBg} borderRadius="md">
                      <Text fontSize="sm" color="gray.600" mb={1}>Order Status</Text>
                      {getStatusBadge(selectedOrder.status)}
                    </Box>
                    <Box p={4} bg={blueBg} borderRadius="md">
                      <Text fontSize="sm" color="gray.600" mb={1}>Order Date</Text>
                      <Text fontWeight="semibold">
                        {format(new Date(selectedOrder.createdAt), 'PPP p')}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {/* Customer Information */}
                  <Box p={4} bg={bgColor} borderRadius="md" border="1px" borderColor={borderColor}>
                    <Heading size="sm" mb={3}>👤 Customer Information</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Name</Text>
                        <Text fontWeight="semibold">
                          {selectedOrder.user?.name || selectedOrder.user?.username || 'N/A'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Email</Text>
                        <Text fontWeight="semibold">{selectedOrder.user?.email || 'N/A'}</Text>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  {/* Shipping Address */}
                  <Box p={4} bg={bgColor} borderRadius="md" border="1px" borderColor={borderColor}>
                    <Heading size="sm" mb={3}>📍 Shipping Address</Heading>
                    {selectedOrder.shippingAddress ? (
                      <VStack align="stretch" spacing={2}>
                        <HStack>
                          <Text fontSize="sm" color="gray.600" w="120px">Full Name:</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress.fullName}</Text>
                        </HStack>
                        <HStack>
                          <Text fontSize="sm" color="gray.600" w="120px">Phone:</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress.phone}</Text>
                        </HStack>
                        <HStack align="start">
                          <Text fontSize="sm" color="gray.600" w="120px">Street:</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress.street}</Text>
                        </HStack>
                        <HStack>
                          <Text fontSize="sm" color="gray.600" w="120px">City:</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress.city}</Text>
                        </HStack>
                        {selectedOrder.shippingAddress.state && (
                          <HStack>
                            <Text fontSize="sm" color="gray.600" w="120px">State:</Text>
                            <Text fontWeight="semibold">{selectedOrder.shippingAddress.state}</Text>
                          </HStack>
                        )}
                        <HStack>
                          <Text fontSize="sm" color="gray.600" w="120px">ZIP Code:</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress.zipCode}</Text>
                        </HStack>
                        <HStack>
                          <Text fontSize="sm" color="gray.600" w="120px">Country:</Text>
                          <Text fontWeight="semibold">{selectedOrder.shippingAddress.country}</Text>
                        </HStack>
                      </VStack>
                    ) : (
                      <Text color="gray.500">No shipping address provided</Text>
                    )}
                  </Box>

                  {/* Payment Information */}
                  <Box p={4} bg={bgColor} borderRadius="md" border="1px" borderColor={borderColor}>
                    <Heading size="sm" mb={3}>💳 Payment Information</Heading>
                    <VStack align="stretch" spacing={3}>
                      <HStack>
                        <Text fontSize="sm" color="gray.600" w="150px">Payment Method:</Text>
                        {getPaymentMethodBadge(selectedOrder.paymentMethod)}
                      </HStack>
                      
                      {selectedOrder.paymentDetails?.transactionId && (
                        <Box p={3} bg={yellowBg} borderRadius="md" borderLeft="4px" borderColor="yellow.500">
                          <Text fontSize="sm" color="gray.600" mb={1}>Transaction ID</Text>
                          <Text fontWeight="bold" fontFamily="mono" fontSize="md" color="yellow.700">
                            {selectedOrder.paymentDetails.transactionId}
                          </Text>
                        </Box>
                      )}
                      
                      {selectedOrder.paymentDetails?.senderNumber && (
                        <HStack>
                          <Text fontSize="sm" color="gray.600" w="150px">Sender Number:</Text>
                          <Text fontWeight="semibold" fontFamily="mono">
                            {selectedOrder.paymentDetails.senderNumber}
                          </Text>
                        </HStack>
                      )}
                      
                      {selectedOrder.paymentDetails?.receiverNumber && (
                        <HStack>
                          <Text fontSize="sm" color="gray.600" w="150px">Receiver Number:</Text>
                          <Text fontWeight="semibold" fontFamily="mono">
                            {selectedOrder.paymentDetails.receiverNumber}
                          </Text>
                        </HStack>
                      )}
                      
                      {selectedOrder.paymentDetails?.paymentNote && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>Payment Note:</Text>
                          <Text fontWeight="semibold" fontSize="sm">
                            {selectedOrder.paymentDetails.paymentNote}
                          </Text>
                        </Box>
                      )}

                      <HStack>
                        <Text fontSize="sm" color="gray.600" w="150px">Payment Status:</Text>
                        <Badge 
                          colorScheme={
                            selectedOrder.paymentStatus === 'verified' ? 'green' :
                            selectedOrder.paymentStatus === 'paid' ? 'blue' :
                            selectedOrder.paymentStatus === 'failed' ? 'red' : 'yellow'
                          }
                        >
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Order Items */}
                  <Box p={4} bg={bgColor} borderRadius="md" border="1px" borderColor={borderColor}>
                    <Heading size="sm" mb={3}>🛍️ Order Items</Heading>
                    <VStack align="stretch" spacing={3}>
                      {selectedOrder.items.map((item, idx) => (
                        <Flex 
                          key={idx} 
                          p={3} 
                          bg={hoverBgAlt} 
                          borderRadius="md" 
                          justify="space-between"
                          align="center"
                        >
                          <HStack spacing={3}>
                            {item.product?.image && (
                              <Image 
                                src={item.product.image} 
                                alt={item.product.name}
                                boxSize="50px"
                                objectFit="cover"
                                borderRadius="md"
                              />
                            )}
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold">{item.product?.name || 'Unknown Product'}</Text>
                              <Text fontSize="sm" color="gray.500">
                                Quantity: {item.quantity} × ${item.price.toFixed(2)}
                              </Text>
                            </VStack>
                          </HStack>
                          <Text fontWeight="bold" color="blue.500">
                            ${(item.quantity * item.price).toFixed(2)}
                          </Text>
                        </Flex>
                      ))}
                      
                      {/* Total */}
                      <Box pt={3} borderTop="2px" borderColor={borderColor}>
                        <Flex justify="space-between" align="center">
                          <Heading size="md">Total Amount</Heading>
                          <Heading size="lg" color="blue.500">
                            ${selectedOrder.totalAmount.toFixed(2)}
                          </Heading>
                        </Flex>
                      </Box>
                    </VStack>
                  </Box>

                  {/* Admin Notes & Rejection Reason */}
                  {(selectedOrder.adminNotes || selectedOrder.rejectionReason) && (
                    <Box p={4} bg={redBg} borderRadius="md" border="1px" borderColor="red.300">
                      <Heading size="sm" mb={3}>📝 Admin Notes</Heading>
                      {selectedOrder.rejectionReason && (
                        <Box mb={2}>
                          <Text fontSize="sm" color="gray.600">Rejection Reason:</Text>
                          <Text fontWeight="semibold" color="red.600">
                            {selectedOrder.rejectionReason}
                          </Text>
                        </Box>
                      )}
                      {selectedOrder.adminNotes && (
                        <Box>
                          <Text fontSize="sm" color="gray.600">Notes:</Text>
                          <Text fontWeight="semibold">{selectedOrder.adminNotes}</Text>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Approval Info */}
                  {selectedOrder.approvedBy && (
                    <Box p={4} bg={greenBg} borderRadius="md" border="1px" borderColor="green.300">
                      <Heading size="sm" mb={3}>✅ Approval Information</Heading>
                      <VStack align="stretch" spacing={2}>
                        <HStack>
                          <Text fontSize="sm" color="gray.600" w="120px">Approved By:</Text>
                          <Text fontWeight="semibold">
                            {selectedOrder.approvedBy.name || selectedOrder.approvedBy.username}
                          </Text>
                        </HStack>
                        {selectedOrder.approvedAt && (
                          <HStack>
                            <Text fontSize="sm" color="gray.600" w="120px">Approved At:</Text>
                            <Text fontWeight="semibold">
                              {format(new Date(selectedOrder.approvedAt), 'PPP p')}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  {selectedOrder.status === 'pending' && (
                    <Box p={4} bg={yellowBg} borderRadius="md" border="1px" borderColor="yellow.300">
                      <Heading size="sm" mb={3}>⚡ Quick Actions</Heading>
                      <HStack spacing={3}>
                        <Button
                          colorScheme="green"
                          onClick={() => {
                            handleApprove(selectedOrder._id);
                            onDetailsClose();
                          }}
                          leftIcon={<Icon as={FaCheckCircle} />}
                          flex={1}
                        >
                          Approve Order
                        </Button>
                        <Button
                          colorScheme="red"
                          onClick={() => {
                            onDetailsClose();
                            openRejectModal(selectedOrder._id);
                          }}
                          leftIcon={<Icon as={FaTimesCircle} />}
                          flex={1}
                        >
                          Reject Order
                        </Button>
                      </HStack>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter bg={hoverBgAlt} borderBottomRadius="xl">
              <Button
                onClick={onDetailsClose}
                colorScheme="blue"
                variant="ghost"
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default AdminOrdersPage;

