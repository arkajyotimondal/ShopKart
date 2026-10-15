import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

const sampleProducts = [
    {
        name: "Mechanical Keyboard Pro",
        description: "RGB mechanical keyboard with cherry MX blue switches.",
        price: 4999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop",
        stock: 15
    },
    {
        name: "Noise Cancelling Headphones",
        description: "Wireless over-ear headphones with active noise cancellation and 30-hour battery life.",
        price: 8999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
        stock: 8
    },
    {
        name: "Minimalist Coffee Mug",
        description: "Matte black ceramic coffee mug, perfect for your morning brew.",
        price: 499,
        category: "Home",
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop",
        stock: 50
    },
    {
        name: "Ergonomic Office Chair",
        description: "Adjustable ergonomic chair with lumbar support and breathable mesh.",
        price: 12500,
        category: "Home",
        image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=600&auto=format&fit=crop",
        stock: 3
    },
    {
        name: "Running Shoes",
        description: "Lightweight breathable running shoes for everyday jogging.",
        price: 3499,
        category: "Sports",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
        stock: 0
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");
        
        await Product.deleteMany({});
        console.log("Cleared existing products...");
        
        await Product.insertMany(sampleProducts);
        console.log("Sample products added successfully!");
        
        process.exit();
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedDB();
