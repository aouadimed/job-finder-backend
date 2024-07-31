const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  name: String,
  index: Number,
});

const CategorySchema = new mongoose.Schema({
  name: String,
  index: Number,
  subcategories: [SubcategorySchema],
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
