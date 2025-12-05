import orderModel from "../../models/orderModel.js";
import productModel from "../../models/productModel.js";

// Create Order (Kasir)
export const createOrderKasir = async (req, res) => {
  try {
    const { items, orderType, tableNumber, paymentMethod, customerName } =
      req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required",
      });
    }

    // Normalize orderType
    const normalizedOrderType =
      orderType?.toLowerCase() === "dine-in"
        ? "Dine-In"
        : orderType?.toLowerCase() === "takeaway"
        ? "Takeaway"
        : orderType?.toLowerCase() === "delivery"
        ? "Delivery"
        : null;

    if (!normalizedOrderType) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderType",
      });
    }

    const dineIn = normalizedOrderType === "Dine-In";
    const takeaway = normalizedOrderType === "Takeaway";
    const delivery = normalizedOrderType === "Delivery";

    if (dineIn && !tableNumber) {
      return res.status(400).json({
        success: false,
        message: "tableNumber is required for Dine-In orders",
      });
    }

    if ((takeaway || delivery) && !customerName) {
      return res.status(400).json({
        success: false,
        message: "customerName is required for Takeaway & Delivery orders",
      });
    }

    // Calculate total & validate stock
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
          message: `Product ${product.name} only has ${product.stock} left`,
          availableStock: product.stock,
        });
      }

      totalPrice += product.price * item.quantity;

      productUpdates.push({
        productId: product._id,
        quantity: item.quantity,
      });
    }

    // Update stock
    for (const update of productUpdates) {
      await productModel.findByIdAndUpdate(update.productId, {
        $inc: { stock: -update.quantity },
      });
    }

    // --- BUILD ITEMS WITH NOTE ---
    const mappedItems = items.map((i) => ({
      product: i.product,
      quantity: i.quantity,
      note: i.note || "", // ⬅ HERE
    }));

    // Create Order
    const newOrder = new orderModel({
      userId: null,
      items: mappedItems,
      totalPrice,
      orderType: normalizedOrderType,
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

    return res.status(200).json({
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
// Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const { status: statusQuery } = req.query;

    const validStatus = ["pending", "confirmed", "delivered"];
    let filter = {};

    if (statusQuery) {
      if (!validStatus.includes(statusQuery)) {
        return res.status(400).json({
          success: false,
          message: `Status "${statusQuery}" tidak valid`,
        });
      }
      filter.orderStatus = statusQuery;
    }

    let orders = await orderModel
      .find(filter)
      .select(
        "_id items totalPrice customerName tableNumber orderType orderStatus createdAt payment paymentDetails"
      )
      .populate({ path: "items.product", select: "name price" })
      .sort({ createdAt: -1 })
      .lean();

    orders = orders.map((o) => {
      const items = o.items.map((i) => ({
        productId: i.product?._id || null,
        productName: i.product?.name || "Unknown Product",
        productPrice: i.product?.price ?? null,
        quantity: i.quantity,
        note: i.note || "",
      }));

      const paymentMethod = o.paymentDetails?.method ?? o.paymentMethod ?? null;
      const paymentStatus = o.payment?.status ?? null;
      const paymentId = o.payment?.paymentId ?? null;
      const paymentUrl = o.payment?.paymentUrl ?? null;

      return {
        ...o,
        items,
        paymentMethod,
        paymentStatus,
        paymentId,
        paymentUrl,
      };
    });

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
      .select(
        "_id items totalPrice customerName tableNumber orderType orderStatus createdAt payment paymentDetails"
      )
      .populate({ path: "items.product", select: "name price" })
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const items = order.items.map((i) => ({
      productId: i.product?._id || null,
      productName: i.product?.name || "Unknown Product",
      productPrice: i.product?.price ?? null,
      quantity: i.quantity,
      note: i.note || "",
    }));

    const paymentMethod =
      order.paymentDetails?.method ?? order.paymentMethod ?? null;
    const paymentStatus = order.payment?.status ?? null;
    const paymentId = order.payment?.paymentId ?? null;
    const paymentUrl = order.payment?.paymentUrl ?? null;

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: {
        ...order,
        items,
        paymentMethod,
        paymentStatus,
        paymentId,
        paymentUrl,
      },
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

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const newStatus = req.body.status ?? req.body.orderStatus ?? null;

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: "Missing status in request body. Use { status: 'confirmed' }",
      });
    }

    const validStatus = ["pending", "confirmed", "delivered"];
    if (!validStatus.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status "${newStatus}" tidak valid.`,
      });
    }

    const order = await orderModel
      .findById(id)
      .populate("items.product", "name stock salesCount price");
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Order sudah delivered dan tidak bisa diubah lagi",
      });
    }

    if (newStatus === "delivered") {
      for (const item of order.items) {
        if (item?.product?._id) {
          await productModel.findByIdAndUpdate(item.product._id, {
            $inc: { salesCount: item.quantity },
          });
        }
      }
    }

    order.orderStatus = newStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to "${newStatus}"`,
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
