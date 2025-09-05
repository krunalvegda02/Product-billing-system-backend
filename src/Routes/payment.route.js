import express from "express";
import { createRazorpayOrder, verifyRazorpayPayment } from "../Controllers/payment.controller.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";

const paymentRouter = express.Router();


paymentRouter.post("/create", asyncHandler(createRazorpayOrder));


paymentRouter.post("/verify", asyncHandler(verifyRazorpayPayment));

// Optional: Add webhook route to sync Razorpay events (refunds, etc)
// router.post("/webhook", asyncHandler(handleRazorpayWebhook));

export default paymentRouter;
