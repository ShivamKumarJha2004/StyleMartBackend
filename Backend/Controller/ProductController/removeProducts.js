import product from "../../Model/ProductSchema.js";

const removeProduct=async(req,res)=>{
    try
    {
      await product.findOneAndDelete({
        id:req.body.id
      })  
      console.log("Element is deleted");
      res.status(200).json({
        success:"true",
        name:req.body.name
      })
    }
    catch(error)
    {
     console.log("Error in deleting the product" + erorr)
    res.status(500).json({
      success:"false",
      message:"Error deleting products",
      error:erorr.message,
    });
    
    }

}
export default removeProduct;