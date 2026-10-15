import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, initialWishlistState = false }) => {
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [isWishlisted, setIsWishlisted] = useState(initialWishlistState);
    const { addToCart, cartItems } = useCart();
    const [cartStatus, setCartStatus] = useState('idle');
    const [cartError, setCartError] = useState('');

    const inCart = cartItems.some(item => item.product._id === product._id || item.product === product._id);

    const handleWishlist = async () => {
        if (status === 'loading') return;
        setStatus('loading');
        setErrorMsg('');
        try {
            if (isWishlisted) {
                await api.delete(`/wishlist/${product._id}`);
                setIsWishlisted(false);
            } else {
                await api.post(`/wishlist/${product._id}`);
                setIsWishlisted(true);
            }
            setStatus('idle');
        } catch (error) {
            setStatus('error');
            setErrorMsg(error.response?.data?.message || 'Unable to update wishlist. Please try again.');
        }
    };

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

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative group">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Only {product.stock} left!
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Out of Stock
                    </div>
                )}
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        {product.category}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                    </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1" title={product.name}>
                    {product.name}
                </h3>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow" title={product.description}>
                    {product.description}
                </p>

                {status === 'error' && (
                    <div className="text-red-500 text-xs mb-2">{errorMsg}</div>
                )}
                {cartStatus === 'error' && (
                    <div className="text-red-500 text-xs mb-2">{cartError}</div>
                )}
                
                <div className="flex flex-col gap-2 mt-auto">
                    <button
                        onClick={handleAddToCart}
                        disabled={cartStatus === 'loading' || product.stock === 0}
                        className={`w-full text-center font-medium py-2.5 rounded-lg transition-colors duration-200 ${
                            product.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                            cartStatus === 'success' ? 'bg-green-600 text-white' :
                            'bg-gray-900 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {cartStatus === 'loading' ? 'Adding...' : cartStatus === 'success' ? 'Added!' : inCart ? 'Add Another' : 'Add to Cart'}
                    </button>
                    <div className="flex gap-2">
                        <Link 
                            to={`/products/${product._id}`}
                            className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg transition-colors duration-200"
                        >
                            View Details
                        </Link>
                        <button
                            onClick={handleWishlist}
                            disabled={status === 'loading'}
                            className={`flex-1 text-center font-medium py-2.5 rounded-lg transition-colors duration-200 border ${
                                isWishlisted
                                    ? 'bg-pink-50 border-pink-200 text-pink-600' 
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {status === 'loading' ? '⏳ Saving...' : (isWishlisted ? '♥ Remove' : '♡ Wishlist')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
