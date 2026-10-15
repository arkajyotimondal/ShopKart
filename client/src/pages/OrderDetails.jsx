import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${id}`);
                if (response.data.success) {
                    setOrder(response.data.order);
                } else {
                    setError("Failed to load order");
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || "Order not found");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) {
        return <div className="text-center py-20 text-gray-600">Loading order details...</div>;
    }

    if (error || !order) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || "Order not found"}</h2>
                    <Link to="/orders" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg">Back to Orders</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
            {order.status === 'PLACED' && (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6 mb-8 text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <h2 className="text-2xl font-bold">Order Placed Successfully!</h2>
                    <p className="mt-2">Thank you for shopping with us.</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">{order.status}</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Order ID</p>
                        <p className="font-medium text-gray-900">{order._id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Order Date</p>
                        <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                        <p className="font-medium text-gray-900">{order.paymentStatus}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                        <p className="font-bold text-gray-900 text-lg">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm leading-relaxed">
                        <p className="font-bold">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                        <p>Phone: {order.shippingAddress.phone}</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Items Purchased</h3>
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                <div className="flex items-center space-x-4">
                                    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />}
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center space-x-4">
                <Link to="/orders" className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">View All Orders</Link>
                <Link to="/products" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Continue Shopping</Link>
            </div>
        </div>
    );
};

export default OrderDetails;
