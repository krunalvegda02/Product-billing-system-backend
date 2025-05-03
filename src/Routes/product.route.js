import { Router } from "express";
import { API } from "../Constants/endpoints.js";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    updateProduct,
    getProductById
} from "../Controllers/product.controller.js";
import { upload } from "../Middlewares/multer.middleware.js";

const productRouter = Router();

productRouter.route(API.PRODUCT.CREATE_PRODUCT).post(upload.single("thumbnail"), createProduct);
productRouter.route(API.PRODUCT.DELETE_PRODUCT).delete(deleteProduct);
productRouter.route(API.PRODUCT.UPDATE_PRODUCT).patch(upload.single("newThumbnail"), updateProduct);
productRouter.route(API.PRODUCT.GET_ALL_PRODUCTS).get(getAllProducts);
productRouter.route(API.PRODUCT.GET_PRODUCTBY_ID).get(getProductById);

export default productRouter;