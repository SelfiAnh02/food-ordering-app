import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import productRouter from "./routes/productRoutes.js"; // add your router
import userRouter from "./routes/userRoutes.js"; // import user routes
import cartRouter from "./routes/cartRoutes.js"; // import cart routes


// Load environment variables

dotenv.config();
const app = express();


// Middleware
app.use(express.json());
app.use(cors());

// Connect Database
connectDB();

// API endpoints
app.use("/api/products", productRouter);
app.use("/images", express.static("uploads"));
app.use("/api/users", userRouter); // add user routes
app.use("/api/cart", cartRouter); // add cart routes

// Routes
app.get("/", (req, res) => {
  res.send("🌯 Food Ordering API is running...");
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`"Server running on http://localhost:${PORT}"`));
