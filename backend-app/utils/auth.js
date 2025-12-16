import jwt from "jsonwebtoken";

// auth Token
export const generateToken = async (res, userId, userRole) => {
  // generate token dengan role
  const token = jwt.sign(
    { id: userId, role: userRole },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // scope cookie by role so admin and staff tokens can coexist under different paths
  const cookiePath =
    userRole === "admin"
      ? "/api/admin"
      : userRole === "staff"
      ? "/api/staff"
      : "/";

  // res.cookie("jwt", token, {
  //   maxAge: getMaxageFromExpiresIn("7d"),
  //   httpOnly: true,
  //   sameSite: "strict",
  //   // secure should be true in production
  //   secure: process.env.NODE_ENV !== "development",
  //   path: cookiePath,
  // });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // ⬅️ WAJIB
  });

  return token;
};

const getMaxageFromExpiresIn = (expiresIn) => {
  if (typeof expiresIn === "number") return expiresIn * 1000;
  const match = expiresIn.match(/^(\d+)([dhm])$/);
  if (!match) return 3600 * 1000; // default 1 hour

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "m":
      return value * 60 * 1000;
    default:
      return 3600 * 1000;
  }
};
