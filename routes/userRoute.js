const express = require("express");

const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  ChangePassword,
  uploadUserImage,
  resizeImage,
} = require("../services/userService");
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateUserPasswordValidator,
} = require("../utils/validators/userValidator");

const router = express.Router();

router.put("/changePassword/:id", updateUserPasswordValidator, ChangePassword);
router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);
module.exports = router;
