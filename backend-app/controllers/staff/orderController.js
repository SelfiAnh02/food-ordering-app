import orderModel from "../../models/orderModel.js";
import productModel from "../../models/productModel.js";

// Create Order (Kasir)
export const createOrderKasir = async (req, res) => {
  try {
    const { items, orderType, tableNumber, paymentMethod, customerName } =
      req.body;

    // --- Basic Validation ---
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required",
      });
    }

    // ❗ Sesuaikan dengan frontend (lowercase)
    const dineIn = orderType === "dine-in";
    const takeaway = orderType === "takeaway";
    const delivery = orderType === "delivery";

    // Validasi Dine-In
    if (dineIn && !tableNumber) {
      return res.status(400).json({
        success: false,
        message: "tableNumber is required for Dine-In orders",
      });
    }

    // Validasi Takeaway / Delivery harus ada customerName
    if ((takeaway || delivery) && !customerName) {
      return res.status(400).json({
        success: false,
        message: "customerName is required for Takeaway & Delivery orders",
      });
    }

    // --- Calculate Total & Validate Stock ---
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

    // --- Update Stock ---
    for (const update of productUpdates) {
      await productModel.findByIdAndUpdate(update.productId, {
        $inc: { stock: -update.quantity },
      });
    }

    // --- Create Order ---
    const newOrder = new orderModel({
      userId: null, // kasir tidak terkait user login
      items,
      totalPrice,
      orderType, // sudah lowercase sesuai request
      tableNumber: dineIn ? tableNumber : null,
      customerName: takeaway || delivery ? customerName : null,
      orderStatus: "pending",
      payment: {
        status: "paid",
      },
      paymentDetails: {
        method: paymentMethod,
        paidAt: new Date(),
      },
    });

    await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully by cashier",
      data: newOrder,
    });
  } catch (error) {
    console.error("Error creating cashier order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create cashier order",
      error: error.message,
    });
  }
};

// Get All Order (can filter by orderStatus)
export const getAllOrders = async (req, res) => {
  try {
    const { status: statusQuery } = req.query; // ambil dari query ?status=pending

    const validStatus = ["pending", "confirmed", "delivered"];
    let filter = {};

    if (statusQuery) {
      if (!validStatus.includes(statusQuery)) {
        return res.status(400).json({
          success: false,
          message: `Status "${statusQuery}" tidak valid. Gunakan: ${validStatus.join(
            ", "
          )}`,
        });
      }
      filter.orderStatus = statusQuery;
    }

    const orders = await orderModel
      .find(filter)
      .select(
        "_id items totalPrice tableNumber orderType orderStatus createdAt"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Daftar order berhasil diambil",
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get all orders",
      error: error.message,
    });
  }
};

// Get Order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await orderModel
      .findById(req.params.id)
      .select("_id items totalPrice tableNumber orderType orderStatus");

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

// Update Order Status (Kasir only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // daftar status valid
    const validStatus = ["pending", "confirmed", "delivered"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status "${status}" tidak valid. Gunakan: ${validStatus.join(
          ", "
        )}`,
      });
    }

    // ambil order dulu
    const order = await orderModel
      .findById(id)
      .populate("items.product", "name stock salesCount price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // kalau sudah delivered → stop, jangan update
    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Order sudah delivered dan tidak bisa diubah lagi",
      });
    }

    // jika status diubah ke "delivered", tambahkan salesCount
    if (status === "delivered") {
      for (const item of order.items) {
        await productModel.findByIdAndUpdate(item.product._id, {
          $inc: { salesCount: item.quantity },
        });
      }
    }

    // update status order
    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
