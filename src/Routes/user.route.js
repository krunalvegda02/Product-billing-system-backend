import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { API } from "../Constants/endpoints.js"
import {
    changeCurrentPassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateProfile,
    userAvatarUpdate
} from "../Controllers/user.controller.js";

export const userRouter = Router();

userRouter.route(API.USER.REGISTER).post(registerUser);
userRouter.route(API.USER.LOGIN).post(loginUser);
userRouter.route(API.USER.LOGOUT).post(verifyJWT, logoutUser);
userRouter.route(API.USER.CHANGE_PASSWORD).patch(verifyJWT, changeCurrentPassword);
userRouter.route(API.USER.REFRESH_TOKEN).post(refreshAccessToken);
userRouter.route(API.USER.UPDATE_PROFILE).patch(verifyJWT, updateProfile);
userRouter.route(API.USER.UPDATE_AVATAR).patch(verifyJWT, userAvatarUpdate);
userRouter.route(API.USER.CURRENT_USER).get(verifyJWT, getCurrentUser);

