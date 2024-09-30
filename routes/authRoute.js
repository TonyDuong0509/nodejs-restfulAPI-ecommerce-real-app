const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");
const { authenticateUser } = require("./../middlewares/authentication");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.delete("/logout", authenticateUser, authController.logout);
router.post("/verify-email", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
