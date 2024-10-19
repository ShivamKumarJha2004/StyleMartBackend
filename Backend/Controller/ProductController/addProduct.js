import product from "../../Model/ProductSchema.js";

const productController = async (req, res) => {
    try {
        let productSearch= await product.find({});
        let id;
        if(productSearch.length>0)
        {
            let last_prod_array=productSearch.slice(-1);
            let last_prod=last_prod_array[0];
            id=last_prod.id+1;

        }
        else
        {
            id=1;
        }

        const pro = new product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            description:req.body.description,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        console.log(pro); // Log the product object for debugging

        // Save the product to the database
        await pro.save();
        console.log("Saved"); // Log the success message

        // Send a success response
        res.status(201).json({
            success: true,
            message: "Product saved successfully!",
            name: req.body.name,
        });

    } catch (error) {
        console.error("Error saving product:", error);

        // Send an error response
        res.status(500).json({
            success: false,
            message: "Error saving product",
            error: error.message,
        });
    }
};

export default productController;
