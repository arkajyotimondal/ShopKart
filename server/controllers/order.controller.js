import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";
import razorpay from "../config/razorpay.js";

export const createPaymentOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        
        // Basic validation
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
            return res.status(400).json({ success: false, message: "Invalid shipping address" });
        }

        const user = await Customer.findById(req.user._id).populate("cart.product");
        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate stock and prepare snapshot
        for (const item of user.cart) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(400).json({ success: false, message: `Product not found: ${item.product.name}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }

            totalAmount += product.price * item.quantity;
            
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.image
            });
        }

        // Create pending shopkart order
        const shopKartOrder = new Order({
            user: user._id,
            items: orderItems,
            shippingAddress,
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        await shopKartOrder.save();

        // Create razorpay order
        const amountInRupees = totalAmount;
        
        // Use try-catch specifically for Razorpay to give a clear error message
        let razorpayOrder;
        try {
            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(amountInRupees * 100), // in paise
                currency: "INR",
                receipt: shopKartOrder._id.toString()
            });
        } catch (rzpError) {
            console.error("Razorpay API Error:", rzpError);
            return res.status(500).json({
                success: false,
                message: "Failed to connect to payment gateway. Please ensure valid Razorpay keys are configured in .env."
            });
        }

        shopKartOrder.razorpayOrderId = razorpayOrder.id;
        await shopKartOrder.save();

        res.status(200).json({
            success: true,
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: Math.round(amountInRupees * 100),
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxx'
        });

    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const order = await Order.findById(shopKartOrderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        const body = order.razorpayOrderId + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxxxxxxxx')
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Signature valid, confirm order
        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // Decrease product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear user cart
        const user = await Customer.findById(req.user._id);
        user.cart = [];
        await user.save();

        res.status(200).json({ success: true, message: "Payment verified successfully", order });

    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
