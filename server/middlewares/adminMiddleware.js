const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required.",
      code: "NOT_AUTHENTICATED"
    });
  }

  const userRole = req.user.role || req.userRole;
  
  if (userRole === "admin") {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Administrator privileges required.",
      code: "FORBIDDEN"
    });
  }
};

module.exports = adminMiddleware;
