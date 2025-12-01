import React from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Avatar,
  VStack,
  Container,
  Flex,
  Image,
  Stack,
  Icon,
  HStack,
  useColorModeValue,
  Button,
  Divider
} from '@chakra-ui/react'
import { FaStore, FaUsers, FaShoppingCart, FaAward, FaCheckCircle, FaRocket, FaHeart, FaGlobe } from 'react-icons/fa'

const AboutPage = () => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const accentColor = useColorModeValue('blue.500', 'blue.400')

  const stats = [
    { label: 'Products', value: '1000+', icon: FaStore },
    { label: 'Happy Customers', value: '10,000+', icon: FaUsers },
    { label: 'Orders Completed', value: '50,000+', icon: FaShoppingCart },
    { label: 'Years Experience', value: '5+', icon: FaAward },
  ]

  const values = [
    {
      title: 'Quality First',
      description: 'We carefully curate every product to ensure the highest quality standards.',
      icon: FaCheckCircle,
      color: 'green.500'
    },
    {
      title: 'Fast Delivery',
      description: 'Lightning-fast shipping to get your products to you as quickly as possible.',
      icon: FaRocket,
      color: 'blue.500'
    },
    {
      title: 'Customer Care',
      description: 'Your satisfaction is our priority. We\'re here to help 24/7.',
      icon: FaHeart,
      color: 'red.500'
    },
    {
      title: 'Global Reach',
      description: 'Serving customers worldwide with localized experiences.',
      icon: FaGlobe,
      color: 'purple.500'
    },
  ]

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Hero Section */}
      <Box
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        py={{ base: 12, md: 20 }}
      >
        <Container maxW="1400px">
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            align="center"
            gap={12}
          >
            {/* Text Content */}
            <VStack align={{ base: 'center', lg: 'flex-start' }} flex={1} spacing={6} textAlign={{ base: 'center', lg: 'left' }}>
              <Heading
                size={{ base: 'xl', md: '3xl' }}
                bgGradient="linear(to-r, blue.500, purple.500)"
                bgClip="text"
                fontWeight="extrabold"
              >
                About Devil's Den
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" maxW="600px" lineHeight="tall">
                Welcome to Devil's Den - Your trusted destination for quality products and exceptional service. 
                We're passionate about bringing you the best shopping experience with carefully curated products.
              </Text>
              <Text fontSize="md" color="gray.500" maxW="600px">
                Founded with a vision to revolutionize online shopping, we combine cutting-edge technology 
                with personalized service to create an unmatched e-commerce experience.
              </Text>
              <Button colorScheme="blue" size="lg" mt={4}>
                Start Shopping
              </Button>
            </VStack>

            {/* Image */}
            <Box flex={1} w="full">
              <Image
                src="https://scontent.fdac24-4.fna.fbcdn.net/v/t39.30808-6/475080023_2345197669212211_1704024045379549541_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeEzycxkB7k9TJZyqa4wZDoJDB5THBbnjZcMHlMcFueNlzdXlO91e-Jr7PQkbLgglSM-5deRhBpm1FesIxgLQ7H-&_nc_ohc=RGLeRNclMi0Q7kNvwFh96yH&_nc_oc=Adm7B1DRBAgpBd6MKzmVG1dMdcB4tkGbqRAyL5eUqop7nnyhVKakndDSZu5emLSieOs&_nc_zt=23&_nc_ht=scontent.fdac24-4.fna&_nc_gid=x0t01YQ5r4v9iJMD0yekrg&oh=00_AfiXymlDKeXv_4j0GdWmxFnh25C0f8sLlIpxJvCPrvJmPA&oe=6920FF69"
                alt="Admin and Owner"
                borderRadius="2xl"
                shadow="2xl"
                objectFit="cover"
                w="full"
                h={{ base: '400px', md: '500px' }}
              />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={16} bg={useColorModeValue('white', 'gray.800')}>
        <Container maxW="1400px">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            {stats.map((stat, index) => (
              <VStack key={index} spacing={3}>
                <Icon as={stat.icon} boxSize={12} color={accentColor} />
                <Heading size="2xl" color={accentColor}>
                  {stat.value}
                </Heading>
                <Text fontSize="lg" color="gray.600" fontWeight="medium">
                  {stat.label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Our Values */}
      <Box py={16}>
        <Container maxW="1400px">
          <VStack spacing={4} mb={12} textAlign="center">
            <Heading size="2xl">Our Core Values</Heading>
            <Text fontSize="lg" color="gray.600" maxW="700px">
              These principles guide everything we do and shape the experience we deliver to our customers.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {values.map((value, index) => (
              <Box
                key={index}
                bg={bgColor}
                p={8}
                borderRadius="xl"
                border="1px"
                borderColor={borderColor}
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-8px)',
                  shadow: '2xl',
                  borderColor: value.color
                }}
              >
                <VStack align="flex-start" spacing={4}>
                  <Icon as={value.icon} boxSize={10} color={value.color} />
                  <Heading size="md">{value.title}</Heading>
                  <Text color="gray.600" lineHeight="tall">
                    {value.description}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box py={16} bg={bgColor} borderTop="1px" borderBottom="1px" borderColor={borderColor}>
        <Container maxW="1200px">
          <Stack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl">Our Mission</Heading>
              <Text fontSize="lg" color="gray.600" maxW="800px" lineHeight="tall">
                To empower customers worldwide with access to quality products, seamless shopping experiences, 
                and exceptional service that exceeds expectations at every touchpoint.
              </Text>
            </VStack>

            <Divider />

            <VStack spacing={4} textAlign="center">
              <Heading size="2xl">Our Vision</Heading>
              <Text fontSize="lg" color="gray.600" maxW="800px" lineHeight="tall">
                To become the world's most trusted and innovative e-commerce platform, setting new standards 
                for customer satisfaction and sustainable business practices.
              </Text>
            </VStack>
          </Stack>
        </Container>
      </Box>

      {/* Leadership Section */}
      <Box py={16}>
        <Container maxW="1400px">
          <VStack spacing={4} mb={12} textAlign="center">
            <Heading size="2xl">Meet the Leadership</Heading>
            <Text fontSize="lg" color="gray.600" maxW="700px">
              Our dedicated team works tirelessly to bring you the best shopping experience.
            </Text>
          </VStack>

          <Flex justify="center">
            <Box
              bg={bgColor}
              p={10}
              borderRadius="2xl"
              border="1px"
              borderColor={borderColor}
              shadow="xl"
              maxW="500px"
              w="full"
            >
              <VStack spacing={6}>
                <Image
                  src="https://scontent.fdac24-4.fna.fbcdn.net/v/t39.30808-6/475080023_2345197669212211_1704024045379549541_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeEzycxkB7k9TJZyqa4wZDoJDB5THBbnjZcMHlMcFueNlzdXlO91e-Jr7PQkbLgglSM-5deRhBpm1FesIxgLQ7H-&_nc_ohc=RGLeRNclMi0Q7kNvwFh96yH&_nc_oc=Adm7B1DRBAgpBd6MKzmVG1dMdcB4tkGbqRAyL5eUqop7nnyhVKakndDSZu5emLSieOs&_nc_zt=23&_nc_ht=scontent.fdac24-4.fna&_nc_gid=x0t01YQ5r4v9iJMD0yekrg&oh=00_AfiXymlDKeXv_4j0GdWmxFnh25C0f8sLlIpxJvCPrvJmPA&oe=6920FF69"
                  alt="Founder & CEO"
                  borderRadius="xl"
                  w="250px"
                  h="250px"
                  objectFit="cover"
                  border="4px"
                  borderColor={accentColor}
                />
                <VStack spacing={2}>
                  <Heading size="lg">Admin & Owner</Heading>
                  <Text fontSize="md" color={accentColor} fontWeight="semibold">
                    Founder & CEO
                  </Text>
                  <Text textAlign="center" color="gray.600" px={4} lineHeight="tall">
                    Leading Devil's Den with vision and passion, dedicated to creating exceptional 
                    shopping experiences and building a trusted brand that customers love.
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        py={20}
        bgGradient="linear(to-r, blue.500, purple.600)"
        color="white"
      >
        <Container maxW="1200px">
          <VStack spacing={6} textAlign="center">
            <Heading size="2xl">Ready to Start Shopping?</Heading>
            <Text fontSize="xl" maxW="700px">
              Join thousands of satisfied customers and discover why Devil's Den is the trusted choice for online shopping.
            </Text>
            <HStack spacing={4} pt={4}>
              <Button size="lg" bg="white" color="blue.600" _hover={{ bg: 'gray.100' }}>
                Explore Products
              </Button>
              <Button size="lg" variant="outline" borderColor="white" color="white" _hover={{ bg: 'whiteAlpha.200' }}>
                Contact Us
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}

export default AboutPage
