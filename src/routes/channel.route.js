import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import {
  createNewChannel,
  getChannelDetails,
} from "../controllers/channel.controller.js";

const router = Router();

router.route("/channel").post(isLoggedIn, createNewChannel);

router.route("/channel/:channelID").get(getChannelDetails);

export default router;
