import { Router } from "express";
import {
  changePassword,
  getUserChannelProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { uploadToServer } from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/user/register")
  .post(
    uploadToServer.fields([{ name: "avatar" }, { name: "coverImage" }]),
    registerUser
  );

router.route("/user/login").get(loginUser);

router.route("/user/logout").get(isLoggedIn, logoutUser);

router.route("/user/refresh-token").get(refreshAccessToken);

// update user details and password change
router
  .route("/user/update")
  .patch(
    isLoggedIn,
    uploadToServer.fields([{ name: "avatar" }, { name: "coverImage" }]),
    updateUserDetails
  );

router.route("/user/change-password").patch(isLoggedIn, changePassword);

router.route("/user/testing").get((req, res) => {
  return res.send("Testing route");
});

// user channel profile
router.route("/user/profile/:username").get(isLoggedIn, getUserChannelProfile);

export default router;
