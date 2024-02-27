import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: [true, "channel slug needs to be unique"],
      required: [true, "channel slug is required"],
      lowercase: true,
      trim: true,
      index: true,
    }, // represent unique channel slug in lowercase and remove extra space in between
    name: {
      type: String,
      trim: true,
    }, // channel name can be duplicate
    description: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

export const Channel = mongoose.model("Channel", channelSchema);
