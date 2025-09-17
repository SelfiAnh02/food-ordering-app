import jwt from "jsonwebtoken";

export const authStaff = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.role) {
      return res.status(403).json({ message: "Access denied, staff only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};