import { useEffect, useState } from "react";
import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return navigate("/signin");
    try {
      const u = JSON.parse(raw);
      if (u.role !== "user") return navigate("/signin");
    } catch (err) {
      return navigate("/signin");
    }
  }, [navigate]);

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setProfile(JSON.parse(raw));
    } catch (err) {
      setProfile(null);
    }
  }, []);

  return (
    <Box maxW="1000px" mx="auto" mt={8} p={6} bg="white" rounded="md" shadow="sm">
      <Heading size="lg" mb={4}>User Dashboard</Heading>
      <Text mb={4}>Welcome. Here you can browse products, view your cart and orders, and update your profile.</Text>
      {profile && (
        <VStack align="start" spacing={2} mb={4}>
          <Text><strong>Name:</strong> {profile.name}</Text>
          <Text><strong>Username:</strong> {profile.username}</Text>
          <Text><strong>Email:</strong> {profile.email}</Text>
          <Text><strong>Role:</strong> {profile.role}</Text>
        </VStack>
      )}
      <Button colorScheme="blue" mb={3}>View Products</Button>
      <Button colorScheme="green" ml={3}>My Orders</Button>
    </Box>
  );
};

export default UserDashboard;
