import { Router } from "express";
import { API } from "../Constants/endpoints.js";
import { createCategory, deleteCategory, updateCategory, getAllCategories, getCategoryById } from "../Controllers/category.controller.js";
import { upload } from "../Middlewares/multer.middleware.js"

const categoryRouter = Router();

categoryRouter.route(API.CATEGORY.CREATE_CATEGORY).post(upload.single("categoryThumbnail"), createCategory);
categoryRouter.route(API.CATEGORY.UPDATE_CATEGORY).patch(upload.single("newCategoryThumbnail"), updateCategory);
categoryRouter.route(API.CATEGORY.DELETE_CATEGORY).delete(deleteCategory);
categoryRouter.route(API.CATEGORY.GET_ALL_CATEGORY).get(getAllCategories);
categoryRouter.route(API.CATEGORY.GET_CATEGORYBY_ID).get(getCategoryById);

// http://localhost:8000/api/v1/category/?page=1&limit=10&sortBy=categoryName&sortType=asc

export default categoryRouter;