import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { API } from "../Constants/endpoints.js"
import {upload} from "../Middlewares/multer.middleware.js"
import {
    changeCurrentPassword,
    createUserByAdmin,
    getAllStaffMembers,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateProfile,
    userAvatarUpdate
} from "../Controllers/user.controller.js";

const userRouter = Router();

userRouter.route(API.USER.REGISTER).post(registerUser);
userRouter.route(API.USER.LOGIN).post(loginUser);
userRouter.route(API.USER.LOGOUT).post(verifyJWT, logoutUser);
userRouter.route(API.USER.CHANGE_PASSWORD).patch(verifyJWT, changeCurrentPassword);
userRouter.route(API.USER.REFRESH_TOKEN).post(refreshAccessToken);
userRouter.route(API.USER.UPDATE_PROFILE).patch(verifyJWT, updateProfile);
userRouter.route(API.USER.UPDATE_AVATAR).patch(verifyJWT, upload.single("newAvatar") ,userAvatarUpdate);
userRouter.route(API.USER.CURRENT_USER).get(verifyJWT, getCurrentUser);
userRouter.route(API.USER.CREATE_USER).post(createUserByAdmin);
userRouter.route(API.USER.GET_STAFF_MEMBERS).get(getAllStaffMembers);



export default userRouter;