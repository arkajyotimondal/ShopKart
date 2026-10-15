import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const user = req.user;
        if (!user.cart) user.cart = [];

        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

        if (cartItemIndex > -1) {
            // Already in cart, increase quantity
            if (user.cart[cartItemIndex].quantity + 1 > product.stock) {
                return res.status(400).json({ success: false, message: "Cannot exceed available stock" });
            }
            user.cart[cartItemIndex].quantity += 1;
        } else {
            if (product.stock < 1) {
                return res.status(400).json({ success: false, message: "Product out of stock" });
            }
            user.cart.push({ product: productId, quantity: 1 });
        }

        await user.save();
        res.status(200).json({ success: true, message: "Cart updated", cart: user.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock"
        });

        res.status(200).json({ success: true, cart: user.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        
        if (typeof quantity !== "number" || quantity < 1) {
            return res.status(400).json({ success: false, message: "Invalid quantity" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        if (quantity > product.stock) {
            return res.status(400).json({ success: false, message: "Cannot exceed available stock" });
        }

        const user = req.user;
        if (!user.cart) user.cart = [];

        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);
        if (cartItemIndex === -1) {
            return res.status(404).json({ success: false, message: "Product not in cart" });
        }

        user.cart[cartItemIndex].quantity = quantity;
        await user.save();
        
        res.status(200).json({ success: true, message: "Cart updated", cart: user.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const user = req.user;
        if (!user.cart) user.cart = [];

        user.cart = user.cart.filter(item => item.product.toString() !== productId);
        await user.save();

        res.status(200).json({ success: true, message: "Product removed from cart", cart: user.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
