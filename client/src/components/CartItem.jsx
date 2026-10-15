import { useState } from 'react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();
    const [updating, setUpdating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const product = item.product;

    const handleIncrease = async () => {
        if (updating) return;
        setUpdating(true);
        setErrorMsg('');
        const res = await updateQuantity(product._id, item.quantity + 1);
        if (!res.success) setErrorMsg(res.message);
        setUpdating(false);
    };

    const handleDecrease = async () => {
        if (updating || item.quantity <= 1) return;
        setUpdating(true);
        setErrorMsg('');
        const res = await updateQuantity(product._id, item.quantity - 1);
        if (!res.success) setErrorMsg(res.message);
        setUpdating(false);
    };

    const handleRemove = async () => {
        if (updating) return;
        setUpdating(true);
        await removeFromCart(product._id);
        setUpdating(false);
    };

    if (!product) return null;

    return (
        <div className="flex flex-col sm:flex-row bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            <div className="w-full sm:w-48 h-48 sm:h-auto bg-gray-50 flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                    <span className="text-lg font-bold text-gray-900">
                        ₹{product.price?.toLocaleString('en-IN')}
                    </span>
                </div>
                
                {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
                
                <div className="mt-auto flex flex-wrap items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                            <button 
                                onClick={handleDecrease}
                                disabled={item.quantity <= 1 || updating}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors rounded-l-lg"
                            >
                                -
                            </button>
                            <span className="px-4 py-1 font-medium border-x border-gray-200">{item.quantity}</span>
                            <button 
                                onClick={handleIncrease}
                                disabled={updating}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors rounded-r-lg"
                            >
                                +
                            </button>
                        </div>
                        <button 
                            onClick={handleRemove}
                            disabled={updating}
                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                    <div className="font-bold text-gray-900 mt-4 sm:mt-0">
                        Total: ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
