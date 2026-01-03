import express from "express";
import { notify, finalize } from "../controllers/midtransController.js";

const router = express.Router();

// Webhook endpoint dari Midtrans (Payment Notification URL)
router.post("/notify", notify);
// Fallback finalize endpoint to create Order from PaymentIntent on client success
router.post("/finalize/:id", finalize);

export default router;
