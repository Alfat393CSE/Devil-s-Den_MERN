import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Image,
  Divider,
  Spinner,
  Center,
  Icon,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Input,
  Select,
  SimpleGrid,
  Checkbox,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { useOrderStore } from '../store/order';
import { FaShoppingBag, FaCheckCircle, FaClock, FaTimesCircle, FaTrash, FaTrashAlt } from 'react-icons/fa';
import { format } from 'date-fns';

const OrderHistoryPage = () => {
  const { orders, loading, fetchUserOrders, cancelOrder, deleteOrder, deleteMultipleOrders } = useOrderStore();
  
  // All hooks must be at the top level
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const toast = useToast();
  
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = useState(false);
  const cancelRef = React.useRef();
  const deleteRef = React.useRef();
  const bulkDeleteRef = React.useRef();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    const filterObj = {};
    if (filters.startDate) filterObj.startDate = filters.startDate;
    if (filters.endDate) filterObj.endDate = filters.endDate;
    if (filters.status) filterObj.status = filters.status;
    fetchUserOrders(filterObj);
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', status: '' });
    fetchUserOrders();
  };

  const openCancelDialog = (orderId) => {
    setCancelTarget(orderId);
    setIsAlertOpen(true);
  };

  const closeCancelDialog = () => {
    setCancelTarget(null);
    setIsAlertOpen(false);
  };

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;

    const result = await cancelOrder(cancelTarget);
    
    if (result.success) {
      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled and stock has been restored',
        status: 'success',
        duration: 3000
      });
      fetchUserOrders(); // Refresh orders
    } else {
      toast({
        title: 'Error',
        description: result.message,
        status: 'error',
        duration: 3000
      });
    }
    
    closeCancelDialog();
  };

  // Delete order handlers
  const openDeleteDialog = (orderId) => {
    setDeleteTarget(orderId);
    setIsDeleteAlertOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
    setIsDeleteAlertOpen(false);
  };

  const handleDeleteOrder = async () => {
    if (!deleteTarget) return;

    const result = await deleteOrder(deleteTarget);
    
    if (result.success) {
      toast({
        title: 'Order Deleted',
        description: 'Order has been removed from your history',
        status: 'success',
        duration: 3000
      });
      // Remove from selected orders if it was selected
      setSelectedOrders(prev => prev.filter(id => id !== deleteTarget));
    } else {
      toast({
        title: 'Error',
        description: result.message,
        status: 'error',
        duration: 3000
      });
    }
    
    closeDeleteDialog();
  };

  // Bulk delete handlers
  const openBulkDeleteDialog = () => {
    setIsBulkDeleteAlertOpen(true);
  };

  const closeBulkDeleteDialog = () => {
    setIsBulkDeleteAlertOpen(false);
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;

    const result = await deleteMultipleOrders(selectedOrders);
    
    if (result.success) {
      toast({
        title: 'Orders Deleted',
        description: `Successfully deleted ${result.deletedCount} order(s)`,
        status: 'success',
        duration: 3000
      });
      setSelectedOrders([]);
    } else {
      toast({
        title: 'Error',
        description: result.message,
        status: 'error',
        duration: 3000
      });
    }
    
    closeBulkDeleteDialog();
  };

  // Checkbox handlers
  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleSelectAll = () => {
    // Only select deletable orders (completed, cancelled, rejected)
    const deletableOrders = orders.filter(
      order => ['completed', 'cancelled', 'rejected'].includes(order.status)
    );
    
    if (selectedOrders.length === deletableOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(deletableOrders.map(order => order._id));
    }
  };

  const isDeletable = (status) => {
    return ['completed', 'cancelled', 'rejected'].includes(status);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { colorScheme: 'yellow', icon: FaClock, text: 'Pending Approval' },
      approved: { colorScheme: 'green', icon: FaCheckCircle, text: 'Approved' },
      rejected: { colorScheme: 'red', icon: FaTimesCircle, text: 'Rejected' },
      cancelled: { colorScheme: 'gray', icon: FaTimesCircle, text: 'Cancelled' },
      completed: { colorScheme: 'blue', icon: FaCheckCircle, text: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge
        colorScheme={config.colorScheme}
        px={3}
        py={1}
        borderRadius="full"
        display="flex"
        alignItems="center"
        gap={2}
        fontSize="sm"
      >
        <Icon as={config.icon} />
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Center minH="100vh" bg={pageBg}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500">Loading your orders...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} py={16}>
      <Container maxW="1200px">
        {/* Header */}
        <VStack spacing={4} mb={8}>
          <HStack spacing={3}>
            <Icon as={FaShoppingBag} boxSize={8} color="blue.500" />
            <Heading
              size="xl"
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
            >
              My Orders
            </Heading>
          </HStack>
          <Text color="gray.500" textAlign="center">
            View and manage your order history
          </Text>
        </VStack>

        {/* Filters */}
        <Box
          bg={bgColor}
          p={6}
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
          mb={6}
        >
          <VStack spacing={4} align="stretch">
            <Heading size="sm" mb={2}>Filter Orders</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
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
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium">Status</Text>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  placeholder="All Statuses"
                  size="md"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </Select>
              </Box>
            </SimpleGrid>
            <HStack spacing={3} justify="flex-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                size="sm"
              >
                Clear Filters
              </Button>
              <Button
                colorScheme="blue"
                onClick={applyFilters}
                size="sm"
              >
                Apply Filters
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Header */}
        <VStack spacing={4} mb={8}>
          <HStack spacing={3}>
            <Icon as={FaShoppingBag} boxSize={8} color="blue.500" />
            <Heading
              size="2xl"
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
              fontWeight="extrabold"
            >
              My Orders
            </Heading>
          </HStack>
          <Text color="gray.600" fontSize="lg">
            Track and manage your order history
          </Text>
        </VStack>

        {/* Bulk Actions Bar */}
        {orders.length > 0 && (
          <Box
            bg={bgColor}
            p={4}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            mb={4}
          >
            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <HStack spacing={3}>
                <Checkbox
                  isChecked={
                    selectedOrders.length > 0 &&
                    selectedOrders.length === orders.filter(o => isDeletable(o.status)).length
                  }
                  isIndeterminate={
                    selectedOrders.length > 0 &&
                    selectedOrders.length < orders.filter(o => isDeletable(o.status)).length
                  }
                  onChange={handleSelectAll}
                  colorScheme="blue"
                >
                  <Text fontWeight="medium">
                    Select All Deletable Orders
                  </Text>
                </Checkbox>
                {selectedOrders.length > 0 && (
                  <Badge colorScheme="blue" fontSize="sm" px={2} py={1} borderRadius="md">
                    {selectedOrders.length} selected
                  </Badge>
                )}
              </HStack>
              
              {selectedOrders.length > 0 && (
                <Button
                  leftIcon={<FaTrashAlt />}
                  colorScheme="red"
                  size="sm"
                  onClick={openBulkDeleteDialog}
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'lg'
                  }}
                  transition="all 0.2s"
                >
                  Delete Selected ({selectedOrders.length})
                </Button>
              )}
            </HStack>
          </Box>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <Box
            bg={bgColor}
            p={12}
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            textAlign="center"
          >
            <Icon as={FaShoppingBag} boxSize={16} color="gray.300" mb={4} />
            <Heading size="md" mb={2} color="gray.500">
              No orders yet
            </Heading>
            <Text color="gray.400">
              Start shopping to see your orders here
            </Text>
          </Box>
        ) : (
          <Accordion allowMultiple>
            {orders.map((order) => (
              <AccordionItem
                key={order._id}
                bg={bgColor}
                border="1px"
                borderColor={borderColor}
                borderRadius="xl"
                mb={4}
                overflow="hidden"
              >
                <AccordionButton p={6} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <HStack flex="1" justify="space-between" align="center" flexWrap="wrap" gap={4}>
                    <HStack spacing={3}>
                      {/* Checkbox for deletable orders */}
                      {isDeletable(order.status) && (
                        <Checkbox
                          isChecked={selectedOrders.includes(order._id)}
                          onChange={() => handleSelectOrder(order._id)}
                          colorScheme="blue"
                          size="lg"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {format(new Date(order.createdAt), 'MMM dd, yyyy h:mm a')}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack spacing={6} flexWrap="wrap">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">
                          Total Amount
                        </Text>
                        <Text fontWeight="bold" fontSize="lg" color="blue.500">
                          ${order.totalAmount.toFixed(2)}
                        </Text>
                      </VStack>

                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">
                          Items
                        </Text>
                        <Text fontWeight="bold">
                          {order.items.length}
                        </Text>
                      </VStack>

                      {getStatusBadge(order.status)}
                    </HStack>
                  </HStack>
                  <AccordionIcon ml={4} />
                </AccordionButton>

                <AccordionPanel p={6} pt={0}>
                  <Divider mb={4} />

                  {/* Order Items */}
                  <VStack align="stretch" spacing={4} mb={6}>
                    <Heading size="sm">Order Items</Heading>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Product</Th>
                          <Th isNumeric>Quantity</Th>
                          <Th isNumeric>Price</Th>
                          <Th isNumeric>Subtotal</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {order.items.map((item, index) => (
                          <Tr key={index}>
                            <Td>
                              <HStack>
                                {item.product?.image && (
                                  <Image
                                    src={item.product.image}
                                    boxSize="50px"
                                    objectFit="cover"
                                    borderRadius="md"
                                  />
                                )}
                                <Text>{item.product?.name || 'Product'}</Text>
                              </HStack>
                            </Td>
                            <Td isNumeric>{item.quantity}</Td>
                            <Td isNumeric>${item.price.toFixed(2)}</Td>
                            <Td isNumeric fontWeight="semibold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </VStack>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <VStack align="stretch" spacing={2}>
                      <Heading size="sm">Shipping Address</Heading>
                      <Box
                        p={4}
                        bg={useColorModeValue('gray.50', 'gray.700')}
                        borderRadius="md"
                      >
                        <Text>{order.shippingAddress.street}</Text>
                        <Text>
                          {order.shippingAddress.city}
                          {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                          {order.shippingAddress.zipCode && ` ${order.shippingAddress.zipCode}`}
                        </Text>
                        <Text>{order.shippingAddress.country}</Text>
                      </Box>
                    </VStack>
                  )}

                  {/* Rejection Reason */}
                  {order.status === 'rejected' && order.rejectionReason && (
                    <Box
                      mt={4}
                      p={4}
                      bg="red.50"
                      borderRadius="md"
                      borderLeft="4px"
                      borderColor="red.500"
                    >
                      <Text fontWeight="bold" color="red.700" mb={1}>
                        Rejection Reason:
                      </Text>
                      <Text color="red.600">{order.rejectionReason}</Text>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <HStack mt={4} spacing={3} flexWrap="wrap">
                    {/* Cancel Button - Only show for pending orders */}
                    {order.status === 'pending' && (
                      <Button
                        colorScheme="red"
                        variant="outline"
                        size="sm"
                        onClick={() => openCancelDialog(order._id)}
                        leftIcon={<FaTimesCircle />}
                      >
                        Cancel Order
                      </Button>
                    )}
                    
                    {/* Delete Button - Only show for completed, cancelled, or rejected orders */}
                    {isDeletable(order.status) && (
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => openDeleteDialog(order._id)}
                        leftIcon={<FaTrash />}
                        _hover={{
                          transform: 'translateY(-2px)',
                          shadow: 'md'
                        }}
                        transition="all 0.2s"
                      >
                        Delete Order
                      </Button>
                    )}
                  </HStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Cancel Confirmation Dialog */}
        <AlertDialog
          isOpen={isAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={closeCancelDialog}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Cancel Order
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to cancel this order? The stock will be restored.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={closeCancelDialog}>
                  No, Keep Order
                </Button>
                <Button colorScheme="red" onClick={handleCancelOrder} ml={3}>
                  Yes, Cancel Order
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Delete Single Order Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteAlertOpen}
          leastDestructiveRef={deleteRef}
          onClose={closeDeleteDialog}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                <HStack spacing={2}>
                  <Icon as={FaTrash} color="red.500" />
                  <Text>Delete Order</Text>
                </HStack>
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete this order? This action cannot be undone and the order will be permanently removed from your history.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={deleteRef} onClick={closeDeleteDialog}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteOrder} ml={3}>
                  Delete Order
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isBulkDeleteAlertOpen}
          leastDestructiveRef={bulkDeleteRef}
          onClose={closeBulkDeleteDialog}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                <HStack spacing={2}>
                  <Icon as={FaTrashAlt} color="red.500" />
                  <Text>Delete Multiple Orders</Text>
                </HStack>
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete <strong>{selectedOrders.length}</strong> order(s)? 
                This action cannot be undone and all selected orders will be permanently removed from your history.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={bulkDeleteRef} onClick={closeBulkDeleteDialog}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleBulkDelete} ml={3}>
                  Delete {selectedOrders.length} Order(s)
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
};

export default OrderHistoryPage;
