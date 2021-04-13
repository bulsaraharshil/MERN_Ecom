//same file name should be given to both route and controller as controller will control route
const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs"); //fs:file system

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

  form.parse(req, (err, fields, files) => {
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

    let product = new Product(fields);

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
  let form = new formidable.IncomingForm(); //form is another method like json, form is used because we have image to work with
  form.keepExtensions = true; //this will keep extensions like png,jpg,etc

  form.parse(req, (err, fields, files) => {
    // this is the syntax
    if (err) {
      return res.status(400).json({
        err: "problem with image",
      });
    }
    // updation code
    let product = req.product;
    product = _.extend(product, fields); //using lodash

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
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
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
    //looping through each product
    return {
      updateOne: {
        filter: { _id: prod._id }, //finding the product with id
        update: { $inc: { stock: -prod.count, sold: +prod.count } }, //updating that product
      },
    };
  });

  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        err: "Bulk operation failed",
      });
    }
    next();
  });
};
