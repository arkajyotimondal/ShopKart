import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Add to wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product Not Found" });
        }

        const user = req.user;
        if (!user.wishlist) user.wishlist = [];
        
        if (user.wishlist.some(id => id.toString() === productId)) {
            return res.status(409).json({ success: false, message: "Already in wishlist" });
        }

        user.wishlist.push(productId);
        await user.save();

        res.status(200).json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get wishlist
export const getWishlist = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name price category image stock"
        });

        res.status(200).json({
            success: true,
            count: user.wishlist.length,
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const user = req.user;
        if (!user.wishlist) user.wishlist = [];
        
        if (!user.wishlist.some(id => id.toString() === productId)) {
            return res.status(404).json({ success: false, message: "Product not in wishlist" });
        }

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        res.status(200).json({ success: true, message: "Product removed from wishlist" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
