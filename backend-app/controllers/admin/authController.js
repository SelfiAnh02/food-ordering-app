// controllers/admin/authController.js

import userModel from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/auth.js";

// LOGIN ADMIN 
export const loginAdmin = async (req, res) => {
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

    // generate token dan set di cookie
    generateToken(res, user._id, user.role);

    // kembalikan success + info user
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/admin/authController.js
export const meAdmin = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) return res.status(401).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// LOGOUT ADMIN
// controllers/authController.js
export const logoutAdmin = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // hapus cookie
  });
  res.status(200).json({ success: true, message: "Logout berhasil" });
};

