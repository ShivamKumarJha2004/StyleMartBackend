import mongoose from "mongoose";

// Define the schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true, // It's generally a good practice to require the password field
  },
  cartData: {
    type: Object,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  verificationTokenExpiry: {
    type: Date,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpiry: {
    type: Date,
    default: null,
  },
  createdAt: { // Use 'createdAt' for better clarity
    type: Date,
    default: Date.now,
  },
});

// Create the model
const User = mongoose.model("User", userSchema);

export default User;
