import { useEffect } from "react";
import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return navigate("/signin");
    try {
      const u = JSON.parse(raw);
      if (u.role !== "admin") return navigate("/signin");
    } catch (err) {
      return navigate("/signin");
    }
  }, [navigate]);

  return (
    <Box maxW="1000px" mx="auto" mt={8} p={6} bg="white" rounded="md" shadow="sm">
      <Heading size="lg" mb={4}>Admin Dashboard</Heading>
      <Text mb={4}>Welcome, admin. From here you can manage users, products and orders.</Text>
      <Button colorScheme="blue" mb={3} onClick={() => navigate('/admin/users')}>Manage Users</Button>
      <Button colorScheme="gray" ml={3} onClick={() => navigate('/admin/products')}>Review Submissions</Button>
      <Button colorScheme="teal" ml={3} onClick={() => navigate('/create')}>Add Product</Button>
      <Button colorScheme="green" ml={3} onClick={() => navigate('/admin/sales')}>View Sales</Button>
    </Box>
  );
};

export default AdminDashboard;
