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
        const cartData = user.cartData; // { productId: quantity }
        const isCartEmpty = !cartData || Object.values(cartData).every(qty => qty === 0);
        if (isCartEmpty) {
            return res.status(400).json({
                success: false,
                message: "Tidak ada item di keranjang"
            });
        }

        // 2. Transform cartData to items array
        const items = Object.entries(cartData).map(([productId, quantity]) => ({
            product: productId,
            quantity
        }));

        // 3. Calculate totalPrice
        let totalPrice = 0;
        for (const item of items) {
            const product = await productModel.findById(item.product);
            if (product) {
                totalPrice += product.price * item.quantity;
            }
        }

        // 4. Create new order
        const newOrder = new orderModel({
            userId: req.user.id,
            items,
            totalPrice,
            tableNumber: req.body.tableNumber,
        });

        await newOrder.save();

        // 5. Update user: push orderId ke field orders + kosongkan cart
        await userModel.findByIdAndUpdate(req.user.id, {
            $push: { orders: newOrder._id }, // tambahkan id order ke array orders
            $set: { cartData: {} }           // kosongkan cart
        });

        res.status(200).json({ success: true, order: newOrder });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}

export { placeOrder };


