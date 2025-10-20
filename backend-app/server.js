import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// ==============================
// 📦 IMPORT ROUTES
// ==============================
import adminAuthRouter from "./routes/admin/authRoutes.js";     // Admin auth
import userRouter from "./routes/admin/userRoutes.js";          // Admin user management
import categoryRouter from "./routes/admin/categoryRoutes.js";  // Category routes (shared)
import productRouter from "./routes/admin/productRoutes.js";    // Product routes
import orderRouter from "./routes/user/orderRoutes.js";         // User order routes
import staffAuthRouter from "./routes/staff/authRoutes.js";     // Staff auth
import staffOrderRouter from "./routes/staff/orderRoutes.js";   // Staff order routes

// ==============================
// ⚙️ CONFIGURATION
// ==============================
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // alamat frontend
  credentials: true, // kalau pakai cookie/auth
}));


// Connect Database
connectDB();

// ==============================
// 🔐 ADMIN API ENDPOINTS
// ==============================
app.use("/api/admin", adminAuthRouter);               // Admin login/logout
app.use("/api/admin/users", userRouter);              // Manage users
app.use("/api/admin/categories", categoryRouter);     // Manage categories
app.use("/api/admin/products", productRouter);        // Manage products
app.use("/api/admin/orders", orderRouter);            // Manage orders

// ==============================
// 👩‍⚕️ STAFF API ENDPOINTS
// ==============================
app.use("/api/staff", staffAuthRouter);               // Staff login/logout
app.use("/api/staff/categories", categoryRouter);     // View categories
app.use("/api/staff/products", productRouter);        // View/manage products
app.use("/api/staff/orders", staffOrderRouter);       // Manage orders

// ==============================
// 👤 USER / CUSTOMER API ENDPOINTS
// ==============================
app.use("/api/categories", categoryRouter);           // View categories
app.use("/api/products", productRouter);              // View products
app.use("/api/orders", orderRouter);                  // Place orders

// ==============================
// 🌯 ROOT ROUTE
// ==============================
app.get("/", (req, res) => {
  res.send("🌯 Food Ordering API is running...");
});

// ==============================
// 🚀 START SERVER
// ==============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

// Export for testing or modular use
export default app;
