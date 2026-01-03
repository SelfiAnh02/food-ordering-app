import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import PaymentIntent from "../models/paymentIntentModel.js";

function calcSignature(orderId, statusCode, grossAmount, serverKey) {
  return crypto
    .createHash("sha512")
    .update(
      String(orderId) +
        String(statusCode) +
        String(grossAmount) +
        String(serverKey)
    )
    .digest("hex");
}

export const notify = async (req, res) => {
  try {
    const b = req.body || {};
    const expected = calcSignature(
      b.order_id,
      b.status_code,
      b.gross_amount,
      process.env.MIDTRANS_SERVER_KEY
    );

    if (!b.signature_key || b.signature_key !== expected) {
      return res.status(401).send("invalid signature");
    }

    const mid = b.transaction_status; // pending | settlement | capture | cancel | deny | expire | refund | chargeback

    // New flow: if we have an Order already (rare), update it. Else, operate on PaymentIntent.
    const existingOrder = await orderModel.findOne({
      "payment.paymentId": b.order_id,
    });
    if (existingOrder) {
      const appStatus =
        mid === "settlement" || mid === "capture"
          ? "paid"
          : mid === "pending"
          ? "pending"
          : "failed";
      const updateDoc = {
        $set: {
          "payment.status": appStatus,
          "payment.transactionId": b.transaction_id,
          "payment.midtransStatus": mid,
        },
      };
      if (appStatus === "paid")
        updateDoc.$set["paymentDetails.paidAt"] = new Date();
      if (b?.payment_type)
        updateDoc.$set["paymentDetails.method"] = String(
          b.payment_type
        ).toLowerCase();
      await orderModel.findOneAndUpdate({ _id: existingOrder._id }, updateDoc, {
        new: true,
      });
      return res.status(200).send("OK");
    }

    // No order yet: look up intent by paymentId
    const intent = await PaymentIntent.findOne({ paymentId: b.order_id });
    if (!intent) {
      // Unknown notification; still acknowledge to avoid retries
      return res.status(200).send("OK");
    }

    if (mid === "settlement" || mid === "capture") {
      // Create Order from intent, then decrement stock
      const newOrder = new orderModel({
        userId: null,
        items: intent.items,
        totalPrice: intent.totalPrice,
        tableNumber: intent.tableNumber,
        orderType: intent.orderType,
        customerName: intent.customerName,
        customerWhatsapp: intent.customerWhatsapp,
        orderStatus: "pending",
        payment: {
          status: "paid",
          paymentId: intent.paymentId,
          paymentUrl: intent.paymentUrl || null,
          snapToken: intent.snapToken || null,
        },
        paymentDetails: {
          paidAt: new Date(),
          method: b?.payment_type
            ? String(b.payment_type).toLowerCase()
            : undefined,
        },
        source: "customer",
      });
      await newOrder.save();

      try {
        for (const item of intent.items || []) {
          const pid = item?.product?._id || item?.product;
          if (pid && item.quantity) {
            await productModel.findByIdAndUpdate(pid, {
              $inc: { stock: -Number(item.quantity) },
            });
          }
        }
      } catch (e) {
        // Log stock decrement error; order already recorded as paid
        console.warn("Stock decrement error on settlement:", e?.message);
      }

      intent.status = "settled";
      await intent.save();
      // Optionally delete the intent to keep collection small
      try {
        await PaymentIntent.findByIdAndDelete(intent._id);
      } catch {}
      return res.status(200).send("OK");
    }

    if (mid === "cancel" || mid === "deny" || mid === "expire") {
      intent.status = "canceled";
      await intent.save();
      try {
        await PaymentIntent.findByIdAndDelete(intent._id);
      } catch {}
      return res.status(200).send("OK");
    }

    // For pending or other statuses, just acknowledge
    return res.status(200).send("OK");
  } catch (e) {
    console.error("Webhook error:", e);
    return res.status(500).send("error");
  }
};

// Finalize a payment intent into an Order when Snap reports success on client
// Idempotent: if an Order already exists for the paymentId, returns OK
export const finalize = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res.status(400).json({ success: false, message: "Missing id" });

    // Find intent either by _id or by paymentId (e.g., PAY-<intentId>)
    let intent = await PaymentIntent.findById(id);
    if (!intent) intent = await PaymentIntent.findOne({ paymentId: id });
    if (!intent)
      return res
        .status(404)
        .json({ success: false, message: "Intent not found" });

    // If order already created (by webhook), return success
    const existing = await orderModel.findOne({
      "payment.paymentId": intent.paymentId,
    });
    if (existing) {
      return res
        .status(200)
        .json({
          success: true,
          message: "Order already created",
          data: existing,
        });
    }

    // Create order similar to settlement path
    const newOrder = new orderModel({
      userId: null,
      items: intent.items,
      totalPrice: intent.totalPrice,
      tableNumber: intent.tableNumber,
      orderType: intent.orderType,
      customerName: intent.customerName,
      customerWhatsapp: intent.customerWhatsapp,
      orderStatus: "pending",
      payment: {
        status: "paid",
        paymentId: intent.paymentId,
        paymentUrl: intent.paymentUrl || null,
        snapToken: intent.snapToken || null,
      },
      paymentDetails: {
        paidAt: new Date(),
        // method best-effort; may be set by webhook later
      },
      source: "customer",
    });
    await newOrder.save();

    // Decrement stock best-effort
    try {
      for (const item of intent.items || []) {
        const pid = item?.product?._id || item?.product;
        if (pid && item.quantity) {
          await productModel.findByIdAndUpdate(pid, {
            $inc: { stock: -Number(item.quantity) },
          });
        }
      }
    } catch (e) {
      console.warn("Stock decrement error on finalize:", e?.message);
    }

    intent.status = "settled";
    await intent.save();
    try {
      await PaymentIntent.findByIdAndDelete(intent._id);
    } catch {}

    return res
      .status(200)
      .json({ success: true, message: "Order created", data: newOrder });
  } catch (e) {
    console.error("Finalize error:", e);
    return res
      .status(500)
      .json({ success: false, message: "Failed to finalize payment" });
  }
};
