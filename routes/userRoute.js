const express = require("express");
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require("./../middlewares/authentication");

const {
  getAllUsers,
  getSingleUser,
  showCurrentuser,
  updateUser,
  updateUserPassword,
} = require("./../controllers/userController");

router.get("/", authenticateUser, authorizePermissions("admin"), getAllUsers);
router.get("/showMe", authenticateUser, showCurrentuser);
router.patch("/updateUser", authenticateUser, updateUser);
router.patch("/updateUserPassword", authenticateUser, updateUserPassword);

router.get("/:id", authenticateUser, getSingleUser);

module.exports = router;
