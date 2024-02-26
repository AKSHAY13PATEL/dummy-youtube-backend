import { Subscriber } from "../models/subscriber.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addSubscriber = asyncHandler(async (req, res) => {
  const userID = req.user._id;
  const channelID = req.params.channelID;

  if (!channelID?.trim()) {
    return new ApiError(res, 400, "channel id is missing", "bad request");
  }

  const newSubscriber = await Subscriber.create({
    subscriber: userID,
    channel: channelID,
  });

  return new ApiResponse(res, true, 200, "Subscribed successfully", null, {
    subscriber: newSubscriber,
  });
});
