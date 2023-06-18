const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");

const { v4: uuidv4 } = require("uuid");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

const UserModel = require("../models/userModel");
const Factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");

exports.uploadUserImage = uploadSingleImage("profileImg");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);
    req.body.profileImg = filename;
  }

  next();
});
// @desc get all users
// @route GET /api/v1/users
// @access private
exports.getUsers = Factory.getAll(UserModel);
// @desc create User
// @route POST /api/v1/users
// @access private
exports.createUser = Factory.createOne(UserModel);
// @desc get specific user by id
// @route GET /api/v1/users/:id
// @access private
exports.getUser = Factory.getOne(UserModel);
// @desc update specific user
// @route PUT /api/v1/users/:id
// @access Private

exports.updateUser = asyncHandler(async (req, res, next) => {
  const { name, slug, email, phone, profileImg, role, active } = req.body;
  const document = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      name,
      slug,
      email,
      phone,
      profileImg,
      role,
      active,
    },
    {
      new: true,
    }
  );
  if (!document) {
    // res.status(404).json({ message: "this category is not found" });
    return next(new ApiError(`this document is not found`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc update  user password
// @route PUT /api/v1/users/changePassword/:id
// @access Private

exports.ChangePassword = asyncHandler(async (req, res, next) => {
  const document = await UserModel.findByIdAndUpdate(
    req.params.id,

    { password: await bcrypt.hash(req.body.password, 7) },
    {
      new: true,
    }
  );
  if (!document) {
    // res.status(404).json({ message: "this category is not found" });
    return next(new ApiError(`this document is not found`, 404));
  }
  res.status(200).json({ data: document });
});
// @desc delete specific user
// @route DELETE /api/v1/users/:id
// @access Private
exports.deleteUser = Factory.deleteOne(UserModel);
