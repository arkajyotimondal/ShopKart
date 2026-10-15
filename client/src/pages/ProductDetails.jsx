import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { addToCart, cartItems } = useCart();
    const [cartStatus, setCartStatus] = useState('idle');
    const [cartError, setCartError] = useState('');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistStatus, setWishlistStatus] = useState('idle');
    const [wishlistError, setWishlistError] = useState('');

    const inCart = product ? cartItems.some(item => item.product._id === product._id || item.product === product._id) : false;

    const handleAddToCart = async () => {
        if (cartStatus === 'loading') return;
        setCartStatus('loading');
        setCartError('');
        const res = await addToCart(product._id);
        if (res.success) {
            setCartStatus('success');
            setTimeout(() => setCartStatus('idle'), 2000);
        } else {
            setCartStatus('error');
            setCartError(res.message);
        }
    };

    const handleWishlist = async () => {
        if (wishlistStatus === 'loading') return;
        setWishlistStatus('loading');
        setWishlistError('');
        try {
            if (isWishlisted) {
                await api.delete(`/wishlist/${product._id}`);
                setIsWishlisted(false);
            } else {
                await api.post(`/wishlist/${product._id}`);
                setIsWishlisted(true);
            }
            setWishlistStatus('idle');
        } catch (error) {
            setWishlistStatus('error');
            setWishlistError(error.response?.data?.message || 'Unable to update wishlist.');
        }
    };

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                const [productRes, wishlistRes] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get('/wishlist').catch(() => ({ data: { wishlist: [] } }))
                ]);
                
                if (productRes.data.success) {
                    setProduct(productRes.data.product);
                    const inWishlist = wishlistRes.data.wishlist.some(w => w._id === id || w === id);
                    setIsWishlisted(inWishlist);
                } else {
                    setError("Product not found");
                }
            } catch (err) {
                console.error("Error fetching product details:", err);
                if (err.response && err.response.status === 404) {
                    setError("Product not found");
                } else {
                    setError("Something went wrong while loading the product.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
                    <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || "Product not found"}</h2>
                    <p className="text-gray-500 mb-8">The product you are looking for might have been removed or is temporarily unavailable.</p>
                    <Link to="/products" className="inline-flex justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Breadcrumbs */}
            <nav className="flex mb-8 text-sm text-gray-500">
                <ol className="flex items-center space-x-2">
                    <li>
                        <Link to="/home" className="hover:text-blue-600 transition-colors">Home</Link>
                    </li>
                    <li><span className="mx-2">/</span></li>
                    <li>
                        <Link to="/products" className="hover:text-blue-600 transition-colors">Products</Link>
                    </li>
                    <li><span className="mx-2">/</span></li>
                    <li className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</li>
                </ol>
            </nav>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Image */}
                    <div className="bg-gray-100 p-8 flex items-center justify-center">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="max-h-[500px] object-contain rounded-lg shadow-sm"
                        />
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-8 md:p-10 flex flex-col">
                        <div className="mb-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 uppercase tracking-wider">
                                {product.category}
                            </span>
                        </div>
                        
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
                        
                        <div className="text-3xl font-bold text-gray-900 mb-6">
                            ₹{product.price.toLocaleString('en-IN')}
                        </div>
                        
                        <div className="mb-8 flex-grow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600 text-base leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-8 mt-auto">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-medium text-gray-500">Availability</span>
                                {product.stock > 0 ? (
                                    <span className="inline-flex items-center text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        In Stock ({product.stock} available)
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center text-sm font-medium text-red-700 bg-red-50 px-3 py-1 rounded-full">
                                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                            
                            {cartError && (
                                <div className="text-red-500 text-sm mb-4">{cartError}</div>
                            )}
                            {wishlistError && (
                                <div className="text-red-500 text-sm mb-4">{wishlistError}</div>
                            )}
                            <div className="flex gap-4">
                                <button 
                                    onClick={handleAddToCart}
                                    className={`flex-1 py-4 px-8 rounded-xl text-lg font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                                        product.stock > 0 
                                        ? cartStatus === 'success' ? "bg-green-600 shadow-md" : "bg-gray-900 hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
                                        : "bg-gray-300 cursor-not-allowed"
                                    }`}
                                    disabled={product.stock === 0 || cartStatus === 'loading'}
                                >
                                    {cartStatus === 'loading' ? (
                                        <span>Adding to Cart...</span>
                                    ) : cartStatus === 'success' ? (
                                        <span>Added to Cart!</span>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span>{product.stock > 0 ? (inCart ? 'Add Another to Cart' : 'Add to Cart') : 'Currently Unavailable'}</span>
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={handleWishlist}
                                    disabled={wishlistStatus === 'loading'}
                                    className={`py-4 px-8 rounded-xl text-lg font-bold transition-all duration-200 flex items-center justify-center border-2 ${
                                        isWishlisted
                                            ? 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100' 
                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {wishlistStatus === 'loading' ? '⏳' : (isWishlisted ? '♥ Saved' : '♡ Wishlist')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
