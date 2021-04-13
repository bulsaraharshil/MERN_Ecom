//same file name should be given to both route and controller as controller will control route
const {Order, ProductCart} = require("../models/order")

exports.getOrderById = (req,res,next,id) =>{
    Order.findById(id)
    .populate("products.product", "name price")     //populating name & price of product
    .exec((err, order)=>{
        if(err){
            res.status(400).json({
                err:"No order found in DB"
            })
        }
        req.order = order;
        next();
    })
}

exports.createOrder = (req,res) =>{
    req.body.order.user = req.profile;
    const order = new Order(req.body.order)
    order.save((err, order)=>{
        if (err) {
            return res.status(400).json({
                err:"Failed to save your order in DB"
            })
            
        } 
        res.json(order)
    })
}

exports.getAllOrders = (req,res) =>{
    Order.find()
    .populate("user" , "_id name")		 //populating user schema with its id and name
    .exec((err, order)=>{
        if(err){
            return res.status(400).json({
                err:"No orders found in DB"
            })
        }
        res.json(order)
    })
}

exports.getorderStatus = (req,res) =>{	
    res.json(Order.schema.path("status").enumValues)	//accessing order schema enum values
}

exports.updateStatus = (req,res) =>{
    Order.update(
        {_id:req.body.orderId},
        {$set:{status: req.body.status}}, //updating the status based on id
        (err, order)=>{
            if(err){
                return res.status(400).json({
                    err:"Cannot update order status"
                })
            }
            res.json(order)
        }
    )
}