import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./Routes/productRoutes.js";
import User from "./Model/UserSchema.js";
import { promises as fs } from 'fs'; // Import fs with promises
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();

// Setup __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the upload folder exists
const uploadDir = path.join(__dirname, 'upload', 'images');
const ensureDirExists = async (dir) => {
    try {
        await fs.mkdir(dir, { recursive: true }); // Create folder if it doesn't exist
    } catch (err) {
        console.error("Error creating folder:", err);
    }
};

await ensureDirExists(uploadDir);

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", productRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

// Fetch user middleware
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    console.log("Token", token);
    
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }
    
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "Invalid token" });
    }
};

// Add to cart route
app.post('/addtocart', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    userdata.cartData[req.body.itemid] = (userdata.cartData[req.body.itemid] || 0) + 1;
    
    await User.findOneAndUpdate(
        { _id: req.user.id },
        { cartData: userdata.cartData }
    );
    
    res.send("Added");
});

// Remove product route
app.post('/removeproduct', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    
    if (userdata.cartData[req.body.itemid] > 0) {
        userdata.cartData[req.body.itemid] -= 1;
    }
    
    await User.findOneAndUpdate(
        { _id: req.user.id },
        { cartData: userdata.cartData }
    );
    
    res.send("Removed");
});

// Get cart route
app.post('/getcart', fetchUser, async (req, res) => {
    let userdata = await User.findOne({ _id: req.user.id });
    res.json(userdata.cartData);
});

// Test route
app.get("/", (req, res) => {
    res.send("Express is Running");
});

// Multer configuration for image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use the dynamically created folder
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Serve static images
app.use("/images", express.static(uploadDir));

// Image upload endpoint
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.json({
        success: 1,
        image_url: `https://stylemartbackend.onrender.com/images/${req.file.filename}` // Use your hosted server URL
    });
});

// Start server
app.listen(process.env.PORT, (e) => {
    if (!e) {
        console.log(`Server running on port ${process.env.PORT}`);
    } else {
        console.log("Error", e);
    }
});
