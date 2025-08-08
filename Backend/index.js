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

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Enable CORS (adjust if you need to restrict)
app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Serve static files for images and other assets
app.use("/images", express.static(path.resolve(__dirname, 'upload/images')));

// Use routes
app.use("/api", productRoutes);
app.use("/api/admin", adminRoutes);

// MongoDB connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// JWT Middleware for protected routes
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        
        // Check if user is verified
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

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: path.resolve(__dirname, "upload/images"),
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

// Image upload endpoint
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Return the image URL in the response
    res.json({
        success: 1,
        image_url: `https://stylemart-backend-1.onrender.com/images/${req.file.filename}` 
    });
});

// Add to cart endpoint
app.post('/addtocart', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    userdata.cartData[req.body.itemid] += 1;
    await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userdata.cartData });
    res.send("Added");
});

// Remove product from cart endpoint
app.post('/removeproduct', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    if (userdata.cartData[req.body.itemid] > 0) {
        userdata.cartData[req.body.itemid] -= 1;
    }
    await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userdata.cartData });
    res.send("Removed");
});

// Get cart data endpoint
app.post('/getcart', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    res.json(userdata.cartData);
});

// Default route for server status
app.get("/", (req, res) => {
    res.send("Express is Running");
});

// Start the server
app.listen(PORT, (e) => {
    if (!e) {
        console.log(`Server running on port ${PORT}`);
    } else {
        console.log("Error", e);
    }
});
