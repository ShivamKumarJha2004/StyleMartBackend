import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Admin from '../Model/AdminSchema.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const createAdmin = async (customUsername, customEmail, customPassword) => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Use custom credentials or defaults
    const username = customUsername || 'admin';
    const email = customEmail || 'admin@stylemart.com';
    const password = customPassword || 'admin123';
    
    // Create admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({
      username: username,
      email: email,
      password: hashedPassword,
      role: 'admin',
      permissions: {
        manageProducts: true,
        manageUsers: true,
        manageOrders: true
      }
    });

    await admin.save();
    console.log('Admin created successfully with the following credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('IMPORTANT: Please change this password after first login!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating superadmin:', error);
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(1);
  }
};

// Get command line arguments
const args = process.argv.slice(2);
const username = args[0];
const email = args[1];
const password = args[2];

// Call createAdmin with optional custom credentials
createAdmin(username, email, password);
