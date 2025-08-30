import { Router } from "express";
import { API } from "../Constants/endpoints.js";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    updateProduct,
    getProductById,
    getProductByCategory,
    getUserLikedProducts,
    togglelikeProduct
} from "../Controllers/product.controller.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { get } from "mongoose";
import verifyJWT from "../middlewares/auth.middleware.js";

const productRouter = Router();

productRouter.route(API.PRODUCT.GET_ALL_PRODUCTS).get(getAllProducts);
productRouter.route(API.PRODUCT.GET_PRODUCTBY_CATEGORY).get(getProductByCategory);

productRouter.route(API.PRODUCT.GET_LIKED_PRODUCTS).get(verifyJWT, getUserLikedProducts); // ⚡ put before /:id
productRouter.route(API.PRODUCT.TOGGLE_LIKE_PRODUCT).patch(verifyJWT, togglelikeProduct);

productRouter.route(API.PRODUCT.CREATE_PRODUCT).post(upload.single("thumbnail"), verifyJWT, createProduct);
productRouter.route(API.PRODUCT.DELETE_PRODUCT).delete(deleteProduct);
productRouter.route(API.PRODUCT.UPDATE_PRODUCT).patch(upload.single("thumbnail"), verifyJWT, updateProduct);

// must be last
productRouter.route(API.PRODUCT.GET_PRODUCTBY_ID).get(getProductById);


// http://localhost:8000/api/v1/products/?page=1&limit=10&sortBy=name&sortType=asc

export default productRouter;