import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    // check req.cookie and authorisation header for token
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!accessToken) {
      return new ApiError(
        res,
        401,
        "Login to access this resource",
        "Unauthorized client request"
      );
    }

    // jwt verify and get payload
    const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // add user id into req object
    const user = await User.findById(payload._id);
    if (!user)
      return new ApiError(
        res,
        401,
        "Invalid token",
        "Unauthorised client request"
      );

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      return new ApiError(
        res,
        403,
        "Token expired : please login again",
        "Token expired"
      );
    else if (error instanceof jwt.JsonWebTokenError)
      return next(
        new ApiError(res, 401, "invalid token", "Unauthorised client request")
      );

    console.log("Error :", error.message);
    return new ApiError(res, 500, "internal server error", error);
  }
};
