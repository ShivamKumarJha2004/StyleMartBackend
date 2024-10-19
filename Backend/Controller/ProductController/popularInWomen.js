import product from "../../Model/ProductSchema.js";

const popinWomen=async(req,res)=>{
    let products=await product.find({
        category:'women'
    })
    let popular=products.slice(0,4);
    console.log('popular in women fetch');
    res.send(popular);
}
export default popinWomen