//same file name should be given to both route and controller as controller will control route
const Category = require("../models/category");

exports.getCategoryById = (req, res, next, id) => {
  //getCategoryById will work with params because it has Id with it
  // and it will return a single category
  Category.findById(id).exec((err, category) => {
    if (err || !category) {
      return res.status(400).json({
        err: "No category was found in DB",
      });
    }
    req.category = category; // this will return single category as it will send category id
    next();
  });
};

exports.createCategory = (req, res) => {
  const category = new Category(req.body);
  category.save((err, category) => {
    if (err || !category) {
      return res.status(400).json({
        err: "Not able to save category in DB",
      });
    }
    res.json({ category });
  });
};

exports.getCategory = (req, res) => {
  return res.json(req.category);
};

exports.getAllCategories = (req, res) => {
  Category.find().exec((err, categories) => {
    if (err) {
      return res.status(400).json({
        err: "NO categories found",
      });
    }
    res.json(categories);
  });
};

exports.updateCategory = (req, res) => {
  const category = req.category;
  category.name = req.body.name;
  category.save((err, updatedCategory) => {
    if (err) {
      return res.status(400).json({
        err: "Failed to update category",
      });
    }
    res.json(updatedCategory);
  });
};

exports.removeCategory = (req, res) => {
  const category = req.category;
  category.remove((err, category) => {
    if (err) {
      return res.status(400).json({
        err: "Failed to delete category",
      });
    }
    res.json({ message: category.name + " is successfully deleted" });
  });
};
