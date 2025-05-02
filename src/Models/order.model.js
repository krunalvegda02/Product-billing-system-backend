import mongoose, { mongo } from "mongoose";

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
    },
    referral: {
        type: String
    },
    discount: {
        type: Number
    },
    paymentId: {
        type: String,
        // required: true,
    },    paymentMethod: {
        type: String,
        enum: ["Card", "UPI", "Cash", "Other"],
        default: "UPI",
    },
    status: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending",
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    // total: {
    //     type: Number,
    //     required: true
    // }                 Removes total because we will use aggregate to gave total instead of storing its value
}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema);
export default Order;