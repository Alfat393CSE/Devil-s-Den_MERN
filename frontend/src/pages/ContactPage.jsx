import React, { useState } from 'react'
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  useToast,
  Container,
  Flex,
  Icon,
  HStack,
  useColorModeValue,
  SimpleGrid
} from '@chakra-ui/react'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Message sent successfully!',
        description: 'Thanks for reaching out. We\'ll get back to you within 24 hours.',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
      setIsSubmitting(false)
    }, 1000)
  }

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const inputBg = useColorModeValue('gray.50', 'gray.700')

  const contactInfo = [
    {
      icon: FaPhone,
      title: 'Phone',
      detail: '01736276082',
      subDetail: 'Mon-Fri, 9am-6pm EST',
      color: 'blue.500'
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      detail: 'alfattasnimhasan@gmail.com',
      subDetail: 'We\'ll respond within 24hrs',
      color: 'red.500'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Office',
      detail: '123 Commerce Street',
      subDetail: 'New York, NY 10001',
      color: 'green.500'
    },
    {
      icon: FaClock,
      title: 'Business Hours',
      detail: 'Monday - Friday',
      subDetail: '9:00 AM - 6:00 PM EST',
      color: 'purple.500'
    }
  ]

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} py={16}>
      <Container maxW="1400px">
        {/* Header */}
        <VStack spacing={4} mb={12} textAlign="center">
          <Heading
            size="2xl"
            bgGradient="linear(to-r, blue.500, purple.500)"
            bgClip="text"
            fontWeight="extrabold"
          >
            Get In Touch
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="700px">
            Have a question or need assistance? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Text>
        </VStack>

        <Flex
          direction={{ base: 'column', lg: 'row' }}
          gap={8}
          align="stretch"
        >
          {/* Contact Form */}
          <Box
            flex={1.5}
            bg={bgColor}
            p={{ base: 6, md: 10 }}
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            shadow="xl"
          >
            <VStack align="stretch" spacing={2} mb={8}>
              <Heading size="lg">Send us a message</Heading>
              <Text color="gray.600">
                Fill out the form below and we'll get back to you shortly.
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Full Name</FormLabel>
                    <Input
                      placeholder="John Doe"
                      size="lg"
                      bg={inputBg}
                      border="1px"
                      borderColor={borderColor}
                      value={form.name}
                      onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Email Address</FormLabel>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      size="lg"
                      bg={inputBg}
                      border="1px"
                      borderColor={borderColor}
                      value={form.email}
                      onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel fontWeight="semibold">Phone Number</FormLabel>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      size="lg"
                      bg={inputBg}
                      border="1px"
                      borderColor={borderColor}
                      value={form.phone}
                      onChange={(e) => setForm(s => ({ ...s, phone: e.target.value }))}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Subject</FormLabel>
                    <Input
                      placeholder="How can we help?"
                      size="lg"
                      bg={inputBg}
                      border="1px"
                      borderColor={borderColor}
                      value={form.subject}
                      onChange={(e) => setForm(s => ({ ...s, subject: e.target.value }))}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel fontWeight="semibold">Message</FormLabel>
                  <Textarea
                    placeholder="Tell us more about your inquiry..."
                    size="lg"
                    rows={6}
                    bg={inputBg}
                    border="1px"
                    borderColor={borderColor}
                    value={form.message}
                    onChange={(e) => setForm(s => ({ ...s, message: e.target.value }))}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    resize="vertical"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  fontSize="md"
                  fontWeight="bold"
                  isLoading={isSubmitting}
                  loadingText="Sending..."
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.3s"
                >
                  Send Message
                </Button>
              </VStack>
            </form>
          </Box>

          {/* Contact Information Sidebar */}
          <VStack flex={1} spacing={6} align="stretch">
            {/* Contact Cards */}
            <VStack spacing={4} align="stretch">
              {contactInfo.map((info, index) => (
                <Box
                  key={index}
                  bg={bgColor}
                  p={6}
                  borderRadius="xl"
                  border="1px"
                  borderColor={borderColor}
                  shadow="md"
                  transition="all 0.3s"
                  _hover={{ shadow: 'xl', transform: 'translateY(-2px)' }}
                >
                  <HStack spacing={4} align="flex-start">
                    <Icon
                      as={info.icon}
                      boxSize={6}
                      color={info.color}
                    />
                    <VStack align="flex-start" spacing={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {info.title}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {info.detail}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {info.subDetail}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>

            {/* Social Media */}
            <Box
              bg={bgColor}
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              shadow="md"
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Follow Us</Heading>
                <Text fontSize="sm" color="gray.600">
                  Stay connected with us on social media for updates and news.
                </Text>
                <HStack spacing={3} pt={2}>
                  <Button
                    as="a"
                    href="https://facebook.com"
                    target="_blank"
                    leftIcon={<FaFacebook />}
                    colorScheme="facebook"
                    size="sm"
                    variant="solid"
                  >
                    Facebook
                  </Button>
                  <Button
                    as="a"
                    href="https://twitter.com"
                    target="_blank"
                    leftIcon={<FaTwitter />}
                    colorScheme="twitter"
                    size="sm"
                    variant="solid"
                  >
                    Twitter
                  </Button>
                </HStack>
                <HStack spacing={3}>
                  <Button
                    as="a"
                    href="https://www.instagram.com/athassan246/?hl=en"
                    target="_blank"
                    leftIcon={<FaInstagram />}
                    colorScheme="pink"
                    size="sm"
                    variant="solid"
                  >
                    Instagram
                  </Button>
                  <Button
                    as="a"
                    href="https://linkedin.com"
                    target="_blank"
                    leftIcon={<FaLinkedin />}
                    colorScheme="linkedin"
                    size="sm"
                    variant="solid"
                  >
                    LinkedIn
                  </Button>
                </HStack>
              </VStack>
            </Box>

            {/* Quick Info */}
            <Box
              bg="blue.500"
              color="white"
              p={6}
              borderRadius="xl"
              shadow="md"
            >
              <VStack align="stretch" spacing={3}>
                <Heading size="md">Need Immediate Help?</Heading>
                <Text fontSize="sm">
                  For urgent matters, please call us directly at our customer service line.
                </Text>
                <Button
                  as="a"
                  href="tel:01736276082"
                  bg="white"
                  color="blue.600"
                  size="md"
                  fontWeight="bold"
                  _hover={{ bg: 'gray.100' }}
                >
                  Call Now: 01736276082
                </Button>
              </VStack>
            </Box>
          </VStack>
        </Flex>

        {/* FAQ Section */}
        <Box mt={16}>
          <VStack spacing={4} mb={8} textAlign="center">
            <Heading size="xl">Frequently Asked Questions</Heading>
            <Text color="gray.600" maxW="700px">
              Find quick answers to common questions before reaching out.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {[
              {
                q: 'What are your shipping times?',
                a: 'We typically ship within 1-2 business days. Delivery times vary by location but usually take 3-7 business days.'
              },
              {
                q: 'What is your return policy?',
                a: 'We offer a 30-day return policy for all products in original condition. Returns are free and easy to process.'
              },
              {
                q: 'Do you ship internationally?',
                a: 'Yes! We ship to over 100 countries worldwide. International shipping rates and times vary by destination.'
              },
              {
                q: 'How can I track my order?',
                a: 'Once your order ships, you\'ll receive a tracking number via email. You can also check your order status in your account dashboard.'
              }
            ].map((faq, index) => (
              <Box
                key={index}
                bg={bgColor}
                p={6}
                borderRadius="xl"
                border="1px"
                borderColor={borderColor}
                shadow="sm"
              >
                <Heading size="sm" mb={3} color="blue.600">
                  {faq.q}
                </Heading>
                <Text fontSize="sm" color="gray.600" lineHeight="tall">
                  {faq.a}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  )
}

export default ContactPage
