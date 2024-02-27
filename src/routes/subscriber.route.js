import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { addSubscriber } from "../controllers/subscriber.controller.js";

const router = Router();

router.route("/subscriber/add/:channelID").post(isLoggedIn, addSubscriber);

export default router;
