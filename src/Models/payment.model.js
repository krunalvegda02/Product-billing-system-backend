import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    razorpay_order_id: {
        type: String,
        required: true
    },
    razorpay_payment_id: {
        type: String
    },
    razorpay_signature: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        // enum: ["Card", "UPI", "NetBanking", "Wallet", "Cash", "Other"], // Add all Razorpay supported methods
        required: true
    },
    status: {
        type: String,
        enum: ["CREATED", "INITIATED", "SUCCESS", "FAILED", "REFUNDED"],
        default: "CREATED"
    },
    notes: {
        type: mongoose.Schema.Types.Mixed
    },
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
