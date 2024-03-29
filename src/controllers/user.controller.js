import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { generateAccessAndRefreshToken } from "../utils/generateAccessAndRefreshToken.js";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, fullName, password } = req.body;

  let data = [username, email, fullName, password];
  if (data.some((e) => e === "")) {
    return new ApiError(res, 400, "Fields can not be empty", "missing details");
  }

  let existingUser = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });
  if (existingUser) {
    return new ApiError(res, 409, "user already exist", "conflict");
  }

  const localAvatarPath = req.files.avatar && req.files.avatar[0]?.path;
  const localCoverPath = req.files.coverImage && req.files.coverImage[0]?.path;

  if (!localAvatarPath) {
    return new ApiError(res, 400, "Avatar is required", "missing details");
  }

  const avatar = await uploadToCloudinary(localAvatarPath);
  const coverImage = await uploadToCloudinary(localCoverPath);

  if (!avatar) {
    return new ApiError(
      res,
      500,
      "Could not upload avatar",
      "internal server error"
    );
  }

  const user = await User.create({
    username,
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const newUser = await User.findById(user._id).select({
    password: 0,
    refreshToken: 0,
  });

  if (!newUser) {
    return new ApiError(
      res,
      500,
      "something went wrong while registering user",
      "internal server error"
    );
  }
  return new ApiResponse(
    res,
    true,
    201,
    "user created successfully",
    null,
    newUser
  );
});

export const loginUser = asyncHandler(async (req, res, next) => {
  // get login credentials
  const { username, email, password } = req.body;

  // check user exist or not username / email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    return new ApiError(res, 400, "user does not exist", "bad request");
  }

  // validate password
  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword)
    return new ApiError(res, 400, "invalid password", "bad request");

  // generate access and refresh token
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select({
    _id: 0,
    password: 0,
    watchHistory: 0,
    refreshToken: 0,
    createdAt: 0,
    updatedAt: 0,
  });

  // send cookies with access and refresh token
  // access token expiry : 1 hr. Refresh token : 1 day
  const options = {
    expires: new Date(Date.now() + 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
  };

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, {
      ...options,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    .json({
      success: true,
      message: "Login Successful",
      error: null,
      data: {
        accessToken,
        refreshToken,
        user: loggedInUser,
      },
    });
});

export const logoutUser = asyncHandler(async (req, res) => {
  // delete refresh token from db and clear cookies
  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshToken: null },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
      success: true,
      message: "Logout successfull",
      error: null,
      data: null,
    });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken)
      return new ApiError(
        res,
        401,
        "Refresh token is required",
        "Unauthorized client request"
      );

    const { _id } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(_id);

    if (user?.refreshToken !== refreshToken)
      return new ApiError(
        res,
        401,
        "Invalid refresh token",
        "Unauthorised request"
      );

    // FIX: this function does not give new refresh token
    // because there is already existing refresh token in DB
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res.cookie("accessToken", accessToken, options).json({
      success: true,
      message: "Token refreshed successful",
      error: null,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.log("refreshAccessToken : ", error);
    return new ApiError(
      res,
      500,
      error?.message || "Can not refresh access token",
      "internal server error"
    );
  }
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return new ApiError(res, 400, "Fields are required", "bad request");
  }

  // find logged in user
  const user = await User.findOne(req.user._id);

  // validate old password
  const isValidPassword = await user.isPasswordCorrect(oldPassword);
  if (!isValidPassword) {
    return new ApiError(res, 400, "old password is not correct", "bad request");
  }

  user.password = newPassword;
  await user.save();

  return new ApiResponse(
    res,
    true,
    200,
    "password changes successfully",
    null,
    null
  );
});

export const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  // updation details object
  const newData = {
    fullName,
    email,
  };

  if (!fullName || !email)
    return new ApiError(
      res,
      400,
      "User updation details are required",
      "bad request"
    );

  // if user request avatar update
  if (req.files && "avatar" in req.files) {
    const avatar = await uploadToCloudinary(req.files.avatar[0]?.path);
    newData.avatar = avatar.url;
  }

  // if user request coverimage update
  if (req.files && "coverImage" in req.files) {
    const coverImage = await uploadToCloudinary(req.files.coverImage[0]?.path);
    newData.coverImage = coverImage.url;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, newData, {
    new: true,
  }).select({ refreshToken: 0, password: 0, _id: 0 });

  return new ApiResponse(res, true, 200, "User updated successfully", null, {
    user: updatedUser,
  });
});

export const getUserChannelProfile = asyncHandler(async (req, res) => {
  // username and channel name both are same
  // because both are unique
  const username = req.params.username?.toLowerCase();
  const requestingUserID = req.user._id;

  if (!username)
    return new ApiError(res, 400, "username is required", "bad request");

  const pipeline = [
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: "subscribers",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscribers",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribed",
      },
    },
    {
      $addFields: {
        totalSubscribers: {
          $size: "$subscribers",
        },
        totalSubscribedTo: {
          $size: "$subscribed",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [requestingUserID, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        password: 0,
        createdAt: 0,
        updatedAt: 0,
        refreshToken: 0,
        subscribers: 0,
        subscribed: 0,
      },
    },
  ];

  const channel = await User.aggregate(pipeline);

  return new ApiResponse(res, true, 200, "", null, {
    channel: channel[0],
  });
});
