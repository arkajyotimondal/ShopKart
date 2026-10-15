import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import api from './services/api'
import Navbar from './components/Navbar'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import { CartProvider } from './context/CartContext'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/customers/me");
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <CartProvider user={user}>
        <Navbar user={user} setUser={setUser} />
        <Routes>
        <Route path="/" element={user ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />} />
        <Route path="/register" element={user ? <Navigate to="/products" replace /> : <Register setUser={setUser} />} />
        <Route path="/login" element={user ? <Navigate to="/products" replace /> : <Login setUser={setUser} />} />
        
        {/* Protected Routes */}
        <Route path="/profile" element={user ? <Home user={user} setUser={setUser} /> : <Navigate to="/login" replace />} />
        <Route path="/products" element={user ? <Products /> : <Navigate to="/login" replace />} />
        <Route path="/products/:id" element={user ? <ProductDetails /> : <Navigate to="/login" replace />} />
        <Route path="/wishlist" element={user ? <Wishlist /> : <Navigate to="/login" replace />} />
        <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" replace />} />
        <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" replace />} />
        <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" replace />} />
        <Route path="/orders/:id" element={user ? <OrderDetails /> : <Navigate to="/login" replace />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </CartProvider>
    </div>
  )
}

export default App
