import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
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

router.route("/refreshToken").get(refreshAccessToken);

export default router;
