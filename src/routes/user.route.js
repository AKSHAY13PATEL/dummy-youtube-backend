import { Router } from "express";
import {
  loginUser,
  logoutUser,
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

export default router;
