import mongoose, { mongo, Schema } from "mongoose";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: "",
        },
        price: {
            type: Number,
            required: true
        },
        inStock: {
            type: Boolean,
            default: true,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        categoryOfProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        },
        isDiscountActive: {
            type: Boolean,
            default: false
        },
        ActiveDiscount: {
            type: Number,
            default: "0",
        }
    }, { timestamps: true }
)

const Product = mongoose.model("Product", productSchema);
export default Product;