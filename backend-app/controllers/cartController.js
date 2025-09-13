import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// add item to user cart
const addToCart = async (req, res) => {
    try {
        const { productId, note } = req.body;
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // cek apakah productId valid & isActive
        const product = await productModel.findById(productId);
        if (!product || !product.isActive) {
            return res.status(400).json({ success: false, message: "Product not available for now" });
        }

        let cartData = user.cartData || {};

        if (!cartData[productId]) {
            cartData[productId] = { quantity: 1, note: note || "" };
        } else {
            cartData[productId].quantity += 1;

            // kalau ada note baru dikirim, update note
            if (note) {
                cartData[productId].note = note;
            }
        }

        await userModel.findByIdAndUpdate(
            req.user.id,
            { cartData },
            { new: true }
        );
        res.status(200).json({ success: true, message: "Item added to cart successfully" });
    } catch (error) {
        console.error("Add to cart error:", error); // biar kelihatan stack errornya
        res.status(500).json({ 
            success: false, 
            message: error.message || "error lagi deh" 
        });
    }
}

// remove item from user cart
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userData = await userModel.findById(req.user.id);
        let cartData = userData.cartData || {};

        // cek apakah cart kosong (tidak ada key)
        if (!Object.keys(cartData).length) {
            return res.status(400).json({
                success: false,
                message: "Keranjang masih kosong"
            });
        }

        // cek apakah productId ada di cart
        if (!cartData[productId]) {
            return res.status(400).json({
                success: false,
                message: "Produk ini tidak ada di keranjang"
            });
        }

        // aman, sekarang kurangi quantity
        if (cartData[productId].quantity > 0) {
            cartData[productId].quantity -= 1;

            if (cartData[productId].quantity === 0) {
                delete cartData[productId];
            }
        }

        await userModel.findByIdAndUpdate(req.user.id, { cartData });

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error lagi broow"
        });
    }
};


// get user cart
const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = user.cartData || {};

    // kalau kosong langsung return array kosong
    if (Object.keys(cartData).length === 0) {
      return res.status(200).json({ success: true, cart: [] });
    }

    // ubah object cartData jadi array agar mudah diolah frontend
    const cartItems = Object.entries(cartData).map(([productId, item]) => ({
      productId,
      quantity: item.quantity,
      note: item.note || ""
    }));

    res.status(200).json({ success: true, cart: cartItems });
  } catch (error) {
    console.error(">>> ERROR getCart:", error);
    res.status(500).json({ success: false, message: "Error getCart" });
  }
};




export { addToCart, removeFromCart, getCart };