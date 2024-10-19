import express from "express";
import productController from "../Controller/ProductController/addProduct.js"; // Import the controller
import removeProduct from "../Controller/ProductController/removeProducts.js";
import allproduct from "../Controller/ProductController/allProduct.js";
import {RegUser} from "../Controller/ProductController/User/RegUser.js";
import  {userLogin}  from "../Controller/ProductController/User/RegUser.js";
import newcoll from "../Controller/ProductController/newCollectionData.js";
import popinWomen from "../Controller/ProductController/popularInWomen.js";
import relatedPro from "../Controller/ProductController/relatedProduct.js";
const router = express.Router();

// Define the POST route for adding a product
router.post("/addproduct", productController);
router.post("/deleteproduct",removeProduct);
router.get("/allproduct",allproduct);
router.post("/signUp",RegUser);
router.post("/login",userLogin);
router.get("/newcollection",newcoll);
router.get("/popularInwomen",popinWomen);
router.get("/relatedProduct",relatedPro);




export default router;
