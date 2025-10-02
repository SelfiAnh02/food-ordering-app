import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import productRouter from "./routes/admin/productRoutes.js"; // add your router
import orderRouter from "./routes/user/orderRoutes.js"; // import order routes
import staffOrderRouter from "./routes/staff/orderRoutes.js"; // import order routes
import userRouter from "./routes/admin/userRoutes.js"; // import admin user routes
import adminAuthRouter from "./routes/admin/authRoutes.js"; // import admin auth routes
import staffAuthRouter from "./routes/staff/authRoutes.js"; // import staff auth routes
import categoryRouter from "./routes/admin/categoryRoutes.js"; // import category routes

// Load environment variables
dotenv.config();

const app = express();


// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Connect Database
connectDB();

// API endpoints Admin
app.use("/api/admin", adminAuthRouter);
app.use("/api/admin/users", userRouter);
app.use("/api/admin/categories", categoryRouter);
app.use("/api/admin/products", productRouter);
app.use("/api/admin/orders", orderRouter); 


// API endpoints Staff
app.use("/api/staff", staffAuthRouter);
app.use("/api/staff/categories", categoryRouter);
app.use("/api/staff/products", productRouter);
app.use("/api/staff/orders", staffOrderRouter); // add order routes

// API endpoints User
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter); // add order routes


// Routes
app.get("/", (req, res) => {
  res.send("🌯 Food Ordering API is running...");
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`"Server running on http://localhost:${PORT}"`));
