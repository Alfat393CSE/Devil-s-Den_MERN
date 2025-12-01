import { 
	Box, Button, Heading, HStack, Image, Text, VStack, StackDivider, useToast, IconButton, 
	NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, 
	Container, Badge, Divider, Icon, Flex, 
	useColorModeValue, Card, CardBody, SimpleGrid
} from "@chakra-ui/react";
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons';
import { FaShoppingCart, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { useProductStore } from "../store/product";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
	const cart = useProductStore((s) => s.cart);
	const removeFromCart = useProductStore((s) => s.removeFromCart);
	const updateCartQty = useProductStore((s) => s.updateCartQty);
	const clearCart = useProductStore((s) => s.clearCart);
	const loadUserCart = useProductStore((s) => s.loadUserCart);
	const toast = useToast();
	const navigate = useNavigate();

	// Load user-specific cart on mount
	useEffect(() => {
		loadUserCart();
	}, [loadUserCart]);

	const total = cart.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);

	const bgColor = useColorModeValue('white', 'gray.800');
	const borderColor = useColorModeValue('gray.200', 'gray.700');
	const emptyCartBg = useColorModeValue('gray.50', 'gray.700');

	return (
		<Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} py={8}>
			<Container maxW="1200px">
				{/* Header */}
				<Box textAlign="center" mb={10}>
					<HStack justify="center" spacing={4} mb={3}>
						<Box 
							p={3} 
							bg={useColorModeValue('teal.50', 'teal.900')} 
							borderRadius="xl"
							boxShadow="lg"
						>
							<Icon as={FaShoppingCart} boxSize={10} color="teal.500" />
						</Box>
						<Heading
							size="2xl"
							bgGradient="linear(to-r, teal.400, blue.500, purple.600)"
							bgClip="text"
							fontWeight="black"
							letterSpacing="tight"
						>
							Shopping Cart
						</Heading>
					</HStack>
					<Text 
						fontSize="lg" 
						color={useColorModeValue('gray.600', 'gray.400')}
						fontWeight="medium"
					>
						{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
					</Text>
				</Box>

				{!cart.length ? (
					<Card 
						bg={emptyCartBg} 
						borderRadius="2xl" 
						shadow="xl"
						border="1px"
						borderColor={borderColor}
					>
						<CardBody p={20}>
							<VStack spacing={6}>
								<Icon as={FaShoppingCart} boxSize={24} color="gray.300" />
								<Heading size="lg" color="gray.500">Your Cart is Empty</Heading>
								<Text color="gray.400" fontSize="lg">
									Start shopping to add items to your cart
								</Text>
								<Button
									size="lg"
									colorScheme="teal"
									leftIcon={<Icon as={FaShoppingCart} />}
									onClick={() => navigate('/shop')}
									bgGradient="linear(to-r, teal.400, teal.600)"
									_hover={{ bgGradient: 'linear(to-r, teal.500, teal.700)', transform: 'translateY(-2px)' }}
									transition="all 0.2s"
									boxShadow="lg"
								>
									Continue Shopping
								</Button>
							</VStack>
						</CardBody>
					</Card>
				) : (
					<SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
						{/* Cart Items */}
						<Box gridColumn={{ base: '1', lg: '1 / 3' }}>
							<VStack spacing={4} align="stretch">
								{cart.map(item => (
									<Card
										key={item._id}
										bg={bgColor}
										borderRadius="xl"
										shadow="xl"
										border="1px"
										borderColor={borderColor}
										transition="all 0.3s"
										_hover={{ shadow: '2xl', transform: 'translateY(-2px)' }}
									>
										<CardBody p={6}>
											<HStack spacing={6} align="start">
												<Box
													position="relative"
													borderRadius="lg"
													overflow="hidden"
													boxShadow="md"
													flexShrink={0}
												>
													<Image 
														src={item.image} 
														boxSize="120px" 
														objectFit="cover"
													/>
													{item.stock <= 5 && item.stock > 0 && (
														<Badge
															position="absolute"
															top={2}
															right={2}
															colorScheme="orange"
															fontSize="xs"
														>
															Low Stock
														</Badge>
													)}
												</Box>

												<VStack align="start" spacing={3} flex={1}>
													<Box w="full">
														<Heading size="md" mb={1}>{item.name}</Heading>
														<Text fontSize="sm" color="gray.500">
															Stock Available: {item.stock || 'Unlimited'}
														</Text>
													</Box>

													<HStack spacing={4} w="full" justify="space-between" flexWrap="wrap">
														<VStack align="start" spacing={1}>
															<Text fontSize="sm" color="gray.500">Unit Price</Text>
															<Text fontSize="xl" fontWeight="bold" color="teal.500">
																${item.price.toFixed(2)}
															</Text>
														</VStack>

														<VStack align="center" spacing={1}>
															<Text fontSize="sm" color="gray.500">Quantity</Text>
															<HStack>
																<IconButton 
																	size="sm" 
																	aria-label="Decrease" 
																	icon={<MinusIcon />} 
																	onClick={() => updateCartQty(item._id, (item.qty || 1) - 1)}
																	isDisabled={(item.qty || 1) <= 1}
																	colorScheme="teal"
																	variant="outline"
																	_hover={{ bg: useColorModeValue('teal.50', 'teal.900') }}
																/>
																<NumberInput 
																	size="sm" 
																	maxW={20} 
																	min={1} 
																	max={item.stock}
																	value={item.qty || 1} 
																	onChange={(valueString, valueNumber) => updateCartQty(item._id, Number.isNaN(valueNumber) ? 1 : valueNumber)}
																>
																	<NumberInputField textAlign="center" fontWeight="bold" />
																</NumberInput>
																<IconButton 
																	size="sm" 
																	aria-label="Increase" 
																	icon={<AddIcon />} 
																	onClick={() => updateCartQty(item._id, (item.qty || 1) + 1)}
																	isDisabled={item.stock && (item.qty || 1) >= item.stock}
																	colorScheme="teal"
																	variant="outline"
																	_hover={{ bg: useColorModeValue('teal.50', 'teal.900') }}
																/>
															</HStack>
														</VStack>

														<VStack align="end" spacing={1}>
															<Text fontSize="sm" color="gray.500">Subtotal</Text>
															<Text fontSize="xl" fontWeight="bold" color="purple.500">
																${(item.price * (item.qty || 1)).toFixed(2)}
															</Text>
														</VStack>
													</HStack>

													<Button
														size="sm"
														colorScheme="red"
														variant="ghost"
														leftIcon={<Icon as={FaTrash} />}
														onClick={() => removeFromCart(item._id)}
														_hover={{ bg: 'red.50' }}
													>
														Remove Item
													</Button>
												</VStack>
											</HStack>
										</CardBody>
									</Card>
								))}
							</VStack>
						</Box>

						{/* Order Summary */}
						<Box position="sticky" top={4} h="fit-content">
							<Card
								bg={bgColor}
								borderRadius="2xl"
								shadow="2xl"
								border="1px"
								borderColor={borderColor}
							>
								<CardBody p={8}>
									<VStack spacing={6} align="stretch">
										<Heading size="lg" mb={2}>
											Order Summary
										</Heading>
										<Divider />

										<VStack spacing={4} align="stretch">
											<HStack justify="space-between">
												<Text color="gray.600">Subtotal</Text>
												<Text fontWeight="semibold">${total.toFixed(2)}</Text>
											</HStack>
											<HStack justify="space-between">
												<Text color="gray.600">Items</Text>
												<Text fontWeight="semibold">{cart.length}</Text>
											</HStack>
											<HStack justify="space-between">
												<Text color="gray.600">Shipping</Text>
												<Badge colorScheme="green" fontSize="sm" px={2} py={1}>FREE</Badge>
											</HStack>
										</VStack>

										<Divider />

										<HStack justify="space-between" py={2}>
											<Heading size="md">Total</Heading>
											<Heading size="lg" color="teal.500">${total.toFixed(2)}</Heading>
										</HStack>

									<Button
										size="lg"
										colorScheme="blue"
										onClick={() => navigate('/order-checkout')}
										leftIcon={<Icon as={FaCheckCircle} />}
										bgGradient="linear(to-r, blue.400, blue.600)"
										_hover={{ 
											bgGradient: 'linear(to-r, blue.500, blue.700)', 
											transform: 'translateY(-2px)',
											shadow: 'xl'
										}}
										transition="all 0.2s"
										boxShadow="lg"
									>
										Place Order with Payment
									</Button>										<Button
											size="md"
											variant="outline"
											colorScheme="red"
											onClick={clearCart}
											leftIcon={<DeleteIcon />}
										>
											Clear Cart
										</Button>
									</VStack>
								</CardBody>
							</Card>

							<Box 
								mt={6} 
								p={4} 
								bg={useColorModeValue('blue.50', 'blue.900')} 
								borderRadius="xl"
								border="1px"
								borderColor={useColorModeValue('blue.200', 'blue.700')}
							>
								<HStack spacing={3}>
									<Icon as={FaCheckCircle} color="blue.500" boxSize={5} />
									<Text fontSize="sm" color={useColorModeValue('blue.800', 'blue.200')}>
										Secure checkout with order approval process
									</Text>
								</HStack>
							</Box>
						</Box>
					</SimpleGrid>
				)}
			</Container>
		</Box>
	)
}

export default CartPage;
