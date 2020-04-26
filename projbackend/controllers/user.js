//same file name should be given to both route and controller as controller will control route
const User = require("../models/user");
const Order = require("../models/order")

exports.getUserById = (req,res,next,id) => {        //getUserById will work with params because it has Id with it
    User.findById(id).exec((err,user) =>{
        if(err || !user ){
            return res.status(400).json({
                err:"No user was found in DB"
            })
        }
        req.profile = user  //setting the profile key to req object with the value of user
        next()
    })
}


exports.getUser = (req,res) =>{     //getUser will get the user
    req.profile.salt = undefined;           //all these values are just undefined in users profile and not in DB
    req.profile.encry_password = undefined;
    req.profile.createdAt = undefined;
    req.profile.updatedAt = undefined;
    return res.json(req.profile)
}

exports.updateUser = (req,res) =>{
    User.findByIdAndUpdate(
        {_id: req.profile._id},
        {$set : req.body},
        {new: true, useFindAndModify: false},   //new and useFindAndModify are compulsory parameter when we use findByIdAndUpdate
        (err,user) =>{
            if(err || !user){
               return res.send(400).json({
                   err:"You are not Authorise to update this user"
               })
            }
            user.salt = undefined;           //all these values are just undefined in users profile and not in DB
            user.encry_password = undefined;
            res.json(user)
        }
    )
}

exports.userPurchaseList = (req,res) => {
    Order.find({user: req.profile._id})
    .populate("user","_id name")            // if at anytime you have to reference a different collection at that moment use populate 
    .exec((err, order)=>{
        if(err){
        return res.status(400).json({
            err:"No order in this account"
        })
    }
    return res.json(order)
    })
}

//this is a middlewear
exports.pushOrderInPurchaseList = (req,res,next) =>{
    let purchases = []
    req.body.order.products.forEach(product =>{
        purchases.push({
            _id: product._id,
            name:product.name,
            description:product.description,
            category:product.category,
            quantity:product.quantity,
            amount: req.body.order.amount,
            transaction_id:req.body.order.transaction_id
        })
    })
    //store this in DB
    User.findOneAndUpdate(
        {_id: req.profile._id},
        {$push: {purchases: purchases}},  //it will push in purchases of user.js and will be pushed by purchases of this file
        {new: true},
        (err, purchases)=>{
            if(err){
                return res.status(400).json({
                    err:"Unable to save purchase list"
                })
            }
            next()
        }
    )
}
    

//Assignment
// exports.getAllUsers = (req,res) => {
//     User.find().exec((err,users) => {
//         if(err || !users) {
//             return res.status(400).json({
//                 err:"No users found"
//             })
//         }
//         res.json(users);
//     })
// }




