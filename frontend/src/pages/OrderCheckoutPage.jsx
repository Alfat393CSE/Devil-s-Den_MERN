import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  Textarea,
  useColorModeValue,
  Card,
  CardBody,
  Divider,
  List,
  ListItem,
  Image,
  Flex,
  Badge,
  useToast,
  Radio,
  RadioGroup,
  Stack,
  Alert,
  AlertIcon,
  AlertDescription,
  SimpleGrid
} from '@chakra-ui/react';
import { useProductStore } from '../store/product';

const OrderCheckoutPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const cart = useProductStore(s => s.cart);
  const clearCart = useProductStore(s => s.clearCart);
  
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh',
    paymentMethod: 'bKash',
    transactionId: '',
    senderNumber: '',
    receiverNumber: '',
    paymentNote: ''
  });

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  }, [cart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (value) => {
    setFormData(prev => ({ ...prev, paymentMethod: value }));
  };

  const validateForm = () => {
    const { fullName, phone, street, city, zipCode, paymentMethod, transactionId } = formData;
    
    if (!fullName || !phone || !street || !city || !zipCode) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all shipping address fields',
        status: 'error',
        duration: 3000,
      });
      return false;
    }

    if (paymentMethod !== 'Cash on Delivery' && !transactionId) {
      toast({
        title: 'Missing Transaction ID',
        description: 'Please provide your transaction ID for payment verification',
        status: 'error',
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Please login',
          description: 'You need to be logged in to place an order',
          status: 'warning',
          duration: 3000,
        });
        navigate('/signin');
        return;
      }

      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity || 1,
          price: item.price
        })),
        totalAmount: totalAmount,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod,
        paymentDetails: {
          transactionId: formData.transactionId,
          senderNumber: formData.senderNumber,
          receiverNumber: formData.receiverNumber,
          paymentNote: formData.paymentNote
        }
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Order Placed Successfully!',
          description: 'Your order is pending admin approval. We will notify you soon.',
          status: 'success',
          duration: 5000,
        });
        clearCart();
        navigate('/orders');
      } else {
        throw new Error(data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: 'Order Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Container maxW="container.lg" py={8}>
        <Card bg={cardBg} maxW="500px" mx="auto">
          <CardBody>
            <VStack spacing={4} py={8}>
              <Heading size="md">Your cart is empty</Heading>
              <Text color="gray.500">Add some items to your cart to proceed with checkout</Text>
              <Button colorScheme="blue" onClick={() => navigate('/shop')}>
                Continue Shopping
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
          <Heading size="xl">Checkout</Heading>

          <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
            {/* Order Form */}
            <Box flex={2}>
              <VStack spacing={6} align="stretch">
                {/* Shipping Information */}
                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="md" mb={4}>Shipping Information</Heading>
                    <Divider mb={4} />
                    
                    <VStack spacing={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        <FormControl isRequired>
                          <FormLabel>Full Name</FormLabel>
                          <Input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Phone Number</FormLabel>
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+880 1234567890"
                          />
                        </FormControl>
                      </SimpleGrid>

                      <FormControl isRequired>
                        <FormLabel>Street Address</FormLabel>
                        <Input
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          placeholder="House/Flat no, Road, Area"
                        />
                      </FormControl>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        <FormControl isRequired>
                          <FormLabel>City</FormLabel>
                          <Input
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Dhaka"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>State/Division</FormLabel>
                          <Input
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Dhaka Division"
                          />
                        </FormControl>
                      </SimpleGrid>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        <FormControl isRequired>
                          <FormLabel>ZIP/Postal Code</FormLabel>
                          <Input
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            placeholder="1200"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Country</FormLabel>
                          <Input
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            isReadOnly
                          />
                        </FormControl>
                      </SimpleGrid>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Payment Information */}
                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="md" mb={4}>Payment Information</Heading>
                    <Divider mb={4} />
                    
                    <VStack spacing={4} align="stretch">
                      <FormControl isRequired>
                        <FormLabel>Payment Method</FormLabel>
                        <RadioGroup value={formData.paymentMethod} onChange={handlePaymentMethodChange}>
                          <Stack direction="column" spacing={3}>
                            <Radio value="bKash" colorScheme="pink">
                              <HStack>
                                <Text fontWeight="bold" color="pink.600">bKash</Text>
                                <Badge colorScheme="pink">Mobile Payment</Badge>
                              </HStack>
                            </Radio>
                            <Radio value="Nagad" colorScheme="orange">
                              <HStack>
                                <Text fontWeight="bold" color="orange.600">Nagad</Text>
                                <Badge colorScheme="orange">Mobile Payment</Badge>
                              </HStack>
                            </Radio>
                            <Radio value="Rocket" colorScheme="purple">
                              <HStack>
                                <Text fontWeight="bold" color="purple.600">Rocket</Text>
                                <Badge colorScheme="purple">Mobile Payment</Badge>
                              </HStack>
                            </Radio>
                            <Radio value="Card" colorScheme="blue">
                              <HStack>
                                <Text fontWeight="bold">Card Payment</Text>
                                <Badge colorScheme="blue">Visa/Mastercard</Badge>
                              </HStack>
                            </Radio>
                            <Radio value="Cash on Delivery" colorScheme="green">
                              <HStack>
                                <Text fontWeight="bold">Cash on Delivery</Text>
                                <Badge colorScheme="green">Pay when you receive</Badge>
                              </HStack>
                            </Radio>
                          </Stack>
                        </RadioGroup>
                      </FormControl>

                      {formData.paymentMethod !== 'Cash on Delivery' && (
                        <>
                          <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <AlertDescription fontSize="sm">
                              {formData.paymentMethod === 'bKash' && 'Send payment to: 01XXXXXXXXX via bKash'}
                              {formData.paymentMethod === 'Nagad' && 'Send payment to: 01XXXXXXXXX via Nagad'}
                              {formData.paymentMethod === 'Rocket' && 'Send payment to: 01XXXXXXXXX via Rocket'}
                              {formData.paymentMethod === 'Card' && 'Complete card payment and enter transaction ID'}
                            </AlertDescription>
                          </Alert>

                          <FormControl isRequired>
                            <FormLabel>Transaction ID</FormLabel>
                            <Input
                              name="transactionId"
                              value={formData.transactionId}
                              onChange={handleChange}
                              placeholder="Enter your transaction ID"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Sender Number (Your Number)</FormLabel>
                            <Input
                              name="senderNumber"
                              value={formData.senderNumber}
                              onChange={handleChange}
                              placeholder="01XXXXXXXXX"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Receiver Number (Merchant Number)</FormLabel>
                            <Input
                              name="receiverNumber"
                              value={formData.receiverNumber}
                              onChange={handleChange}
                              placeholder="01XXXXXXXXX"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Payment Note (Optional)</FormLabel>
                            <Textarea
                              name="paymentNote"
                              value={formData.paymentNote}
                              onChange={handleChange}
                              placeholder="Any additional notes about your payment"
                              rows={3}
                            />
                          </FormControl>
                        </>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </Box>

            {/* Order Summary */}
            <Box flex={1}>
              <Card bg={cardBg} position="sticky" top="20px">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Order Summary</Heading>
                    <Divider />
                    
                    <List spacing={3} maxH="300px" overflowY="auto">
                      {cart.map((item) => (
                        <ListItem key={item._id}>
                          <Flex gap={3} align="center">
                            <Image
                              src={item.image}
                              alt={item.name}
                              boxSize="50px"
                              objectFit="cover"
                              borderRadius="md"
                              border="1px solid"
                              borderColor={borderColor}
                            />
                            <Box flex={1}>
                              <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                                {item.name}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                Qty: {item.quantity || 1} × ${item.price}
                              </Text>
                            </Box>
                            <Text fontSize="sm" fontWeight="bold">
                              ${(item.price * (item.quantity || 1)).toFixed(2)}
                            </Text>
                          </Flex>
                        </ListItem>
                      ))}
                    </List>

                    <Divider />
                    
                    <HStack justify="space-between">
                      <Text>Subtotal</Text>
                      <Text>${totalAmount.toFixed(2)}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text>Shipping</Text>
                      <Badge colorScheme="green">FREE</Badge>
                    </HStack>
                    
                    <Divider />
                    
                    <HStack justify="space-between" fontSize="xl" fontWeight="bold">
                      <Text>Total</Text>
                      <Text color="blue.500">${totalAmount.toFixed(2)}</Text>
                    </HStack>

                    <Button
                      colorScheme="blue"
                      size="lg"
                      onClick={handleSubmitOrder}
                      isLoading={loading}
                      loadingText="Placing Order..."
                      w="full"
                    >
                      Place Order
                    </Button>

                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      Your order will be reviewed by admin before processing
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </Box>
          </Flex>
        </VStack>
      </Container>
  );
};

export default OrderCheckoutPage;
