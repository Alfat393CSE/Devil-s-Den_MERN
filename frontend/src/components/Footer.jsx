import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  Flex,
  IconButton,
  useColorModeValue,
  Divider,
  HStack,
  VStack,
  Heading,
  SimpleGrid,
  Input,
  Button,
  InputGroup,
  InputRightElement,
  Icon
} from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt, FaStore } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const bgColor = useColorModeValue('gray.900', 'gray.900');
  const textColor = useColorModeValue('gray.300', 'gray.400');
  const headingColor = useColorModeValue('white', 'white');
  const borderColor = useColorModeValue('gray.700', 'gray.700');

  return (
    <Box bg={bgColor} color={textColor} mt="auto">
      {/* Main Footer */}
      <Box borderBottom="1px" borderColor={borderColor}>
        <Container maxW="1400px" py={16}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            {/* Company Info */}
            <VStack align="flex-start" spacing={5}>
              <HStack spacing={2}>
                <Box p={2} bg="blue.500" borderRadius="md">
                  <FaStore color="white" size={20} />
                </Box>
                <Heading size="lg" color={headingColor} fontWeight="800">
                  Devil's Den
                </Heading>
              </HStack>
              <Text fontSize="sm" lineHeight="tall">
                Your trusted destination for quality products. We bring you the best selection with unbeatable prices and exceptional service.
              </Text>
              <VStack align="flex-start" spacing={3} pt={2}>
                <HStack spacing={3}>
                  <Icon as={FaPhone} color="blue.400" />
                  <Text fontSize="sm">01736276082</Text>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={FaEnvelope} color="blue.400" />
                  <Text fontSize="sm">alfattasnimhasan@gmail.com</Text>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={FaMapMarkerAlt} color="blue.400" />
                  <Text fontSize="sm">123 Commerce St, NY 10001</Text>
                </HStack>
              </VStack>
            </VStack>

            {/* Quick Links */}
            <VStack align="flex-start" spacing={4}>
              <Heading size="md" color={headingColor} fontWeight="bold" mb={2}>
                Quick Links
              </Heading>
              <Link as={RouterLink} to="/" fontSize="sm" _hover={{ color: 'blue.400', pl: 2 }} transition="all 0.3s">
                Home
              </Link>
              <Link as={RouterLink} to="/shop" fontSize="sm" _hover={{ color: 'blue.400', pl: 2 }} transition="all 0.3s">
                Shop
              </Link>
              <Link as={RouterLink} to="/about" fontSize="sm" _hover={{ color: 'blue.400', pl: 2 }} transition="all 0.3s">
                About Us
              </Link>
              <Link as={RouterLink} to="/contact" fontSize="sm" _hover={{ color: 'blue.400', pl: 2 }} transition="all 0.3s">
                Contact
              </Link>
              <Link as={RouterLink} to="/sell" fontSize="sm" _hover={{ color: 'blue.400', pl: 2 }} transition="all 0.3s">
                Sell Products
              </Link>
            </VStack>

            {/* Customer Service */}
            <VStack align="flex-start" spacing={4}>
              <Heading size="md" color={headingColor} fontWeight="bold" mb={2}>
                Customer Service
              </Heading>
              <Link as={RouterLink} to="/cart" fontSize="sm" _hover={{ color: 'blue.400', pl: 2 }} transition="all 0.3s">
                Shopping Cart
              </Link>
              <Link as={RouterLink} to="/dashboard" fontSize="sm" _hover={{ color: 'blue.400', pl: 2 }} transition="all 0.3s">
                My Account
              </Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'blue.400', pl: 2 }} transition="all 0.3s">
                Track Order
              </Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'blue.400', pl: 2 }} transition="all 0.3s">
                Shipping & Returns
              </Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'blue.400', pl: 2 }} transition="all 0.3s">
                Help & Support
              </Link>
            </VStack>

            {/* Newsletter */}
            <VStack align="flex-start" spacing={4}>
              <Heading size="md" color={headingColor} fontWeight="bold" mb={2}>
                Newsletter
              </Heading>
              <Text fontSize="sm" lineHeight="tall">
                Subscribe to get special offers, free giveaways, and exclusive deals.
              </Text>
              <InputGroup size="md">
                <Input
                  placeholder="Your email"
                  bg="gray.800"
                  border="1px"
                  borderColor="gray.700"
                  _hover={{ borderColor: 'gray.600' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  color="white"
                />
                <InputRightElement width="auto" pr={1}>
                  <Button size="sm" colorScheme="blue" px={4}>
                    Subscribe
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Text fontSize="xs" color="gray.500">
                By subscribing, you agree to our Privacy Policy
              </Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Bottom Bar */}
      <Box bg={useColorModeValue('gray.950', 'black')} py={6}>
        <Container maxW="1400px">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap={4}
          >
            {/* Copyright */}
            <Text fontSize="sm" textAlign={{ base: 'center', md: 'left' }}>
              © {new Date().getFullYear()} Devil's Den. All rights reserved. Made with ❤️ by{' '}
              <Link href="#" color="blue.400" _hover={{ color: 'blue.300' }}>
                Your Team
              </Link>
            </Text>

            {/* Social Media */}
            <HStack spacing={4}>
              <IconButton
                as="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                icon={<FaFacebook />}
                size="sm"
                bg="gray.800"
                color="gray.400"
                _hover={{ bg: 'blue.600', color: 'white', transform: 'translateY(-2px)' }}
                transition="all 0.3s"
              />
              <IconButton
                as="a"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                icon={<FaTwitter />}
                size="sm"
                bg="gray.800"
                color="gray.400"
                _hover={{ bg: 'blue.400', color: 'white', transform: 'translateY(-2px)' }}
                transition="all 0.3s"
              />
              <IconButton
                as="a"
                href="https://www.instagram.com/athassan246/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                icon={<FaInstagram />}
                size="sm"
                bg="gray.800"
                color="gray.400"
                _hover={{ bg: 'pink.600', color: 'white', transform: 'translateY(-2px)' }}
                transition="all 0.3s"
              />
              <IconButton
                as="a"
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                icon={<FaLinkedin />}
                size="sm"
                bg="gray.800"
                color="gray.400"
                _hover={{ bg: 'blue.700', color: 'white', transform: 'translateY(-2px)' }}
                transition="all 0.3s"
              />
              <IconButton
                as="a"
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                icon={<FaYoutube />}
                size="sm"
                bg="gray.800"
                color="gray.400"
                _hover={{ bg: 'red.600', color: 'white', transform: 'translateY(-2px)' }}
                transition="all 0.3s"
              />
            </HStack>

            {/* Legal Links */}
            <HStack spacing={4} fontSize="sm">
              <Link href="#" _hover={{ color: 'blue.400' }}>
                Privacy Policy
              </Link>
              <Text>•</Text>
              <Link href="#" _hover={{ color: 'blue.400' }}>
                Terms of Service
              </Link>
              <Text>•</Text>
              <Link href="#" _hover={{ color: 'blue.400' }}>
                Cookies
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
