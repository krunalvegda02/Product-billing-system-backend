import { registerUser } from "../Controllers/user.controller.js";
import { User } from "../Models/index.js";
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";
import MESSAGE from "../Constants/message.js";

export const createAdmin = async () => {
    try {
        const admin = await User.findOne({ email: "admin@gmail.com" });
        // console.log("Admin Details", admin);

        if (!admin) {
            console.log("Admin Not Registered, Registerig Admin: Email = admin@gmail.com, Password: 123456");

            const registerAdmin = await User.create({
                email: "admin@gmail.com",
                password: "123456",
                role: "ADMIN",
                username: "Admin",
                contact: "1234567890"
                // todo: Contact dynamicness
            });

            console.log("Admin registered successfully:", {
                _id: registerAdmin._id,
                username: registerAdmin.username,
                email: registerAdmin.email,
            })
        } else {
            console.log("Admin Details:", {
                _id: admin._id,
                username: admin.username,
                email: admin.email,
            });
        }
    } catch (error) {
        console.log("Admin Regestration error", error);
        throw new ApiError(404, MESSAGE.ADMIN_REGISTER_FAILED)
    }
}
