const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Team_Member",
  },
  product_name: {
    type: String,
    required: true,
  },
  product_price: {
    type: String,
    required: true,
  },
  product_description: {
    type: String,
    required: true,
  },
  image_link: {
    type: String,
    require: true,
  },
});

// Create a model for your image
const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = ProductModel;
