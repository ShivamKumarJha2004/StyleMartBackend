import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import cors from "cors";
import { fileURLToPath } from 'url'; // For __dirname workaround
import productRoutes from "./Routes/productRoutes.js";
import User from "./Model/UserSchema.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get the values from the .env file
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Middleware
app.use(express.json());

// CORS configuration to allow access from any origin
app.use(cors({
    origin: '*',  // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['auth-token', 'Content-Type'],
}));

// Serve static images from 'upload/images' directory
app.use("/images", express.static(path.join(__dirname, 'upload/images'), {
    maxAge: '1d',  // Cache images for 1 day to improve performance
}));

// MongoDB connection using environment variable
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Middleware to fetch the user based on the auth-token
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({
            errors: "Please authenticate using a valid token"
        });
    }

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).send({
            errors: "Please authenticate using a valid token"
        });
    }
};

// Add to cart endpoint
app.post('/addtocart', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    userdata.cartData[req.body.itemid] += 1;
    await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userdata.cartData });
    res.send("Added to cart");
});

// Remove product from cart endpoint
app.post('/removeproduct', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    if (userdata.cartData[req.body.itemid] > 0) {
        userdata.cartData[req.body.itemid] -= 1;
    }
    await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userdata.cartData });
    res.send("Removed from cart");
});

// Get cart data
app.post('/getcart', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    res.json(userdata.cartData);
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: "./upload/images",  // Directory for image uploads
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage
});

// Image upload endpoint
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Return the public URL of the uploaded image
    res.json({
        success: 1,
        image_url: `https://yourdomain.com/images/${req.file.filename}` // Use your domain here
    });
});

// Default route
app.get("/", (req, res) => {
    res.send("Express is Running");
});

// Start the server using the environment variable
app.listen(PORT, (e) => {
    if (!e) {
        console.log(`Server running on port ${PORT}`);
    } else {
        console.log("Error", e);
    }
});
