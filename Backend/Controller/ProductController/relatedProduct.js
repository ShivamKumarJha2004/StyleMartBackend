import product from "../../Model/ProductSchema.js";

const relatedPro = async (req, res) => {
    const category = req.query.category; // Get the category from query parameters
    let products = await product.find({
        category: category
    });
    let popular = products.slice(0, 4);
    console.log('Fetched products:', popular);
    res.send(popular);
};

export default relatedPro;