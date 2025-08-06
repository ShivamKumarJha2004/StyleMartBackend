import express from "express";
import productController from "../Controller/ProductController/addProduct.js"; // Import the controller
import removeProduct from "../Controller/ProductController/removeProducts.js";
import allproduct from "../Controller/ProductController/allProduct.js";
import {RegUser} from "../Controller/ProductController/User/RegUser.js";
import {userLogin} from "../Controller/ProductController/User/RegUser.js";
import newcoll from "../Controller/ProductController/newCollectionData.js";
import popinWomen from "../Controller/ProductController/popularInWomen.js";
import relatedPro from "../Controller/ProductController/relatedProduct.js";
import createOrder from "../Controller/ProductController/createOrder.js";
import verifyPayment from "../Controller/ProductController/verifyPayment.js";
import saveOrder from "../Controller/ProductController/saveOrder.js";
import { 
  sendVerificationCode, 
  verifyEmail, 
  sendPasswordResetCode, 
  resetPassword 
} from "../Controller/ProductController/User/EmailVerification.js";
const router = express.Router();

// Define the POST route for adding a product
router.post("/addproduct", productController);
router.post("/deleteproduct",removeProduct);
router.get("/allproduct",allproduct);
router.post("/signUp",RegUser);
router.post("/login",userLogin);

// Email verification and password reset routes
router.post("/send-verification-code", sendVerificationCode);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", sendPasswordResetCode);
router.post("/reset-password", resetPassword);
router.get("/newcollection",newcoll);
router.get("/popularInwomen",popinWomen);
router.get("/relatedProduct",relatedPro);

// Razorpay routes
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/save-order", saveOrder);

export default router;
