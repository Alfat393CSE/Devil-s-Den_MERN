import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import {
	Box,
	Button,
	Heading,
	HStack,
	IconButton,
	Image,
	Input,
	Badge,
	Tooltip,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useColorModeValue,
	useDisclosure,
	useToast,
	VStack,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	FormControl,
	FormLabel,
	Textarea,
} from "@chakra-ui/react";
import { useProductStore } from "../store/product";
import { useState, useRef } from "react";
import { FaBoxOpen, FaExclamationTriangle } from "react-icons/fa";

const ProductCard = ({ product }) => {
	const [updatedProduct, setUpdatedProduct] = useState(product);

	const textColor = useColorModeValue("gray.600", "gray.200");
	const bg = useColorModeValue("white", "gray.800");

	const { deleteProduct, updateProduct, addToCart, updateStock } = useProductStore();
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isOpen: isDelOpen, onOpen: onDelOpen, onClose: onDelClose } = useDisclosure();
	const cancelRef = useRef();

	// determine if current user is admin to show admin actions
	let currentUser = null;
	try {
		const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
		if (raw) currentUser = JSON.parse(raw);
	} catch (err) {
		currentUser = null;
	}
	const isAdmin = currentUser?.role === 'admin';

	const handleDeleteProduct = async (pid) => {
		const { success, message } = await deleteProduct(pid);
		if (!success) {
			toast({
				title: "Error",
				description: message,
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} else {
			toast({
				title: "Success",
				description: message,
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const handleUpdateProduct = async (pid, updatedProduct) => {
		const { success, message } = await updateProduct(pid, updatedProduct);
		onClose();
		if (!success) {
			toast({
				title: "Error",
				description: message,
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} else {
			toast({
				title: "Success",
				description: "Product updated successfully",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const handleStockChange = async (change) => {
		const currentStock = product.stock || 0;
		const newStock = Math.max(0, currentStock + change);
		
		const { success, message } = await updateStock(product._id, newStock);
		if (!success) {
			toast({
				title: "Error",
				description: message,
				status: "error",
				duration: 2000,
			});
		} else {
			toast({
				title: "Stock Updated",
				description: `Stock ${change > 0 ? 'increased' : 'decreased'} to ${newStock}`,
				status: "success",
				duration: 2000,
			});
		}
	};

	const handleBuyNow = () => {
		const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
		if (!token) {
			return window.location.href = '/signin';
		}
		
		// Add product to cart
		const { success, message } = addToCart(product);
		if (!success) {
			toast({ title: 'Error', description: message, status: 'error', duration: 2000 });
		} else {
			// Redirect to checkout page
			window.location.href = '/order-checkout';
		}
	};

	return (
		<Box
			shadow='lg'
			rounded='lg'
			overflow='hidden'
			transition='all 0.3s'
			_hover={{ transform: "translateY(-5px)", shadow: "xl" }}
			bg={bg}
		>
			<Link to={`/product/${product._id}`}>
				<Image 
					src={product.image} 
					alt={product.name} 
					h={48} 
					w='full' 
					objectFit='cover'
					cursor="pointer"
					transition="all 0.2s"
					_hover={{ transform: "scale(1.05)" }}
				/>
			</Link>

			<Box p={4}>
					<HStack mb={2} alignItems="center" justifyContent="space-between">
						<Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
							<Heading 
								as='h3' 
								size='md'
								cursor="pointer"
								_hover={{ color: 'blue.500', textDecoration: 'underline' }}
								transition="all 0.2s"
							>
								{product.name}
							</Heading>
						</Link>
						{isAdmin ? (
							<Tooltip label="You can edit or delete this product">
								<Badge colorScheme="green">Admin</Badge>
							</Tooltip>
						) : (
							<Tooltip label="Edit/Delete are admin-only actions">
								<Badge colorScheme="red">Admin only</Badge>
							</Tooltip>
						)}
					</HStack>

				<Text fontWeight='bold' fontSize='xl' color={textColor} mb={2}>
					${product.price}
					{product.sales ? (
						<Text as='span' fontSize='sm' color='gray.500' ml={3}>Sold: {product.sales}</Text>
					) : null}
				</Text>

				{/* Stock Information */}
				<HStack mb={4} spacing={2}>
					{product.stock === 0 ? (
						<Badge colorScheme="red" display="flex" alignItems="center" gap={1}>
							<FaExclamationTriangle /> Out of Stock
						</Badge>
					) : product.stock <= 5 ? (
						<Badge colorScheme="orange" display="flex" alignItems="center" gap={1}>
							<FaExclamationTriangle /> Only {product.stock} left!
						</Badge>
					) : (
						<Badge colorScheme="blue" display="flex" alignItems="center" gap={1}>
							<FaBoxOpen /> In Stock: {product.stock}
						</Badge>
					)}
				</HStack>

				{/* Admin Stock Management */}
				{isAdmin && (
					<VStack mb={4} spacing={2} align="stretch">
						<HStack spacing={2}>
							<Button
								size="sm"
								colorScheme="red"
								onClick={() => handleStockChange(-1)}
								isDisabled={product.stock === 0}
							>
								-1
							</Button>
							<Button
								size="sm"
								colorScheme="gray"
								onClick={() => handleStockChange(-10)}
								isDisabled={product.stock < 10}
							>
								-10
							</Button>
							<Button
								size="sm"
								colorScheme="green"
								onClick={() => handleStockChange(1)}
							>
								+1
							</Button>
							<Button
								size="sm"
								colorScheme="green"
								onClick={() => handleStockChange(10)}
							>
								+10
							</Button>
						</HStack>
						<HStack spacing={2}>
							<Input
								size="sm"
								type="number"
								min="0"
								placeholder="Set stock"
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										const newStock = Number(e.target.value);
										if (!isNaN(newStock) && newStock >= 0) {
											handleStockChange(newStock - product.stock);
											e.target.value = '';
										}
									}
								}}
							/>
							<Button
								size="sm"
								colorScheme="blue"
								onClick={(e) => {
									const input = e.target.parentElement.querySelector('input');
									const newStock = Number(input.value);
									if (!isNaN(newStock) && newStock >= 0) {
										handleStockChange(newStock - product.stock);
										input.value = '';
									}
								}}
							>
								Set
							</Button>
						</HStack>
					</VStack>
				)}

				{isAdmin && (
					<HStack spacing={2}>
						<IconButton icon={<EditIcon />} onClick={onOpen} colorScheme='blue' />
						<IconButton
							icon={<DeleteIcon />}
							onClick={onDelOpen}
							colorScheme='red'
						/>
					</HStack>
				)}

				{/* Buy button for users */}
				<Box p={4}>
					{!isAdmin && (
						<VStack spacing={2} w="full">
							<Button 
								as={Link}
								to={`/product/${product._id}`}
								w="full"
								variant="outline"
								colorScheme="blue"
								borderWidth="2px"
								_hover={{
									transform: 'translateY(-2px)',
									boxShadow: 'md',
								}}
							>
								View Details
							</Button>
							<HStack spacing={2} w="full">
								<Button 
									flex={1}
									colorScheme='orange' 
									onClick={() => {
										const { success, message } = addToCart(product);
										if (!success) {
											toast({ title: 'Error', description: message, status: 'error', duration: 2000 });
										} else {
											toast({ title: 'Added to cart', status: 'success', duration: 2000 });
										}
									}}
									isDisabled={product.stock === 0}
								>
									Add to Cart
								</Button>
								<Button 
									flex={1}
									colorScheme='teal' 
									onClick={handleBuyNow}
									isDisabled={product.stock === 0}
								>
									Buy
								</Button>
							</HStack>
						</VStack>
					)}
				</Box>
			</Box>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />

				<ModalContent maxW="600px" borderRadius="2xl">
					<ModalHeader
						bgGradient="linear(to-r, blue.500, purple.500)"
						color="white"
						borderTopRadius="2xl"
						py={4}
					>
						Update Product
					</ModalHeader>
					<ModalCloseButton color="white" />
					<ModalBody py={6}>
						<VStack spacing={4}>
							<FormControl isRequired>
								<FormLabel>Product Name</FormLabel>
								<Input
									placeholder='Product Name'
									name='name'
									value={updatedProduct.name}
									onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
									size="lg"
									borderRadius="xl"
								/>
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Price</FormLabel>
								<Input
									placeholder='Price'
									name='price'
									type='number'
									value={updatedProduct.price}
									onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
									size="lg"
									borderRadius="xl"
								/>
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Image URL</FormLabel>
								<Input
									placeholder='Image URL'
									name='image'
									value={updatedProduct.image}
									onChange={(e) => setUpdatedProduct({ ...updatedProduct, image: e.target.value })}
									size="lg"
									borderRadius="xl"
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Description</FormLabel>
								<Textarea
									placeholder='Enter product description...'
									name='description'
									value={updatedProduct.description || ''}
									onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })}
									size="lg"
									borderRadius="xl"
									minH="120px"
									resize="vertical"
								/>
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Stock Quantity</FormLabel>
								<Input
									placeholder='Stock (e.g., 100)'
									name='stock'
									type='number'
									min='0'
									value={updatedProduct.stock || 0}
									onChange={(e) => {
										const value = Number(e.target.value) || 0;
										setUpdatedProduct({ ...updatedProduct, stock: value });
									}}
									size="lg"
									borderRadius="xl"
								/>
							</FormControl>
						</VStack>
					</ModalBody>

					<ModalFooter gap={3}>
						<Button
							variant='ghost'
							onClick={onClose}
							borderRadius="xl"
						>
							Cancel
						</Button>
						<Button
							bgGradient="linear(to-r, blue.500, purple.500)"
							color="white"
							onClick={() => handleUpdateProduct(product._id, updatedProduct)}
							borderRadius="xl"
							_hover={{
								bgGradient: "linear(to-r, blue.600, purple.600)",
								transform: "translateY(-2px)",
								boxShadow: "lg"
							}}
						>
							Update Product
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<AlertDialog isOpen={isDelOpen} leastDestructiveRef={cancelRef} onClose={onDelClose}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Product</AlertDialogHeader>
						<AlertDialogBody>Are you sure you want to delete "{product.name}"? This action cannot be undone.</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onDelClose} mr={3}>
								Cancel
							</Button>
							<Button colorScheme="red" onClick={async () => { await handleDeleteProduct(product._id); onDelClose(); }}>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Box>
	);
};
export default ProductCard;