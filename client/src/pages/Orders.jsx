import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                if (response.data.success) {
                    setOrders(response.data.orders);
                } else {
                    setError("Failed to fetch orders");
                }
            } catch (err) {
                console.error(err);
                setError("Unable to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20 text-gray-600 text-lg">Loading your orders...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Try Again</button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16">
                    <div className="text-6xl mb-4">📦</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">You have not placed any orders yet.</h2>
                    <Link to="/products" className="mt-4 inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">Start Shopping</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>
            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Order #{order._id}</p>
                            <p className="text-sm font-medium text-gray-900 mb-3">{new Date(order.createdAt).toLocaleDateString()}</p>
                            
                            <div className="text-sm text-gray-600 mb-3">
                                {order.items.slice(0, 2).map((item, index) => (
                                    <p key={index}>{item.name} &times; {item.quantity}</p>
                                ))}
                                {order.items.length > 2 && <p>...and {order.items.length - 2} more items</p>}
                            </div>
                            
                            <p className="font-bold text-gray-900">Total: ₹{order.totalAmount.toLocaleString('en-IN')}</p>
                            <p className="text-sm mt-1">Status: <span className="font-semibold text-blue-600">{order.status}</span></p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <Link to={`/orders/${order._id}`} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
