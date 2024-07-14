const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.loginUsers);

router.post("/forgotPassword", authController.forgotPassword); // will receive the email address
router.patch("/resetPassword/:token", authController.resetPassword); // will receive the token as well the new password
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword,
); // will receive the
router.delete("/deleteMe", authController.protect, userController.deleteMe); // will receive the

// multiple routes for Users.
router
  .route("/")
  .get(authController.protect, userController.getAllUsers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser);

module.exports = router;
