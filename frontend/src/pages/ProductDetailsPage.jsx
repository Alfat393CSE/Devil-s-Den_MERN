import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    Image,
    Button,
    HStack,
    VStack,
    Badge,
    Divider,
    useToast,
    useColorModeValue,
    Flex,
    IconButton,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Grid,
    GridItem,
    Card,
    CardBody,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    Spinner,
    Textarea,
} from '@chakra-ui/react';
import { FaShoppingCart, FaArrowLeft, FaBoxOpen, FaStore, FaTag, FaClock, FaShippingFast, FaEdit } from 'react-icons/fa';
import { useProductStore } from '../store/product';
import { useOrderStore } from '../store/order';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editedProduct, setEditedProduct] = useState({
        name: '',
        price: '',
        image: '',
        description: '',
        stock: 0
    });

    const { addToCart, updateProduct } = useProductStore();
    const { createOrder } = useOrderStore();

    // Check if user is admin
    let isAdmin = false;
    try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (raw) {
            const user = JSON.parse(raw);
            isAdmin = user.role === 'admin';
        }
    } catch (err) {
        isAdmin = false;
    }

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.300');
    const imageBgColor = useColorModeValue('gray.100', 'gray.700');
    const orderSummaryBg = useColorModeValue('blue.50', 'gray.700');
    const gradientBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${id}`);
            const data = await res.json();
            if (data.success) {
                setProduct(data.data);
            } else {
                toast({
                    title: 'Error',
                    description: 'Product not found',
                    status: 'error',
                    duration: 3000,
                });
                navigate('/shop');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load product',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (quantity > product.stock) {
            return toast({
                title: 'Insufficient Stock',
                description: `Only ${product.stock} items available`,
                status: 'error',
                duration: 3000,
            });
        }

        addToCart(product, quantity);
        toast({
            title: 'Added to Cart',
            description: `${quantity} x ${product.name} added to cart`,
            status: 'success',
            duration: 3000,
        });
    };

    const handleBuyNow = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            toast({
                title: 'Authentication Required',
                description: 'Please sign in to buy products',
                status: 'warning',
                duration: 3000,
            });
            return navigate('/signin');
        }

        if (quantity > product.stock) {
            return toast({
                title: 'Insufficient Stock',
                description: `Only ${product.stock} items available`,
                status: 'error',
                duration: 3000,
            });
        }

        onOpen();
    };

    const handleConfirmBuy = async () => {
        if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.country) {
            return toast({
                title: 'Missing Information',
                description: 'Please fill in street, city, and country',
                status: 'error',
                duration: 3000,
            });
        }

        setIsSubmitting(true);
        const items = [{ productId: product._id, quantity }];

        const { success, message } = await createOrder(items, shippingAddress);
        setIsSubmitting(false);

        if (success) {
            toast({
                title: 'Order Placed',
                description: 'Your order has been placed successfully!',
                status: 'success',
                duration: 4000,
            });
            onClose();
            setShippingAddress({ street: '', city: '', state: '', zipCode: '', country: '' });
            navigate('/orders');
        } else {
            toast({
                title: 'Order Failed',
                description: message || 'Could not place order',
                status: 'error',
                duration: 4000,
            });
        }
    };

    const handleEditProduct = () => {
        setEditedProduct({
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description || '',
            stock: product.stock
        });
        onEditOpen();
    };

    const handleUpdateProduct = async () => {
        setIsSubmitting(true);
        const { success, message } = await updateProduct(product._id, editedProduct);
        setIsSubmitting(false);

        if (success) {
            toast({
                title: 'Product Updated',
                description: 'Product has been updated successfully!',
                status: 'success',
                duration: 3000,
            });
            onEditClose();
            fetchProduct(); // Refresh product data
        } else {
            toast({
                title: 'Update Failed',
                description: message || 'Could not update product',
                status: 'error',
                duration: 3000,
            });
        }
    };

    if (loading) {
        return (
            <Container maxW="1200px" py={12} centerContent>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text mt={4} color={textColor}>Loading product details...</Text>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container maxW="1200px" py={12} centerContent>
                <Text fontSize="xl" color={textColor}>Product not found</Text>
                <Button mt={4} onClick={() => navigate('/shop')}>Back to Shop</Button>
            </Container>
        );
    }

    return (
        <Container maxW="1200px" py={8}>
            {/* Back Button */}
            <Button
                leftIcon={<FaArrowLeft />}
                variant="ghost"
                mb={6}
                onClick={() => navigate(-1)}
                _hover={{
                    transform: 'translateX(-5px)',
                    transition: 'all 0.2s'
                }}
            >
                Back
            </Button>

            {/* Product Details Card */}
            <Card
                bg={bgColor}
                borderRadius="2xl"
                boxShadow="2xl"
                overflow="hidden"
                border="1px"
                borderColor={borderColor}
            >
                <CardBody p={0}>
                    <Grid
                        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
                        gap={0}
                    >
                        {/* Product Image */}
                        <GridItem>
                            <Box
                                position="relative"
                                h={{ base: '400px', lg: '600px' }}
                                bg={imageBgColor}
                            >
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    w="100%"
                                    h="100%"
                                    objectFit="cover"
                                />
                                {product.stock <= 5 && product.stock > 0 && (
                                    <Badge
                                        position="absolute"
                                        top={4}
                                        right={4}
                                        colorScheme="orange"
                                        fontSize="sm"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        boxShadow="lg"
                                    >
                                        Only {product.stock} left!
                                    </Badge>
                                )}
                                {product.stock === 0 && (
                                    <Badge
                                        position="absolute"
                                        top={4}
                                        right={4}
                                        colorScheme="red"
                                        fontSize="sm"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        boxShadow="lg"
                                    >
                                        Out of Stock
                                    </Badge>
                                )}
                            </Box>
                        </GridItem>

                        {/* Product Info */}
                        <GridItem>
                            <VStack align="stretch" spacing={6} p={{ base: 6, lg: 8 }}>
                                {/* Product Name */}
                                <Box>
                                    <HStack justify="space-between" align="start" mb={2}>
                                        <Heading
                                            size="2xl"
                                            bgGradient="linear(to-r, blue.600, purple.600)"
                                            bgClip="text"
                                            flex={1}
                                        >
                                            {product.name}
                                        </Heading>
                                        {isAdmin && (
                                            <IconButton
                                                icon={<FaEdit />}
                                                colorScheme="blue"
                                                variant="ghost"
                                                size="lg"
                                                onClick={handleEditProduct}
                                                aria-label="Edit product"
                                                borderRadius="xl"
                                                _hover={{
                                                    transform: "scale(1.1)",
                                                    bg: "blue.50"
                                                }}
                                            />
                                        )}
                                    </HStack>
                                    <HStack spacing={3} mt={2}>
                                        <Badge
                                            colorScheme="blue"
                                            fontSize="sm"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                        >
                                            <Flex align="center" gap={1}>
                                                <FaStore size={12} />
                                                In Store
                                            </Flex>
                                        </Badge>
                                        <Badge
                                            colorScheme="green"
                                            fontSize="sm"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                        >
                                            <Flex align="center" gap={1}>
                                                <FaShippingFast size={12} />
                                                Fast Delivery
                                            </Flex>
                                        </Badge>
                                    </HStack>
                                </Box>

                                <Divider />

                                {/* Price */}
                                <Box>
                                    <Text fontSize="sm" color={textColor} mb={1}>
                                        Price
                                    </Text>
                                    <Heading
                                        size="3xl"
                                        color="teal.500"
                                    >
                                        ${product.price.toFixed(2)}
                                    </Heading>
                                </Box>

                                <Divider />

                                {/* Description */}
                                <Box>
                                    <HStack mb={3}>
                                        <FaTag color="#667eea" />
                                        <Heading size="md">Product Description</Heading>
                                    </HStack>
                                    <Text
                                        fontSize="md"
                                        color={textColor}
                                        lineHeight="tall"
                                        whiteSpace="pre-wrap"
                                    >
                                        {product.description || 'No description available for this product.'}
                                    </Text>
                                </Box>

                                <Divider />

                                {/* Stock Info */}
                                <Box>
                                    <HStack spacing={2} mb={2}>
                                        <FaBoxOpen color="#667eea" />
                                        <Text fontSize="md" fontWeight="semibold">
                                            Availability
                                        </Text>
                                    </HStack>
                                    <HStack>
                                        <Badge
                                            colorScheme={product.stock > 5 ? 'green' : product.stock > 0 ? 'orange' : 'red'}
                                            fontSize="md"
                                            px={4}
                                            py={2}
                                            borderRadius="lg"
                                        >
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </Badge>
                                    </HStack>
                                </Box>

                                <Divider />

                                {/* Quantity Selector */}
                                {product.stock > 0 && (
                                    <Box>
                                        <Text fontSize="md" fontWeight="semibold" mb={3}>
                                            Quantity
                                        </Text>
                                        <HStack spacing={4}>
                                            <NumberInput
                                                value={quantity}
                                                onChange={(valueString) => setQuantity(parseInt(valueString) || 1)}
                                                min={1}
                                                max={product.stock}
                                                maxW="150px"
                                                size="lg"
                                            >
                                                <NumberInputField
                                                    borderRadius="xl"
                                                    borderWidth="2px"
                                                    _focus={{
                                                        borderColor: 'blue.500',
                                                        boxShadow: '0 0 0 1px #3182ce'
                                                    }}
                                                />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                            <Text fontSize="sm" color={textColor}>
                                                Max: {product.stock}
                                            </Text>
                                        </HStack>
                                    </Box>
                                )}

                                {/* Action Buttons */}
                                <VStack spacing={3} pt={4}>
                                    {product.stock > 0 ? (
                                        <>
                                            <Button
                                                size="lg"
                                                w="full"
                                                bgGradient="linear(to-r, blue.500, purple.600)"
                                                color="white"
                                                leftIcon={<FaShippingFast />}
                                                onClick={handleBuyNow}
                                                borderRadius="xl"
                                                _hover={{
                                                    bgGradient: 'linear(to-r, blue.600, purple.700)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '2xl',
                                                }}
                                                transition="all 0.2s"
                                            >
                                                Buy Now - ${(product.price * quantity).toFixed(2)}
                                            </Button>
                                            <Button
                                                size="lg"
                                                w="full"
                                                variant="outline"
                                                leftIcon={<FaShoppingCart />}
                                                onClick={handleAddToCart}
                                                borderRadius="xl"
                                                borderWidth="2px"
                                                _hover={{
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: 'lg',
                                                }}
                                                transition="all 0.2s"
                                            >
                                                Add to Cart
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="lg"
                                            w="full"
                                            colorScheme="red"
                                            isDisabled
                                            borderRadius="xl"
                                        >
                                            Out of Stock
                                        </Button>
                                    )}
                                </VStack>
                            </VStack>
                        </GridItem>
                    </Grid>
                </CardBody>
            </Card>

            {/* Buy Now Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="2xl" mx={4}>
                    <ModalHeader
                        bgGradient="linear(to-r, teal.500, blue.500)"
                        color="white"
                        borderTopRadius="2xl"
                        py={6}
                    >
                        <Flex align="center" gap={3}>
                            <Box
                                p={2}
                                bg="whiteAlpha.300"
                                borderRadius="lg"
                            >
                                <FaShippingFast size={24} />
                            </Box>
                            <Box>
                                <Text fontSize="2xl" fontWeight="bold">Complete Your Order</Text>
                                <Text fontSize="sm" fontWeight="normal" opacity={0.9}>
                                    Enter shipping details
                                </Text>
                            </Box>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={6} />
                    <ModalBody py={6}>
                        <VStack spacing={4}>
                            {/* Order Summary */}
                            <Box
                                w="full"
                                p={4}
                                bg={orderSummaryBg}
                                borderRadius="xl"
                            >
                                <Text fontWeight="bold" mb={2}>Order Summary</Text>
                                <HStack justify="space-between">
                                    <Text color={textColor}>{product.name} x {quantity}</Text>
                                    <Text fontWeight="bold" color="teal.500">
                                        ${(product.price * quantity).toFixed(2)}
                                    </Text>
                                </HStack>
                            </Box>

                            {/* Shipping Form */}
                            <FormControl isRequired>
                                <FormLabel>Street Address</FormLabel>
                                <Input
                                    size="lg"
                                    borderRadius="xl"
                                    placeholder="123 Main Street"
                                    value={shippingAddress.street}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                                />
                            </FormControl>
                            <HStack w="full" spacing={3}>
                                <FormControl isRequired>
                                    <FormLabel>City</FormLabel>
                                    <Input
                                        size="lg"
                                        borderRadius="xl"
                                        placeholder="New York"
                                        value={shippingAddress.city}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>State</FormLabel>
                                    <Input
                                        size="lg"
                                        borderRadius="xl"
                                        placeholder="NY"
                                        value={shippingAddress.state}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                                    />
                                </FormControl>
                            </HStack>
                            <HStack w="full" spacing={3}>
                                <FormControl>
                                    <FormLabel>Zip Code</FormLabel>
                                    <Input
                                        size="lg"
                                        borderRadius="xl"
                                        placeholder="10001"
                                        value={shippingAddress.zipCode}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Country</FormLabel>
                                    <Input
                                        size="lg"
                                        borderRadius="xl"
                                        placeholder="USA"
                                        value={shippingAddress.country}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                    />
                                </FormControl>
                            </HStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter gap={3}>
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            borderRadius="xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            bgGradient="linear(to-r, teal.500, blue.500)"
                            color="white"
                            onClick={handleConfirmBuy}
                            isLoading={isSubmitting}
                            loadingText="Placing Order..."
                            borderRadius="xl"
                            px={8}
                            _hover={{
                                bgGradient: 'linear(to-r, teal.600, blue.600)',
                                transform: 'translateY(-2px)',
                                boxShadow: 'lg',
                            }}
                        >
                            Place Order - ${(product.price * quantity).toFixed(2)}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Product Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" isCentered>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="2xl" mx={4}>
                    <ModalHeader
                        bgGradient="linear(to-r, blue.500, purple.500)"
                        color="white"
                        borderTopRadius="2xl"
                        py={6}
                    >
                        <Flex align="center" gap={3}>
                            <Box
                                p={2}
                                bg="whiteAlpha.300"
                                borderRadius="lg"
                            >
                                <FaEdit size={24} />
                            </Box>
                            <Box>
                                <Text fontSize="2xl" fontWeight="bold">Edit Product</Text>
                                <Text fontSize="sm" fontWeight="normal" opacity={0.9}>
                                    Update product information
                                </Text>
                            </Box>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={6} />
                    <ModalBody py={6}>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Product Name</FormLabel>
                                <Input
                                    size="lg"
                                    borderRadius="xl"
                                    placeholder="Product Name"
                                    value={editedProduct.name}
                                    onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Price</FormLabel>
                                <Input
                                    size="lg"
                                    borderRadius="xl"
                                    type="number"
                                    placeholder="Price"
                                    value={editedProduct.price}
                                    onChange={(e) => setEditedProduct({ ...editedProduct, price: e.target.value })}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Image URL</FormLabel>
                                <Input
                                    size="lg"
                                    borderRadius="xl"
                                    placeholder="Image URL"
                                    value={editedProduct.image}
                                    onChange={(e) => setEditedProduct({ ...editedProduct, image: e.target.value })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    size="lg"
                                    borderRadius="xl"
                                    placeholder="Enter product description..."
                                    value={editedProduct.description}
                                    onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                                    minH="150px"
                                    resize="vertical"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Stock Quantity</FormLabel>
                                <Input
                                    size="lg"
                                    borderRadius="xl"
                                    type="number"
                                    placeholder="Stock"
                                    value={editedProduct.stock}
                                    onChange={(e) => setEditedProduct({ ...editedProduct, stock: Number(e.target.value) || 0 })}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter gap={3}>
                        <Button
                            variant="ghost"
                            onClick={onEditClose}
                            borderRadius="xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            bgGradient="linear(to-r, blue.500, purple.500)"
                            color="white"
                            onClick={handleUpdateProduct}
                            isLoading={isSubmitting}
                            loadingText="Updating..."
                            borderRadius="xl"
                            px={8}
                            _hover={{
                                bgGradient: 'linear(to-r, blue.600, purple.600)',
                                transform: 'translateY(-2px)',
                                boxShadow: 'lg',
                            }}
                        >
                            Update Product
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default ProductDetailsPage;
