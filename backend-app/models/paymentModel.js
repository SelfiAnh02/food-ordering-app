import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "E-Wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    transactionId: {
      type: String, // transaction_id dari Midtrans
    },
    vaNumber: {
      type: String, // kalau Bank Transfer
    },
    ewalletType: {
      type: String, // misalnya GoPay, OVO, Dana
    },
    amount: {
      type: Number,
      required: true,
    },
    rawResponse: {
      type: Object, // simpan full response dari Midtrans (opsional, untuk debug)
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
