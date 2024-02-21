import asyncMiddleware from "../middlewares/async.middleware.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncMiddleware(async (req, res, next) => {
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
