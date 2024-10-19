import product from "../../Model/ProductSchema.js";

const allproduct=async(req,res)=>{
    const allpro=await product.find({})
     console.log(allpro);
     res.send(allpro);
     
}
export default allproduct;