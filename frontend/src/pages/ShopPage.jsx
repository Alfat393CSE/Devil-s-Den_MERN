import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Container,
  Flex,
  HStack,
  VStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  Divider,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Stack,
  Checkbox,
  useColorModeValue,
  Icon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from '@chakra-ui/react'
import { useProductStore } from '../store/product'
import ProductCard from '../components/ProductCard'
import { FaSearch, FaFilter, FaThLarge, FaTh, FaChevronRight, FaSortAmountDown } from 'react-icons/fa'
import { Link as RouterLink } from 'react-router-dom'

const ShopPage = () => {
  const products = useProductStore(state => state.products)
  const fetchProducts = useProductStore(state => state.fetchProducts)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [gridColumns, setGridColumns] = useState(4)
  const [selectedCategories, setSelectedCategories] = useState([])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Calculate max price from products
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000
    return Math.max(...products.map(p => Number(p.price) || 0))
  }, [products])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Price filter
    filtered = filtered.filter(p => {
      const price = Number(p.price) || 0
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
        break
      case 'price-high':
        filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
        break
      case 'name':
        filtered.sort((a, b) => a.name?.localeCompare(b.name))
        break
      case 'newest':
        filtered.reverse()
        break
      default:
        break
    }

    return filtered
  }, [products, searchQuery, priceRange, sortBy])

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const filterBg = useColorModeValue('gray.50', 'gray.900')

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Breadcrumb */}
      <Box bg={bgColor} borderBottom="1px" borderColor={borderColor} py={3}>
        <Container maxW="1400px">
          <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gray.500" boxSize={3} />}>
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Shop</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>

      <Container maxW="1400px" py={8}>
        {/* Header */}
        <Box mb={8}>
          <Heading size="2xl" mb={2}>All Products</Heading>
          <Text color="gray.600" fontSize="lg">
            Discover our complete collection ({filteredProducts.length} items)
          </Text>
        </Box>

        <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
          {/* Desktop Filters - Left Sidebar */}
          <Box
            display={{ base: 'none', lg: 'block' }}
            w="280px"
            flexShrink={0}
          >
            <Box
              bg={bgColor}
              p={6}
              borderRadius="lg"
              border="1px"
              borderColor={borderColor}
              position="sticky"
              top="80px"
            >
              <VStack align="stretch" spacing={6}>
                {/* Search */}
                <Box>
                  <Text fontWeight="bold" mb={3} fontSize="lg">Search</Text>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaSearch color="gray.500" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </Box>

                <Divider />

                {/* Price Range */}
                <Box>
                  <Text fontWeight="bold" mb={3} fontSize="lg">Price Range</Text>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    ${priceRange[0]} - ${priceRange[1]}
                  </Text>
                  <RangeSlider
                    value={priceRange}
                    onChange={setPriceRange}
                    min={0}
                    max={Math.ceil(maxPrice)}
                    step={10}
                  >
                    <RangeSliderTrack bg="gray.200">
                      <RangeSliderFilledTrack bg="blue.500" />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} boxSize={5} />
                    <RangeSliderThumb index={1} boxSize={5} />
                  </RangeSlider>
                </Box>

                <Divider />

                {/* Sort By */}
                <Box>
                  <Text fontWeight="bold" mb={3} fontSize="lg">Sort By</Text>
                  <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </Select>
                </Box>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setPriceRange([0, maxPrice])
                    setSortBy('featured')
                  }}
                >
                  Reset Filters
                </Button>
              </VStack>
            </Box>
          </Box>

          {/* Main Content */}
          <Box flex={1}>
            {/* Toolbar */}
            <Flex
              bg={bgColor}
              p={4}
              borderRadius="lg"
              mb={6}
              border="1px"
              borderColor={borderColor}
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={4}
            >
              {/* Mobile Filter Button */}
              <Button
                display={{ base: 'flex', lg: 'none' }}
                leftIcon={<FaFilter />}
                onClick={onOpen}
                size="sm"
              >
                Filters
              </Button>

              {/* Results Count */}
              <HStack>
                <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full">
                  {filteredProducts.length} Products
                </Badge>
              </HStack>

              {/* Desktop Sort */}
              <HStack display={{ base: 'none', lg: 'flex' }} spacing={4}>
                <HStack>
                  <Icon as={FaSortAmountDown} color="gray.500" />
                  <Select
                    size="sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    w="200px"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </Select>
                </HStack>

                {/* Grid View Buttons */}
                <HStack spacing={2}>
                  <IconButton
                    icon={<FaThLarge />}
                    size="sm"
                    variant={gridColumns === 3 ? 'solid' : 'ghost'}
                    colorScheme={gridColumns === 3 ? 'blue' : 'gray'}
                    onClick={() => setGridColumns(3)}
                    aria-label="3 columns"
                  />
                  <IconButton
                    icon={<FaTh />}
                    size="sm"
                    variant={gridColumns === 4 ? 'solid' : 'ghost'}
                    colorScheme={gridColumns === 4 ? 'blue' : 'gray'}
                    onClick={() => setGridColumns(4)}
                    aria-label="4 columns"
                  />
                </HStack>
              </HStack>
            </Flex>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <SimpleGrid
                columns={{ base: 1, sm: 2, md: 2, lg: gridColumns === 4 ? 4 : 3 }}
                spacing={6}
              >
                {filteredProducts.map(p => (
                  <ProductCard key={p._id || p.id} product={p} />
                ))}
              </SimpleGrid>
            ) : (
              <Box
                bg={bgColor}
                p={12}
                borderRadius="lg"
                textAlign="center"
                border="1px"
                borderColor={borderColor}
              >
                <Text fontSize="xl" color="gray.500" mb={4}>No products found</Text>
                <Text color="gray.400" mb={6}>Try adjusting your filters or search query</Text>
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    setSearchQuery('')
                    setPriceRange([0, maxPrice])
                    setSortBy('featured')
                  }}
                >
                  Clear All Filters
                </Button>
              </Box>
            )}
          </Box>
        </Flex>
      </Container>

      {/* Mobile Filter Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Filters</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={6} py={4}>
              {/* Search */}
              <Box>
                <Text fontWeight="bold" mb={3}>Search</Text>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaSearch color="gray.500" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </Box>

              <Divider />

              {/* Price Range */}
              <Box>
                <Text fontWeight="bold" mb={3}>Price Range</Text>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  ${priceRange[0]} - ${priceRange[1]}
                </Text>
                <RangeSlider
                  value={priceRange}
                  onChange={setPriceRange}
                  min={0}
                  max={Math.ceil(maxPrice)}
                  step={10}
                >
                  <RangeSliderTrack bg="gray.200">
                    <RangeSliderFilledTrack bg="blue.500" />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} boxSize={5} />
                  <RangeSliderThumb index={1} boxSize={5} />
                </RangeSlider>
              </Box>

              <Divider />

              {/* Sort By */}
              <Box>
                <Text fontWeight="bold" mb={3}>Sort By</Text>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </Select>
              </Box>

              <Button
                colorScheme="blue"
                onClick={() => {
                  setSearchQuery('')
                  setPriceRange([0, maxPrice])
                  setSortBy('featured')
                  onClose()
                }}
              >
                Apply Filters
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setPriceRange([0, maxPrice])
                  setSortBy('featured')
                }}
              >
                Reset Filters
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export default ShopPage
