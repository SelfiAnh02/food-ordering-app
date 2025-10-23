import userModel from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/auth.js";

// LOGIN STAFF
export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email, role: "staff" });
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

    // kembalikan info user
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // penting untuk frontend
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const logoutStaff = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // hapus cookie
    secure: process.env.NODE_ENV === "production", // jika production
    sameSite: "strict",
  });
  res.status(200).json({ success: true, message: "Logout berhasil" });
};

