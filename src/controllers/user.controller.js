import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { generateAccessAndRefreshToken } from "../utils/generateAccessAndRefreshToken.js";

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
  const options = {
    expires: new Date(Date.now() + 60 * 1000),
    httpOnly: true,
    secure: true,
  };

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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
