const mongoose = require("mongoose");
const { productSchema } = require("./product");

const orderSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String,
  },
  status: {
    required: true,
    type: String,
  },
  date: {
    required: true,
    type: String,
  },
  products: [
    {
      product: productSchema,
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    required: true,
    type: Number,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
