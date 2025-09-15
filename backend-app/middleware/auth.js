import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Not Authorized Login Again" });
    }

    // ambil token setelah "Bearer "
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Not Authorized Login Again" });
    }

    try {
      const token_decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = token_decode;
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: "Not Authorized Login Again" });
    }
};




// role check
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: No access" });
    }
    next();
  };
};

export { authMiddleware, authorize };