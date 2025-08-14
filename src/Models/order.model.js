import mongoose from "mongoose";
import MESSAGE from "../Constants/message.js";

const orderSchema = new mongoose.Schema({
    menuItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        }
    ],
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    served_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tip: {
        type: Number,
        default: 0,
    },
    referral: {
        type: String,
        default: null
    },
    discount: {
        type: Number,
        default: 0,
        minlength: [0, MESSAGE.ENTER_VALID_DISCOUNT],
        maxlength: [100, MESSAGE.ENTER_VALID_DISCOUNT],
    },
    paymentId: {
        type: String,
        // required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["Card", "UPI", "Cash", "Other"],
        default: "UPI",
    },
    status: {
        type: String,
        enum: ["Pending", "Preparing", "Ready", "Completed", "Failed", "Cancelled"],
        default: "Pending",
    },
    isLocked: { type: Boolean, default: false },
    deletedAt: {
        type: Date,
        default: null,
    },
    // total: {
    //     type: Number,
    //     required: true
    // }
}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema);
export default Order;