import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    }, // Reference to User model
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    }, // Reference to User (channel owner)
    subscribedAt: { type: Date, default: Date.now },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Subscriber = mongoose.model("Subscriber", subscriberSchema);
