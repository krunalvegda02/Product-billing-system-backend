import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";


const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = await req.header("Authorization")?.replace("Bearer ", "");
        console.log(token);

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findOne({ _id: decodedToken?._id }).select(
            "-password -refreshToken"
        );
        if (!user) throw new ApiError(403, "Invalid Credentials")

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
})

export default verifyJWT;
