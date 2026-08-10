import {Like} from '../models/like.model.js';
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from '../models/video.model.js';
import mongoose from 'mongoose';

const toggleVideoLike = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    const userId = req.user._id;
const video = await Video.findById(videoId);

if (!video) {
    throw new ApiError(404, "Video not found");
}

    // Check if already liked
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    });


    // Unlike
    if (existingLike) {

        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Video unliked successfully"
            )
        );
    }


    // Like
    const like = await Like.create({
        video: videoId,
        likedBy: userId
    });


    return res.status(201).json(
        new ApiResponse(
            201,
            like,
            "Video liked successfully"
        )
    );

});


const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    // Validate video id
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }


    // Check video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }


    // Increment views
    await Video.findByIdAndUpdate(
        videoId,
        {
            $inc:{
                views:1
            }
        }
    );


    // Get video with likes information
    const videoDetails = await Video.aggregate([

        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            }
        },


        // Get owner details
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },


        {
            $unwind:"$owner"
        },


        // Get all likes of video
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },


        // Check current user liked or not
        {
            $lookup:{
                from:"likes",
                let:{
                    videoId:"$_id"
                },
                pipeline:[
                    {
                        $match:{
                            $expr:{
                                $and:[
                                    {
                                        $eq:[
                                            "$video",
                                            "$$videoId"
                                        ]
                                    },
                                    {
                                        $eq:[
                                            "$likedBy",
                                            req.user._id
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as:"userLiked"
            }
        },


        // Add fields
        {
            $addFields:{
                
                likeCount:{
                    $size:"$likes"
                },

                isLiked:{
                    $gt:[
                        {
                            $size:"$userLiked"
                        },
                        0
                    ]
                }
            }
        },


        // Remove unnecessary data
        {
            $project:{
                likes:0,
                userLiked:0,

                "owner.password":0,
                "owner.refreshToken":0
            }
        }

    ]);


    return res.status(200).json(
        new ApiResponse(
            200,
            videoDetails[0],
            "Video fetched successfully"
        )
    );

});
export { toggleVideoLike,  getVideoById};