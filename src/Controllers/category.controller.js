import { Category } from "../Models/index.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { uploadOnCloudinary, extractPublicIdFromUrl, deleteFromCloudinary } from "../Utils/Cloudinary.js";

const createCategory = asyncHandler(async (req, res) => {
    const { categoryName } = req.body;
    const categoryThumbnail = req.file;
    // console.log('Name:', categoryName);
    // console.log('Thumbnail file:', categoryThumbnail);

    if (!categoryName || !categoryThumbnail) throw new ApiError(401, "All Fields must required")

    const uploadThumbnail = await uploadOnCloudinary(req.file?.path);
    if (!uploadOnCloudinary) throw new ApiError(401, "Unable to upload thumbnail on cloudinary")
    // console.log("uploadOnCloudinary", uploadOnCloudinary);

    const category = await Category.create({
        categoryName: categoryName,
        categoryThumbnail: uploadThumbnail.url
    });
    if (!category) throw new ApiError(401, "Unable to create category");

    return res.status(200).json(new ApiResponse(200, category, "Category Created Succesfully"))
})

const updateCategory = asyncHandler(async (req, res) => {
    const { newCategoryName } = req.body;
    const newCategoryThumbnail = req.file;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) throw new ApiError(404, "Category not found");

    if (newCategoryName) category.categoryName = newCategoryName;

    if (newCategoryThumbnail) {
        try {
            // Delete old thumbnail from Cloudinary
            if (category.categoryThumbnail) {
                const publicId = extractPublicIdFromUrl(category.categoryThumbnail);
                if (!publicId) throw new ApiError(400, "Invalid public ID extracted from old thumbnail URL");

                await deleteFromCloudinary(publicId);
            }

            // uploading new thumbnail
            const uploadNewThumbnail = await uploadOnCloudinary(newCategoryThumbnail?.path);
            if (!uploadNewThumbnail?.url) throw new ApiError(401, "Unable to upload thumbnail on cloudinary");

            category.categoryThumbnail = uploadNewThumbnail.url;
        } catch (error) {
            console.error("Thumbnail update error:", error);
            throw new ApiError(500, "Unable to Update Thumbnail of Category")
        }
    }

    await category.save();

    return res.status(200).json(new ApiResponse(200, category, "Category Updated Succesfully"));
})

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) throw new ApiError(400, "Category Not Found");

    // deleting cloudinary thumbnail
    try {
        if (category.categoryThumbnail) {
            const publicId = extractPublicIdFromUrl(category.categoryThumbnail);
            if (!publicId) throw new ApiError(400, "Invalid public ID extracted from old thumbnail URL");

            await deleteFromCloudinary(publicId);
        }
    } catch (error) {
        console.log("Error while deleting thumbnail in CLoudinary", error);
        throw new ApiError(500, "Error while deleting thumbnail in CLoudinary")
    }

    const deleted = await category.deleteOne();

    return res.status(200).json(new ApiResponse(200, deleted, "Category Deleted Succesfully"));
})

// TODO: pagination with fetching all categories
const getAllCategories = asyncHandler(async (req, res) => {

})

const getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const categoryById = await Category.findById(id);
    if (!categoryById) throw new ApiError(404, "category not found");

    return res.status(200).json(200, categoryById, "Category Fetched Succesfully")
})

export { createCategory, deleteCategory, getAllCategories, updateCategory, getCategoryById }