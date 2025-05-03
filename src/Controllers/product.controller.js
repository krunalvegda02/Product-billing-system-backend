import MESSAGE from "../Constants/message.js";
import { Product, Category } from "../Models/index.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.js";

const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, inStock, categoryOfProduct, isDiscountActive, ActiveDiscount } = req.body;
    const thumbnail = req.file;
    console.log(thumbnail);


    // if (
    //     !name || !description || !price || !inStock ||
    //     !categoryOfProduct || !Array.isArray(categoryOfProduct) || categoryOfProduct.length === 0 || !thumbnail
    // ) {
    //     throw new ApiError(400, MESSAGE.ALL_FIELDS_MUST_REQUIRED);
    // }

    const uploadedThumbnail = await uploadOnCloudinary(thumbnail.path);
    if (!uploadedThumbnail?.url) throw new ApiError(500, MESSAGE.UPLOAD_CLOUDINARY_ERROR);

    const product = await Product.create({
        name,
        description,
        price,
        inStock,
        thumbnail: uploadedThumbnail.url,
        categories: categoryOfProduct,
        isDiscountActive,
        ActiveDiscount
    });
    if (!product) throw new ApiError(500, MESSAGE.PRODUCT_CREATE_FAILED);

    // addding peoducts to category products array
    await Category.updateMany(
        { _id: { $in: categoryOfProduct } },
        { $push: { products: product._id } }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, product, MESSAGE.PRODUCT_CREATE_SUCCESS));
})

const updateProduct = asyncHandler(async (req, res) => {
    const { name, description, price, inStock, categoryOfProduct, isDiscountActive, ActiveDiscount } = req.body;
    const thumbnail = req.file;
})

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;


})

// get all products by pagination
const getAllProducts = asyncHandler(async (req, res) => {

})

const getProductById = asyncHandler(async (req, res) => {
    const id = req.params;

    const product = Product.findById(id);
    if (!product) throw new ApiError(401, MESSAGE.PRODUCT_NOT_FOUND);

    return res.status(200).json(new ApiResponse(200, product, MESSAGE.PRODUCT_FOUND_SUCCESS))
})

export {
    createProduct,
    deleteProduct,
    getAllProducts,
    updateProduct,
    getProductById
}