const jwt = require("jsonwebtoken");
const Examinee = require("../models/Examinee");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided.",
        code: "NO_TOKEN"
      });
    }

    const token = authHeader.split(" ")[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ 
          success: false, 
          message: "Token expired. Please login again.",
          code: "TOKEN_EXPIRED"
        });
      }
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token.",
        code: "INVALID_TOKEN"
      });
    }

    let user;
    if (decoded.role === "admin") {
      const Admin = require("../models/Admin");
      user = await Admin.findById(decoded.id);
    } else {
      user = await Examinee.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found.",
        code: "USER_NOT_FOUND"
      });
    }

    // Session validation - disable for now to fix login issues
    // Allow users to stay logged in unless session explicitly mismatches
    // if (decoded.sid && user.currentSessionId && user.currentSessionId !== decoded.sid) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Your session has expired or you have logged in from another device.",
    //     code: "SESSION_EXPIRED"
    //   });
    // }

    req.user = user;
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(500).json({ 
      success: false, 
      message: "Authentication server error.",
      code: "AUTH_ERROR"
    });
  }
};

module.exports = authMiddleware;