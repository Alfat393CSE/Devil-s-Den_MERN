import { Link, useNavigate, NavLink } from 'react-router-dom'
import {
    Flex,
    Container,
    HStack,
    Text,
    Button,
    useColorMode,
    Box,
    Spacer,
    Input,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useDisclosure,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    VStack,
    Avatar,
    Badge,
    VisuallyHidden,
    InputGroup,
    InputLeftElement,
    Divider,
    useColorModeValue,
} from '@chakra-ui/react'

import { PlusSquareIcon, HamburgerIcon, SearchIcon, ChevronDownIcon } from "@chakra-ui/icons";

import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { FaBell, FaShoppingCart, FaStore, FaUser } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useProductStore } from '../store/product';

const Navbar = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    let user = null;
    try { if (raw) user = JSON.parse(raw); } catch(e) { user = null }
    const cart = useProductStore(s => s.cart);
    const clearCart = useProductStore(s => s.clearCart);
    const [unread, setUnread] = useState(0);

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.100', 'gray.700');
    const activeColor = useColorModeValue('blue.600', 'blue.400');
    const gradientBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    const searchBg = useColorModeValue('gray.50', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'white');

    useEffect(() => {
        const fetchUnread = async () => {
            if (!user) return setUnread(0);
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (!token) {
                    setUnread(0);
                    return;
                }
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers.Authorization = `Bearer ${token}`;
                const res = await fetch('/api/notifications', { headers });
                if (!res.ok) {
                    setUnread(0);
                    return;
                }
                const data = await res.json();
                const unreadCount = (data.data || []).filter(n => !n.read).length;
                setUnread(unreadCount);
            } catch (e) {
                console.error('Error fetching notifications:', e);
                setUnread(0);
            }
        };
        
        // Initial fetch
        fetchUnread();
        
        // Refresh when page becomes visible (user returns to tab)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchUnread();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Listen for custom notification update events
        const handleNotificationUpdate = () => {
            fetchUnread();
        };
        window.addEventListener('notificationRead', handleNotificationUpdate);
        
        // Poll every 10 seconds to update count
        const interval = setInterval(fetchUnread, 10000);
        
        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('notificationRead', handleNotificationUpdate);
            clearInterval(interval);
        };
    }, [raw]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear the cart for this user
        clearCart();
        // Force navigation and reload user state
        navigate('/signin');
        window.location.reload();
    }

    return (
        <Box 
            bg={bgColor} 
            borderBottom="1px" 
            borderColor={borderColor}
            position='sticky' 
            top={0} 
            zIndex={999}
            boxShadow="lg"
            backdropFilter="blur(10px)"
            transition="all 0.3s"
        >
            <Container maxW={"1400px"} px={6}>
                <Flex h={20} alignItems="center" justifyContent="space-between">
                    {/* Logo */}
                    <HStack spacing={4}>
                        <Link to={'/'}>
                            <HStack spacing={2}>
                                <Box 
                                    p={2} 
                                    bg="blue.500" 
                                    borderRadius="md"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <FaStore color="white" size={20} />
                                </Box>
                                <Text
                                    fontSize={{ base: '20px', md: '26px' }}
                                    fontWeight={'800'}
                                    letterSpacing='tight'
                                    color={useColorModeValue('gray.800', 'white')}
                                >
                                    Devil’s Den
                                    <VisuallyHidden> - Home</VisuallyHidden>
                                </Text>
                            </HStack>
                        </Link>
                    </HStack>

                    {/* Desktop Navigation Links */}
                    <HStack spacing={1} display={{ base: 'none', lg: 'flex' }} flex={1} ml={12}>
                        {[
                            ['/', 'Home'], 
                            ['/shop', 'Shop'], 
                            ['/about', 'About'], 
                            ['/contact', 'Contact'], 
                            ['/sell', 'Sell Products']
                        ].map(([to, label]) => (
                            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
                                {({ isActive }) => (
                                    <Button 
                                        variant='ghost' 
                                        color={isActive ? activeColor : undefined}
                                        fontWeight={isActive ? 'bold' : 'medium'}
                                        _hover={{ 
                                            bg: hoverBg,
                                            transform: 'translateY(-2px)',
                                            transition: 'all 0.2s'
                                        }}
                                        size="md"
                                        px={5}
                                        borderRadius="lg"
                                        position="relative"
                                        _after={isActive ? {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: 1,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '60%',
                                            height: '3px',
                                            bgGradient: 'linear(to-r, blue.500, purple.500)',
                                            borderRadius: 'full'
                                        } : {}}
                                    >
                                        {label}
                                    </Button>
                                )}
                            </NavLink>
                        ))}
                    </HStack>

                    {/* Search Bar */}
                    <Box flex={1} maxW="420px" mx={4} display={{ base: 'none', md: 'block' }}>
                        <InputGroup size="md">
                            <InputLeftElement pointerEvents='none'>
                                <SearchIcon color='gray.400' />
                            </InputLeftElement>
                            <Input 
                                placeholder='Search products...' 
                                bg={searchBg} 
                                border="2px"
                                borderColor="transparent"
                                borderRadius='xl'
                                _hover={{ borderColor: borderColor }}
                                _focus={{
                                    borderColor: 'blue.500',
                                    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)',
                                    bg: bgColor
                                }}
                                transition="all 0.2s"
                            />
                        </InputGroup>
                    </Box>

                    {/* Right Side Icons & Menu */}
                    <HStack spacing={2} flexShrink={0}>
                        {/* Cart */}
                        <Box position='relative'>
                            <IconButton 
                                as={Link}
                                to={'/cart'}
                                aria-label='Cart' 
                                variant='ghost' 
                                icon={<FaShoppingCart size={20} />}
                                _hover={{ 
                                    bg: hoverBg,
                                    transform: 'translateY(-2px)',
                                    transition: 'all 0.2s'
                                }}
                                size="lg"
                                borderRadius="xl"
                            />
                            {cart && cart.length > 0 && (
                                <Badge 
                                    colorScheme='red' 
                                    position='absolute' 
                                    top='0' 
                                    right='0' 
                                    borderRadius='full' 
                                    fontSize='xs'
                                    fontWeight='bold'
                                    minW="22px"
                                    h="22px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    boxShadow="md"
                                    border="2px solid"
                                    borderColor={bgColor}
                                >
                                    {cart.length}
                                </Badge>
                            )}
                        </Box>

                        {/* Notifications */}
                        <Box position='relative'>
                            <IconButton 
                                as={Link}
                                to={'/notifications'}
                                aria-label='Notifications' 
                                variant='ghost' 
                                icon={<FaBell size={20} />}
                                _hover={{ 
                                    bg: hoverBg,
                                    transform: 'translateY(-2px)',
                                    transition: 'all 0.2s'
                                }}
                                size="lg"
                                borderRadius="xl"
                            />
                            {unread > 0 && (
                                <Badge 
                                    colorScheme='red' 
                                    position='absolute' 
                                    top='0' 
                                    right='0' 
                                    borderRadius='full' 
                                    fontSize='xs'
                                    fontWeight='bold'
                                    minW="22px"
                                    h="22px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    boxShadow="md"
                                    border="2px solid"
                                    borderColor={bgColor}
                                    animation="pulse 2s infinite"
                                    sx={{
                                        '@keyframes pulse': {
                                            '0%, 100%': { opacity: 1 },
                                            '50%': { opacity: 0.7 }
                                        }
                                    }}
                                >
                                    {unread}
                                </Badge>
                            )}
                        </Box>

                        {/* Theme Toggle */}
                        <IconButton 
                            aria-label='Toggle theme' 
                            onClick={toggleColorMode} 
                            variant='ghost'
                            icon={colorMode === 'light' ? <IoMoon size={20} /> : <LuSun size={20} />}
                            _hover={{ 
                                bg: hoverBg,
                                transform: 'rotate(180deg)',
                                transition: 'all 0.3s'
                            }}
                            size="lg"
                            borderRadius="xl"
                        />

                        {/* User Menu or Auth Buttons */}
                        {!user ? (
                            <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                                <Button 
                                    as={Link}
                                    to={'/signin'}
                                    variant='ghost'
                                    size="md"
                                    borderRadius="xl"
                                    _hover={{ 
                                        bg: hoverBg,
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Sign In
                                </Button>
                                <Button 
                                    as={Link}
                                    to={'/signup'}
                                    bgGradient='linear(to-r, blue.500, purple.600)'
                                    color='white'
                                    size="md"
                                    borderRadius="xl"
                                    _hover={{ 
                                        bgGradient: 'linear(to-r, blue.600, purple.700)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: 'lg',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </HStack>
                        ) : (
                            <Menu>
                                <MenuButton 
                                    as={Button} 
                                    variant='ghost'
                                    borderRadius="xl"
                                    _hover={{ 
                                        bg: hoverBg,
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s'
                                    }}
                                    _active={{ bg: hoverBg }}
                                    rightIcon={<ChevronDownIcon />}
                                    pl={2}
                                    pr={3}
                                >
                                    <HStack spacing={2}>
                                        <Avatar 
                                            size='sm' 
                                            name={user.name || user.username}
                                            bg="blue.500"
                                        />
                                        <VStack 
                                            display={{ base: 'none', lg: 'flex' }} 
                                            alignItems="flex-start" 
                                            spacing={0}
                                            ml={2}
                                        >
                                            <Text fontSize="sm" fontWeight="semibold">
                                                {user.name || user.username}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">
                                                {user.role}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </MenuButton>
                                <MenuList 
                                    boxShadow="2xl" 
                                    borderColor={borderColor}
                                    borderRadius="xl"
                                    overflow="hidden"
                                >
                                    <Box px={3} py={2}>
                                        <Text fontSize="sm" fontWeight="bold">
                                            {user.name || user.username}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                            {user.email}
                                        </Text>
                                    </Box>
                                    <Divider />
                                    <MenuItem 
                                        onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
                                        icon={<FaUser />}
                                    >
                                        {user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
                                    </MenuItem>
                                    <MenuItem 
                                        onClick={() => navigate('/orders')}
                                        icon={<FaShoppingCart />}
                                    >
                                        My Orders
                                    </MenuItem>
                                    <MenuItem 
                                        onClick={() => navigate('/create')}
                                        icon={<PlusSquareIcon />}
                                    >
                                        Add Product
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout} color="red.500">
                                        Logout
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        )}

                        {/* Mobile menu button */}
                        <IconButton 
                            aria-label='Open menu' 
                            icon={<HamburgerIcon boxSize={6} />} 
                            display={{ base: 'inline-flex', lg: 'none' }} 
                            onClick={onOpen}
                            variant='ghost'
                            borderRadius="xl"
                            _hover={{ 
                                bg: hoverBg,
                                transform: 'scale(1.05)',
                                transition: 'all 0.2s'
                            }}
                            size="lg"
                        />
                    </HStack>
                </Flex>
            </Container>

            {/* Mobile drawer */}
            <Drawer isOpen={isOpen} placement='left' onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader 
                        borderBottomWidth="1px"
                        bgGradient='linear(to-r, blue.50, purple.50)'
                        _dark={{ bgGradient: 'linear(to-r, gray.800, gray.700)' }}
                    >
                        <HStack spacing={3}>
                            <Box 
                                p={2.5} 
                                bgGradient={gradientBg}
                                borderRadius='xl'
                                boxShadow="md"
                            >
                                <FaStore color='white' size={20} />
                            </Box>
                            <Text 
                                fontWeight='900' 
                                fontSize="lg"
                                bgGradient='linear(to-r, blue.600, purple.600)'
                                bgClip='text'
                            >
                                Devil's Den
                            </Text>
                        </HStack>
                    </DrawerHeader>
                    <DrawerBody>
                        <VStack spacing={2} align='stretch' mt={4}>
                            {user && (
                                <>
                                    <HStack p={3} bg={hoverBg} borderRadius="md">
                                        <Avatar size='md' name={user.name || user.username} bg="blue.500" />
                                        <VStack align="start" spacing={0}>
                                            <Text fontWeight="bold" fontSize="sm">
                                                {user.name || user.username}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">
                                                {user.email}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <Divider my={2} />
                                </>
                            )}

                            <Button variant='ghost' justifyContent="flex-start" as={Link} to='/' onClick={onClose}>
                                Home
                            </Button>
                            <Button variant='ghost' justifyContent="flex-start" as={Link} to='/shop' onClick={onClose}>
                                Shop
                            </Button>
                            <Button variant='ghost' justifyContent="flex-start" as={Link} to='/about' onClick={onClose}>
                                About
                            </Button>
                            <Button variant='ghost' justifyContent="flex-start" as={Link} to='/contact' onClick={onClose}>
                                Contact
                            </Button>
                            <Button variant='ghost' justifyContent="flex-start" as={Link} to='/sell' onClick={onClose}>
                                Sell Products
                            </Button>

                            <Divider my={2} />

                            {user && (
                                <>
                                    <Button 
                                        variant='ghost' 
                                        justifyContent="flex-start"
                                        onClick={() => { 
                                            onClose(); 
                                            navigate(user.role === 'admin' ? '/admin' : '/dashboard') 
                                        }}
                                        leftIcon={<FaUser />}
                                    >
                                        {user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
                                    </Button>
                                    <Button 
                                        variant='ghost' 
                                        justifyContent="flex-start"
                                        onClick={() => { onClose(); navigate('/create') }}
                                        leftIcon={<PlusSquareIcon />}
                                    >
                                        Add Product
                                    </Button>
                                    <Divider my={2} />
                                    <Button 
                                        onClick={() => { onClose(); handleLogout() }} 
                                        colorScheme='red'
                                        w="full"
                                        borderRadius="xl"
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </>
                            )}

                            {!user && (
                                <>
                                    <Button 
                                        as={Link} 
                                        to='/signin' 
                                        onClick={onClose}
                                        variant="outline"
                                        w="full"
                                        borderRadius="xl"
                                        borderWidth="2px"
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'md',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                    <Button 
                                        bgGradient='linear(to-r, blue.500, purple.600)'
                                        color='white'
                                        as={Link} 
                                        to='/signup' 
                                        onClick={onClose}
                                        w="full"
                                        borderRadius="xl"
                                        _hover={{
                                            bgGradient: 'linear(to-r, blue.600, purple.700)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Sign Up
                                    </Button>
                                </>
                            )}
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    )
}

export default Navbar