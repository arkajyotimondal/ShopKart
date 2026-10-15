import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import WishlistCard from '../components/WishlistCard';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchWishlist = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await api.get('/wishlist');
            setWishlist(response.data.wishlist);
        } catch (error) {
            console.error("Error fetching wishlist", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = (productId) => {
        setWishlist(prev => prev.filter(p => p._id !== productId));
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20 text-gray-600 text-lg">
                    Loading your wishlist...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20">
                    <p className="text-red-500 text-lg mb-4">Unable to load wishlist.</p>
                    <button 
                        onClick={fetchWishlist}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20">
                    <div className="text-5xl mb-4">❤️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Save products you love and find them here later.
                    </p>
                    <Link 
                        to="/products"
                        className="inline-block bg-blue-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
                    <p className="text-gray-600">{wishlist.length} products saved</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link to="/products" className="text-blue-600 hover:text-blue-800 font-medium">
                        Continue Shopping &rarr;
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map(product => (
                    <WishlistCard 
                        key={product._id} 
                        product={product} 
                        onRemove={handleRemove} 
                    />
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
