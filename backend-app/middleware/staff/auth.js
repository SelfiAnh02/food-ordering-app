//middleware/staff/auth.js
import jwt from "jsonwebtoken";

export const authStaff = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // pastikan role benar-benar 'staff'
    if (decoded.role !== "staff") {
      return res.status(403).json({ message: "Access denied, staff only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("authStaff error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
