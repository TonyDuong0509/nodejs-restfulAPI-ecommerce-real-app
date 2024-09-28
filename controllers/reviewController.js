const Review = require("./../models/reviewModel");
const Product = require("./../models/productModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const { checkPermissions } = require("./../utils/index");

const createReview = async (req, res) => {
  const { product: productId } = req.body;
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct)
    throw new CustomError.NotFoundError(
      `Not Found product with this ID: ${productId}`
    );

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadySubmitted)
    throw new CustomError.BadRequestError(
      "Already Submitted review for this product"
    );

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find().populate({
    path: "product",
    select: "name company price",
  });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    throw new CustomError.NotFoundError(
      `Not Found review with this ID: ${reviewId}`
    );
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    throw new CustomError.NotFoundError(
      `Not Found review with this ID: ${reviewId}`
    );
  checkPermissions(req.user, review._id);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    throw new CustomError.NotFoundError(
      `Not Found review with this ID: ${reviewId}`
    );
  checkPermissions(req.user, review._id);
  await review.remove();
  res
    .status(StatusCodes.NO_CONTENT)
    .json({ msg: "Delete review successfully !" });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
