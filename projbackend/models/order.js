const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;
//we can define multiple schemas in one file
const ProductCartSchema = new mongoose.Schema({     //ProductCartSchema will display products in cart
    product:{                                       //the product in ProductCartSchema comes from product.js so we have used product
        type: ObjectId,
        ref:"Product"
    },
    name: String,
    count: Number,
    price: Number
});

const ProductCart = mongoose.model("ProductCart",ProductCartSchema)

const OrderSchema = new mongoose.Schema({
    products:[ProductCartSchema],               //products here refer to products in the cart thats why we named it ProductCartSchema
    transaction_id: {},
    amount:{type:Number},
    address: String,
    status:{
        type: String,
        default:"Recieved",
        enum: ["Cancelled", "Delivered", "Shipped", "Processing", "Recieved"]
    },
    updated: Date,                              //updated is used to refer in admin when was order placed or updated
    user: {                                    //user is used to refer which user placed the order
        type: ObjectId,
        ref: "User"
    }
},{timestamps: true});

const Order = mongoose.model("Order",OrderSchema)  

module.exports = (Order, ProductCart)