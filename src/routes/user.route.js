import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { uploadToServer } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/register")
  .post(
    uploadToServer.fields([{ name: "avatar" }, { name: "coverImage" }]),
    registerUser
  );

export default router;
