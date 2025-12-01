import { useState } from "react";
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Text, 
  FormErrorMessage, 
  Link,
  Heading,
  Container,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../store/product";

const SigninPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState(null);
  const navigate = useNavigate();
  const loadUserCart = useProductStore(state => state.loadUserCart);
  const toast = useToast();

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerMsg(null);
    if (!validate()) return;

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Check if user needs to verify email
        if (data.requiresVerification) {
          setServerMsg(
            <Box>
              <Text color="orange.600" fontWeight="semibold" mb={2}>
                📧 {data.message}
              </Text>
              <Text fontSize="sm" color="gray.600" mb={2}>
                {data.otpSent 
                  ? `Check your email (${data.email}) for the OTP code.` 
                  : 'Email service unavailable. OTP will be shown on verify page.'}
              </Text>
              <Link 
                color="blue.600" 
                fontWeight="semibold" 
                onClick={() => navigate("/verify", { 
                  state: { 
                    email: data.email || email,
                    developmentOTP: data.developmentOTP
                  } 
                })}
                cursor="pointer"
                textDecoration="underline"
              >
                Go to Verify Page →
              </Link>
            </Box>
          );
          return;
        }
        setServerMsg(data.message || "Signin failed");
        return;
      }
      
      // store token and user info
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      // Show success notification
      const userName = data.user?.name || "User";
      const userRole = data.user?.role || "user";
      
      toast({
        title: `Welcome back, ${userName}!`,
        description: userRole === "admin" 
          ? "🔐 Signed in as Administrator" 
          : "✅ Signed in successfully",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });

      // Load user-specific cart
      loadUserCart();

      // redirect based on role
      setTimeout(() => {
        if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 500);
    } catch (err) {
      setServerMsg("Server error");
      toast({
        title: "Error",
        description: "Unable to connect to server. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
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
      <Container maxW="md">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={2} textAlign="center">
            <Heading
              fontSize={{ base: "3xl", md: "4xl" }}
              bgGradient="linear(to-r, purple.500, pink.500)"
              bgClip="text"
              fontWeight="extrabold"
            >
              Welcome back
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Sign in to your account to continue
            </Text>
          </VStack>

          {/* Main Card */}
          <Box
            bg={cardBg}
            rounded="2xl"
            shadow="2xl"
            p={{ base: 6, md: 10 }}
            borderWidth="1px"
            borderColor="gray.100"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {/* Email Input */}
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Email Address
                  </FormLabel>
                  <Input
                    size="lg"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
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
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                {/* Password Input */}
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Password
                  </FormLabel>
                  <Input
                    size="lg"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                {/* Server Message */}
                {serverMsg && (
                  <Box w="full">
                    {typeof serverMsg === "string" ? (
                      <Box
                        p={4}
                        bg="red.50"
                        border="2px"
                        borderColor="red.200"
                        rounded="lg"
                      >
                        <Text color="red.700" fontWeight="medium" fontSize="sm">
                          {serverMsg}
                        </Text>
                      </Box>
                    ) : (
                      <Box
                        p={4}
                        bg="orange.50"
                        border="2px"
                        borderColor="orange.200"
                        rounded="lg"
                      >
                        {serverMsg}
                      </Box>
                    )}
                  </Box>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  w="full"
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  color="white"
                  fontWeight="bold"
                  fontSize="md"
                  rounded="lg"
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
                  Sign In
                </Button>

                {/* Forgot Password Link */}
                <Link
                  fontSize="sm"
                  color="purple.500"
                  fontWeight="semibold"
                  textAlign="center"
                  _hover={{ color: "purple.600", textDecoration: "underline" }}
                >
                  Forgot your password?
                </Link>

                {/* Divider */}
                <HStack w="full" spacing={4}>
                  <Divider />
                  <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                    Don't have an account?
                  </Text>
                  <Divider />
                </HStack>

                {/* Sign Up Link */}
                <Button
                  variant="outline"
                  size="lg"
                  w="full"
                  borderWidth="2px"
                  borderColor="purple.200"
                  color="purple.600"
                  fontWeight="semibold"
                  rounded="lg"
                  _hover={{
                    bg: "purple.50",
                    borderColor: "purple.300",
                    transform: "translateY(-2px)",
                  }}
                  onClick={() => navigate("/signup")}
                >
                  Create Account
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default SigninPage;
