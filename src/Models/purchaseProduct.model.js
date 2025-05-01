import mongoose from "mongoose";

const purchaseProductSchema = mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Completed", "Failed"],
            default: "Pending",
        },
        paymentId: {
            type: String,
            // required: true,
        },
        deletedAt: {
            type: Date,
            default: null
        },
        paymentMethod: {
            type: String,
            enum: ["Card", "UPI", "Cash", "Other"],
            default: "UPI",
        },
    },
    { timestamps: true }
);

const PurchaseProduct = mongoose.model("PurchaseProduct", purchaseProductSchema);
export default PurchaseProduct;