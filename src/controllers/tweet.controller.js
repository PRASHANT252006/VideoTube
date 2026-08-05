import { asyncHandler } from "../utils/asynchandler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";

const createTweet = asyncHandler(async (req, res) => {
     // 1. Get content

    // 2. Validate content

    // 3. Create Tweet with
    //    content
    //    owner: req.user._id

    // 4. Return ApiResponse

    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Write something...");
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            tweet,
            "Tweet created successfully"
        )
    );
});

const getUserTweet = asyncHandler(async (req, res) => {
    //get id 
    //fetch avatarimage , tweets
    //return response

    // 1. Get userId from req.params
    // 2. Check if userId is valid
    // 3. Find all tweets where owner = userId
    // 4. Sort by newest first
    // 5. Return tweets

    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const { page = 1, limit = 10 } = req.query;

    const isUserExist = await User.findById(userId);

    if (!isUserExist) {
        throw new ApiError(404, "User not found");
    }

    const totalTweets = await Tweet.countDocuments({
        owner: userId,
    });

    const tweets = await Tweet.find({
        owner: userId,
    })
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tweets,
                page: Number(page),
                limit: Number(limit),
                totalTweets,
                totalPages: Math.ceil(totalTweets / Number(limit)),
            },
            "User tweets fetched successfully"
        )
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweet_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweet_id)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweet_id);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    await Tweet.findByIdAndDelete(tweet_id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweet_id } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tweet_id)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Enter what to update");
    }

    const tweet = await Tweet.findById(tweet_id);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    tweet.content = content.trim();
    await tweet.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet updated successfully"
        )
    );
});

export {
    createTweet,
    getUserTweet,
    updateTweet,
    deleteTweet,
};