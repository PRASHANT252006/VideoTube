import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

const uploadVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const owner = req.user._id;

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail are required");
    }

    const uploadedVideo = await uploadOncloudinary(videoLocalPath);
    const uploadedThumbnail = await uploadOncloudinary(thumbnailLocalPath);

    if (!uploadedVideo || !uploadedThumbnail) {
        throw new ApiError(500, "Failed to upload files");
    }

    const video = await Video.create({
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        title,
        description,
        duration: uploadedVideo.duration,
        owner,
        videoPublicId: uploadedVideo.public_id,
        thumbnailPublicId: uploadedThumbnail.public_id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            video,
            "Video uploaded successfully"
        )
    );
});
const getAllVideosOwner = asyncHandler(async (req, res) => {
    const owner = req.user._id;

    const videos = await Video.find({ owner })
        .populate("owner", "fullName username avatar ")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    );
});
const getAllPublishedVideos = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10 } = req.query;

    const pipeline = [
        {
            $match: {
                isPublished: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                views: 1,
                createdAt: 1,
                owner: {
                    _id: "$owner._id",
                    fullName: "$owner.fullName",
                    username: "$owner.username",
                    avatar: "$owner.avatar"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ];

    const options = {
        page: Number(page),
        limit: Number(limit)
    };

    const videos = await Video.aggregatePaginate(
        Video.aggregate(pipeline),
        options
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Published videos fetched successfully"
        )
    );
});


const deleteVideo = asyncHandler(async (req, res) => {
const { videoId } = req.params;

if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
}

const video = await Video.findById(videoId);

if (!video) {
    throw new ApiError(404, "Video not found");
}

if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this video");
}

try {
    const videoDeleteResult = await cloudinary.uploader.destroy(
        video.videoPublicId,
        {
            resource_type: "video"
        }
    );

    const thumbnailDeleteResult = await cloudinary.uploader.destroy(
        video.thumbnailPublicId
    );

    console.log(videoDeleteResult);
    console.log(thumbnailDeleteResult);
} catch (error) {
    throw new ApiError(500, "Failed to delete files from Cloudinary");
}

await video.deleteOne();

return res.status(200).json(
    new ApiResponse(
        200,
        {},
        "Video deleted successfully"
    )
);
});
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Get the video once
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Increment only for non-owner
    if (video.owner.toString() !== req.user._id.toString()) {
        video.views += 1;
        await video.save();
    }

    // Now run aggregation for the final response
   const aggregatedVideo = await Video.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(videoId)
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner"
        }
    }
]);

    return res.status(200).json(
        new ApiResponse(
            200,
            aggregatedVideo[0],
            "Video fetched successfully"
        )
    );
});
// const updateVideo = asyncHandler(async(req,res)=>{

//     const {videoId}=req.params;


// if (!mongoose.Types.ObjectId.isValid(videoId)) {
//     throw new ApiError(400, "Invalid video ID");
// }

//     const {title, description}=req.body;

//     const video = await Video.findById(videoId);

//     if(!video){
//         throw new ApiError(404,"Video not found");
//     }

//     if(video.owner.toString() !== req.user._id.toString()){
//         throw new ApiError(403,"Unauthorized");
//     }
//  const thumbnail=req.files?.thumbnail?.[0]?.path;
//  if(thumbnail!=undefined){
//     try{
//         await cloudinary.uploader.destroy(video.thumbnailPublicId);
//         const uploadedThumbnail = await uploadOncloudinary(thumbnail);
//         return res.status(200).json(
//             new ApiResponse(
//                 200,
//                 uploadedThumbnail,
//                 "Thumbnail updated successfully"
//             )
//         );
//     }
//     catch(error){
//         throw new ApiError(500,"Failed to upload thumbnail");
//     }
//  }
//     video.title = title || video.title;
//     video.description = description || video.description;

//     await video.save();

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             video,
//             "Video updated successfully"
//         )
//     );

// });


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const { title, description } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    const videoLocalPath = req.files?.videoFile?.[0]?.path;

    if (thumbnailLocalPath) {
        try {
            // Save old public_id
            const oldThumbnailPublicId = video.thumbnailPublicId;

            // Upload new thumbnail
            const uploadedThumbnail = await uploadOncloudinary(thumbnailLocalPath);

            if (!uploadedThumbnail) {
                throw new ApiError(500, "Failed to upload thumbnail");
            }

            // Update database fields
            video.thumbnail = uploadedThumbnail.secure_url;
            video.thumbnailPublicId = uploadedThumbnail.public_id;

            // Delete old thumbnail from Cloudinary
            await cloudinary.uploader.destroy(oldThumbnailPublicId);

        } catch (error) {
            throw new ApiError(500, "Failed to update thumbnail");
        }
    }
  if(videoLocalPath){
    try {
        // Save old public_id
        const oldVideoPublicId = video.videoPublicId;
       

        // Upload new video
        const uploadedVideo = await uploadOncloudinary(videoLocalPath);
        if (!uploadedVideo) {
            throw new ApiError(500, "Failed to upload video");
        }
        video.videoFile = uploadedVideo.secure_url;
        video.videoPublicId = uploadedVideo.public_id;
        await cloudinary.uploader.destroy(oldVideoPublicId, { resource_type: "video" });
    }
    catch (error) {
        throw new ApiError(500, "Failed to update video");
    }}
    // Update title & description
    if (title) {
        video.title = title;
    }

    if (description) {
        video.description = description;
    }

    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video updated successfully"
        )
    );
});

const togglePublishStatus = asyncHandler(async(req,res)=>{

    const {videoId}=req.params;

if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
}
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not found");
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized");
    }

    video.isPublished = !video.isPublished;

    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Publish status updated"
        )
    );
});
export {
    uploadVideo,
    getAllVideosOwner,
    getAllPublishedVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};