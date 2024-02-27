import { Channel } from "../models/channel.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createNewChannel = asyncHandler(async (req, res) => {
  const { slug, name, description } = req.body;
  const ownerID = req.user._id;

  // validate slug
  const isChannelExist = await Channel.findOne({ slug: slug });
  if (isChannelExist) {
    return new ApiError(
      res,
      409,
      `Channel: ${slug} already exist`,
      "slug not available"
    );
  }

  const channel = await Channel.create({
    slug,
    name,
    description,
    owner: ownerID,
  });

  return new ApiResponse(
    res,
    true,
    201,
    "New channel created successfully",
    null,
    {
      channel,
    }
  );
});

export const getChannelDetails = asyncHandler(async (req, res) => {
  // route : /channel/:channelID
  const { channelID } = req.params;

  const channel = await Channel.findById(channelID).select({
    createdAt: 0,
    updatedAt: 0,
  });

  if (!channel) {
    return new ApiError(
      res,
      404,
      "Channel with given slug does not exist",
      "not found"
    );
  }

  return new ApiResponse(res, true, 200, "", null, {
    channel,
  });
});
