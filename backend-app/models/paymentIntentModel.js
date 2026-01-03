import mongoose from "mongoose";

const paymentIntentSchema = new mongoose.Schema(
  {
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        note: { type: String },
      },
    ],
    tableNumber: { type: String },
    orderType: {
      type: String,
      enum: ["Dine-In", "Takeaway", "Delivery"],
      default: "Dine-In",
    },
    customerName: { type: String },
    customerWhatsapp: { type: String },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["created", "settled", "canceled"],
      default: "created",
    },
    paymentId: { type: String }, // same as Midtrans order_id
    paymentUrl: { type: String },
    snapToken: { type: String },
  },
  { timestamps: true }
);

const PaymentIntentModel =
  mongoose.models.paymentintent ||
  mongoose.model("PaymentIntent", paymentIntentSchema);
export default PaymentIntentModel;
