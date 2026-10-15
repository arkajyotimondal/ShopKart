import Product from "../models/product.model.js";

// @desc    Create a product
// @route   POST /products
// @access  Public (for this lab)
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || price === undefined || !category || !image || stock === undefined) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        if (price <= 0) {
            return res.status(400).json({ success: false, message: "Price must be greater than 0" });
        }

        if (stock < 0) {
            return res.status(400).json({ success: false, message: "Stock cannot be negative" });
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock,
        });

        res.status(201).json({ success: true, product });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all products (with search, category, sort)
// @route   GET /products
// @access  Public
export const getAllProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        let query = {};

        // Search by name (case-insensitive)
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Build the mongoose query
        let mongooseQuery = Product.find(query);

        // Sort by price
        if (sort === "price_asc") {
            mongooseQuery = mongooseQuery.sort({ price: 1 });
        } else if (sort === "price_desc") {
            mongooseQuery = mongooseQuery.sort({ price: -1 });
        } else {
            // Default sort by newest
            mongooseQuery = mongooseQuery.sort({ createdAt: -1 });
        }

        const products = await mongooseQuery;

        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get single product by ID
// @route   GET /products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
