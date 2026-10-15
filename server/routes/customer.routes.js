import express from "express";
import {
    registerCustomer,
    loginCustomer,
    logoutCustomer,
    getCustomer,
} from "../controllers/customer.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const customerRoutes = express.Router();

customerRoutes.post("/register", registerCustomer);
customerRoutes.post("/login", loginCustomer);
customerRoutes.post("/logout", isAuthenticated, logoutCustomer);
customerRoutes.get("/me", isAuthenticated, getCustomer);

export default customerRoutes;