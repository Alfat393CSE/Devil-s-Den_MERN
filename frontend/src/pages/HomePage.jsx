import {
	Container,
	SimpleGrid,
	Text,
	VStack,
	Box,
	Heading,
	Button,
	HStack,
	Icon,
	useColorModeValue,
	Stack,
	Flex,
	Image
} from "@chakra-ui/react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProductStore } from "../store/product";
import ProductCard from "../components/ProductCard";
import { FaShoppingCart, FaRocket, FaShieldAlt, FaTruck, FaUsers, FaStar, FaArrowRight } from "react-icons/fa";

const HomePage = () => {
	const { fetchProducts, products } = useProductStore();
	const navigate = useNavigate();

	const bgGradient = useColorModeValue(
		'linear(to-br, blue.50, purple.50, pink.50)',
		'linear(to-br, gray.900, blue.900, purple.900)'
	);
	const cardBg = useColorModeValue('white', 'gray.800');
	const borderColor = useColorModeValue('gray.200', 'gray.700');

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	const features = [
		{
			icon: FaShieldAlt,
			title: 'Secure Shopping',
			description: '100% secure payments with SSL encryption'
		},
		{
			icon: FaTruck,
			title: 'Fast Delivery',
			description: 'Free shipping on orders over $50'
		},
		{
			icon: FaUsers,
			title: '24/7 Support',
			description: 'Dedicated customer support team'
		},
		{
			icon: FaStar,
			title: 'Quality Products',
			description: 'Carefully curated premium items'
		}
	];

	const stats = [
		{ value: '10K+', label: 'Happy Customers' },
		{ value: '500+', label: 'Products' },
		{ value: '50+', label: 'Categories' },
		{ value: '99%', label: 'Satisfaction' }
	];

	return (
		<Box>
			{/* Hero Section */}
			<Box
				bgGradient={bgGradient}
				pt={{ base: 20, md: 32 }}
				pb={{ base: 16, md: 24 }}
				position="relative"
				overflow="hidden"
			>
				{/* Decorative Elements */}
				<Box
					position="absolute"
					top="-10%"
					right="-5%"
					width="400px"
					height="400px"
					borderRadius="full"
					bg="blue.400"
					opacity="0.1"
					filter="blur(60px)"
				/>
				<Box
					position="absolute"
					bottom="-10%"
					left="-5%"
					width="300px"
					height="300px"
					borderRadius="full"
					bg="purple.400"
					opacity="0.1"
					filter="blur(60px)"
				/>

				<Container maxW="1400px" position="relative">
					<Stack
						direction={{ base: 'column', lg: 'row' }}
						spacing={{ base: 8, lg: 16 }}
						align="center"
						justify="space-between"
					>
						<VStack
							align={{ base: 'center', lg: 'flex-start' }}
							spacing={6}
							flex={1}
							textAlign={{ base: 'center', lg: 'left' }}
						>
							<HStack spacing={2} mb={4}>
								<Icon as={FaRocket} color="blue.500" boxSize={8} />
								<Text
									fontSize="sm"
									fontWeight="bold"
									color="blue.600"
									textTransform="uppercase"
									letterSpacing="wider"
								>
									Welcome to Devil's Den
								</Text>
							</HStack>

							<Heading
								fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
								fontWeight="extrabold"
								lineHeight="1.1"
								bgGradient="linear(to-r, blue.600, purple.600)"
								bgClip="text"
							>
								Discover Amazing
								<br />
								Products Today
							</Heading>

							<Text
								fontSize={{ base: 'lg', md: 'xl' }}
								color={useColorModeValue('gray.600', 'gray.300')}
								maxW="600px"
								lineHeight="tall"
							>
								Shop the latest trends with unbeatable prices. Quality products,
								fast shipping, and exceptional customer service - all in one place.
							</Text>

							<HStack spacing={4} pt={4}>
								<Button
									size="lg"
									colorScheme="blue"
									rightIcon={<FaArrowRight />}
									onClick={() => navigate('/shop')}
									_hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
									transition="all 0.3s"
								>
									Shop Now
								</Button>
								<Button
									size="lg"
									variant="outline"
									onClick={() => navigate('/about')}
									_hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
									transition="all 0.3s"
								>
									Learn More
								</Button>
							</HStack>

							{/* Stats */}
							<SimpleGrid columns={4} spacing={8} pt={8} w="full">
								{stats.map((stat, index) => (
									<VStack key={index} spacing={0}>
										<Text
											fontSize={{ base: '2xl', md: '3xl' }}
											fontWeight="bold"
											bgGradient="linear(to-r, blue.600, purple.600)"
											bgClip="text"
										>
											{stat.value}
										</Text>
										<Text fontSize="xs" color="gray.500" textAlign="center">
											{stat.label}
										</Text>
									</VStack>
								))}
							</SimpleGrid>
						</VStack>

						{/* Hero Image */}
						<Box
							flex={1}
							display={{ base: 'none', lg: 'block' }}
							position="relative"
						>
							<Box
								position="relative"
								w="full"
								h="500px"
								borderRadius="2xl"
								overflow="hidden"
								boxShadow="2xl"
								transform="perspective(1000px) rotateY(-5deg)"
								transition="all 0.5s"
								_hover={{ transform: 'perspective(1000px) rotateY(0deg)' }}
							>
								<Box
									bgGradient="linear(to-br, blue.500, purple.600)"
									w="full"
									h="full"
									display="flex"
									alignItems="center"
									justifyContent="center"
									position="relative"
								>
									<Icon as={FaShoppingCart} boxSize={48} color="white" opacity={0.3} />
									<Box
										position="absolute"
										inset={0}
										bgGradient="linear(to-t, blackAlpha.600, transparent)"
									/>
									<VStack position="absolute" bottom={8} left={8} align="start" spacing={2}>
										<Text color="white" fontSize="2xl" fontWeight="bold">
											Trending Products
										</Text>
										<Text color="whiteAlpha.800" fontSize="sm">
											Discover what's hot this season
										</Text>
									</VStack>
								</Box>
							</Box>
						</Box>
					</Stack>
				</Container>
			</Box>

			{/* Features Section */}
			<Container maxW="1400px" py={16}>
				<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
					{features.map((feature, index) => (
						<Box
							key={index}
							bg={cardBg}
							p={8}
							borderRadius="xl"
							borderWidth="1px"
							borderColor={borderColor}
							textAlign="center"
							transition="all 0.3s"
							_hover={{
								transform: 'translateY(-8px)',
								shadow: 'xl',
								borderColor: 'blue.500'
							}}
						>
							<Icon
								as={feature.icon}
								boxSize={12}
								color="blue.500"
								mb={4}
							/>
							<Heading size="md" mb={2}>
								{feature.title}
							</Heading>
							<Text color="gray.500" fontSize="sm">
								{feature.description}
							</Text>
						</Box>
					))}
				</SimpleGrid>
			</Container>

			{/* Products Section */}
			<Box bg={useColorModeValue('gray.50', 'gray.900')} py={16}>
				<Container maxW="1400px">
					<VStack spacing={12}>
						<VStack spacing={4} textAlign="center">
							<HStack spacing={2}>
								<Box w={12} h={1} bg="blue.500" borderRadius="full" />
								<Text
									fontSize="sm"
									fontWeight="bold"
									color="blue.600"
									textTransform="uppercase"
									letterSpacing="wider"
								>
									Our Collection
								</Text>
								<Box w={12} h={1} bg="blue.500" borderRadius="full" />
							</HStack>
							
							<Heading
								fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
								bgGradient="linear(to-r, blue.600, purple.600)"
								bgClip="text"
							>
								Featured Products
							</Heading>
							
							<Text
								fontSize={{ base: 'md', md: 'lg' }}
								color={useColorModeValue('gray.600', 'gray.400')}
								maxW="2xl"
							>
								Browse our carefully selected products and find exactly what you're looking for
							</Text>
						</VStack>

						{products.length > 0 ? (
							<>
								<SimpleGrid
									columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
									spacing={8}
									w="full"
								>
									{products.slice(0, 8).map((product) => (
										<ProductCard key={product._id} product={product} />
									))}
								</SimpleGrid>

								{products.length > 8 && (
									<Button
										size="lg"
										colorScheme="blue"
										onClick={() => navigate('/shop')}
										rightIcon={<FaArrowRight />}
									>
										View All Products
									</Button>
								)}
							</>
						) : (
							<VStack spacing={6} py={16}>
								<Icon as={FaShoppingCart} boxSize={20} color="gray.300" />
								<Heading size="lg" color="gray.500">
									No products available yet
								</Heading>
								<Text fontSize="md" color="gray.400" textAlign="center" maxW="md">
									Be the first to add products to our store! Click below to get started.
								</Text>
								<Button
									size="lg"
									colorScheme="blue"
									as={Link}
									to="/create"
									leftIcon={<Icon as={FaShoppingCart} />}
								>
									Add Your First Product
								</Button>
							</VStack>
						)}
					</VStack>
				</Container>
			</Box>

			{/* CTA Section */}
			<Box py={20}>
				<Container maxW="1400px">
					<Box
						bgGradient="linear(to-r, blue.500, purple.600)"
						borderRadius="2xl"
						p={{ base: 8, md: 16 }}
						position="relative"
						overflow="hidden"
					>
						<Box
							position="absolute"
							top="-20%"
							right="-10%"
							width="300px"
							height="300px"
							borderRadius="full"
							bg="whiteAlpha.200"
							filter="blur(60px)"
						/>
						
						<VStack spacing={6} position="relative" textAlign="center">
							<Heading
								fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
								color="white"
							>
								Ready to Start Shopping?
							</Heading>
							<Text
								fontSize={{ base: 'md', md: 'xl' }}
								color="whiteAlpha.900"
								maxW="2xl"
							>
								Join thousands of satisfied customers and discover amazing products at unbeatable prices
							</Text>
							<HStack spacing={4} pt={4}>
								<Button
									size="lg"
									bg="white"
									color="blue.600"
									_hover={{ bg: 'gray.100', transform: 'translateY(-2px)' }}
									onClick={() => navigate('/shop')}
									rightIcon={<FaArrowRight />}
								>
									Browse Products
								</Button>
								<Button
									size="lg"
									variant="outline"
									color="white"
									borderColor="white"
									_hover={{ bg: 'whiteAlpha.200' }}
									onClick={() => navigate('/contact')}
								>
									Contact Us
								</Button>
							</HStack>
						</VStack>
					</Box>
				</Container>
			</Box>
		</Box>
	);
};

export default HomePage;