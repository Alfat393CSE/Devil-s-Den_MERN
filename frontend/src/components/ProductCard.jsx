import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
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
} from "@chakra-ui/react";
import { useProductStore } from "../store/product";
import { useState, useRef } from "react";

const ProductCard = ({ product }) => {
	const [updatedProduct, setUpdatedProduct] = useState(product);

	const textColor = useColorModeValue("gray.600", "gray.200");
	const bg = useColorModeValue("white", "gray.800");

	const { deleteProduct, updateProduct, buyProduct, addToCart } = useProductStore();
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

	return (
		<Box
			shadow='lg'
			rounded='lg'
			overflow='hidden'
			transition='all 0.3s'
			_hover={{ transform: "translateY(-5px)", shadow: "xl" }}
			bg={bg}
		>
			<Image src={product.image} alt={product.name} h={48} w='full' objectFit='cover' />

			<Box p={4}>
					<HStack mb={2} alignItems="center" justifyContent="space-between">
						<Heading as='h3' size='md'>
							{product.name}
						</Heading>
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

				<Text fontWeight='bold' fontSize='xl' color={textColor} mb={4}>
					${product.price}
					{product.sales ? (
						<Text as='span' fontSize='sm' color='gray.500' ml={3}>Sold: {product.sales}</Text>
					) : null}
				</Text>

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
						<HStack spacing={3}>
							<Button colorScheme='orange' onClick={() => {
								addToCart(product);
								toast({ title: 'Added to cart', status: 'success', duration: 2000 });
							}}>Add to Cart</Button>
							<Button colorScheme='teal' onClick={async () => {
								const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
								if (!token) {
									return window.location.href = '/signin';
								}
								const { success, message } = await buyProduct(product._id);
								if (!success) {
									return toast({ title: 'Purchase failed', description: message, status: 'error', duration: 3000 });
								}
								toast({ title: 'Purchase successful', description: 'Thank you for your purchase!', status: 'success', duration: 3000 });
							}}>Buy</Button>
						</HStack>
					)}
				</Box>
			</Box>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />

				<ModalContent>
					<ModalHeader>Update Product</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={4}>
							<Input
								placeholder='Product Name'
								name='name'
								value={updatedProduct.name}
								onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
							/>
							<Input
								placeholder='Price'
								name='price'
								type='number'
								value={updatedProduct.price}
								onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
							/>
							<Input
								placeholder='Image URL'
								name='image'
								value={updatedProduct.image}
								onChange={(e) => setUpdatedProduct({ ...updatedProduct, image: e.target.value })}
							/>
						</VStack>
					</ModalBody>

					<ModalFooter>
						<Button
							colorScheme='blue'
							mr={3}
							onClick={() => handleUpdateProduct(product._id, updatedProduct)}
						>
							Update
						</Button>
						<Button variant='ghost' onClick={onClose}>
							Cancel
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