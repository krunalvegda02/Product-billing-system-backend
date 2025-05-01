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
    // total: {
    //     type: Number,
    //     required: true
    // }                 Removes total because we will use aggregate to gave total instead of storing its value
}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema);
export default Order;