import mongoose from "mongoose";

const product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description:
    {
       type:String,
       required:true,
    },
    new_price: {
        type: Number,
        required: true, // Fixed typo
    },
    old_price: {
        type: Number,
        required: true, // Fixed typo
    },
    date: {
        type: Date,
        default: Date.now, // Fixed typo (Date.now is a function)
    },
    available: {
        type: Boolean, // Corrected the type for boolean
        default: true, // Fixed typo (default instead of "deafult")
    },
});

export default product;
