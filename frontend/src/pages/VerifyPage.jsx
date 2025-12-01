import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Stack,
  Heading,
  PinInput,
  PinInputField,
  HStack,
  useToast,
  Link,
  Container,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyPage = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [developmentOTP, setDevelopmentOTP] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    // Get email and development OTP from navigation state
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.developmentOTP) {
      setDevelopmentOTP(location.state.developmentOTP);
    }
  }, [location]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (ev) => {
    ev.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP code",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast({
          title: "Verification failed",
          description: data.message || "Wrong code or code expired",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Success!",
        description: "Email verified successfully!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // Redirect to home or dashboard
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      toast({
        title: "Error",
        description: "Server error. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast({
          title: "Resend failed",
          description: data.message || "Failed to resend OTP",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        setResendLoading(false);
        return;
      }

      // Update developmentOTP if email service failed (fallback)
      if (data.developmentOTP) {
        setDevelopmentOTP(data.developmentOTP);
        toast({
          title: "⚠️ Email Service Unavailable",
          description: "Check the OTP code displayed below or in backend console",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "📧 New OTP Sent!",
          description: `A new OTP has been sent to ${email}. Check your inbox (and spam folder).`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }

      // Start countdown
      setCountdown(60);
      setOtp("");
      setResendLoading(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Server error. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setResendLoading(false);
    }
  };

  const bgGradient = useColorModeValue(
    "linear(to-br, purple.50, blue.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Box minH="100vh" bgGradient={bgGradient} py={12} px={4}>
      <Container maxW="lg">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={2} textAlign="center">
            <Heading
              fontSize={{ base: "3xl", md: "4xl" }}
              bgGradient="linear(to-r, purple.500, pink.500)"
              bgClip="text"
              fontWeight="extrabold"
            >
              Verify Your Email
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Enter the 6-digit code sent to your email
            </Text>
          </VStack>

          {/* Email Info Banner */}
          {!developmentOTP && email && (
            <Box
              p={4}
              bg="blue.50"
              borderRadius="xl"
              borderWidth="2px"
              borderColor="blue.200"
            >
              <Text fontSize="sm" color="blue.800" textAlign="center" fontWeight="medium">
                📧 Check your email: <strong>{email}</strong>
              </Text>
              <Text fontSize="xs" color="gray.600" textAlign="center" mt={1}>
                Don't forget to check your spam/junk folder!
              </Text>
            </Box>
          )}

          {/* Main Card */}
          <Box
            bg={cardBg}
            rounded="2xl"
            shadow="2xl"
            p={{ base: 6, md: 10 }}
            borderWidth="1px"
            borderColor="gray.100"
          >
            <form onSubmit={handleVerify}>
              <VStack spacing={6}>
                {/* Email Input */}
                <FormControl>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Email Address
                  </FormLabel>
                  <Input
                    size="lg"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    bg={inputBg}
                    border="2px"
                    borderColor="gray.200"
                    _hover={{ borderColor: "purple.300" }}
                    _focus={{
                      borderColor: "purple.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                      bg: "white",
                    }}
                    rounded="lg"
                    isRequired
                  />
                </FormControl>

                {/* Fallback OTP Display */}
                {developmentOTP && (
                  <Box
                    w="full"
                    p={4}
                    bg="yellow.50"
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor="yellow.400"
                  >
                    <Text
                      fontSize="sm"
                      color="yellow.800"
                      fontWeight="bold"
                      textAlign="center"
                    >
                      ⚠️ EMAIL SERVICE UNAVAILABLE
                    </Text>
                    <Text
                      fontSize="3xl"
                      fontWeight="bold"
                      textAlign="center"
                      color="purple.600"
                      mt={2}
                      letterSpacing="wider"
                    >
                      {developmentOTP}
                    </Text>
                    <Text
                      fontSize="xs"
                      color="gray.600"
                      textAlign="center"
                      mt={2}
                    >
                      Use this code (email service is temporarily down)
                    </Text>
                  </Box>
                )}

                {/* OTP Input */}
                <FormControl>
                  <FormLabel textAlign="center" fontWeight="semibold" color="gray.700">
                    Enter 6-Digit Code
                  </FormLabel>
                  <HStack justify="center" spacing={3}>
                    <PinInput
                      otp
                      size="lg"
                      value={otp}
                      onChange={setOtp}
                      placeholder="0"
                    >
                      <PinInputField
                        w="50px"
                        h="60px"
                        fontSize="2xl"
                        fontWeight="bold"
                        bg={inputBg}
                        border="2px"
                        borderColor="gray.200"
                        _hover={{ borderColor: "purple.300" }}
                        _focus={{
                          borderColor: "purple.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                          bg: "white",
                        }}
                        rounded="lg"
                      />
                      <PinInputField
                        w="50px"
                        h="60px"
                        fontSize="2xl"
                        fontWeight="bold"
                        bg={inputBg}
                        border="2px"
                        borderColor="gray.200"
                        _hover={{ borderColor: "purple.300" }}
                        _focus={{
                          borderColor: "purple.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                          bg: "white",
                        }}
                        rounded="lg"
                      />
                      <PinInputField
                        w="50px"
                        h="60px"
                        fontSize="2xl"
                        fontWeight="bold"
                        bg={inputBg}
                        border="2px"
                        borderColor="gray.200"
                        _hover={{ borderColor: "purple.300" }}
                        _focus={{
                          borderColor: "purple.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                          bg: "white",
                        }}
                        rounded="lg"
                      />
                      <PinInputField
                        w="50px"
                        h="60px"
                        fontSize="2xl"
                        fontWeight="bold"
                        bg={inputBg}
                        border="2px"
                        borderColor="gray.200"
                        _hover={{ borderColor: "purple.300" }}
                        _focus={{
                          borderColor: "purple.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                          bg: "white",
                        }}
                        rounded="lg"
                      />
                      <PinInputField
                        w="50px"
                        h="60px"
                        fontSize="2xl"
                        fontWeight="bold"
                        bg={inputBg}
                        border="2px"
                        borderColor="gray.200"
                        _hover={{ borderColor: "purple.300" }}
                        _focus={{
                          borderColor: "purple.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                          bg: "white",
                        }}
                        rounded="lg"
                      />
                      <PinInputField
                        w="50px"
                        h="60px"
                        fontSize="2xl"
                        fontWeight="bold"
                        bg={inputBg}
                        border="2px"
                        borderColor="gray.200"
                        _hover={{ borderColor: "purple.300" }}
                        _focus={{
                          borderColor: "purple.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                          bg: "white",
                        }}
                        rounded="lg"
                      />
                    </PinInput>
                  </HStack>
                </FormControl>

                {/* Verify Button */}
                <Button
                  type="submit"
                  size="lg"
                  w="full"
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  color="white"
                  fontWeight="bold"
                  fontSize="md"
                  rounded="lg"
                  isLoading={loading}
                  isDisabled={otp.length !== 6 || !email}
                  _hover={{
                    bgGradient: "linear(to-r, purple.600, pink.600)",
                    transform: "translateY(-2px)",
                    shadow: "xl",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s"
                >
                  Verify Email
                </Button>

                {/* Resend OTP */}
                <Text fontSize="sm" textAlign="center" color="gray.600">
                  Didn't receive the code?{" "}
                  <Link
                    color="purple.500"
                    fontWeight="bold"
                    onClick={handleResendOTP}
                    cursor={countdown > 0 ? "not-allowed" : "pointer"}
                    opacity={countdown > 0 ? 0.5 : 1}
                    _hover={{ textDecoration: countdown > 0 ? "none" : "underline" }}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                  </Link>
                </Text>

                {/* Back to Sign In */}
                <Button
                  variant="ghost"
                  size="sm"
                  color="gray.600"
                  onClick={() => navigate("/signin")}
                  _hover={{ color: "purple.500" }}
                >
                  ← Back to Sign In
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default VerifyPage;