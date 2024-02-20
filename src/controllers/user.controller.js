import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, fullName, password } = req.body;

    let data = [username, email, fullName, password];
    if (data.some((e) => e === "")) {
      return res.status(400).send("Fields can not be empty");
    }

    let existingUser = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (existingUser) {
      return res.status(400).send("user already exist");
    }

    const localAvatarPath = req.files.avatar && req.files.avatar[0]?.path;
    const localCoverPath =
      req.files.coverImage && req.files.coverImage[0]?.path;

    if (!localAvatarPath) {
      return res.status(400).send("Avatar is required");
    }

    const avatar = await uploadToCloudinary(localAvatarPath);
    const coverImage = await uploadToCloudinary(localCoverPath);

    if (!avatar) {
      return res.status(500).send("Could not upload avatar");
    }

    const user = await User.create({
      username,
      email,
      fullName,
      password,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    });

    const newUser = await User.findById(user._id).select({
      password: 0,
      refreshToken: 0,
    });

    if (!newUser) {
      return res
        .status(500)
        .send("something went wrong while registering user");
    }
    return res.status(201).send(newUser);
  } catch (error) {
    next(error);
  }
};
