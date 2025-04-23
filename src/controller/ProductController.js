const {
  HTTP_OK,
  SUCCESS,
  HTTP_BAD_REQUEST,
  FAILED,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../global");
const mongoose = require("mongoose");
const Product = require("../model/ProductModel");
const cloudinary = require("../db/cloudinary");
const TeamMember = require("../model/CreateTeamModel");
const ProductModel = require("../model/ProductModel");

const createProductController = () => {
  const UploadProductDetails = async (req, res, next) => {
    const { id } = req.params;
    const { product_name, product_price, product_description } = req.body;
    const imageBuffer = req.file.buffer;

    if (
      !id ||
      !product_name ||
      !product_price ||
      !product_description ||
      !imageBuffer
    ) {
      return res.status(HTTP_BAD_REQUEST).json({
        success: FAILED,
        message: "Missing Fields are required",
      });
    }

    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${imageBuffer.toString("base64")}`, // convert to base64-encoded string
      {
        folder: "my_folder",
        tags: ["my_tag"],
        public_id: product_name,
      }
    );

    const newProduct = new Product({
      created_by: id,
      product_price,
      product_description,
      product_name,
      image_link: result.secure_url,
    });

    newProduct.save();

    res.status(HTTP_OK).json({
      success: SUCCESS,
      message: "Product Successfully Uploaded",
    });
  };

  const GetProductList = async (req, res, next) => {
    const { user_id, role_id } = req.query;

    if (!user_id || !role_id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Missing Fields are required" });
    }

    let productListQuery = {};
    let populateOptions = null;

    if (role_id === "1") {
      productListQuery = {}; // get all products
      populateOptions = { path: "created_by", select: "username" }; // include username of created_by in response
    } else {
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ success: FAILED, message: "Invalid user ID" });
      }
      const user = await TeamMember.findById(user_id);
      if (!user) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ success: FAILED, message: "User does not exist" });
      }
      productListQuery = { created_by: user_id }; // get products created by user
    }

    const productList = await ProductModel.find(productListQuery)
      .populate(populateOptions)
      .exec();

    // Update created_by field to created_by_username as a string
    const productListResponse = productList.map((product) => ({
      _id: product._id.toString(),
      product_name: product.product_name,
      product_description: product.product_description,
      product_price: product.product_price,
      created_by_username: product.created_by?.username,
      image_link: product.image_link,
    }));

    return res.status(HTTP_OK).json({
      success: SUCCESS,
      message: "List of products",
      productList: productListResponse,
    });

    // Update created_by field to created_by_username as a string
  };

  const GetSingleProductDetails = async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Id is required" });
    }

    const productDetails = await Product.findById(id);

    if (productDetails.length === null) {
      return res
        .status(HTTP_OK)
        .json({ success: SUCCESS, message: "Product not found" });
    }

    const createdByUsername = await TeamMember.findById(
      productDetails.created_by
    );

    res.status(HTTP_OK).json({
      success: SUCCESS,
      message: "Product details found",
      created_by_username: createdByUsername.username,
      productDetails,
    });
  };

  return { UploadProductDetails, GetProductList, GetSingleProductDetails };
};

module.exports = createProductController;
