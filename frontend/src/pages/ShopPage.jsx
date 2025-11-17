import React, { useEffect } from 'react'
import { Box, Heading, Text, SimpleGrid, Button } from '@chakra-ui/react'
import { useProductStore } from '../store/product'
import ProductCard from '../components/ProductCard'

const ShopPage = () => {
  const products = useProductStore(state => state.products)
  const fetchProducts = useProductStore(state => state.fetchProducts)

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return (
    <Box p={6} maxW="1100px" mx="auto">
      <Box bgGradient='linear(to-r, teal.50, white)' p={8} borderRadius='md' mb={6}>
        <Heading>Shop</Heading>
        <Text mt={2} color='gray.600'>Curated selection of demo products — try the store features and enjoy clear examples.</Text>
        <Button mt={4} colorScheme='teal'>Start Shopping</Button>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {products.map(p => (
          <ProductCard key={p._id || p.id} product={p} />
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default ShopPage
