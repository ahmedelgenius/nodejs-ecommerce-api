const asyncHandler = require("express-async-handler");
const sharp = require("sharp");

const { v4: uuidv4 } = require("uuid");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

const BrandModel = require("../models/brandModel");
const Factory = require("./handlersFactory");

exports.uploadBrandImage = uploadSingleImage("image");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/brands/${filename}`);
  req.body.image = filename;
  console.log(req.body);
  next();
});
// @desc get all brands
// @route GET /api/v1/brands
// @access public
exports.getBrands = Factory.getAll(BrandModel);
// @desc create Brand
// @route POST /api/v1/brands
// @access private
exports.createBrand = Factory.createOne(BrandModel);
// @desc get specific Brand by id
// @route GET /api/v1/brands/:id
// @access Public
exports.getBrand = Factory.getOne(BrandModel);
// @desc update specific Brand
// @route PUT /api/v1/brands/:id
// @access Private

exports.updateBrand = Factory.updateOne(BrandModel);
// @desc delete specific Brand
// @route DELETE /api/v1/brands/:id
// @access Private
exports.deleteBrand = Factory.deleteOne(BrandModel);
