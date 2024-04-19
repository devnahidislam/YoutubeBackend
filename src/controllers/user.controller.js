import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "./../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import { getLocalPath } from "../utils/getLocalPath.js";

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some((field) => !field?.trim())) {
      throw new ApiError(400, "All fields are required."); // Throw an error if any required field is missing
    }

    // Check if the username or email already exists in the database
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      throw new ApiError(409, "User already exist.");
    }

    const avatarLocalPath = getLocalPath(req.files, "avatar");
    const coverImageLocalPath = getLocalPath(req.files, "coverImage");

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required.");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
      throw new ApiError(400, "Avatar file upload failed.");
    }

    const user = await User.create({
      username: username.toLowerCase(),
      email,
      fullName,
      password,
      avatar: avatar.url,
      coverImage: (await uploadOnCloudinary(coverImageLocalPath))?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Registration failed.");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User Registered Successfully."));
  } catch (error) {
    // Unlink files if they exist
    [getLocalPath(req.files, "avatar"), getLocalPath(req.files, "coverImage")]
      .filter(Boolean)
      .forEach((filePath) => {
        fs.unlinkSync(filePath);
      });

    throw error;
  }
});

export { registerUser };
