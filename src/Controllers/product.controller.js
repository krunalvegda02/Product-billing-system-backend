import MESSAGE from "../Constants/message.js";
import { Product, Category } from "../Models/index.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { deleteFromCloudinary, extractPublicIdFromUrl, uploadOnCloudinary } from "../Utils/Cloudinary.js";

const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, inStock, categoryOfProduct, isDiscountActive, ActiveDiscount } = req.body;
    const thumbnail = req.file;
    console.log(thumbnail, req.body);


    if (
        !name || !description || !price || !inStock ||
        !Array.isArray(categoryOfProduct) || categoryOfProduct.length === 0 || !thumbnail
    ) {
        throw new ApiError(400, MESSAGE.ALL_FIELDS_MUST_REQUIRED);
    }

    const uploadedThumbnail = await uploadOnCloudinary(thumbnail.path);
    if (!uploadedThumbnail?.url) throw new ApiError(500, MESSAGE.UPLOAD_CLOUDINARY_ERROR);

    const product = await Product.create({
        name,
        description,
        price,
        inStock,
        thumbnail: uploadedThumbnail.url,
        categoryOfProduct: categoryOfProduct,
        isDiscountActive,
        ActiveDiscount
    });
    if (!product) throw new ApiError(500, MESSAGE.PRODUCT_CREATE_FAILED);

    // addding peoducts to category products array
    await Category.updateMany(
        { _id: { $in: categoryOfProduct } },
        { $addToSet: { products: product._id } }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, product, MESSAGE.PRODUCT_CREATE_SUCCESS));
})

const updateProduct = asyncHandler(async (req, res) => {
    const { name, description, price, inStock, categoryOfProduct, isDiscountActive, ActiveDiscount } = req.body;
    const thumbnail = req.file;
    const { id } = req.params;
    console.log(req.body, req.file);


    // ! tu frontend mathi everytime thumbnail mokalish every time api ma??? enathi cloudinary and database 
    // ! par load pade to if na mokalvu hoy to validation mathi hatai deje niche nu logic to brorbr j rese  
    if (
        !name || !description || !price || !inStock ||
        !Array.isArray(categoryOfProduct) || categoryOfProduct.length === 0 || !thumbnail
    ) {
        throw new ApiError(400, MESSAGE.ALL_FIELDS_MUST_REQUIRED);
    }

    //Before updating product save categoryOfProduct Array ID 
    const existingProduct = await Product.findById(id).lean();
    if (!existingProduct) throw new ApiError(500, MESSAGE.PRODUCT_NOT_FOUND);

    const oldCategories = existingProduct.categoryOfProduct || [];

    const product = await Product.findByIdAndUpdate(
        id,
        { name, description, price, inStock, categoryOfProduct, isDiscountActive, ActiveDiscount },
        { new: true }
    );
    if (!product) throw new ApiError(500, MESSAGE.PRODUCT_NOT_FOUND);

    // newCatgories
    const newCategories = product.categoryOfProduct || [];

    // Categories to remove: present in oldCategories but not in newCategories
    const categoriesToRemove = oldCategories.filter(oldId => !newCategories.includes(oldId.toString()));

    // Categories to add: present in newCategories but not in oldCategories
    const categoriesToAdd = newCategories.filter(newId => !oldCategories.map(x => x.toString()).includes(newId));

    // Remove the product from categories that are no longer assigned
    if (categoriesToRemove.length > 0) {
        await Category.updateMany(
            { _id: { $in: categoriesToRemove } },
            { $pull: { products: product._id } }
        );
    }

    // Add the product to new categories
    if (categoriesToAdd.length > 0) {
        await Category.updateMany(
            { _id: { $in: categoriesToAdd } },
            { $addToSet: { products: product._id } }
        );
    }

    if (thumbnail) {
        try {
            try {
                // Delete old thumbnail from Cloudinary
                const publicId = await extractPublicIdFromUrl(existingProduct.thumbnail);
                const deletedThumbnail = await deleteFromCloudinary(publicId);
                console.log("deletedThumbnail", deletedThumbnail);

            } catch (error) {
                console.log("deleting error", error);
                throw new ApiError(500, MESSAGE.DELETE_CLOUDINARY_ERROR);
            }

            const uploadNewThumbnail = await uploadOnCloudinary(thumbnail.path);
            if (!uploadNewThumbnail?.url) throw new ApiError(500, MESSAGE.UPLOAD_CLOUDINARY_ERROR);

            product.thumbnail = uploadNewThumbnail.url;
            await product.save();
        } catch (error) {
            throw new ApiError(500, MESSAGE.UPLOAD_CLOUDINARY_ERROR);
        }
    }

    return res.status(200).json(new ApiResponse(200, product, MESSAGE.PRODUCT_UPDATE_SUCCESS));
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id).lean();
    if (!product) throw new ApiError(500, MESSAGE.PRODUCT_NOT_FOUND);
    // console.log(product);

    const deletedCategory = product.categoryOfProduct;
    // console.log("delete", deletedCategory);

    const category = await Category.updateMany(
        { _id: { $in: deletedCategory } },
        { $pull: { products: product._id } }
    );
    // console.log("catetgory", category);

    const deletedProduct = await Product.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, deletedProduct, MESSAGE.PRODUCT_DELETE_SUCCESS))
})

// get all products by pagination and sorting
const getAllProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;

    const sortOptions = {};
    const validSortFields = ["createdAt", "updatedAt", "name"];
    const sortDirection = sortType === "asc" ? 1 : -1;

    // Validate and set sort field
    if (validSortFields.includes(sortBy)) {
        sortOptions[sortBy] = sortDirection;
    } else {
        sortOptions["createdAt"] = -1; // default sort
    }

    const skip = (page - 1) * limit;

    const productsFromDB = await Product.find()
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-categoryOfProduct");

    const products = productsFromDB.map(product => {
        const productObj = product.toObject();

        if (product.isDiscountActive && product.ActiveDiscount > 0) {
            productObj.discountedPrice = product.price - (product.price * product.ActiveDiscount / 100);
        }

        return productObj;
    });
    const total = await Product.countDocuments();

    return res.status(200).json(
        new ApiResponse(200, {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            products,
        }, MESSAGE.DATA_FETCHED_SUCCESS)
    );
})

const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) throw new ApiError(401, MESSAGE.PRODUCT_NOT_FOUND);

    const productObj = product.toObject();
    if (product.isDiscountActive) {
        productObj.discountedPrice = product.price - (product.price * product.ActiveDiscount / 100);
    }

    return res.status(200).json(new ApiResponse(200, { product: productObj }, MESSAGE.PRODUCT_FOUND_SUCCESS))
})

export {
    createProduct,
    deleteProduct,
    getAllProducts,
    updateProduct,
    getProductById
}