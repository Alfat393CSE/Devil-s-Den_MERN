import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Container,
  useColorModeValue,
  Badge,
  Icon,
  Flex,
  Divider,
  Spinner,
  Center,
  useToast,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { FaBell, FaCheck, FaCheckDouble, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTrash } from "react-icons/fa";
import { format } from "date-fns";

const Notifications = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen: isDeleteAllOpen, onOpen: onDeleteAllOpen, onClose: onDeleteAllClose } = useDisclosure();
  const cancelRef = useRef();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const unreadBg = useColorModeValue("blue.50", "blue.900");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setLoading(false);
        return;
      }
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/notifications', { headers });
      
      if (!res.ok) {
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      if (res.ok) setItems(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers });
      setItems(items.map(it => it._id === id ? { ...it, read: true } : it));
      
      // Dispatch custom event to update navbar
      window.dispatchEvent(new Event('notificationRead'));
      
      toast({
        title: "Marked as read",
        status: "success",
        duration: 2000,
        isClosable: true
      });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      
      const unreadItems = items.filter(it => !it.read);
      await Promise.all(
        unreadItems.map(it => 
          fetch(`/api/notifications/${it._id}/read`, { method: 'PATCH', headers })
        )
      );
      
      setItems(items.map(it => ({ ...it, read: true })));
      
      // Dispatch custom event to update navbar
      window.dispatchEvent(new Event('notificationRead'));
      
      toast({
        title: "All notifications marked as read",
        status: "success",
        duration: 2000,
        isClosable: true
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = async (id) => {
    setIsDeleting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      
      if (res.ok) {
        setItems(items.filter(it => it._id !== id));
        toast({
          title: "Notification deleted",
          status: "success",
          duration: 2000,
          isClosable: true
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete notification",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const deleteAllNotifications = async () => {
    setIsDeleting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      
      const res = await fetch('/api/notifications', { method: 'DELETE', headers });
      const data = await res.json();
      
      if (res.ok) {
        setItems([]);
        toast({
          title: "All notifications deleted",
          status: "success",
          duration: 2000,
          isClosable: true
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete notifications",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to delete notifications",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsDeleting(false);
      onDeleteAllClose();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return FaCheckCircle;
      case "error":
        return FaTimesCircle;
      case "warning":
        return FaExclamationTriangle;
      default:
        return FaInfoCircle;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "green";
      case "error":
        return "red";
      case "warning":
        return "orange";
      default:
        return "blue";
    }
  };

  const unreadCount = items.filter(it => !it.read).length;

  if (loading) {
    return (
      <Center minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500">Loading notifications...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")} py={16}>
      <Container maxW="900px">
        {/* Header */}
        <VStack spacing={6} mb={8}>
          <HStack spacing={3}>
            <Icon as={FaBell} boxSize={8} color="blue.500" />
            <Heading
              size="2xl"
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
              fontWeight="extrabold"
            >
              Notifications
            </Heading>
          </HStack>
          
          <HStack spacing={4} w="full" justify="space-between" flexWrap="wrap">
            <HStack spacing={2}>
              <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full">
                {items.length} Total
              </Badge>
              {unreadCount > 0 && (
                <Badge colorScheme="red" fontSize="md" px={3} py={1} borderRadius="full">
                  {unreadCount} Unread
                </Badge>
              )}
            </HStack>
            
            <HStack spacing={2}>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  leftIcon={<FaCheckDouble />}
                  onClick={markAllRead}
                  borderRadius="xl"
                >
                  Mark all as read
                </Button>
              )}
              {items.length > 0 && (
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  leftIcon={<FaTrash />}
                  onClick={onDeleteAllOpen}
                  borderRadius="xl"
                >
                  Delete all
                </Button>
              )}
            </HStack>
          </HStack>
        </VStack>

        {/* Notifications List */}
        {!items.length ? (
          <Box
            bg={bgColor}
            p={12}
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            textAlign="center"
          >
            <Icon as={FaBell} boxSize={16} color="gray.300" mb={4} />
            <Heading size="md" mb={2} color="gray.500">
              No notifications yet
            </Heading>
            <Text color="gray.400">
              You're all caught up! New notifications will appear here.
            </Text>
          </Box>
        ) : (
          <VStack spacing={3} align="stretch">
            {items.map((notification, index) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorScheme = getNotificationColor(notification.type);
              const isUnread = !notification.read;

              return (
                <Box
                  key={notification._id}
                  bg={isUnread ? unreadBg : bgColor}
                  p={6}
                  borderRadius="xl"
                  border="1px"
                  borderColor={isUnread ? `${colorScheme}.200` : borderColor}
                  shadow={isUnread ? "md" : "sm"}
                  transition="all 0.3s"
                  _hover={{
                    bg: hoverBg,
                    transform: "translateY(-2px)",
                    shadow: "lg"
                  }}
                  position="relative"
                >
                  {isUnread && (
                    <Box
                      position="absolute"
                      top={6}
                      right={6}
                      w={3}
                      h={3}
                      bg={`${colorScheme}.500`}
                      borderRadius="full"
                      animation="pulse 2s infinite"
                    />
                  )}

                  <Flex gap={4} align="start">
                    <Icon
                      as={IconComponent}
                      boxSize={6}
                      color={`${colorScheme}.500`}
                      mt={1}
                      flexShrink={0}
                    />

                    <VStack align="stretch" flex={1} spacing={2}>
                      <Text
                        fontSize="md"
                        fontWeight={isUnread ? "semibold" : "normal"}
                        color={useColorModeValue("gray.800", "white")}
                        lineHeight="tall"
                      >
                        {notification.message}
                      </Text>

                      <HStack spacing={3} fontSize="sm" color="gray.500">
                        <Text>
                          {notification.createdAt
                            ? format(new Date(notification.createdAt), "MMM dd, yyyy 'at' h:mm a")
                            : "Just now"}
                        </Text>
                        {isUnread && (
                          <>
                            <Text>•</Text>
                            <Badge colorScheme={colorScheme} variant="subtle">
                              New
                            </Badge>
                          </>
                        )}
                      </HStack>
                    </VStack>

                    <HStack spacing={2} flexShrink={0}>
                      {isUnread && (
                        <Button
                          size="sm"
                          colorScheme={colorScheme}
                          variant="ghost"
                          leftIcon={<FaCheck />}
                          onClick={() => markRead(notification._id)}
                          borderRadius="lg"
                        >
                          Mark read
                        </Button>
                      )}
                      <IconButton
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        icon={<FaTrash />}
                        onClick={() => setDeleteId(notification._id)}
                        aria-label="Delete notification"
                        borderRadius="lg"
                        _hover={{
                          bg: "red.100",
                          transform: "scale(1.05)"
                        }}
                      />
                    </HStack>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        )}

        {/* Delete Single Notification Dialog */}
        <AlertDialog
          isOpen={!!deleteId}
          leastDestructiveRef={cancelRef}
          onClose={() => setDeleteId(null)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent borderRadius="2xl" mx={4}>
              <AlertDialogHeader
                fontSize="xl"
                fontWeight="bold"
                bgGradient="linear(to-r, red.500, pink.500)"
                color="white"
                borderTopRadius="2xl"
                py={4}
              >
                Delete Notification
              </AlertDialogHeader>

              <AlertDialogBody py={6}>
                <Text>Are you sure you want to delete this notification?</Text>
                <Text color="red.500" fontWeight="semibold" mt={2}>
                  ⚠️ This action cannot be undone.
                </Text>
              </AlertDialogBody>

              <AlertDialogFooter gap={3}>
                <Button
                  ref={cancelRef}
                  onClick={() => setDeleteId(null)}
                  borderRadius="xl"
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => deleteNotification(deleteId)}
                  isLoading={isDeleting}
                  loadingText="Deleting..."
                  borderRadius="xl"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg"
                  }}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Delete All Notifications Dialog */}
        <AlertDialog
          isOpen={isDeleteAllOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteAllClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent borderRadius="2xl" mx={4}>
              <AlertDialogHeader
                fontSize="xl"
                fontWeight="bold"
                bgGradient="linear(to-r, red.500, pink.500)"
                color="white"
                borderTopRadius="2xl"
                py={4}
              >
                Delete All Notifications
              </AlertDialogHeader>

              <AlertDialogBody py={6}>
                <VStack spacing={3} align="start">
                  <Text>
                    Are you sure you want to delete <strong>all {items.length}</strong> notification(s)?
                  </Text>
                  <Text color="red.500" fontWeight="semibold">
                    ⚠️ This action cannot be undone.
                  </Text>
                </VStack>
              </AlertDialogBody>

              <AlertDialogFooter gap={3}>
                <Button
                  ref={cancelRef}
                  onClick={onDeleteAllClose}
                  borderRadius="xl"
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={deleteAllNotifications}
                  isLoading={isDeleting}
                  loadingText="Deleting..."
                  borderRadius="xl"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg"
                  }}
                >
                  Delete All
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
};

export default Notifications;
