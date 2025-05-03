import MESSAGE from "../Constants/message";
import { Product } from "../Models";
import { ApiError } from "../Utils/ApiError";
import { ApiResponse } from "../Utils/ApiResponse";
import { asyncHandler } from "../Utils/AsyncHandler";

const createProduct = asyncHandler(async (req, res) => {
    // add product to any category during creation
    const { } = req.body;
    const thumbnail = req.file;

    
})

const updateProduct = asyncHandler(async (req, res) => {

})

const deleteProduct = asyncHandler(async (req, res) => {

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