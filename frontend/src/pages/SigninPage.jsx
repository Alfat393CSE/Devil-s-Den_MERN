import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Text, FormErrorMessage } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const SigninPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState(null);
  const navigate = useNavigate();

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
        setServerMsg(data.message || "Signin failed");
        return;
      }
      // store token and user info
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      // redirect based on role
      const role = data.user?.role || "user";
      if (role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      setServerMsg("Server error");
    }
  };

  return (
    <Box maxW="480px" mx="auto" mt={12} p={6} bg="white" rounded="md" shadow="sm">
      <Text fontSize="2xl" mb={4} fontWeight="bold">Sign In</Text>
      <form onSubmit={handleSubmit}>
        <FormControl isInvalid={!!errors.email} mb={3}>
          <FormLabel>Email</FormLabel>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password} mb={4}>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        {serverMsg && <Text color="red.500" mb={3}>{serverMsg}</Text>}

        <Button type="submit" colorScheme="blue">Sign in</Button>
      </form>
    </Box>
  );
};

export default SigninPage;
