import mongoose, { mongo } from "mongoose";

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    categoryThumbnail: {
        type: String,
        required: true
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
}, { timestamps: true })

const Category = mongoose.model("Category", categorySchema);
export default Category;