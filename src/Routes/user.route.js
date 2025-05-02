import { Router } from "express";
import  verifyJWT  from "../middlewares/auth.middleware.js";
import { API } from "../Constants/endpoints.js"
import { registerUser } from "../Controllers/user.controller.js";

export const userRouter = Router();

userRouter.route(API.USER.REGISTER).post(registerUser);