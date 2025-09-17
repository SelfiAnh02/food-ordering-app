import jwt from "jsonwebtoken";


// auth Token
export const generateToken = async(res, userId , userRole) => {

    // generate token dengan role
    const token = jwt.sign(
      { id: userId, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie('jwt',token, { 
    maxage: getMaxageFromExpiresIn('7d'),
    httpOnly: true,
    samesite: 'strict',
    secure: process.env.NODE_ENV === "development",
    path: '/'
    });

    return token;

};

const getMaxageFromExpiresIn = (expiresIn) => {
    if (typeof expiresIn === 'number') return expiresIn * 1000;
    const match = expiresIn.match(/^(\d+)([dhm])$/);
    if (!match) return 3600*1000; // default 1 hour

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        default: return 3600 * 1000;
    }
};

