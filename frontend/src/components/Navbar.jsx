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
} from '@chakra-ui/react'

import { PlusSquareIcon, HamburgerIcon } from "@chakra-ui/icons";

import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { FaBell, FaShoppingCart } from 'react-icons/fa';
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
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            if (!user) return setUnread(0);
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers.Authorization = `Bearer ${token}`;
                const res = await fetch('/api/notifications', { headers });
                const data = await res.json();
                if (res.ok) {
                    const unreadCount = (data.data || []).filter(n => !n.read).length;
                    setUnread(unreadCount);
                }
            } catch (e) { console.error(e); }
        };
        fetchUnread();
    }, [raw]);

        const handleLogout = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/signin');
        }
    return (
        <Box bg={colorMode === 'light' ? 'white' : 'gray.800'} boxShadow="sm" position='sticky' top={0} zIndex={40}>
            <Container maxW={"1140px"} px={4}>
                <Flex h={16} alignItems="center">
                    <Box>
                        <Link to={'/'}>
                            <Text
                                fontSize={{ base: '18px', sm: '24px' }}
                                fontWeight={'extrabold'}
                                letterSpacing='wide'
                                bgGradient={'linear(to-r, cyan.400, blue.500)'}
                                bgClip={'text'}
                            >
                                Product Store
                                <VisuallyHidden> - Home</VisuallyHidden>
                            </Text>
                        </Link>
                    </Box>

                    <HStack spacing={6} ml={8} display={{ base: 'none', md: 'flex' }}>
                        {[['/', 'Home'], ['/shop', 'Shop'], ['/about', 'About'], ['/contact', 'Contact'], ['/sell', 'Sell']].map(([to, label]) => (
                            <NavLink key={to} to={to} style={({isActive}) => ({ textDecoration: 'none' })}>
                                {({ isActive }) => (
                                    <Button variant='ghost' color={isActive ? 'teal.600' : undefined} _hover={{ bg: 'gray.50' }}>{label}</Button>
                                )}
                            </NavLink>
                        ))}
                    </HStack>

                    <Spacer />

                    <HStack spacing={6} alignItems={'center'} flexShrink={0}>
                        <Input placeholder='Search products...' maxW={'320px'} display={{ base: 'none', md: 'block' }} bg={colorMode === 'light' ? 'gray.50' : 'gray.700'} borderRadius='md' />

                        {!user && (
                            <HStack spacing={2}>
                                <Link to={'/signin'}>
                                    <Button variant={'ghost'}>Sign in</Button>
                                </Link>
                                <Link to={'/signup'}>
                                    <Button colorScheme={'teal'}>Sign up</Button>
                                </Link>
                            </HStack>
                        )}

                        {user && (
                            <Menu>
                                <MenuButton as={Button} variant='ghost' rightIcon={<Avatar size='sm' name={user.name || user.username} />}>
                                    <Text display={{ base: 'none', md: 'block' }}>{user.name || user.username}</Text>
                                </MenuButton>
                                <MenuList>
                                    {user.role === 'admin' ? (
                                        <MenuItem onClick={() => navigate('/admin')}>Admin Dashboard</MenuItem>
                                    ) : (
                                        <MenuItem onClick={() => navigate('/dashboard')}>My Dashboard</MenuItem>
                                    )}
                                    <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </MenuList>
                            </Menu>
                        )}

                        <Link to={'/create'}>
                            <Button aria-label='Add product' title='Add product' variant='ghost'>
                                <PlusSquareIcon fontSize={18} />
                            </Button>
                        </Link>

                        <Box position='relative'>
                            <Link to={'/notifications'}>
                                <IconButton aria-label='Notifications' variant='ghost' title='Notifications' icon={<FaBell />} />
                            </Link>
                            {unread > 0 && (
                                <Badge colorScheme='red' position='absolute' top='-1' right='-1' borderRadius='full' px={2} fontSize='xs'>{unread}</Badge>
                            )}
                        </Box>

                        <Box position='relative'>
                            <Link to={'/cart'}>
                                <IconButton aria-label='Cart' variant='ghost' title='Cart' icon={<FaShoppingCart />} />
                            </Link>
                            {cart && cart.length > 0 && (
                                <Badge colorScheme='green' position='absolute' top='-1' right='-1' borderRadius='full' px={2} fontSize='xs'>{cart.length}</Badge>
                            )}
                        </Box>

                        <IconButton aria-label='Toggle theme' onClick={toggleColorMode} variant='ghost'>
                            {colorMode === 'light' ? <IoMoon /> : <LuSun size={'18'} />}
                        </IconButton>

                        {/* Mobile menu button */}
                        <IconButton aria-label='Open menu' icon={<HamburgerIcon />} display={{ base: 'inline-flex', md: 'none' }} onClick={onOpen} />
                    </HStack>
                </Flex>
            </Container>

            {/* Mobile drawer */}
            <Drawer isOpen={isOpen} placement='left' onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>
                        <Text fontWeight='bold'>Product Store</Text>
                    </DrawerHeader>
                    <DrawerBody>
                        <VStack spacing={3} align='stretch'>
                            <Button variant='ghost' as={Link} to='/' onClick={onClose}>Home</Button>
                              <Button variant='ghost' as={Link} to='/shop' onClick={onClose}>Shop</Button>
                              <Button variant='ghost' as={Link} to='/about' onClick={onClose}>About</Button>
                              <Button variant='ghost' as={Link} to='/contact' onClick={onClose}>Contact</Button>
                              <Button variant='ghost' as={Link} to='/sell' onClick={onClose}>Sell</Button>
                                                            <Button variant='ghost' as={Link} to='/notifications' onClick={onClose}>Notifications</Button>
                                                            <Button variant='ghost' as={Link} to='/cart' onClick={onClose}>Cart</Button>
                            <Box pt={4} />
                            {!user && (
                                <>
                                    <Button as={Link} to='/signin' onClick={onClose}>Sign in</Button>
                                    <Button colorScheme='teal' as={Link} to='/signup' onClick={onClose}>Sign up</Button>
                                </>
                            )}
                            {user && (
                                <>
                                    <Button onClick={() => { onClose(); navigate(user.role === 'admin' ? '/admin' : '/dashboard') }}>{user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}</Button>
                                    <Button onClick={() => { onClose(); navigate('/profile') }}>Profile</Button>
                                    <Button onClick={() => { onClose(); handleLogout() }} colorScheme='red'>Logout</Button>
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