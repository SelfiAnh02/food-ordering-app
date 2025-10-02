import orderModel from "../../models/orderModel.js";
import productModel from "../../models/productModel.js";

// Create Order (User Checkout)
export const createOrder = async (req, res) => {
  try {
    const { items, tableNumber, orderType } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items are required" });
    }

    let totalPrice = 0;
    const productUpdates = [];

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

      productUpdates.push({
        productId: product._id,
        quantity: item.quantity,
      });
    }

    for (const update of productUpdates) {
      await productModel.findByIdAndUpdate(update.productId, {
        $inc: { stock: -update.quantity },
      });
    }

    const newOrder = new orderModel({
      userId: req.user ? req.user.id : null,
      items,
      totalPrice,
      tableNumber,
      orderType,
      orderStatus: "pending",
      payment: { 
        status: "pending",   // order baru selalu pending dulu
        paymentId: null,     // nanti diisi setelah request ke Midtrans
        paymentUrl: null     // nanti diisi juga dari Midtrans
      }
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
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
        orderStatus: { $in: ["pending", "confirmed", "preparing"] },
      })
      .select("_id items totalPrice")
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
      .select("_id items totalPrice tableNumber orderType orderStatus")
      
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
