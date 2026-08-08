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
import mongoose from "mongoose";


const getDashboardStats = asyncHandler(async (req, res) => {
    const { dashboardPersonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(dashboardPersonId)) {
        throw new ApiError(400, "Invalid user id");
    }

  const [
    totalVideos,
    publishedVideos,
    viewsResult,
    commentsResult,
    user,
    recentVideos,
    totalSubscribers,
    totalPlaylists,
    likesResult
] = await Promise.all([

    // Total Videos
    Video.countDocuments({
        owner: dashboardPersonId
    }),

    // Published Videos
    Video.countDocuments({
        owner: dashboardPersonId,
        isPublished: true
    }),

    // Total Views
    Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(dashboardPersonId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ]),

    // Total Comments
    Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(dashboardPersonId)
            }
        },
        {
            $lookup: {
                from: "comments",
                let: {
                    videoId: "$_id"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$target", "$$videoId"] },
                                    { $eq: ["$targetType", "Video"] }
                                ]
                            }
                        }
                    }
                ],
                as: "comments"
            }
        },
        {
            $addFields: {
                commentCount: {
                    $size: "$comments"
                }
            }
        },
        {
            $group: {
                _id: null,
                totalComments: {
                    $sum: "$commentCount"
                }
            }
        }
    ]),

    // User
    User.findById(dashboardPersonId)
        .select("avatar username fullName")
        .lean(),

    // Recent Videos
    Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(dashboardPersonId),
                isPublished: true
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $limit: 5
        },
        {
            $project: {
                title: 1,
                thumbnail: 1,
                views: 1,
                createdAt: 1
            }
        }
    ]),

    // Total Subscribers
    Subscription.countDocuments({
        channel: dashboardPersonId
    }),

    // Total Playlists
    Playlist.countDocuments({
        owner: dashboardPersonId
    }),

    // Total Likes on all videos
    Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(dashboardPersonId)
            }
        },
        {
            $lookup: {
                from: "likes",
                let: {
                    videoId: "$_id"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$video", "$$videoId"]
                            }
                        }
                    }
                ],
                as: "likes"
            }
        },
        {
            $addFields: {
                likeCount: {
                    $size: "$likes"
                }
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: "$likeCount"
                }
            }
        }
    ])
]);
    const totalViews = viewsResult[0]?.totalViews || 0;
    const totalComments = commentsResult[0]?.totalComments || 0;
    const totalLikes = likesResult[0]?.totalLikes || 0;

   return res.status(200).json(
    new ApiResponse(
        200,
        {
            user,
            totalVideos,
            publishedVideos,
            totalViews,
            totalComments,
            totalLikes,
            totalSubscribers,
            totalPlaylists,
            recentVideos
        },
        "Dashboard stats fetched successfully"
    )
);
});

export { getDashboardStats };
