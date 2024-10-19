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
  createdAt: { // Use 'createdAt' for better clarity
    type: Date,
    default: Date.now,
  },
});

// Create the model
const User = mongoose.model("User", userSchema);

export default User;
