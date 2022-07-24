const express = require("express");
const User = require("../models/user");
const Order = require("../models/order");
const { Product } = require("../models/product");
const productRouter = express.Router();
const auth = require("../middlewares/auth");
const dateTime = require("node-datetime");
const Razorpay = require("razorpay");
require('dotenv').config();

productRouter.get(
  "/products/search/:services/:category",
  auth,
  async (req, res) => {
    try {
      const products = await Product.find({
        services: { $regex: req.params.services, $options: "i" },
        category: { $regex: req.params.category, $options: "i" },
      });

      res.status(200).json(products);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

productRouter.post("/user/addToCart/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    if (product.stock == 0) {
      return res.status(500).json({ msg: "No Stock Left!!!" });
    }
    if (user.cart.length == 0) {
      user.cart.push({ product, quantity: 1 });
    } else {
      let isProductFound = false;
      for (let i = 0; i < user.cart.length; i++) {
        if (user.cart[i].product._id.equals(product._id)) {
          isProductFound = true;
        }
      }

      if (isProductFound) {
        let findProduct = user.cart.find((item) =>
          item.product._id.equals(product._id)
        );
        findProduct.quantity += 1;
      } else {
        user.cart.push({ product, quantity: 1 });
      }
    }
    user = await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

productRouter.delete("/user/removeFromCart/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product._id.equals(product._id)) {
        if (user.cart[i].quantity == 1) {
          user.cart.splice(i, 1);
        } else {
          user.cart[i].quantity -= 1;
        }
      }
    }
    user = await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/checkout", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user);
    if (user.cart.length == 0) {
      return res.status(500).json({ msg: "Cart Empty" });
    }
    let insufficient = "";
    for (let i = 0; i < user.cart.length; i++) {
      let product = await Product.findById(user.cart[i].product._id);
      let stock = product.stock - user.cart[i].quantity;
      if (stock < 0) {
        insufficient += `${product.name} `;
      }
    }
    if (!insufficient) return res.status(200).json(user.cart);
    else
      return res
        .status(500)
        .json({ msg: `Insufficient Stock For : ${insufficient}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/user/myOrders", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user);
    let order = await Order.find({ username: user.username });
    res.status(200).json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.delete("/user/emptyCart", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user);
    user.cart = [];
    user = await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/user/myCart", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user);
    res.status(200).json(user.cart);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/get-razorpay-key", auth, (req, res) => {
  console.log("key");
  res.send({ key: 'rzp_test_4iM1GVNeA7ONuV' });
});

productRouter.post("/create-order", auth, (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: 'rzp_test_4iM1GVNeA7ONuV',
      key_secret: 'KtSFScEadE8gKqtZXgzmlczS',
    });
    const options = {
      amount: req.body.amount,
      currency: "INR",
    };
    
    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send("Some error occured");
    res.send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

productRouter.post("/pay-success", auth, async (req, res) => {
  try {
    const { amount } =
      req.body;
    let user = await User.findById(req.user);
    let items = user.cart;
    user.cart = [];
    user = await user.save();
    const dt = dateTime.create();
    let datetime = dt.format("d-m-Y\nI:M p");

    let order = new Order({
      username: user.username,
      status: "Paid",
      date: datetime,
      products: items,
      total: amount,
    });
    order = await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: e.message });
  }
});

module.exports = productRouter;
