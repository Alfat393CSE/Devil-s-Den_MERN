import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  FormErrorMessage,
  Stack,
  InputGroup,
  InputRightElement,
  IconButton,
  Checkbox,
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
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [emailValidation, setEmailValidation] = useState({ isValid: null, message: "" });
  const navigate = useNavigate();
  const toast = useToast();

  // Enhanced email validation
  const validateEmailFormat = (email) => {
    if (!email) {
      return { isValid: false, message: "" };
    }

    // Basic format check
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Invalid email format" };
    }

    // Check for common typos in popular domains
    const commonDomains = {
      'gamil.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com'
    };

    const domain = email.split('@')[1]?.toLowerCase();
    if (commonDomains[domain]) {
      return { 
        isValid: false, 
        message: `Did you mean ${email.split('@')[0]}@${commonDomains[domain]}?` 
      };
    }

    // Check for valid TLD
    const tld = domain?.split('.').pop();
    const validTLDs = ['com', 'net', 'org', 'edu', 'gov', 'co', 'io', 'ai', 'dev', 'app', 'tech'];
    if (tld && !validTLDs.includes(tld) && tld.length > 4) {
      return { isValid: false, message: "Unusual email domain" };
    }

    return { isValid: true, message: "Valid email format" };
  };

  // Real-time email validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value) {
      const validation = validateEmailFormat(value);
      setEmailValidation(validation);
    } else {
      setEmailValidation({ isValid: null, message: "" });
    }
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!username.trim()) e.username = "Username is required";
    
    if (!email.trim()) {
      e.email = "Email is required";
    } else {
      const emailCheck = validateEmailFormat(email);
      if (!emailCheck.isValid) {
        e.email = emailCheck.message || "Invalid email format";
      }
    }
    
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    if (!confirm) e.confirm = "Please confirm your password";
    else if (password !== confirm) e.confirm = "Passwords do not match";
    if (!acceptedTerms) e.terms = "You must accept the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerMsg(null);
    if (!validate()) return;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerMsg(data.message || "Signup failed");
        setSuccess(false);
        toast({
          title: "Signup Failed",
          description: data.message || "Unable to create account. Please try again.",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
        return;
      }
      
      // Check if email was sent successfully
      if (data.developmentOTP) {
        setServerMsg("Account created! Email service unavailable - check verify page for OTP.");
      } else {
        setServerMsg(`Account created! Check your email (${email}) for the OTP code.`);
      }
      setSuccess(true);
      
      toast({
        title: "Account Created!",
        description: data.developmentOTP 
          ? "⚠️ Email service unavailable. OTP will be shown on verify page." 
          : `📧 Verification email sent to ${email}`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      
      // Navigate to verify page with email
      setTimeout(() => navigate("/verify", { 
        state: { 
          email,
          developmentOTP: data.developmentOTP // Only present if email service failed
        } 
      }), 1800);
    } catch (err) {
      setServerMsg("Server error");
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
              Create your account
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Join us and start your journey today
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
                {/* Name Input */}
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Full Name
                  </FormLabel>
                  <Input
                    size="lg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
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
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                {/* Email Input */}
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Email Address
                  </FormLabel>
                  <Input
                    size="lg"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="you@example.com"
                    bg={inputBg}
                    border="2px"
                    borderColor={
                      emailValidation.isValid === false 
                        ? "red.300" 
                        : emailValidation.isValid === true 
                        ? "green.300" 
                        : "gray.200"
                    }
                    _hover={{ borderColor: "purple.300" }}
                    _focus={{
                      borderColor: "purple.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                      bg: "white",
                    }}
                    rounded="lg"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                  {!errors.email && emailValidation.message && (
                    <Text
                      mt={2}
                      fontSize="sm"
                      color={emailValidation.isValid ? "green.500" : "orange.500"}
                      fontWeight="medium"
                    >
                      {emailValidation.isValid ? "✓" : "⚠"} {emailValidation.message}
                    </Text>
                  )}
                </FormControl>

                {/* Username Input */}
                <FormControl isInvalid={!!errors.username}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Username
                  </FormLabel>
                  <Input
                    size="lg"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
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
                  <FormErrorMessage>{errors.username}</FormErrorMessage>
                </FormControl>

                {/* Password Input */}
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? "text" : "password"}
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
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword((s) => !s)}
                        size="sm"
                        variant="ghost"
                        color="gray.500"
                        _hover={{ color: "purple.500" }}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                  {password && (
                    <Text
                      mt={2}
                      fontSize="sm"
                      color={password.length >= 6 ? "green.500" : "orange.500"}
                      fontWeight="medium"
                    >
                      {password.length >= 6 ? "✓ Strong password" : "⚠ At least 6 characters required"}
                    </Text>
                  )}
                </FormControl>

                {/* Confirm Password Input */}
                <FormControl isInvalid={!!errors.confirm}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Confirm Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
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
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword((s) => !s)}
                        size="sm"
                        variant="ghost"
                        color="gray.500"
                        _hover={{ color: "purple.500" }}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.confirm}</FormErrorMessage>
                  {confirm && password && (
                    <Text
                      mt={2}
                      fontSize="sm"
                      color={password === confirm ? "green.500" : "red.500"}
                      fontWeight="medium"
                    >
                      {password === confirm ? "✓ Passwords match" : "✗ Passwords don't match"}
                    </Text>
                  )}
                </FormControl>

                {/* Terms Checkbox */}
                <FormControl isInvalid={!!errors.terms}>
                  <Checkbox
                    isChecked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    colorScheme="purple"
                    size="md"
                  >
                    <Text fontSize="sm" color="gray.600">
                      I agree to the{" "}
                      <Link color="purple.500" fontWeight="semibold">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link color="purple.500" fontWeight="semibold">
                        Privacy Policy
                      </Link>
                    </Text>
                  </Checkbox>
                  <FormErrorMessage>{errors.terms}</FormErrorMessage>
                </FormControl>

                {/* Server Message */}
                {serverMsg && (
                  <Box
                    w="full"
                    p={4}
                    bg={success ? "green.50" : "red.50"}
                    border="2px"
                    borderColor={success ? "green.200" : "red.200"}
                    rounded="lg"
                  >
                    <Text
                      color={success ? "green.700" : "red.700"}
                      fontWeight="medium"
                      fontSize="sm"
                    >
                      {serverMsg}
                    </Text>
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
                  isDisabled={
                    !name ||
                    !email ||
                    password.length < 6 ||
                    password !== confirm ||
                    !acceptedTerms
                  }
                >
                  Create Account
                </Button>

                {/* Divider */}
                <HStack w="full" spacing={4}>
                  <Divider />
                  <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                    Already have an account?
                  </Text>
                  <Divider />
                </HStack>

                {/* Sign In Link */}
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
                  onClick={() => navigate("/signin")}
                >
                  Sign In
                </Button>
              </VStack>
            </form>
          </Box>

          {/* Footer Text */}
          <Text fontSize="sm" color="gray.600" textAlign="center">
            By signing up, you agree to our terms and privacy policy
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default SignupPage;
