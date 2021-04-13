const express = require("express");
const { getUserById } = require("../controllers/user");
const router = express.Router();

const { isSignedIn, isAuthenticated } = require("../controllers/auth");

const { getToken, processPayment } = require("../controllers/paymentBRoutes");
router.get("/payment/gettoken/:userId", isSignedIn, isAuthenticated, getToken);
router.param("userId", getUserById);

router.post(
  "/payment/braintree/:userId",
  isSignedIn,
  isAuthenticated,
  processPayment
);

module.exports = router;
