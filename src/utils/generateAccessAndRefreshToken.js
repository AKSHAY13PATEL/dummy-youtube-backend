import { User } from "../models/user.model.js";

export const generateAccessAndRefreshToken = async (userID) => {
  try {
    //generate refresh token and store it into db
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    let refreshToken = "";
    if (!user.refreshToken) {
      refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();
    } else {
      refreshToken = user.refreshToken;
    }
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    return { accessToken: null, refreshToken: null };
  }
};
