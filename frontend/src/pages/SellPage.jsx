import React, { useState } from 'react'
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Container,
  VStack,
  Text,
  SimpleGrid,
  Icon,
  HStack,
  useColorModeValue,
  InputGroup,
  InputLeftAddon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react'
import { useProductStore } from '../store/product'
import { FaBox, FaDollarSign, FaImage, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'

const SellPage = () => {
  const [form, setForm] = useState({ name: '', price: '', image: '', description: '', stock: null })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  const submitProduct = useProductStore(state => state.submitProduct)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { success, message } = await submitProduct({
      name: form.name,
      price: Number(form.price),
      image: form.image,
      description: form.description,
      stock: form.stock
    })

    setIsSubmitting(false)

    if (!success) {
      return toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }

    toast({
      title: 'Product Submitted!',
      description: 'Your product has been submitted for review. Our team will approve it shortly.',
      status: 'success',
      duration: 5000,
      isClosable: true
    })

    setForm({ name: '', price: '', image: '', description: '', stock: 1 })
  }

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const inputBg = useColorModeValue('gray.50', 'gray.700')

  const benefits = [
    {
      icon: FaCheckCircle,
      title: 'Quick Approval',
      description: 'Products are reviewed within 24 hours'
    },
    {
      icon: FaCheckCircle,
      title: 'Wide Reach',
      description: 'Your products reach thousands of customers'
    },
    {
      icon: FaCheckCircle,
      title: 'Easy Process',
      description: 'Simple form to list your products'
    }
  ]

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} py={16}>
      <Container maxW="1200px">
        {/* Header */}
        <VStack spacing={4} mb={12} textAlign="center">
          <Heading
            size="2xl"
            bgGradient="linear(to-r, blue.500, purple.500)"
            bgClip="text"
            fontWeight="extrabold"
          >
            Sell Your Products
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="700px">
            List your products on Devil's Den and reach thousands of potential customers. Fill out the form below to submit your product for review.
          </Text>
        </VStack>

        {/* Main Content */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="start">
          {/* Form Section */}
          <Box
            bg={bgColor}
            p={{ base: 6, md: 10 }}
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            shadow="xl"
          >
            <VStack align="stretch" spacing={2} mb={8}>
              <Heading size="lg">Product Details</Heading>
              <Text color="gray.600">
                Provide accurate information about your product
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Product Name */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                    <Icon as={FaBox} color="blue.500" />
                    Product Name
                  </FormLabel>
                  <Input
                    placeholder="Enter product name"
                    size="lg"
                    bg={inputBg}
                    border="1px"
                    borderColor={borderColor}
                    value={form.name}
                    onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Choose a clear and descriptive name
                  </Text>
                </FormControl>

                {/* Price */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                    <Icon as={FaDollarSign} color="green.500" />
                    Price
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftAddon bg={inputBg} border="1px" borderColor={borderColor}>
                      $
                    </InputLeftAddon>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      bg={inputBg}
                      border="1px"
                      borderColor={borderColor}
                      value={form.price}
                      onChange={(e) => setForm(s => ({ ...s, price: e.target.value }))}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    />
                  </InputGroup>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Set a competitive price for your product
                  </Text>
                </FormControl>

                {/* Image URL */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                    <Icon as={FaImage} color="purple.500" />
                    Product Image URL
                  </FormLabel>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    size="lg"
                    bg={inputBg}
                    border="1px"
                    borderColor={borderColor}
                    value={form.image}
                    onChange={(e) => setForm(s => ({ ...s, image: e.target.value }))}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Provide a direct link to a high-quality product image
                  </Text>
                </FormControl>

                {/* Description */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                    <Icon as={FaInfoCircle} color="orange.500" />
                    Product Description
                  </FormLabel>
                  <Textarea
                    placeholder="Describe your product in detail..."
                    size="lg"
                    rows={6}
                    bg={inputBg}
                    border="1px"
                    borderColor={borderColor}
                    value={form.description}
                    onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    resize="vertical"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Include key features, specifications, and benefits
                  </Text>
                </FormControl>

                {/* Stock */}
                <FormControl>
                  <FormLabel fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                    <Icon as={FaBox} color="teal.500" />
                    Stock Quantity
                  </FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter quantity (default: 1)"
                    size="lg"
                    min="1"
                    bg={inputBg}
                    border="1px"
                    borderColor={borderColor}
                    value={form.stock}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 1;
                      setForm(s => ({ ...s, stock: value }));
                    }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Number of items you have available for sale
                  </Text>
                </FormControl>

                <Divider />

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  fontSize="md"
                  fontWeight="bold"
                  isLoading={isSubmitting}
                  loadingText="Submitting..."
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.3s"
                  leftIcon={<FaCheckCircle />}
                >
                  Submit for Review
                </Button>
              </VStack>
            </form>
          </Box>

          {/* Information Sidebar */}
          <VStack spacing={6} align="stretch">
            {/* Info Alert */}
            <Alert
              status="info"
              variant="left-accent"
              flexDirection="column"
              alignItems="flex-start"
              borderRadius="xl"
              p={6}
              bg={bgColor}
              border="1px"
              borderColor={borderColor}
            >
              <HStack mb={2}>
                <AlertIcon />
                <AlertTitle>Review Process</AlertTitle>
              </HStack>
              <AlertDescription fontSize="sm" lineHeight="tall">
                All product submissions are reviewed by our team to ensure quality and authenticity. You'll receive a notification once your product is approved and live on the platform.
              </AlertDescription>
            </Alert>

            {/* Benefits */}
            <Box
              bg={bgColor}
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              shadow="md"
            >
              <Heading size="md" mb={6}>Why Sell With Us?</Heading>
              <VStack spacing={4} align="stretch">
                {benefits.map((benefit, index) => (
                  <HStack key={index} spacing={4} align="flex-start">
                    <Icon
                      as={benefit.icon}
                      boxSize={6}
                      color="green.500"
                      mt={1}
                    />
                    <VStack align="flex-start" spacing={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {benefit.title}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {benefit.description}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Guidelines */}
            <Box
              bg={bgColor}
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              shadow="md"
            >
              <Heading size="md" mb={4}>Submission Guidelines</Heading>
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  ✓ Use high-quality, clear product images
                </Text>
                <Text fontSize="sm" color="gray.600">
                  ✓ Provide accurate pricing information
                </Text>
                <Text fontSize="sm" color="gray.600">
                  ✓ Write detailed product descriptions
                </Text>
                <Text fontSize="sm" color="gray.600">
                  ✓ Ensure products comply with our policies
                </Text>
                <Text fontSize="sm" color="gray.600">
                  ✓ Include all relevant product specifications
                </Text>
              </VStack>
            </Box>

            {/* Contact Support */}
            <Box
              bg="blue.500"
              color="white"
              p={6}
              borderRadius="xl"
              shadow="md"
            >
              <VStack align="stretch" spacing={3}>
                <Heading size="md">Need Help?</Heading>
                <Text fontSize="sm">
                  If you have questions about selling on our platform, our support team is here to help.
                </Text>
                <Button
                  as="a"
                  href="/contact"
                  bg="white"
                  color="blue.600"
                  size="md"
                  fontWeight="bold"
                  _hover={{ bg: 'gray.100' }}
                >
                  Contact Support
                </Button>
              </VStack>
            </Box>
          </VStack>
        </SimpleGrid>
      </Container>
    </Box>
  )
}

export default SellPage
