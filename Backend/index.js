import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import cors from "cors";
import { fileURLToPath } from 'url'; // Import for __dirname workaround
import productRoutes from "./Routes/productRoutes.js"; // Routes for products (make sure the path is correct)
import User from "./Model/UserSchema.js"; // User schema/model (ensure the path is correct)
import dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

// Get the values from the .env file
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// __dirname workaround for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Middleware to parse incoming JSON data
app.use(express.json());

// Enable CORS with all origins (adjust as necessary)
app.use(cors({
    origin: '*',  // You can restrict access to specific origins here
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Use product routes
app.use("/api", productRoutes);

// MongoDB connection using MONGODB_URI from .env
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware to fetch user from JWT token
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET); // JWT_SECRET from .env
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
};

// Multer setup for file uploads with absolute path resolution
const storage = multer.diskStorage({
    destination: path.resolve(__dirname, "upload/images"), // Ensure absolute path for images directory
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`); // Unique file names with timestamp
    }
});

const upload = multer({ storage: storage });

// Serve static images from the upload folder
app.use("/images", express.static(path.resolve(__dirname, 'upload/images')));

// Image upload endpoint
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Return the image URL in the response
    res.json({
        success: 1,
        image_url: `https://stylemartbackend.onrender.com/images/${req.file.filename}`  // Ensure the backend URL is correct
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

// Get cart data
app.post('/getcart', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    res.json(userdata.cartData);
});

// Default route
app.get("/", (req, res) => {
    res.send("Express is Running");
});

// Start the server and listen on the specified port
app.listen(PORT, (e) => {
    if (!e) {
        console.log(`Server running on port ${PORT}`);
    } else {
        console.log("Error", e);
    }
});
