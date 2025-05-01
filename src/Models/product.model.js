import mongoose, { mongo, Schema } from "mongoose";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        categoryOfProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }
    }, { timestamps: true }
)

const Product = mongoose.model("Product", productSchema);
export default Product;