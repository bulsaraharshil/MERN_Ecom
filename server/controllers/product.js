//same file name should be given to both route and controller as controller will control route
const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");			//Lodash makes JavaScript easier by taking the hassle out of working with arrays, numbers, objects, strings, etc by providing inbuilt functions
const fs = require("fs"); ////accessing path of image so we need fs:file system

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          err: "Product not found",
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm(); //form is another method like json, form is used because we have image to work with
  form.keepExtensions = true; //this will keep extensions like png,jpg,etc

  form.parse(req, (err, fields, files) => {	//	Parses an incoming Node.js request containing form data. If callback is provided, all fields and files are collected and passed to the callback.
    // this is the syntax
    if (err) {
      return res.status(400).json({
        err: "problem with image",
      });
    }
    //destructure the fields
    const { name, description, price, category, stock } = fields; //all these will come from product.js of models so we need to destructure fields like price,category,...
    if (!name || !description || !price || !category || !stock) {
      //we can use expressvalidator instead of this if condition
      return res.status(400).json({
        err: "Please include all fields",
      });
    }

    let product = new Product(fields);	//all the field of products are brought here
    //handle file here
    if (files.photo) {
      if (files.photo.size > 3000000) {
        //3000000 is 3MB
        return res.status(400).json({
          err: "file size too big",
        });
      }
      //including file in product i.e these 2 lines will save photo in DB
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }
    //console.log(product)
    // save to DB
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          err: "Saving tshirt in DB failed",
        });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product); // directly getting product
};

//middlewear for loading photos
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
 //if photo is having data then only proceed
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

//delete controller
exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        err: "Failed to delete the product",
      });
    }
    res.json({
      message: "Deletion was success",
      deletedProduct,
    });
  });
};

//update controller
exports.updateProduct = (req, res) => {
  let form = new formidable({ keepExtensions: true}); //form is another method like json, form is used because we have image to work with
  

  form.parse(req, (err, fields, files) => {
    // this is the syntax
    if (err) {
      return res.status(400).json({
        err: "problem with image",
      });
    }
    // updation code
    let product = req.product;
    product = _.extend(product, fields); //using lodash to update fields in product

    //handle file here
    if (files.photo) {
      if (files.photo.size > 3000000) {
        //3000000 is 3MB
        return res.status(400).json({
          err: "file size too big",
        });
      }
      //including file in product i.e these 2 lines will save photo in DB
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }
    //console.log(product)
    // save to DB
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          err: "Updation of tshirt in DB failed",
        });
      }
      res.json(product);
    });
  });
};

//product listing
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;	//parseInt is used to convert string to int
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  Product.find()
    .select("-photo") //'-' is to deselect that particular field
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          err: "NO product found",
        });
      }
      res.json(product);
    });
};

exports.getAllUniqueCategories = (req, res) => {
     //syntax of distinct, sitinct is used to get all the distinct or unique values 
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        err: "No category found",
      });
    }
    res.json(category);
  });
};

exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((prod) => {
    //In req.body we have orders and in that we have products and then we map though each product therefore we write req.body.order.products.map
    //looping through each product
    return {
      //all these is in documentaion of bulkWrite
      updateOne: {
        filter: { _id: prod._id }, //finding the product with id
        update: { $inc: { stock: -prod.count, sold: +prod.count } }, //updating the stocks and sold, $inc: is incrementing
      },
    };
  });
  //syntax of bulkWrite
  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        err: "Bulk operation failed",
      });
    }
    next();
  });
};
