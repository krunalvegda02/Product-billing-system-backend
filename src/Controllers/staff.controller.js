import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { User } from "../Models/index.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { extractPublicIdFromUrl, deleteFromCloudinary, uploadOnCloudinary } from "../Utils/Cloudinary.js"
import MESSAGE from "../Constants/message.js";



// Create user by admin
const createUserByAdmin = asyncHandler(async (req, res) => {
    console.log(req.body);
    
    const { username, email, contact, password, role } = req.body;
    if (!username && email && !password && !role & !contact) throw new ApiError(401, MESSAGE.ALL_FIELDS_MUST_REQUIRED);

    const user = await User.create({ username, email, password, role, contact });
    if (!user) throw new ApiError(400, MESSAGE.USER_REGISTER_FAILED);

    return res.status(200).json(new ApiResponse(200, user, MESSAGE.USER_REGISTER_SUCCESS));
})



// Get all staff members (managers and waiters)
const getAllStaffMembers = asyncHandler(async (req, res) => {
    const waiters = await User.find({ role: "WAITER" }).select("-password -refreshToken");
    const managers = await User.find({ role: "MANAGER" }).select("-password -refreshToken");

    if (!waiters.length && !managers.length) {
        throw new ApiError(404, MESSAGE.STAFFMEMBERS_FETCH_FAILED);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { waiters, managers },
            MESSAGE.STAFFMEMBERS_FETCH_SUCCESS
        )
    );
})



// Get servant staff list
const getServentStaffList = asyncHandler(async (req, res) => {

    const servantStaff = await User.find({ role: "WAITER" });
    if (!servantStaff || servantStaff.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, MESSAGE.SERVANT_LIST_NOT_FOUND));
    }

    return res.status(200).json(new ApiResponse(200, servantStaff, MESSAGE.SERVANT_LIST_FETCH_SUCCESS));
})


const deleteStaff = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const staff = await User.findById(id);
    if (!staff) {
        throw new ApiError(404, MESSAGE.STAFF_NOT_FOUND);
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, staff, MESSAGE.STAFF_DELETE_SUCCESS));
});



const updateStaff = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, email, contact, role } = req.body;

    const staff = await User.findById(id);
    if (!staff) {
        throw new ApiError(404, MESSAGE.STAFF_NOT_FOUND);
    }

    if (!username && !email && !contact && !role) {
        throw new ApiError(400, MESSAGE.ALL_FIELDS_MUST_REQUIRED);
    }

    if (username) staff.username = username;
    if (email) staff.email = email;
    if (contact) staff.contact = contact;
    if (role) staff.role = role;

    await staff.save();

    return res.status(200).json(new ApiResponse(200, staff, MESSAGE.STAFF_UPDATE_SUCCESS));
});


export {
    createUserByAdmin,
    getAllStaffMembers,
    getServentStaffList,
    deleteStaff,
    updateStaff
}