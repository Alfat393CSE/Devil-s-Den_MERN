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
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!username.trim()) e.username = "Username is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
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
        return;
      }
      setServerMsg(data.message);
      setSuccess(true);
      // show message and optionally navigate to signin
      setTimeout(() => navigate("/signin"), 1800);
    } catch (err) {
      setServerMsg("Server error");
    }
  };

  return (
    <Box maxW="480px" mx="auto" mt={12} p={6} bg="white" rounded="md" shadow="sm">
      <Text fontSize="2xl" mb={4} fontWeight="bold">Sign Up</Text>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.username}>
            <FormLabel>Username</FormLabel>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="choose a username" />
            <FormErrorMessage>{errors.username}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowPassword((s) => !s)}
                  size="sm"
                  variant="ghost"
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password}</FormErrorMessage>
            <Text mt={2} fontSize="sm" color={password.length >= 6 ? "green.600" : "gray.500"}>
              {password.length ? (password.length >= 6 ? "Good password length" : "Password too short") : ""}
            </Text>
          </FormControl>

          <FormControl isInvalid={!!errors.confirm}>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowPassword((s) => !s)}
                  size="sm"
                  variant="ghost"
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.confirm}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.terms}>
            <Checkbox isChecked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}>
              I agree to the <Link color="blue.600">terms and privacy</Link>
            </Checkbox>
            <FormErrorMessage>{errors.terms}</FormErrorMessage>
          </FormControl>

          {serverMsg && <Text color={success ? "green.600" : "red.500"}>{serverMsg}</Text>}

          <Button type="submit" colorScheme="blue" isDisabled={!name || !email || password.length < 6 || password !== confirm || !acceptedTerms}>
            Create account
          </Button>

          <Text fontSize="sm" textAlign="center">
            Already have an account? <Link color="blue.600" onClick={() => navigate("/signin")}>Sign in</Link>
          </Text>
        </Stack>
      </form>
    </Box>
  );
};

export default SignupPage;
