import { Router } from "express";
import { API } from "../Constants/endpoints.js";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    updateProduct,
    getProductById,
    getProductByCategory
} from "../Controllers/product.controller.js";
import { upload } from "../Middlewares/multer.middleware.js";

const productRouter = Router();

productRouter.route(API.PRODUCT.CREATE_PRODUCT).post(upload.single("thumbnail"), createProduct);
productRouter.route(API.PRODUCT.DELETE_PRODUCT).delete(deleteProduct);
productRouter.route(API.PRODUCT.UPDATE_PRODUCT).patch(upload.single("thumbnail"), updateProduct);
productRouter.route(API.PRODUCT.GET_ALL_PRODUCTS).get(getAllProducts);
productRouter.route(API.PRODUCT.GET_PRODUCTBY_ID).get(getProductById);
productRouter.route(API.PRODUCT.GET_PRODUCTBY_CATEGORY).get(getProductByCategory);

productRouter.route(API.PRODUCT.TOGGLE_LIKE_PRODUCT).patch(getProductById);
productRouter.route(API.PRODUCT.GET_LIKED_PRODUCTS).get(getProductById);

// http://localhost:8000/api/v1/products/?page=1&limit=10&sortBy=name&sortType=asc

export default productRouter;