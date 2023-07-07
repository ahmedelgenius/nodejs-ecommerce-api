const stripe = require("stripe")(process.env.STRIPE_SECRET);
const request = require("request");

const asyncHandler = require("express-async-handler");
const Factory = require("./handlersFactory");
const cartModel = require("../models/cartModel");
const ApiError = require("../utils/apiError");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");

// @desc create cash order
// @route GET /api/v1/orders/cartId
// @access private
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // get cart depend on cartId
  const cart = await cartModel.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`there no cart with id  ${req.params.cartId}`, 404)
    );
  }

  //
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // create order
  const order = await orderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await productModel.bulkWrite(bulkOption, {});

    // clear cart
    await cartModel.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({ status: "success", data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    req.filterObj = { user: req.user._id };
  }
  next();
});

// @desc get all orders
// @route GET /api/v1/orders
// @access private/user,admin,manager
exports.getAllOrders = Factory.getAll(orderModel);

// @desc get specific order
// @route GET /api/v1/orders/:id
// @access private/user
exports.getSpecificOrder = Factory.getOne(orderModel);

// @desc update order paid status to paid
// @route PUT /api/v1/orders/:id
// @access private/admin,manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);

  if (!order) {
    return next(new ApiError(`there is no order with id ${req.params.id}`));
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(201).json({ status: "success", data: updatedOrder });
});

// @desc update order deliver status to delivered
// @route PUT /api/v1/orders/:id
// @access private/admin,manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);

  if (!order) {
    return next(new ApiError(`there is no order with id ${req.params.id}`));
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(201).json({ status: "success", data: updatedOrder });
});

// @desc get checkout session from stripe and send it as response
// @route GET /api/v1/orders/checkout-session/cartId
// @access private/user
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // get cart depend on cartId
  const cart = await cartModel.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`there no cart with id  ${req.params.cartId}`, 404)
    );
  }

  //
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],

    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: req.user.name,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});

const apiKey = process.env.STRIPE_SECRET;
const apiUrl = "https://api.stripe.com/v1/charges";

const requestData = {
  amount: 1000,
  currency: "egp",
  source: "tok_visa",
  description: "Charge for test@example.com",
};

const options = {
  url: apiUrl,
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  form: requestData,
};

request(options, (error, response, body) => {
  if (error) {
    console.error(error);
  } else {
    console.log(body);
  }
});

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    console.log("order created here...");
  }
});
