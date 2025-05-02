import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { User } from "../Models/index.js";
import { ApiResponse } from "../Utils/ApiResponse.js";

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
      "Something went wrong while generating Access and Refresh tokens"
    );
  }
};

// todo: API TESTING Is INCOMPLETE
const refreshAccessToken = asyncHandler(
  async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(410, "Unauthorised request");
    }

    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decodedToken?._id);
      if (!user) {
        throw new ApiError(410, "invalid refresh token");
      }
      if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
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
            "Access token refreshed"
          ));
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
  });

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, contact, password } = req.body;

  const identifier = username || email || contact;
  if (!identifier || !password) {
    return res.status(400).json({ message: "Identifier and password are required" });
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
    return res.status(404).json({ message: 'User not found.' });
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Credentials")
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
        "User Logged in Succesfully"
      )
    );
})

const registerUser = asyncHandler(async (req, res) => {
  const { username, contact, email, password, dob } = req.body;
  if (
    [username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are must required");
  }

  //check if user already exist: username, email, contact
  const existedUser = await User.findOne({
    $or: [{ username }, { email }, { contact }],
  });

  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }

  // todo: role based registering of user, profile adding 
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
    .json(new ApiResponse(200, user, "User registered succesfully"));
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

  //delete secure coookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logout seccessfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { username, contact, dob } = req.body;
  const userId = req.user._id;

  const updates = {};
  if (username !== undefined) updates.username = username;
  if (contact !== undefined) updates.contact = contact;
  if (dob !== undefined) updates.dob = dob;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  // ?ANOTHER METHOD
  // const updates = req.body;
  // for (let key in updates) {
  //     if (user[key] !== undefined) {
  //         user[key] = updates[key];
  //     }
  // }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new ApiError(400, "Something went wrong while updating profile");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

// TODO
const userAvatarUpdate = asyncHandler(async (req, res) => {
  const newAvatar = req.file;
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const id = req.user._id;

  const user = await User.findById(id);

  const isCorrectPassword = await user.isPasswordCorrect(oldPassword);
  if (!isCorrectPassword) throw new ApiError(401, "Password incorrect");

  user.password = newPassword;
  await user.save();

  return res.status(200).json(new ApiResponse(200, user, "Password Changed Succesfuuly"))
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched succesfully"));
})

export {
  refreshAccessToken,
  loginUser,
  registerUser,
  logoutUser,
  updateProfile,
  getCurrentUser,
  userAvatarUpdate,
  changeCurrentPassword
}