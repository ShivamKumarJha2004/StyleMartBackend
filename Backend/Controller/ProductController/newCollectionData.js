import product from "../../Model/ProductSchema.js";

const newcoll=async(req,res)=>{
    let products=await product.find({});
    let newcollection=products.slice(1).slice(-8);
    console.log("new coll fetched");
    res.send(newcollection);
    
}
export default newcoll;