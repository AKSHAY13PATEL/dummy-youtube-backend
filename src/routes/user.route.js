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
  .route("/register")
  .post(
    uploadToServer.fields([{ name: "avatar" }, { name: "coverImage" }]),
    registerUser
  );

router.route("/login").get(loginUser);

router.route("/logout").get(isLoggedIn, logoutUser);

router.route("/refresh-token").get(refreshAccessToken);

// update user details and password change
router
  .route("/update")
  .patch(
    isLoggedIn,
    uploadToServer.fields([{ name: "avatar" }, { name: "coverImage" }]),
    updateUserDetails
  );

router.route("/change-password").patch(isLoggedIn, changePassword);

router.route("/testing").get((req, res) => {
  return res.send("Testing route");
});

// user channel profile
router.route("/profile/:username").get(isLoggedIn, getUserChannelProfile);

export default router;
