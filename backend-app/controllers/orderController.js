import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

const placeOrder = async (req, res) => {
    try {
        // 1. Get user and cart data
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cartData = user.cartData || {};
        const isCartEmpty =
        Object.keys(cartData).length === 0 ||
        Object.values(cartData).every(item => !item || item.quantity === 0);

        if (isCartEmpty) {
            return res.status(400).json({
                success: false,
                message: "Tidak ada item di keranjang",
        });
        }

        // 2. Transform cartData to items array
        const items = Object.entries(cartData).map(([productId, item]) => ({
            product: productId,
            quantity: item.quantity,
            note: item.note || "",
        }));

        // 3. Calculate totalPrice + cek isActive
        let totalPrice = 0;
        for (const item of items) {
            const product = await productModel.findById(item.product);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Produk dengan ID ${item.product} tidak ditemukan`,
                });
            }

            if (!product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Produk "${product.name}" sudah tidak tersedia`,
                });
            }

            totalPrice += product.price * item.quantity;
        }

        // 4. Create new order
        const newOrder = new orderModel({
            userId: req.user.id,
            items,
            totalPrice,
            tableNumber: req.body.tableNumber,
            orderType: req.body.orderType || "Dine-In",
        });

        await newOrder.save();

        // 5. Update user: push orderId ke field orders + kosongkan cart
        await userModel.findByIdAndUpdate(req.user.id, {
            $push: { orders: newOrder._id },
            $set: { cartData: {} },
        });

        res.status(200).json({ success: true, order: newOrder });
    } catch (error) {
        console.error(">>> ERROR placeOrder:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};


export { placeOrder };


