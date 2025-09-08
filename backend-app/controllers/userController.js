import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";

// 🔑 JWT helper
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 🔐 Register User
const registerUser = async (req, res) => {
  const { name, phone, email, password, } = req.body;

  try {
    // cek email/phone unik
    const existUser = await userModel.findOne({ $or: [{ email }, { phone }] });
    if (existUser) {
      return res.status(400).json({ success: false, message: "Email/No WA sudah terdaftar" });
    }

    // validasi
    if (phone && !validator.isMobilePhone(phone, "id-ID")) {
      return res.status(400).json({ success: false, message: "Nomor WA tidak valid" });
    }
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Email tidak valid" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password minimal 6 karakter" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      phone,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    return res.status(201).json({ success: true, token, name: user.name });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

// 🔓 Login User
const loginUser = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await userModel.findOne({ phone });
    if (!user) {
      return res.status(400).json({ success: false, message: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Password salah" });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      name: user.name,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { registerUser, loginUser };
