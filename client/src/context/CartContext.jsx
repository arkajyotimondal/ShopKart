import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children, user }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCart = async () => {
        if (!user) {
            setCartItems([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/cart');
            if (response.data.success) {
                setCartItems(response.data.cart);
            }
        } catch (err) {
            console.error("Failed to fetch cart", err);
            setError("Failed to fetch cart");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const addToCart = async (productId) => {
        try {
            const response = await api.post(`/cart/${productId}`);
            if (response.data.success) {
                // To get populated product, we refetch cart or update state locally if we just need structure.
                // Refetch is safer for populated data.
                await fetchCart();
            }
            return { success: true };
        } catch (err) {
            console.error("Add to cart error", err);
            return { success: false, message: err.response?.data?.message || 'Error adding to cart' };
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            const response = await api.patch(`/cart/${productId}`, { quantity });
            if (response.data.success) {
                await fetchCart();
            }
            return { success: true };
        } catch (err) {
            console.error("Update quantity error", err);
            return { success: false, message: err.response?.data?.message || 'Error updating quantity' };
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const response = await api.delete(`/cart/${productId}`);
            if (response.data.success) {
                await fetchCart();
            }
            return { success: true };
        } catch (err) {
            console.error("Remove from cart error", err);
            return { success: false, message: err.response?.data?.message || 'Error removing product' };
        }
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + ((item.product?.price || 0) * item.quantity), 0);

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            loading, 
            error, 
            cartCount,
            subtotal,
            addToCart, 
            updateQuantity, 
            removeFromCart,
            fetchCart,
            setCartItems // useful for clearing cart on checkout
        }}>
            {children}
        </CartContext.Provider>
    );
};
