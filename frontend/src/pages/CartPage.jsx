import { Box, Button, Heading, HStack, Image, Text, VStack, StackDivider, useToast, IconButton, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react";
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { useProductStore } from "../store/product";

const CartPage = () => {
	const cart = useProductStore((s) => s.cart);
	const removeFromCart = useProductStore((s) => s.removeFromCart);
	const updateCartQty = useProductStore((s) => s.updateCartQty);
	const checkoutCart = useProductStore((s) => s.checkoutCart);
	const clearCart = useProductStore((s) => s.clearCart);
	const toast = useToast();

	const total = cart.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);

	const handleCheckout = async () => {
		const result = await checkoutCart();
		if (!result.success) return toast({ title: 'Checkout failed', description: result.message, status: 'error' });
		toast({ title: 'Checkout successful', status: 'success' });
		clearCart();
	};

	return (
		<Box p={6}>
			<Heading mb={4}>Your Cart</Heading>
			{!cart.length ? (
				<Text>No items in cart.</Text>
			) : (
				<VStack align='stretch' divider={<StackDivider />} spacing={4}>
					{cart.map(item => (
						<HStack key={item._id} spacing={4} align='center'>
							<Image src={item.image} boxSize='80px' objectFit='cover' />
							<VStack align='start' spacing={0}>
								<Text fontWeight='bold'>{item.name}</Text>
								<Text>Unit: ${item.price.toFixed(2)}</Text>
								<HStack>
									<IconButton size='sm' aria-label='Decrease' icon={<MinusIcon />} onClick={() => updateCartQty(item._id, (item.qty || 1) - 1)} />
									<NumberInput size='sm' maxW={24} min={1} value={item.qty || 1} onChange={(valueString, valueNumber) => updateCartQty(item._id, Number.isNaN(valueNumber) ? 1 : valueNumber)}>
										<NumberInputField />
										<NumberInputStepper>
											<NumberIncrementStepper />
											<NumberDecrementStepper />
										</NumberInputStepper>
									</NumberInput>
									<IconButton size='sm' aria-label='Increase' icon={<AddIcon />} onClick={() => updateCartQty(item._id, (item.qty || 1) + 1)} />
								</HStack>
								<Text>Total: ${(item.price * (item.qty || 1)).toFixed(2)}</Text>
							</VStack>
							<Button colorScheme='red' onClick={() => removeFromCart(item._id)}>Remove</Button>
						</HStack>
					))}
					<HStack justify='space-between' w='full' pt={4}>
						<Text fontWeight='bold'>Total: ${total.toFixed(2)}</Text>
						<Button colorScheme='teal' onClick={handleCheckout}>Checkout</Button>
					</HStack>
				</VStack>
			)}
		</Box>
	)
}

export default CartPage;
