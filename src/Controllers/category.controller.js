import { Category } from "../Models/index.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { uploadOnCloudinary, extractPublicIdFromUrl, deleteFromCloudinary } from "../Utils/Cloudinary.js";
import MESSAGE from "../Constants/message.js";

const createCategory = asyncHandler(async (req, res) => {
    const { categoryName } = req.body;
    const categoryThumbnail = req.file;
    // console.log('Name:', categoryName);
    // console.log('Thumbnail file:', categoryThumbnail);

    if (!categoryName || !categoryThumbnail) throw new ApiError(401, MESSAGE.ALL_FIELDS_MUST_REQUIRED);

    const uploadThumbnail = await uploadOnCloudinary(req.file?.path);
    if (!uploadThumbnail?.url) throw new ApiError(401, MESSAGE.UPLOAD_CLOUDINARY_ERROR);
    // console.log("uploadOnCloudinary", uploadOnCloudinary);

    const category = await Category.create({
        categoryName: categoryName,
        categoryThumbnail: uploadThumbnail.url
    });
    if (!category) throw new ApiError(401, MESSAGE.CATEGORY_CREATE_FAILED);

    return res.status(200).json(new ApiResponse(200, category, MESSAGE.CATEGORY_CREATE_SUCCESS));
});

const updateCategory = asyncHandler(async (req, res) => {
    const { newCategoryName } = req.body;
    // console.log("body",req.body);

    const newCategoryThumbnail = req.file;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) throw new ApiError(404, MESSAGE.CATEGORY_NOT_FOUND);

    if (newCategoryName) category.categoryName = newCategoryName;

    if (newCategoryThumbnail) {
        try {
            // Delete old thumbnail from Cloudinary
            if (category.categoryThumbnail) {
                const publicId = extractPublicIdFromUrl(category.categoryThumbnail);
                if (!publicId) throw new ApiError(400, MESSAGE.CLOUDINARY_PUBLIC_ID_INVALID);

                await deleteFromCloudinary(publicId);
            }

            // uploading new thumbnail
            const uploadNewThumbnail = await uploadOnCloudinary(newCategoryThumbnail?.path);
            if (!uploadNewThumbnail?.url) throw new ApiError(401, MESSAGE.UPLOAD_CLOUDINARY_ERROR);

            category.categoryThumbnail = uploadNewThumbnail.url;
        } catch (error) {
            console.error("Thumbnail update error:", error);
            throw new ApiError(500, MESSAGE.THUMBNAIL_UPDATE_FAILED);
        }
    }

    await category.save();

    return res.status(200).json(new ApiResponse(200, category, MESSAGE.CATEGORY_UPDATE_SUCCESS));
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) throw new ApiError(400, MESSAGE.CATEGORY_NOT_FOUND);

    // deleting cloudinary thumbnail
    try {
        if (category.categoryThumbnail) {
            const publicId = extractPublicIdFromUrl(category.categoryThumbnail);
            if (!publicId) throw new ApiError(400, MESSAGE.CLOUDINARY_PUBLIC_ID_INVALID);

            await deleteFromCloudinary(publicId);
        }
    } catch (error) {
        console.log("Error while deleting thumbnail in CLoudinary", error);
        throw new ApiError(500, MESSAGE.CLOUDINARY_DELETE_FAILED);
    }

    const deleted = await category.deleteOne();

    return res.status(200).json(new ApiResponse(200, deleted, MESSAGE.CATEGORY_DELETE_SUCCESS));
});

//get all categories by pagination and sort
const getAllCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;

    const sortOptions = {};
    const validSortFields = ["createdAt", "updatedAt", "categoryName"];
    const sortDirection = sortType === "asc" ? 1 : -1;

    // Validate and set sort field
    if (validSortFields.includes(sortBy)) {
        sortOptions[sortBy] = sortDirection;
    } else {
        sortOptions["createdAt"] = -1; // default sort
    }

    const skip = (page - 1) * limit;

    const categories = await Category.find()
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-products"); // exclude products if not needed

    const total = await Category.countDocuments();

    return res.status(200).json(
        new ApiResponse(200, {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            categories,
        }, MESSAGE.DATA_FETCHED_SUCCESS)
    );
});

const getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const categoryById = await Category.findById(id);
    if (!categoryById) throw new ApiError(404, MESSAGE.CATEGORY_NOT_FOUND);

    return res.status(200).json(new ApiResponse(200, categoryById, MESSAGE.CATEGORY_FETCH_SUCCESS));
});

export { createCategory, deleteCategory, getAllCategories, updateCategory, getCategoryById };
