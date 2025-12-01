import { Box, Flex, useColorModeValue } from "@chakra-ui/react"
import { Route, Routes } from "react-router-dom"
import CreatePage from "./pages/CreatePage.jsx"
import HomePage from "./pages/HomePage.jsx"
import SignupPage from "./pages/SignupPage.jsx"
import SigninPage from "./pages/SigninPage.jsx"
import ShopPage from "./pages/ShopPage.jsx"
import AboutPage from "./pages/AboutPage.jsx"
import ContactPage from "./pages/ContactPage.jsx"
import SellPage from "./pages/SellPage.jsx"
import AdminProducts from "./pages/AdminProducts.jsx"
import VerifyPage from "./pages/VerifyPage.jsx"
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import UserDashboard from "./pages/UserDashboard.jsx"
import AdminUsers from "./pages/AdminUsers.jsx"
import AdminSales from "./pages/AdminSales.jsx"
import CartPage from "./pages/CartPage.jsx"
import Notifications from "./pages/Notifications.jsx"
import OrderHistoryPage from "./pages/OrderHistoryPage.jsx"
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx"
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx"
import OrderCheckoutPage from "./pages/OrderCheckoutPage.jsx"
import Navbar from "./components/Navbar.jsx"
import Footer from "./components/Footer.jsx"


function App() {
  
  return (
    <Flex direction="column" minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <Navbar />
      <Box flex="1">
        <Routes>
          <Route path='/' element= {<HomePage />} />
          <Route path='/shop' element= {<ShopPage />} />
          <Route path='/product/:id' element= {<ProductDetailsPage />} />
          <Route path='/about' element= {<AboutPage />} />
          <Route path='/contact' element= {<ContactPage />} />
          <Route path='/sell' element= {<SellPage />} />
          <Route path='/create' element= {<CreatePage />} />
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/signin' element={<SigninPage />} />
          <Route path='/verify' element={<VerifyPage />} />
          <Route path='/forgot' element={<ForgotPasswordPage />} />
          <Route path='/admin' element={<AdminDashboard />} />
          <Route path='/admin/products' element={<AdminProducts />} />
          <Route path='/admin/sales' element={<AdminSales />} />
          <Route path='/admin/orders' element={<AdminOrdersPage />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/orders' element={<OrderHistoryPage />} />
          <Route path='/notifications' element={<Notifications />} />
          <Route path='/dashboard' element={<UserDashboard />} />
          <Route path='/admin/users' element={<AdminUsers />} />
          <Route path='/order-checkout' element={<OrderCheckoutPage />} />
        </Routes>
      </Box>
      <Footer />
    </Flex>
  )
}

export default App
