import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import  { Tweet } from "../models/tweet.model.js";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const search = asyncHandler(async (req, res) => {
    const { type, query, page = 1, limit = 10 } = req.query;

    if (!query?.trim()) {
        throw new ApiError(400, "Search query is required");
    }

    const options = {
        page: Number(page),
        limit: Number(limit)
    };

    if (type === "video") {
        const aggregate = Video.aggregate([
            {
                $match: {
                    $or: [
                        {
                            title: {
                                $regex: query,
                                $options: "i"
                            }
                        },
                        {
                            description: {
                                $regex: query,
                                $options: "i"
                            }
                        }
                    ]
                }
            }
        ]);

        const videos = await Video.aggregatePaginate(aggregate, options);

        return res.status(200).json(
            new ApiResponse(200, videos, "Videos fetched successfully")
        );

    } else if (type === "tweet") {

        const aggregate = Tweet.aggregate([
            {
                $match: {
                    content: {
                        $regex: query,
                        $options: "i"
                    }
                }
            }
        ]);

        const tweets = await Tweet.aggregatePaginate(aggregate, options);

        return res.status(200).json(
            new ApiResponse(200, tweets, "Tweets fetched successfully")
        );

    } else if (type === "playlist") {

        const aggregate = Playlist.aggregate([
            {
                $match: {
                    $or: [
                        {
                            name: {
                                $regex: query,
                                $options: "i"
                            }
                        },
                        {
                            description: {
                                $regex: query,
                                $options: "i"
                            }
                        }
                    ]
                }
            }
        ]);

        const playlists = await Playlist.aggregatePaginate(aggregate, options);

        return res.status(200).json(
            new ApiResponse(200, playlists, "Playlists fetched successfully")
        );

    } else if (type === "user") {

        const aggregate = User.aggregate([
            {
                $match: {
                    $or: [
                        {
                            username: {
                                $regex: query,
                                $options: "i"
                            }
                        },
                        {
                            fullName: {
                                $regex: query,
                                $options: "i"
                            }
                        }
                    ]
                }
            }
        ]);

        const users = await User.aggregatePaginate(aggregate, options);

        return res.status(200).json(
            new ApiResponse(200, users, "Users fetched successfully")
        );

    } else if (type === "comment") {

        const aggregate = Comment.aggregate([
            {
                $match: {
                    content: {
                        $regex: query,
                        $options: "i"
                    }
                }
            }
        ]);

        const comments = await Comment.aggregatePaginate(aggregate, options);

        return res.status(200).json(
            new ApiResponse(200, comments, "Comments fetched successfully")
        );

    } else {

        throw new ApiError(
            400,
            "Invalid search type. Allowed types are: video, tweet, playlist, user, comment."
        );
    }
});



export { search };