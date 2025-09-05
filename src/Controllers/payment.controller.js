import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../Models/payment.model.js"; // Your payment schema
import Order from "../Models/order.model.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";




const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_TESTKEY_ID,
    key_secret: process.env.RAZORPAY_TESTKEY_SECRET,
});



// Create Razorpay Order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
        throw new ApiError(400, "Order ID and amount are required");
    }

    // Amount should be in the smallest currency unit (paise)
    const options = {
        amount: Math.round(amount * 100), // convert INR to paise
        currency: "INR",
        receipt: orderId,
        payment_capture: 1, // auto capture
    };

    try {
        const razorpayOrder = await razorpay.orders.create(options);
        return res.status(201).json({
            success: true,
            data: razorpayOrder,
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        throw new ApiError(500, "Failed to create payment order");
    }
});


// Verify Razorpay Payment Signature
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    console.log(req.body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, method } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
        throw new ApiError(400, "Required payment details missing");
    }




    // Verify signature to confirm payment authenticity
    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_TESTKEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generatedSignature !== razorpay_signature) {
        console.log("Signature verification failed, saving FAILED payment");

        try {
            await Payment.create({
                order: orderId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                amount: 0,
                status: "FAILED",
            });
        } catch (err) {
            console.error("Failed to save payment with FAILED status:", err);
        }
        throw new ApiError(400, "Invalid payment signature");
    }

    // Find the order and update status
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    let paymentDetails;
    try {
        paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
        console.log("PAYMENT", paymentDetails);

    } catch (err) {
        console.error("Error fetching payment details from Razorpay", err);
        throw new ApiError(500, "Failed to fetch payment details");
    }
    // Save payment details
    await Payment.create({
        order: order._id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: order.total,
        status: "SUCCESS",
        paymentMethod: paymentDetails.method, // store user selected method
    });

    // Update order status to COMPLETED
    order.status = "COMPLETED";
    await order.save();

    res.status(200).json({
        success: true,
        message: "Payment verified and order completed",
    });
});