import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { User } from "../Models/index.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { extractPublicIdFromUrl, deleteFromCloudinary, uploadOnCloudinary } from "../Utils/Cloudinary.js"
import MESSAGE from "../Constants/message.js";

//Method to Generate access and refresh tokens for the user
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    console.log("refreshToken", refreshToken);
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };

  } catch (e) {
    console.error("Token generation error:", e);
    throw new ApiError(
      500,
      MESSAGE.SOMETHING_WENT_WRONG
    );
  }
};

// Refresh access token after expiry
const refreshAccessToken = asyncHandler(
  async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(410, MESSAGE.UNAUTHORIZED_REQUEST);
    }

    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decodedToken?._id);
      if (!user) {
        throw new ApiError(410, MESSAGE.INVALID_TOKEN);
      }
      if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, MESSAGE.INVALID_TOKEN);
      }

      const options = {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };

      const { newAccessToken, newRefreshToken } =
        await generateAccessAndRefreshTokens(user._id);

      return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
          new ApiResponse(
            200,
            { newAccessToken, newRefreshToken },
            MESSAGE.OPERATION_SUCCESS
          ));
    } catch (error) {
      throw new ApiError(401, error?.message || MESSAGE.INVALID_TOKEN);
    }
  });

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, contact, password } = req.body;

  const identifier = username || email || contact;
  if (!identifier || !password) {
    return res.status(400).json({ message: MESSAGE.ALL_FIELDS_MUST_REQUIRED });
  }

  const user = await User.findOne({
    $or: [
      { username: identifier },
      { email: identifier },
      { contact: identifier },
    ],
  });
  console.log(user);

  if (!user) {
    return res.status(404).json({ message: MESSAGE.USER_NOT_FOUND });
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, MESSAGE.USER_LOGIN_FAILED)
  }

  //access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        MESSAGE.USER_LOGIN_SUCCESS
      )
    );
})

// User registration for customers during order
const registerUser = asyncHandler(async (req, res) => {
  const { username, contact, email, password, dob } = req.body;
  if (
    [username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, MESSAGE.ALL_FIELDS_MUST_REQUIRED);
  }

  //check if user already exist: username, email, contact
  const existedUser = await User.findOne({
    $or: [{ username }, { email }, { contact }],
  });

  if (existedUser) {
    throw new ApiError(400, MESSAGE.USER_ALREADY_EXISTS);
  }

  const createUser = await User.create({
    username: username.toLowerCase(),
    email,
    contact,
    dob,
    password,
  })

  const user = await User.findById(createUser._id).select("-password -refreshToken")
  console.log("Created user", user);

  return res
    .status(200)
    .json(new ApiResponse(200, user, MESSAGE.USER_REGISTER_SUCCESS));
})

const logoutUser = asyncHandler(async (req, res) => {
  const id = req.user._id;

  await User.findByIdAndUpdate(id, {
    $unset: {
      refreshToken: 1,
    },
  },
    {
      new: true,
    })

  //delete secure cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, MESSAGE.USER_REGISTER_SUCCESS));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { username, contact, dob } = req.body;
  const userId = req.user._id;

  const updates = {};
  if (username !== undefined) updates.username = username;
  if (contact !== undefined) updates.contact = contact;
  if (dob !== undefined) updates.dob = dob;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, MESSAGE.NO_VALID_FIELDS_PROVIDED);
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new ApiError(400, MESSAGE.SOMETHING_WENT_WRONG);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, MESSAGE.USER_UPDATE_SUCCESS));
});

const userAvatarUpdate = asyncHandler(async (req, res) => {
  const newAvatar = req.file;
  console.log(newAvatar);

  const id = req.user._id;

  const user = await User.findById(id).select("-password -refreshToken");
  if (!user) throw new ApiError(404, MESSAGE.USER_NOT_FOUND);

  if (newAvatar) {
    try {
      // If user has already old avatar then delete it
      if (user.Avatar) {
        const publicId = await extractPublicIdFromUrl(user.Avatar);
        const deletedAvatar = await deleteFromCloudinary(publicId);

        console.log("Avatar deleted", deletedAvatar);
        if (!deletedAvatar) throw new ApiError(401, MESSAGE.DELETE_CLOUDINARY_ERROR)
      }

      // if user is uploading avatar for the first time
      const uploadAvatar = await uploadOnCloudinary(newAvatar?.path);
      console.log("Avatar Upload successfully", uploadAvatar);
      if (!uploadAvatar) throw new ApiError(401, MESSAGE.UPLOAD_CLOUDINARY_ERROR)

      // saving avatar url to database
      user.Avatar = uploadAvatar.url;
      await user.save({ validateBeforeSave: false });

    } catch (error) {
      console.log("deleting Avatar error:", error);
      throw new ApiError(401, MESSAGE.UPLOAD_CLOUDINARY_ERROR)
    }
  }

  return res.status(200).json(new ApiResponse(200, user, MESSAGE.USER_UPDATE_SUCCESS))
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const id = req.user._id;

  const user = await User.findById(id);

  const isCorrectPassword = await user.isPasswordCorrect(oldPassword);
  if (!isCorrectPassword) throw new ApiError(401, MESSAGE.PASSWORD_INCORRECT);

  user.password = newPassword;
  await user.save();

  return res.status(200).json(new ApiResponse(200, user, MESSAGE.PASSWORD_CHANGED));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, MESSAGE.DATA_FETCHED_SUCCESS));
})

// Create user by admin
const createUserByAdmin = asyncHandler(async (req, res) => {
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

export {
  refreshAccessToken,
  loginUser,
  registerUser,
  logoutUser,
  updateProfile,
  getCurrentUser,
  userAvatarUpdate,
  changeCurrentPassword,
  createUserByAdmin,
  getAllStaffMembers
}
