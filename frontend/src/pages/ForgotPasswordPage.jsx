import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Text } from "@chakra-ui/react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!email.trim()) {
      setMessage("Please enter your email");
      return;
    }
    // Basic fake flow: in a real app you would call backend to send reset email
    setMessage("If that email exists, password reset instructions have been sent.");
  };

  return (
    <Box maxW="480px" mx="auto" mt={12} p={6} bg="white" rounded="md" shadow="sm">
      <Text fontSize="2xl" mb={4} fontWeight="bold">Forgot Password</Text>
      <form onSubmit={handleSubmit}>
        <FormControl mb={3}>
          <FormLabel>Email</FormLabel>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>

        {message && <Text color="gray.700" mb={3}>{message}</Text>}

        <Button type="submit" colorScheme="blue">Send reset link</Button>
      </form>
    </Box>
  );
};

export default ForgotPasswordPage;
