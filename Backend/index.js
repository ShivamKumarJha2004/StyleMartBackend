import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import cors from "cors";
import { fileURLToPath } from 'url';
import productRoutes from "./Routes/productRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import User from "./Model/UserSchema.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Serve static files only if you still keep local uploads for some reason
// app.use("/images", express.static(path.resolve(__dirname, 'upload/images')));

// Routes
app.use("/api", productRoutes);
app.use("/api/admin", adminRoutes);

// MongoDB connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// JWT Middleware
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ errors: "User not found" });
        }

        if (!user.isVerified) {
            return res.status(403).send({
                errors: "Email not verified",
                needsVerification: true
            });
        }

        next();
    } catch (error) {
        return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
};

// ================= CLOUDINARY CONFIG =================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "products", // Cloudinary folder
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        // public_id: (req, file) => `product_${Date.now()}`
    }
});

const upload = multer({ storage });

// Image upload endpoint (now permanent URLs)
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Cloudinary URL
    const imageUrl = req.file.path || req.file.secure_url || req.file.url;

    res.json({
        success: 1,
        image_url: imageUrl
    });
});

// Cart routes
app.post('/addtocart', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    userdata.cartData[req.body.itemid] += 1;
    await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userdata.cartData });
    res.send("Added");
});

app.post('/removeproduct', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    if (userdata.cartData[req.body.itemid] > 0) {
        userdata.cartData[req.body.itemid] -= 1;
    }
    await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userdata.cartData });
    res.send("Removed");
});

app.post('/getcart', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    res.json(userdata.cartData);
});

// Health check
app.get("/", (req, res) => {
    res.send("Express is Running");
});

// Start server
app.listen(PORT, (e) => {
    if (!e) {
        console.log(`Server running on port ${PORT}`);
    } else {
        console.log("Error", e);
    }
});
