// backend/middleware/auth.js
// ✅ COMPLETE AUTH MIDDLEWARE FILE - COPY THIS ENTIRE FILE

const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const Alumni = require("../models/Alumni");

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE 1: Verify JWT Token
// ═══════════════════════════════════════════════════════════════════════

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please log in.",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Attach user info to request
    req.user = {
      id: decoded.id || decoded._id,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type, // 'user' (admin) or 'alumni'
      ...decoded,
    };

    console.log(`✅ User authenticated: ${req.user.email} (${req.user.role})`);
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE 2: Check if User is Admin
// ═══════════════════════════════════════════════════════════════════════

const adminMiddleware = async (req, res, next) => {
  try {
    // ✅ First check: Must be authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ✅ Second check: Role must be 'admin' or 'superadmin'
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      console.warn(`⚠️ Unauthorized access attempt by ${req.user.email}`);
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // ✅ Optional: Verify user still exists in database
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Optional: Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    console.log(`✅ Admin access granted to: ${req.user.email}`);
    next();
  } catch (error) {
    console.error("❌ Admin middleware error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE 3: Check if User is SuperAdmin
// ═══════════════════════════════════════════════════════════════════════

const superAdminMiddleware = async (req, res, next) => {
  try {
    // ✅ First check: Must be authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ✅ Second check: Role MUST be 'superadmin' (strictly!)
    if (req.user.role !== "superadmin") {
      console.warn(
        `⚠️ Unauthorized superadmin access attempt by ${req.user.email} (role: ${req.user.role})`
      );
      return res.status(403).json({
        success: false,
        message: "SuperAdmin access required",
      });
    }

    // ✅ Optional: Verify user still exists in database
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Optional: Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    // ✅ Verify role is actually superadmin in database too
    if (user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "SuperAdmin access required",
      });
    }

    console.log(`✅ SuperAdmin access granted to: ${req.user.email}`);
    next();
  } catch (error) {
    console.error("❌ SuperAdmin middleware error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// HELPER MIDDLEWARE: Check if Alumni
// ═══════════════════════════════════════════════════════════════════════

const alumniMiddleware = async (req, res, next) => {
  try {
    // ✅ First check: Must be authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ✅ Second check: Role must be 'alumni'
    if (req.user.role !== "alumni") {
      console.warn(`⚠️ Unauthorized alumni access by ${req.user.email}`);
      return res.status(403).json({
        success: false,
        message: "Alumni access required",
      });
    }

    // ✅ Optional: Verify alumni still exists in database
    const alumni = await Alumni.findById(req.user.id);

    if (!alumni) {
      return res.status(401).json({
        success: false,
        message: "Alumni not found",
      });
    }

    console.log(`✅ Alumni access granted to: ${req.user.email}`);
    next();
  } catch (error) {
    console.error("❌ Alumni middleware error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// HELPER: Verify Token (same as authMiddleware but exportable separately)
// ═══════════════════════════════════════════════════════════════════════

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    req.user = {
      id: decoded.id || decoded._id,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type,
      ...decoded,
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// EXPORT ALL MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════

module.exports = {
  authMiddleware,
  adminMiddleware,
  superAdminMiddleware,
  alumniMiddleware,
  verifyToken,
};