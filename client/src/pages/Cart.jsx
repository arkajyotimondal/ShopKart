import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
    const { cartItems, loading, error, cartCount, subtotal } = useCart();

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20 text-gray-600 text-lg">
                    Loading your cart...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20">
                    <p className="text-red-500 text-lg mb-4">Unable to load your cart.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Looks like you haven't added anything yet.
                    </p>
                    <Link 
                        to="/products"
                        className="inline-block bg-gray-900 text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Cart</h1>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    {cartItems.map((item) => (
                        <CartItem key={item.product._id} item={item} />
                    ))}
                </div>
                <div className="w-full lg:w-96">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Order Summary</h2>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Items ({cartCount})</span>
                        </div>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-lg font-medium text-gray-900">Subtotal</span>
                            <span className="text-2xl font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <Link 
                            to="/checkout"
                            className="block w-full text-center bg-gray-900 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors duration-200"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
