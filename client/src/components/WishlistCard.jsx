import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../services/api';

const WishlistCard = ({ product, onRemove }) => {
    const [removing, setRemoving] = useState(false);

    const handleRemove = async () => {
        if (removing) return;
        setRemoving(true);
        try {
            await api.delete(`/wishlist/${product._id}`);
            onRemove(product._id);
        } catch (error) {
            console.error("Failed to remove", error);
            setRemoving(false);
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
                
                <h3 className="text-lg font-bold text-gray-800 mb-4 line-clamp-1" title={product.name}>
                    {product.name}
                </h3>
                
                <div className="flex flex-col gap-2 mt-auto">
                    <Link 
                        to={`/products/${product._id}`}
                        className="w-full text-center bg-gray-900 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors duration-200"
                    >
                        View Details
                    </Link>
                    <button
                        onClick={handleRemove}
                        disabled={removing}
                        className="w-full text-center bg-white border border-red-200 text-red-500 hover:bg-red-50 font-medium py-2.5 rounded-lg transition-colors duration-200"
                    >
                        {removing ? 'Removing...' : 'Remove ♥'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WishlistCard;
