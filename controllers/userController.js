const User = require("./../models/userModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("./../utils/index");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("-password");
  if (!user)
    throw new CustomError.BadRequestError(`No find user with this ID: ${id}`);
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentuser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  const { userId } = req.user;
  if (!name || !email)
    throw new CustomError.BadRequestError("Name or Email can't be empty");
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { name, email },
    { new: true, runValidators: true }
  );
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new CustomError.BadRequestError("Please provide both values");
  const { userId } = req.user;
  const user = await User.findById({ _id: userId });
  const isPasswordCorrect = await user.comparePassword(
    oldPassword,
    user.password
  );
  if (!isPasswordCorrect)
    throw new CustomError.UnauthenticatedError(
      "Old password is not correct, please try again"
    );
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Updated password successfully !" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentuser,
  updateUser,
  updateUserPassword,
};
