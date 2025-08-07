import jwt from 'jsonwebtoken';
import Admin from '../Model/AdminSchema.js';

/**
 * Middleware to verify admin JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const verifyAdminToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token, authorization denied',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_ecom_admin');
    req.admin = decoded.admin;

    // Check if admin exists
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token, admin not found',
      });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Token is not valid',
    });
  }
};

/**
 * Middleware to check if user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const isAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/**
 * Middleware to check if admin can manage products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const canManageProducts = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found',
      });
    }

    // Check if admin has permission to manage products
    if (admin.permissions.manageProducts) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not have permission to manage products.',
      });
    }
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/**
 * Middleware to check if admin can manage users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const canManageUsers = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found',
      });
    }

    // Check if admin has permission to manage users
    if (admin.permissions.manageUsers) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not have permission to manage users.',
      });
    }
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/**
 * Middleware to check if admin can manage orders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const canManageOrders = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found',
      });
    }

    // Check if admin has permission to manage orders
    if (admin.permissions.manageOrders) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Access denied. You do not have permission to manage orders.',
      });
    }
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};