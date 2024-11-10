import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/uploadToCloudinary.js";
import { OTP } from "../models/otp.js";
import { ApiResponse } from "../utils/apiResponse.js";
import JWT from "jsonwebtoken";
import otpGenerator from 'otp-generator'; // Ensure this is installed

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};

// tested
export const registerUser = asyncHandler(async (req, res) => {
    try {
        const {
            fullName,
            email,
            username,
            accountType,
            password,
            location,
        } = req.body;
        // console.log(req.body)
        // Validate input fields
        if (!fullName || !email || !username || !password || !accountType || !location) {
            throw new ApiError(400, "All fields are required");
        }

        // Validate location format
        const locationJson = JSON.parse(req.body.location);
        if (
            !locationJson.type ||
            locationJson.type !== "Point" ||
            !Array.isArray(locationJson.coordinates) ||
            locationJson.coordinates.length !== 2
        ) {
            throw new ApiError(400, "Invalid location format. Must be a Point with coordinates [longitude, latitude]");
        }

        // Check if user already exists
        const existedUser = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (existedUser) {
            throw new ApiError(409, "User already exists");
        }

        // Handle file uploads
        const avatarLocalPath = req.files?.avatar[0]?.path;
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required");
        }

        let coverImageLocalPath;
        if (req.files?.coverImage?.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        // Upload to Cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

        if (!avatar) {
            throw new ApiError(400, "Avatar upload failed");
        }

        // Create user
        const user = await User.create({
            username: username.toLowerCase(),
            fullName,
            email,
            password, // Make sure to hash the password in the User model
            accountType,
            avatar: avatar.secure_url,
            cloudinary_avatar_public_id: avatar?.public_id,
            cloudinary_coverImage_public_id: coverImage?.public_id || "",
            coverImage: coverImage?.secure_url || "",
            location: {
                type: locationJson.type,
                coordinates: locationJson.coordinates,
            },
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            throw new ApiError(500, "User not created");
        }

        return res.status(201).json(new ApiResponse(200, createdUser, "User created successfully"));
    } catch (e) {
        console.error("Error while registering user:", e); // Log the error
        return res.status(e.statusCode || 500).json(new ApiError(e.statusCode || 500, e.message || "Error while registering user"));
    }
});


export const sendOTP = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;

        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(401).json(new ApiError(401, "User already registered"));
        }

        let OTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        let existingOTP = await OTP.findOne({ otp: OTP });
        while (existingOTP) {
            OTP = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            existingOTP = await OTP.findOne({ otp: OTP });
        }

        const otpPayload = { email, otp: OTP };

        const otpBody = await OTP.create(otpPayload);
        // console.log(otpBody);

        res.status(200).json(new ApiResponse(200, OTP, "OTP sent successfully"));
    } catch (e) {
        // console.log("Error in sendOTP: ", e);
        return res.status(500).json(new ApiError(500, "Error while generating OTP"));
    }
});

// tested
export const loginUser = asyncHandler(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // console.log("Hello",req.body)
        if (!username || !email || !password) {
            throw new ApiError(400, "Username, email, or password is required");
        }

        const user = await User.findOne({
            email,
        });

        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        const checkPassword = await user.isPasswordCorrect(password);

        if (!checkPassword) {
            throw new ApiError(401, "Incorrect password");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
        const loggedinUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true,
        };

        res.cookie("accessToken", accessToken, options);
        res.cookie("refreshToken", refreshToken, options);

        return res.status(200).json(new ApiResponse(200, { user: loggedinUser, accessToken, refreshToken }, "User logged in successfully"));
    } catch (e) {
        return res.status(500).json(new ApiError(500, "Error while login", e?.message));
    }
});

// tested
export const logoutUser = asyncHandler(async (req, res) => {
    try {
        const id = req.user._id;
        const user = await User.findByIdAndUpdate(
            id,
            {
                $unset: { refreshToken: 1 },
            },
            {
                new: true,
            }
        );

        const options = {
            httpOnly: true,
            secure: true,
        };

        await res.clearCookie("accessToken", options);
        await res.clearCookie("refreshToken", options);

        return res.status(200).json(new ApiResponse(200, {}, "User logged out"));
    } catch (e) {
        return res.status(500).json(new ApiError(500, "Error while logout", e?.message));
    }
});


// tested
export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Error while retrieving token");
        }

        const decodedToken = JWT.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "User not found");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

        res.cookie("accessToken", accessToken, options);
        res.cookie("refreshToken", refreshToken, options);

        return res.status(200).json(new ApiResponse(200, { accessToken, refreshToken }, "Token is updated"));
    } catch (e) {
        return res.status(500).json(new ApiError(400, e?.message || "Invalid refresh token"));
    }
});

// tested
export const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const id = req.user._id;

        const user = await User.findById(id);
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid password");
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
    } catch (e) {
        return res.status(500).json(new ApiError(500, e?.message || "Internal server error"));
    }
});

// tested
export const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        return res.status(200).json(new ApiResponse(200, req.user, "User details fetched successfully"));
    } catch (e) {
        return res.status(500).json(new ApiError(500, e?.message || "Error while retrieving the user"));
    }
});

// tested
export const updateAccountDetails = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, accountType } = req.body;

        if (!fullName || !email || !accountType) {
            throw new ApiError(400, "Fields are required");
        }

        const id = req.user._id;
        const user = await User.findByIdAndUpdate(
            id,
            { fullName, email, accountType },
            { new: true }
        ).select("-password -refreshToken");

        return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
    } catch (e) {
        return res.status(500).json(new ApiError(500, e?.message || "Internal server error"));
    }
});


export const updateUserAvatar = asyncHandler(async (req, res) => {
    try {
        // accept file
        // validate file
        // update user
        // return user
        const avatarLocalPath = req.file?.path;
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required");
        }

        // upload to cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar.secure_url) {
            throw new ApiError(400, "Error while uploading avatar");
        }
        // console.log("User:", req.user);
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: avatar?.secure_url,
                },
            },
            { new: true }
        ).select("-password");

        return res
            .status(200)
            .json(new ApiResponse(200, user, "Avatar is successfully updated"));
    } catch (e) {
        throw new ApiError(400, "Error while updating avatar");
    }
});

export const updateUserCoverImage = asyncHandler(async (req, res) => {
    try {
        // get image
        const thumbnailLocalPath = req.file?.path;
        // validate image
        if (!thumbnailLocalPath) {
            throw new ApiError(400, "Cover File is required");
        }

        // upload image to cloudinary
        const coverImage = await uploadOnCloudinary(thumbnailLocalPath);

        if (!coverImage.secure_url) {
            throw new ApiError(400, "Error while uploading image");
        }

        // find user
        const id = req.user?._id;
        const user = await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    coverImage: coverImage.secure_url,
                },
            },
            { new: true }
        ).select("-password");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "Coverimage has been uploaded successfully"
                )
            );
    } catch (e) {
        throw new ApiError(400, "Error while updating thumbnail");
    }
});

// tested
export const searchUsersByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        // console.log(username);
        if (!username) {
            throw new ApiError(400, "Username is required");
        }

        // Use regex to search for users with the provided username
        const regex = new RegExp(username, "i"); // 'i' for case-insensitive search
        const users = await User.find({ username: { $regex: regex } }).select(
            "-password -refreshToken"
        ); // Exclude sensitive fields

        if (users.length === 0) {
            return res
                .status(404)
                .json(
                    new ApiResponse(
                        404,
                        null,
                        "No users found matching the username"
                    )
                );
        }
        // console.log(users);
        return res
            .status(200)
            .json(new ApiResponse(200, users, "Users retrieved successfully"));
    } catch (error) {
        throw new ApiError(
            500,
            error.message || "Error while searching for users"
        );
    }
};