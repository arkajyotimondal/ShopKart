# 🛒 ShopKart — Full-Stack E-Commerce Application

A full-stack MERN (MongoDB, Express.js, React, Node.js) e-commerce application with user authentication, product browsing, wishlist management, shopping cart, and secure checkout via Razorpay payment gateway.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)

---

## ✨ Features

### Authentication
- User Registration with form validation
- Login / Logout with JWT-based authentication
- Protected routes (frontend & backend)

### Products
- Browse all products with search, category filter, and sorting
- View detailed product information
- Stock availability display

### Wishlist
- Add / Remove products from wishlist
- Toggle wishlist from Product Cards and Product Details page
- Persistent wishlist stored in the database

### Shopping Cart
- Add products to cart with quantity management
- Increment / Decrement quantity with stock validation
- Remove items from cart
- Real-time cart count in Navbar (global state via React Context)
- Derived state for subtotal and item count

### Checkout & Orders
- Shipping address form with validation (10-digit phone, 6-digit pincode)
- Secure payment integration via Razorpay (Test Mode)
- Backend-calculated order totals (never trusts frontend)
- Cryptographic signature verification for payment security
- Order history with detailed order view
- Product snapshot in orders (price at time of purchase is preserved)
- Stock deduction after successful payment

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens), bcrypt |
| **Payments** | Razorpay Payment Gateway |
| **State Management** | React Context API |

---

## 📁 Project Structure

```
Shopkart/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── context/
│   │   │   └── CartContext.jsx  # Global cart state management
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── OrderDetails.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios instance with interceptors
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                      # Express Backend
│   ├── config/
│   │   ├── db.js
│   │   └── razorpay.js          # Razorpay SDK initialization
│   ├── controllers/
│   │   ├── customer.controller.js
│   │   ├── product.controller.js
│   │   ├── wishlist.controller.js
│   │   ├── cart.controller.js
│   │   └── order.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js   # JWT verification middleware
│   ├── models/
│   │   ├── customer.model.js
│   │   ├── product.model.js
│   │   └── order.model.js
│   ├── routes/
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── cart.routes.js
│   │   └── order.routes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── seed.js                  # Database seeding script
│   ├── index.js                 # Server entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ✅ Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas** account — [Sign up](https://www.mongodb.com/cloud/atlas)
- **Razorpay** account (Test Mode) — [Sign up](https://dashboard.razorpay.com/signup)

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-github-repo-url>
cd Shopkart
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server/` directory:

```bash
touch server/.env
```

Add the following variables to `server/.env`:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

> ⚠️ **Important:** Never commit the `.env` file to GitHub. It is already listed in `.gitignore`.

### 5. Seed the Database (Optional)

To populate the database with sample products:

```bash
cd server
node seed.js
```

---

## ▶️ Running the Application

### Start the Backend Server

```bash
cd server
node index.js
```

The server will start on `http://localhost:5001`

### Start the Frontend Dev Server

In a new terminal:

```bash
cd client
npm run dev
```

The app will open at `http://localhost:5173`

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers/register` | Register a new user |
| POST | `/customers/login` | Login and receive JWT |
| POST | `/customers/logout` | Logout (clear cookie) |
| GET | `/customers/profile` | Get logged-in user profile |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | Get all products (with search, filter, sort) |
| GET | `/products/:id` | Get single product details |

### Wishlist
| Method | Endpoint | Description |
|---|---|---|
| GET | `/wishlist` | Get user's wishlist |
| POST | `/wishlist/:productId` | Add product to wishlist |
| DELETE | `/wishlist/:productId` | Remove product from wishlist |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Get user's cart |
| POST | `/cart/:productId` | Add product to cart |
| PATCH | `/cart/:productId` | Update item quantity |
| DELETE | `/cart/:productId` | Remove item from cart |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders/create-payment-order` | Create Razorpay order |
| POST | `/orders/verify-payment` | Verify payment signature |
| GET | `/orders` | Get user's order history |
| GET | `/orders/:id` | Get single order details |

---

## 🧪 Test Payment Credentials (Razorpay Test Mode)

Use the following credentials when testing payments:

| Field | Value |
|---|---|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date (e.g., `12/26`) |
| CVV | Any 3 digits (e.g., `123`) |

Alternatively, select **Netbanking → SBI** and click **Success** on the test bank page.

---

## 👤 Author

**Arkajyoti Mondal**

---
