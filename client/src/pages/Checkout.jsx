import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, cartCount, subtotal, setCartItems } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.fullName.trim() || !formData.phone.trim() || !formData.addressLine1.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
            return "All fields are required.";
        }
        if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
            return "Phone number must be 10 digits.";
        }
        if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
            return "Pincode must be 6 digits.";
        }
        return null;
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        setLoading(true);

        try {
            // 1. Create order on backend
            const orderRes = await api.post('/orders/create-payment-order', {
                shippingAddress: formData
            });

            if (!orderRes.data.success) {
                setError(orderRes.data.message || "Failed to initiate payment");
                setLoading(false);
                return;
            }

            const orderData = orderRes.data;

            // 2. Load Razorpay script
            const res = await loadRazorpayScript();
            if (!res) {
                setError("Razorpay SDK failed to load. Are you online?");
                setLoading(false);
                return;
            }

            // 3. Initialize Razorpay Checkout
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "ShopKart",
                description: "ShopKart Order Checkout",
                order_id: orderData.razorpayOrderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/orders/verify-payment', {
                            shopKartOrderId: orderData.shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.data.success) {
                            setCartItems([]);
                            navigate(`/orders/${orderData.shopKartOrderId}`);
                        } else {
                            setError(verifyRes.data.message || "Payment verification failed.");
                        }
                    } catch (verifyErr) {
                        console.error("Verification error:", verifyErr);
                        setError(verifyErr.response?.data?.message || "An error occurred during verification.");
                    }
                },
                prefill: {
                    name: formData.fullName,
                    contact: formData.phone
                },
                theme: {
                    color: "#2563EB"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on("payment.failed", function (response) {
                console.error("Payment failed", response.error);
                setError(`Payment failed: ${response.error.description}`);
            });

            paymentObject.open();

        } catch (err) {
            console.error("Checkout error:", err);
            setError(err.response?.data?.message || "An error occurred during checkout.");
        } finally {
            setLoading(false);
        }
    };

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-8">Add some products before checking out.</p>
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
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Shipping Form */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Details</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="10-digit phone number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="Street address, locality"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="State"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="6-digit pincode"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 bg-gray-900 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Pay with Razorpay'}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-96">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Order Summary</h2>
                        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                            {cartItems.map(item => (
                                <div key={item.product._id} className="flex justify-between text-sm">
                                    <span className="text-gray-600 truncate mr-2">{item.product.name} &times; {item.quantity}</span>
                                    <span className="text-gray-900 font-medium whitespace-nowrap">
                                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Total ({cartCount} items)</span>
                            <span className="text-2xl font-bold text-blue-600">₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
