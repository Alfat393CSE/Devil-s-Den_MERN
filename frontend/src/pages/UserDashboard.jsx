import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  HStack,
  VStack,
  Icon,
  Spinner,
  useColorModeValue,
  Avatar,
  Badge,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaDollarSign, FaBox, FaCalendar, FaStore, FaHeart } from "react-icons/fa";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return navigate("/signin");
    try {
      const u = JSON.parse(raw);
      setProfile(u);
    } catch (err) {
      return navigate("/signin");
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box maxW="1400px" mx="auto" mt={8} p={6}>
        <Spinner size="xl" />
      </Box>
    );
  }

  const statCards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: FaShoppingCart,
      color: "blue",
      change: stats?.ordersThisMonth || 0,
      changeLabel: "this month"
    },
    {
      label: "Total Spent",
      value: `$${(stats?.totalSpent || 0).toFixed(2)}`,
      icon: FaDollarSign,
      color: "green",
      change: stats?.spentThisMonth ? `$${stats.spentThisMonth.toFixed(2)}` : "$0.00",
      changeLabel: "this month"
    },
    {
      label: "Active Orders",
      value: stats?.statusBreakdown?.find(s => s._id === 'pending')?.count || 0,
      icon: FaBox,
      color: "orange",
      change: null,
      changeLabel: "in progress"
    },
    {
      label: "Completed",
      value: stats?.statusBreakdown?.find(s => s._id === 'completed')?.count || 0,
      icon: FaCalendar,
      color: "purple",
      change: null,
      changeLabel: "delivered"
    }
  ];

  return (
    <Box maxW="1400px" mx="auto" mt={8} p={6}>
      {/* Header with Profile */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} mb={8}>
        <CardBody>
          <HStack spacing={6}>
            <Avatar size="xl" name={profile?.name} bg="blue.500" />
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="lg">Welcome back, {profile?.name}!</Heading>
              <Text color="gray.600" fontSize="md">
                {profile?.email}
              </Text>
              <HStack spacing={2} mt={2}>
                <Badge colorScheme={profile?.role === 'admin' ? 'red' : 'blue'}>
                  {profile?.role}
                </Badge>
                {profile?.isVerified && (
                  <Badge colorScheme="green">Verified</Badge>
                )}
              </HStack>
            </VStack>
            <Button colorScheme="blue" onClick={fetchStats}>
              Refresh Data
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
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
                    <Text fontSize="sm" color="gray.600">
                      {stat.change} {stat.changeLabel}
                    </Text>
                  )}
                </VStack>
                <Box p={3} borderRadius="lg" bg={`${stat.color}.50`}>
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
              leftIcon={<Icon as={FaStore} />}
              onClick={() => navigate('/shop')}
            >
              Browse Products
            </Button>
            <Button
              colorScheme="orange"
              size="lg"
              leftIcon={<Icon as={FaShoppingCart} />}
              onClick={() => navigate('/cart')}
            >
              My Cart
            </Button>
            <Button
              colorScheme="purple"
              size="lg"
              leftIcon={<Icon as={FaBox} />}
              onClick={() => navigate('/sell')}
            >
              Sell Products
            </Button>
            <Button
              colorScheme="pink"
              size="lg"
              leftIcon={<Icon as={FaHeart} />}
              onClick={() => navigate('/notifications')}
            >
              Notifications
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Recent Orders */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">Recent Orders</Heading>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                // Could create a separate orders page
                navigate('/dashboard');
              }}
            >
              View All Orders
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <VStack spacing={4} align="stretch">
              {stats.recentOrders.map((order) => (
                <Box
                  key={order._id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={borderColor}
                  _hover={{ shadow: "md", borderColor: "blue.500" }}
                  transition="all 0.2s"
                >
                  <HStack justify="space-between" mb={3}>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color="gray.500" fontWeight="medium">
                        Order ID: {order._id.substring(0, 10)}...
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg" color="green.500">
                        ${(order.totalAmount || 0).toFixed(2)}
                      </Text>
                      <Badge
                        colorScheme={
                          order.status === 'completed' ? 'green' :
                          order.status === 'pending' ? 'yellow' : 'red'
                        }
                      >
                        {order.status || 'completed'}
                      </Badge>
                    </VStack>
                  </HStack>
                  
                  <Divider my={2} />
                  
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Items ({order.items?.length || 0}):
                    </Text>
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <HStack key={idx} spacing={3} w="full">
                        <Box
                          w="40px"
                          h="40px"
                          borderRadius="md"
                          bg="gray.100"
                          overflow="hidden"
                        >
                          {item.product?.image && (
                            <img
                              src={item.product.image}
                              alt={item.product?.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </Box>
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {item.product?.name || 'Product'}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Qty: {item.quantity} × ${(item.price || 0).toFixed(2)}
                          </Text>
                        </VStack>
                        <Text fontSize="sm" fontWeight="bold">
                          ${((item.price || 0) * item.quantity).toFixed(2)}
                        </Text>
                      </HStack>
                    ))}
                    {order.items?.length > 3 && (
                      <Text fontSize="xs" color="gray.500">
                        +{order.items.length - 3} more item(s)
                      </Text>
                    )}
                  </VStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <VStack py={12} spacing={4}>
              <Icon as={FaShoppingCart} boxSize={16} color="gray.300" />
              <Text color="gray.500" textAlign="center">
                No orders yet
              </Text>
              <Button colorScheme="blue" onClick={() => navigate('/shop')}>
                Start Shopping
              </Button>
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* Account Info */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} mt={6}>
        <CardHeader>
          <Heading size="md">Account Information</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Full Name</Text>
              <Text fontWeight="medium">{profile?.name}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Username</Text>
              <Text fontWeight="medium">{profile?.username || 'Not set'}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Email Address</Text>
              <Text fontWeight="medium">{profile?.email}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Member Since</Text>
              <Text fontWeight="medium">
                {profile?.createdAt 
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default UserDashboard;
