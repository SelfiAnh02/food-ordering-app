import orderModel from "../../models/orderModel.js";
import productModel from "../../models/productModel.js";
import PaymentIntent from "../../models/paymentIntentModel.js";
import { getSnapClient } from "../../config/midtransClient.js";

// Create Order (User Checkout)
export const createOrder = async (req, res) => {
  try {
    const { items, tableNumber, orderType, customerName, customerWhatsapp } =
      req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Items are required" });
    }

    if (
      !customerName ||
      !customerName.trim() ||
      !customerWhatsapp ||
      !customerWhatsapp.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "customerName and customerWhatsapp are required",
      });
    }

    let totalPrice = 0;
    const itemDetails = [];

    for (const item of items) {
      const product = await productModel.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} only has ${product.stock} left in stock`,
          availableStock: product.stock,
        });
      }

      totalPrice += product.price * item.quantity;

      // siapkan item_details untuk Snap agar rincian tampil
      itemDetails.push({
        id: String(product._id),
        price: Number(product.price),
        quantity: Number(item.quantity),
        name: product.name,
      });
    }

    // Create payment intent (do not persist Order yet)
    const intent = new PaymentIntent({
      items,
      totalPrice,
      tableNumber,
      orderType,
      customerName,
      customerWhatsapp,
      status: "created",
    });
    await intent.save();

    // Buat token Snap (popup) untuk pembayaran
    try {
      const snap = getSnapClient();
      const orderId = `PAY-${intent._id}`;
      const params = {
        transaction_details: {
          order_id: orderId,
          gross_amount: Number(totalPrice),
        },
        item_details: itemDetails,
        customer_details: {
          first_name: customerName,
          phone: customerWhatsapp,
        },
        credit_card: { secure: true },
        enabled_payments: ["qris", "gopay", "bank_transfer", "credit_card"],
      };

      // Use single createTransaction call; token available in result
      const trx = await snap.createTransaction(params);

      intent.paymentId = orderId;
      intent.paymentUrl = trx?.redirect_url || null;
      intent.snapToken = trx?.token || null;
      await intent.save();

      // Create the Order immediately in pending state so it appears
      // while the customer is on the Midtrans popup page.
      // Idempotency: if an order for this paymentId already exists, skip.
      const existingOrder = await orderModel.findOne({
        "payment.paymentId": orderId,
      });
      let createdOrder = existingOrder;
      if (!existingOrder) {
        createdOrder = new orderModel({
          userId: null,
          items: items,
          totalPrice,
          tableNumber,
          orderType,
          customerName,
          customerWhatsapp,
          orderStatus: "pending",
          payment: {
            status: "pending",
            paymentId: orderId,
            paymentUrl: intent.paymentUrl || null,
            snapToken: intent.snapToken || null,
          },
          // paidAt left empty; will be filled on settlement
          paymentDetails: {},
          source: "customer",
        });
        await createdOrder.save();
      }

      return res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        data: intent,
        order: createdOrder ?? null,
        snapToken: trx?.token || null,
      });
    } catch (e) {
      // If token creation fails, delete the intent and return error
      console.error("Snap token error:", e);
      try {
        await PaymentIntent.findByIdAndDelete(intent._id);
      } catch {}
      return res.status(500).json({
        success: false,
        message: "Failed to init payment",
      });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get My Orders (Customer by Table Number)
export const getMyOrders = async (req, res) => {
  try {
    const { tableNumber } = req.query;

    if (!tableNumber) {
      return res.status(400).json({
        success: false,
        message: "tableNumber is required",
      });
    }

    const orders = await orderModel
      .find({
        tableNumber,
        source: "customer", // only customer-originated orders
        orderStatus: { $in: ["pending", "confirmed", "delivered"] },
      })
      .select(
        "_id items totalPrice customerName customerWhatsapp orderType orderStatus tableNumber createdAt payment.status paymentDetails.method payment.paymentId payment.paymentUrl source"
      )
      .populate({ path: "items.product", select: "name price" })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders, // kalau kosong tetap [], bukan error
    });
  } catch (error) {
    console.error("Error getting my orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get orders",
      error: error.message,
    });
  }
};

// Get Order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await orderModel
      .findById(req.params.id)
      .select(
        "_id items totalPrice tableNumber orderType orderStatus customerName customerWhatsapp createdAt payment.status paymentDetails.method payment.paymentId payment.paymentUrl"
      )
      .populate({ path: "items.product", select: "name price" });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve Order",
      error: error.message,
    });
  }
};

// Cancel Unpaid Order (User closes payment or fails)
export const cancelUnpaidOrder = async (req, res) => {
  try {
    const { id } = req.params;
    // Try canceling an existing unpaid order
    const order = await orderModel.findById(id);
    if (order) {
      if (order?.payment?.status === "paid") {
        return res.status(400).json({
          success: false,
          message: "Order already paid and cannot be canceled",
        });
      }
      // restore stock
      try {
        for (const item of order.items || []) {
          const pid = item?.product?._id || item?.product;
          if (pid && item.quantity) {
            await productModel.findByIdAndUpdate(pid, {
              $inc: { stock: Number(item.quantity) },
            });
          }
        }
      } catch (e) {
        console.warn("Stock restore error on cancel order:", e?.message);
      }
      await orderModel.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Order canceled" });
    }

    // Otherwise, cancel a payment intent
    const intent = await PaymentIntent.findById(id);
    if (!intent) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    // Also remove any pending order created for this intent/paymentId
    try {
      const paymentId = intent.paymentId || `PAY-${String(intent._id)}`;
      const pendingOrder = await orderModel.findOne({
        "payment.paymentId": paymentId,
        "payment.status": { $in: ["pending", null] },
      });
      if (pendingOrder) {
        await orderModel.findByIdAndDelete(pendingOrder._id);
      }
    } catch (e) {
      console.warn(
        "Pending order cleanup on intent cancel failed:",
        e?.message
      );
    }
    intent.status = "canceled";
    await intent.save();
    await PaymentIntent.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Payment intent canceled" });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};
