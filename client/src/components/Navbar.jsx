import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [wishlistCount, setWishlistCount] = useState(0);
    const { cartCount } = useCart();

    useEffect(() => {
        if (user) {
            api.get("/wishlist")
                .then(res => setWishlistCount(res.data.count || 0))
                .catch(err => console.error("Failed to fetch wishlist count", err));
        }
    }, [user, location.pathname]);

    const handleLogout = async () => {
        try {
            await api.post("/customers/logout");
            setUser(null);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center mr-8">
                            <span className="text-2xl font-bold text-blue-600 tracking-tight">ShopKart</span>
                        </Link>
                        {user && (
                            <Link to="/products" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Products
                            </Link>
                        )}
                        {user && (
                            <Link to="/wishlist" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                                Wishlist
                                {wishlistCount > 0 && (
                                    <span className="ml-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        {user && (
                            <Link to="/cart" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                                Cart
                                {cartCount > 0 && (
                                    <span className="ml-1 bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/orders" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
                                    Orders
                                </Link>
                                <Link to="/profile" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
                                    Hello, {user.fullName}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors shadow-sm"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
