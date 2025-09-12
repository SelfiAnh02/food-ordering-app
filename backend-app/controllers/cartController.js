import userModel from "../models/userModel.js";

// add item to user cart
const addToCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.user.id);
        let cartData = await userData.cartData;
        if (!cartData[req.body.productId]) {
            cartData[req.body.productId] = 1;
        } else {
            cartData[req.body.productId] += 1;
        }

        await userModel.findByIdAndUpdate(
            req.user.id,
            { cartData }
        );  
        res.status(200).json({success: true, message: "Item added to cart successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: "error lagi deh"});
    }
}

// remove item from user cart
const removeFromCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.user.id);
        let cartData = userData.cartData;
        if (cartData[req.body.productId]>0) {
            cartData[req.body.productId] -= 1;
        }
        await userModel.findByIdAndUpdate(
            req.user.id,
            { cartData }
        );  
        res.status(200).json({success: true, message: "Item removed from cart successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: "Error lagi broow"});
    }
}
    
// fetch user cart data 
const getCart = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            cartData: user.cartData
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error lagi broow" });
    }
};



export { addToCart, removeFromCart, getCart };