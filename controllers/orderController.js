const Order = require("./../models/orderModel");
const Product = require("./../models/productModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const { checkPermissions } = require("./../utils");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_seret = "RandomValue";
  return { client_seret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1)
    throw new CustomError.BadRequestError("No cart items provide");
  if (!tax || !shippingFee)
    throw new CustomError.BadRequestError(
      "Please provide tax and shipping fee"
    );

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `Not found product with this ID: ${item.product}`
      );
    }
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    // Add item to order
    orderItems = [...orderItems, singleOrderItem];
    // Calc subtotal
    subtotal += item.amount * price;
  }
  // Calc total
  const total = tax + shippingFee + subtotal;
  // Get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_seret,
    user: req.user.userId,
  });

  res.status(StatusCodes.CREATED).json({ order });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find();
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findById({ _id: orderId });
  if (!order)
    throw new CustomError.NotFoundError(
      `Not found order with this ID: ${orderId}`
    );
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findById({ _id: orderId });
  if (!order)
    throw new CustomError.NotFoundError(
      `Not found order with this ID: ${orderId}`
    );
  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";

  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  updateOrder,
};
