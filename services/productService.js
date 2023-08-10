const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");

const ApiError = require("../utils/apiError");
const productModel = require("../models/productModel");
const Factory = require("./handlersFactory");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);
exports.resizeProductImage = asyncHandler(async (req, res, next) => {
  // image cover processing
  console.log("resize in here");
  if (req.files && req.files.imageCover) {
    const imageCoverName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverName}`);
    req.body.imageCover = imageCoverName;
  }
  // images processing
  if (req.files && req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        req.body.images.push(imageName);
      })
    );
  }
  next();
});

// @desc get all products
// @route GET /api/v1/products
// @access public
exports.getProducts = Factory.getAll(productModel, "Products");
// @desc create products
// @route POST /api/v1/products
// @access private
exports.createProduct = Factory.createOne(productModel);
// @desc get specific product by id
// @route GET /api/v1/products/:id
// @access Public
exports.getProduct = Factory.getOne(productModel, "reviews");
// @desc update specific product
// @route PUT /api/v1/products/:id
// @access Private

exports.updateProduct = Factory.updateOne(productModel);
// @desc delete specific product
// @route DELETE /api/v1/products/:id
// @access Private
exports.deleteProduct = Factory.deleteOne(productModel);
