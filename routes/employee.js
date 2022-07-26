const express = require("express");
const User = require("../models/user");
const Order = require("../models/order");
const { Product } = require("../models/product");
const employeeRouter = express.Router();
const auth = require("../middlewares/auth");
const upload = require("../services/aws-upload");

employeeRouter.post(
  "/newProduct/register",
  upload.single("image"),
  auth,
  async (req, res) => {
    try {
      const { name, price, category, stock, services } = req.body;

      const product = await Product.findOne({ name });
      if (!product) {
        addProduct = new Product({
          name,
          price,
          category,
          stock,
          image: req.file.Location,
          services,
        });
        await addProduct.save();
        res.status(200).json({ msg: "Item added Successfully" });
      }else{
        if(product.category == category && product.services ==services){
          return res.status(400).json({ msg: "Product Already Exists!!!" });
        }
        else{
          addProduct = new Product({
            name,
            price,
            category,
            stock,
            image: req.file.Location,
            services,
          });
          await addProduct.save();
          res.status(200).json({ msg: "Item added Successfully" });
        }
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

employeeRouter.delete("/product/remove/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    let product = await Product.findOne({ _id: id });
    if (!product) {
      return res.status(400).json({ msg: "Product does not exist!!!" });
    }
    product = await Product.findByIdAndRemove(product._id);
    const products = await Product.find();

    res.status(200).json({ msg: "Product Removed!!!", products: products });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

employeeRouter.get("/orderDetails", auth, async (req, res) => {
  try {
    const order = await Order.find({});
    res.status(200).json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = employeeRouter;
