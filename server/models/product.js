const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const productSchema =new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: true,
        maxlength : 32
    },
    description:{
        type: String,
        trim: true,
        required: true,
        maxlength : 2000
    },
    price:{
        type: Number,
        trim: true,
        required: true,
        maxlength : 32
    },
    category:{              //this will define category of tshirt and ref means reference of category.js(from where 'Category' is being brought)
        type: ObjectId,
        ref: "Category",
        required: true
    },
    stock:{
        type: Number
    },
    sold:{
        type: Number,
        default: 0
    },
    photo:{
        data: Buffer,		//buffer is used when we want to store something in binary form in this case images
        contentType: String	//contentType header is used to indicate media type of resource
    }
}, {timestamps: true}
);

module.exports = mongoose.model("Product",productSchema);