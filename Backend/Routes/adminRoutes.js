import express from 'express';
import { registerAdmin, loginAdmin, getAdminProfile } from '../Controller/AdminController/AdminAuth.js';
import { 
  getAllProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getProductById 
} from '../Controller/AdminController/ProductManagement.js';
import { 
  getAllUsers, 
  getUserById, 
  updateUserStatus, 
  deleteUser, 
  getUserStats 
} from '../Controller/AdminController/UserManagement.js';
import { 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder, 
  getOrderStats 
} from '../Controller/AdminController/OrderManagement.js';
import { verifyAdminToken, isAdmin, canManageProducts, canManageUsers, canManageOrders } from '../Middleware/adminAuth.js';

const router = express.Router();

// Admin Authentication Routes
router.post('/register', verifyAdminToken, isAdmin, registerAdmin); // Only admin can register new admins
router.post('/login', loginAdmin);
router.get('/profile', verifyAdminToken, getAdminProfile);

// Admin management routes (admin only)


// Product Management Routes
router.get('/products', verifyAdminToken, canManageProducts, getAllProducts);
router.post('/products', verifyAdminToken, canManageProducts, addProduct);
router.get('/products/:id', verifyAdminToken, canManageProducts, getProductById);
router.put('/products/:id', verifyAdminToken, canManageProducts, updateProduct);
router.delete('/products/:id', verifyAdminToken, canManageProducts, deleteProduct);

// User Management Routes
router.get('/users', verifyAdminToken, canManageUsers, getAllUsers);
router.get('/users/stats', verifyAdminToken, canManageUsers, getUserStats);
router.get('/users/:id', verifyAdminToken, canManageUsers, getUserById);
router.put('/users/:id/status', verifyAdminToken, canManageUsers, updateUserStatus);
router.delete('/users/:id', verifyAdminToken, canManageUsers, deleteUser);

// Order Management Routes
router.get('/orders', verifyAdminToken, canManageOrders, getAllOrders);
router.get('/orders/stats', verifyAdminToken, canManageOrders, getOrderStats);
router.get('/orders/:id', verifyAdminToken, canManageOrders, getOrderById);
router.put('/orders/:id/status', verifyAdminToken, canManageOrders, updateOrderStatus);
router.delete('/orders/:id', verifyAdminToken, canManageOrders, deleteOrder);

export default router;