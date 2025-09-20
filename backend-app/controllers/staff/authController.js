import userModel from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/auth.js";

// LOGIN STAFF
export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    generateToken(res, user._id, user.role);

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
  
};
