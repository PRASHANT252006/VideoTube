import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespone.js";
import { User } from "../models/user.model.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
// import { Subscription } from "../models/subscription.model.js"
import mongoose from "mongoose";


// Generate Access Token & Refresh Token
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // Find user by id
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Generate JWT tokens
        //user.generateAccessToken() and user.generateRefreshToken() methods from user model
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save refresh token in database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate access and refresh tokens");
    }
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, username } = req.body;

    // Check if any field is empty
    if ([fullName, email, password, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check whether user already exists
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    console.log("Files:", req.files);

    // Get avatar file path
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    // Get cover image file path (optional)
    let coverImageLocalPath;

    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // Avatar is mandatory
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    // Upload images to Cloudinary
    const avatar = await uploadOncloudinary(avatarLocalPath);
    const coverImage = await uploadOncloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    // Create user in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    // Remove sensitive fields before sending response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    // Send response
    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );
});

// Login User
const loginUser = asyncHandler(async (req, res) => {

    // check all fields are filled are not

    //check if user exists

    //match all creditial

    // return response





    //req body-> data

    //username or email

    //find user

    //password check

    // access and refresh token

    // send cookie



    // Get credentials from request body
    const { email, username, password } = req.body;

    // User must provide either email or username
    if (!(email || username)) {
        throw new ApiError(400, "Email or Username is required");
    }

    // Password is mandatory
    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    // Find user by email or username
    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Compare entered password with hashed password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    // Generate Access & Refresh Tokens
    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    // Remove sensitive information before sending user object
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // Cookie options
    const options = {
        httpOnly: true,
        secure: true,
    };

    // Send cookies and response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {

    // Remove refresh token from database
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    // Cookie options
    const options = {
        httpOnly: true,
        secure: true,
    };

    // Clear cookies and send response
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is required");
        }
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access Token refreshed successfully"
                )
            );
    }
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(
        200, {},
        "Password changed successfully"
    )
    )
})

const getUserProfile = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(
        200, req.user,
        "User user fetched successfully"
    )
    )
})

const updateAccountProfile = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!fullName || !email) {
        throw new ApiError(400, "Full name and email are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullName, email } },
        { new: true }
    ).select("-password ")
    return res.status(200).json(new ApiResponse(
        200, user,
        "Account profile updated successfully"
    ))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }
    const avatar = await uploadOncloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Avatar upload failed")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password ")
    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"))

})


const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required")
    }
    const coverImage = await uploadOncloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400, "Cover image upload failed")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password ")

    return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"))

})

const getUserChannel = asyncHandler(async (req, res) => {
    const { username } = req.params

    // Check if username is provided
    if (!username?.trim()) {
        throw new ApiError(400, "Username is required")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },

        // Find all subscribers of this channel
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },

        // Find all channels this user has subscribed to
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },

        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },

                //$ bcoz subscriber field hai ab
                subscribedToCount: {
                    $size: "$subscribedTo"
                },

                isSubscribed: {
                    $cond: {
                        if: {
                            // $in: [
                            //     req.user?._id,
                            //     "$subscribers.subscriber"
                            // ]
                            $in: [
                                new mongoose.Types.ObjectId(req.user?._id),
                                "$subscribers.subscriber"
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },

        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ])

    // Check if channel exists
    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist")
    }

    console.log("Channel:", channel)

    return res.status(200).json(
        new ApiResponse(
            200,
            channel[0],
            "Channel fetched successfully"
        )
    )
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    );
});



export {
    registerUser,
    loginUser,
    getUserProfile,
    updateAccountProfile,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannel,
    getWatchHistory,

};