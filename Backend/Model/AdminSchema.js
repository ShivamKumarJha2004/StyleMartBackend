import mongoose from "mongoose";

// Define the Admin schema
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin',
  },
  permissions: {
    manageProducts: {
      type: Boolean,
      default: true,
    },
    manageUsers: {
      type: Boolean,
      default: true,
    },
    manageOrders: {
      type: Boolean,
      default: true,
    },
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const Admin = mongoose.model("Admin", adminSchema);

export default Admin;