const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  price: {
    required: true,
    type: Number,
  },
  stock: {
    required: true,
    type: Number,
  },
  category: {
    required: true,
    type: String,
  },
  services: {
    required: true,
    type: String,
  },
  image: {
    required: true,
    type: String,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = { Product, productSchema };
