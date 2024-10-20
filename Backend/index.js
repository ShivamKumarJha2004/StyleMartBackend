import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import cors from "cors";
import { fileURLToPath } from 'url'; // Import for __dirname workaround
import productRoutes from "./Routes/productRoutes.js";
import User from "./Model/UserSchema.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get the values from the .env file
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Middleware
app.use(express.json());

// CORS configuration allowing access from all origins and all headers
app.use(cors({
    origin: '*',  
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['auth-token', 'Content-Type'],
    credentials: true,  // Enable cookies if needed
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
    console.log("Token", token);

    if (!token) {
        return res.status(401).send({
            errors: "Please authenticate using a valid token"
        });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET); // Use JWT secret from env
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
    userdata.cartData[req.body.itemid] = (userdata.cartData[req.body.itemid] || 0) + 1;
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

// Get cart data
app.post('/getcart', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    res.json(userdata.cartData);
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: "./upload/images", // Directory where images will be saved
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage
});

// Serve static images from the upload folder using __dirname with caching
app.use("/images", express.static(path.join(__dirname, 'upload/images'), {
    maxAge: '1d',  // Cache images for 1 day for faster load on mobile devices
    etag: false    // Disable ETag for simplicity
}));

// Image upload endpoint
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).send('No file uploaded.');
    }

    console.log(`Uploaded file: ${req.file.filename}`);

    res.json({
        success: 1,
        image_url: `https://stylemartbackend.onrender.com/images/${req.file.filename}` // Absolute URL
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
