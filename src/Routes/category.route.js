import { Router } from "express";
import { API } from "../Constants/endpoints.js";
import { createCategory, deleteCategory, updateCategory } from "../Controllers/category.controller.js";
import { upload } from "../Middlewares/multer.middleware.js"

const categoryRouter = Router();

categoryRouter.route(API.CATEGORY.CREATE_CATEGORY).post(upload.single("categoryThumbnail"), createCategory);
categoryRouter.route(API.CATEGORY.UPDATE_CATEGORY).patch(upload.single("newCategoryThumbnail"), updateCategory);
categoryRouter.route(API.CATEGORY.DELETE_CATEGORY).post(deleteCategory);

export default categoryRouter;