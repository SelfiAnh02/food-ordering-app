import orderModel from "../../models/orderModel.js";
import Product from "../../models/productModel.js";

// 🟢 Get All Orders (Admin)
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await orderModel.find()
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Daftar semua order berhasil diambil",
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching all orders (admin):", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data order",
      error: error.message,
    });
  }
};

// 🟢 Get Order by ID (Admin)
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id)
      .populate("items.product", "name price categoryId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Detail order berhasil diambil",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order by ID (admin):", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail order",
      error: error.message,
    });
  }
};

// 🟢 Get Order Statistics (Admin)
export const getOrderStatsAdmin = async (req, res) => {
  try {
    // Ambil semua order dengan status paid/delivered
    const completedOrders = await orderModel.find({
      "payment.status": "paid",
      orderStatus: "delivered",
    });

    // Hitung total pendapatan
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    // Hitung total order selesai
    const totalCompletedOrders = completedOrders.length;

    // Ambil semua produk & urutkan berdasarkan salesCount
    const topProducts = await Product.find()
      .sort({ salesCount: -1 })
      .limit(5)
      .select("name price salesCount");

    res.status(200).json({
      success: true,
      message: "Statistik penjualan berhasil diambil",
      data: {
        totalRevenue,
        totalCompletedOrders,
        topProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching sales statistics (admin):", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik penjualan",
      error: error.message,
    });
  }
};
