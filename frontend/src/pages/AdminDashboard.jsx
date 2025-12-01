import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  Icon,
  Spinner,
  useColorModeValue,
  Divider,
  Avatar,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaBox, FaShoppingCart, FaDollarSign, FaArrowUp, FaArrowDown } from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return navigate("/signin");
    try {
      const u = JSON.parse(raw);
      if (u.role !== "admin") return navigate("/signin");
    } catch (err) {
      return navigate("/signin");
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        toast({
          title: "Authentication Error",
          description: "Please sign in again",
          status: "error",
          duration: 3000
        });
        navigate("/signin");
        return;
      }

      const res = await fetch("/api/admin/stats", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStats(data.data);
      } else {
        setError(data.message || "Failed to fetch stats");
        toast({
          title: "Error",
          description: data.message || "Failed to fetch dashboard statistics",
          status: "error",
          duration: 3000
        });
        
        if (res.status === 401 || res.status === 403) {
          navigate("/signin");
        }
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setError(error.message || "Network error");
      toast({
        title: "Error",
        description: "Failed to connect to server",
        status: "error",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box maxW="1400px" mx="auto" mt={8} p={6}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Loading dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxW="1400px" mx="auto" mt={8} p={6}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Failed to Load Dashboard
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {error}
          </AlertDescription>
          <Button mt={4} colorScheme="blue" onClick={fetchStats}>
            Try Again
          </Button>
        </Alert>
      </Box>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: FaUsers,
      color: "blue",
      change: stats?.verifiedUsers || 0,
      changeLabel: "verified users"
    },
    {
      label: "Total Products",
      value: stats?.totalProducts || 0,
      icon: FaBox,
      color: "purple",
      change: null,
      changeLabel: "in inventory"
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: FaShoppingCart,
      color: "orange",
      change: stats?.pendingOrders || 0,
      changeLabel: "pending orders"
    },
    {
      label: "Total Sales",
      value: stats?.totalSales || 0,
      icon: FaShoppingCart,
      color: "green",
      change: stats?.salesThisMonth || 0,
      changeLabel: "this month"
    },
    {
      label: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: FaDollarSign,
      color: "teal",
      change: stats?.revenueThisMonth ? `$${stats.revenueThisMonth.toFixed(2)}` : '$0.00',
      changeLabel: "this month"
    }
  ];

  return (
    <Box maxW="1400px" mx="auto" mt={8} p={6}>
      {/* Header */}
      <HStack justify="space-between" mb={8}>
        <VStack align="start" spacing={1}>
          <Heading size="xl">Admin Dashboard</Heading>
          <Text color="gray.600">Welcome back! Here's what's happening with your store.</Text>
        </VStack>
        <Button colorScheme="blue" onClick={fetchStats}>
          Refresh Data
        </Button>
      </HStack>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6} mb={8}>
        {statCards.map((stat, index) => (
          <Card key={index} bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    {stat.label}
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold">
                    {stat.value}
                  </Text>
                  {stat.change !== null && (
                    <HStack spacing={1}>
                      <Icon as={FaArrowUp} color="green.500" boxSize={3} />
                      <Text fontSize="sm" color="gray.600">
                        {typeof stat.change === 'number' && stat.change > 0 
                          ? stat.change 
                          : stat.change} {stat.changeLabel}
                      </Text>
                    </HStack>
                  )}
                </VStack>
                <Box
                  p={3}
                  borderRadius="lg"
                  bg={`${stat.color}.50`}
                >
                  <Icon as={stat.icon} boxSize={8} color={`${stat.color}.500`} />
                </Box>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Quick Actions */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} mb={8}>
        <CardHeader>
          <Heading size="md">Quick Actions</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Button
              colorScheme="blue"
              size="lg"
              leftIcon={<Icon as={FaUsers} />}
              onClick={() => navigate('/admin/users')}
            >
              Manage Users
            </Button>
            <Button
              colorScheme="purple"
              size="lg"
              leftIcon={<Icon as={FaBox} />}
              onClick={() => navigate('/admin/products')}
            >
              Review Products
            </Button>
            <Button
              colorScheme="orange"
              size="lg"
              leftIcon={<Icon as={FaShoppingCart} />}
              onClick={() => navigate('/admin/orders')}
            >
              Manage Orders
            </Button>
            <Button
              colorScheme="teal"
              size="lg"
              leftIcon={<Icon as={FaBox} />}
              onClick={() => navigate('/create')}
            >
              Add Product
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Recent Activity Section */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Recent Sales */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Recent Sales</Heading>
              <Button size="sm" variant="ghost" onClick={() => navigate('/admin/sales')}>
                View All
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            {stats?.recentSales && stats.recentSales.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {stats.recentSales.map((sale) => (
                  <Box key={sale._id} p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                    <HStack justify="space-between" mb={2}>
                      <HStack>
                        <Avatar size="sm" name={sale.user?.name || "User"} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium" fontSize="sm">
                            {sale.user?.name || "Unknown User"}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {sale.items?.length || 0} item(s)
                          </Text>
                        </VStack>
                      </HStack>
                      <VStack align="end" spacing={0}>
                        <Text fontWeight="bold" color="green.500">
                          ${(sale.totalAmount || 0).toFixed(2)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme={sale.status === 'completed' ? 'green' : 'yellow'}>
                      {sale.status || 'completed'}
                    </Badge>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500" textAlign="center" py={8}>
                No recent sales
              </Text>
            )}
          </CardBody>
        </Card>

        {/* Recent Users */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Recent Users</Heading>
              <Button size="sm" variant="ghost" onClick={() => navigate('/admin/users')}>
                View All
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {stats.recentUsers.map((user) => (
                  <Box key={user._id} p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                    <HStack justify="space-between">
                      <HStack>
                        <Avatar size="sm" name={user.name} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium" fontSize="sm">
                            {user.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {user.email}
                          </Text>
                        </VStack>
                      </HStack>
                      <VStack align="end" spacing={1}>
                        <Badge colorScheme={user.role === 'admin' ? 'red' : 'blue'}>
                          {user.role}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500" textAlign="center" py={8}>
                No recent users
              </Text>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Sales Chart Data */}
      {stats?.recentSalesData && stats.recentSalesData.length > 0 && (
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} mt={6}>
          <CardHeader>
            <Heading size="md">Sales Overview (Last 7 Days)</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th isNumeric>Orders</Th>
                  <Th isNumeric>Revenue</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stats.recentSalesData.map((day) => (
                  <Tr key={day._id}>
                    <Td>{new Date(day._id).toLocaleDateString()}</Td>
                    <Td isNumeric fontWeight="medium">{day.count}</Td>
                    <Td isNumeric fontWeight="bold" color="green.500">
                      ${day.revenue.toFixed(2)}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default AdminDashboard;
