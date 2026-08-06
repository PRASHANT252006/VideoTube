import {Playlist} from '../models/playlist.model.js';
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
// 1. Get data from req.body
// 2. Validate input
// 3. Create playlist
// 4. Return response
    const {name, description}=req.body;
    if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and description are required");
}
    const owner=req.user._id;
    const playlist= await Playlist.create({
        name,
        description,
        owner
    });
    if (!playlist) {
    throw new ApiError(500, "Failed to create playlist");
}
    return res.status(201).json(
        new ApiResponse(
            201,playlist,"playlist created successfully"))
});
//  const addVideoToPlaylist = asyncHandler(async (req, res) => {
//     //take video id from req.body how to know about which playlist ->name of playlist
//     // validate id and playlist
//     //put it in playlist
//     //return response

// // 1. Get playlistId and videoId from req.params
// // 2. Validate both ObjectIds
// // 3. Find playlist
// //      -> 404 if not found
// // 4. Check ownership
// //      -> Only owner can modify playlist
// // 5. Find video
// //      -> 404 if not found
// // 6. Add video using $addToSet
// // 7. Return updated playlist
//  const { playlistId, videoId } = req.params;
//  if(!playlistId || !videoId){
//     throw new ApiError("404","playlist or videolist is missing");
//  }
//  const playlist=Playlist.findById(playlistId);
//  if(!playlist){
//      throw new ApiError("404","NO such playlist");
//  }
//  const user=req.user._id;
//  if(user!=playlist.owner){
//     throw new ApiError("400","Unauthorisedaccess");
//  }
//  const video=Video.findById(videoId);
//     if(!video){
//         throw new ApiError("404","No such video");
//     }
//     playlist.video.addtoset(video);
//      return res.status(200).json(
//         new ApiResponse()
//      )
//  });
// const addVideoToPlaylist = asyncHandler(async (req, res) => {
//     // 1. Get playlistId and videoId from req.params
//     const { playlistId, videoId } = req.params;

//     // 2. Validate ObjectIds
//     if (
//         !mongoose.isValidObjectId(playlistId) ||
//         !mongoose.isValidObjectId(videoId)
//     ) {
//         throw new ApiError(400, "Invalid playlist or video id");
//     }

//     // 3. Find playlist
//     const playlist = await Playlist.findById(playlistId);

//     if (!playlist) {
//         throw new ApiError(404, "Playlist not found");
//     }

//     // 4. Check ownership
//     if (playlist.owner.toString() !== req.user._id.toString()) {
//         throw new ApiError(403, "Unauthorized access");
//     }

//     // 5. Find video
//     const video = await Video.findById(videoId);

//     if (!video) {
//         throw new ApiError(404, "Video not found");
//     }

//     // 6. Add video using $addToSet
//     const updatedPlaylist = await Playlist.findByIdAndUpdate(
//         playlistId,
//         {
//             $addToSet: {
//                 videos: videoId,
//             },
//         },
//         {
//             new: true,
//         }
//     );

//     // 7. Return response
//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             updatedPlaylist,
//             "Video added to playlist successfully"
//         )
//     );
// });

const updateplaylist=asyncHandler(async(req,res)=>{
// 1. Get playlistId
// 2. Validate ObjectId
// 3. Find playlist
//       -> 404 if not found
// 4. Check ownership
//       -> 403 if not owner
// 5. Update fields if provided
//       name
//       description
//       videos
//       isPublic
// 6. Save
// 7. Return updated playlist
 const { playlistId } = req.params;

if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
}

const playlistDetails = await Playlist.findById(playlistId);

if (!playlistDetails) {
    throw new ApiError(404, "Playlist not found");
}

if (playlistDetails.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized access");
}

const { name, description, videos, isPublic } = req.body;

if (name !== undefined) playlistDetails.name = name;
if (description !== undefined) playlistDetails.description = description;

if (videos !== undefined) {
    if (!Array.isArray(videos)) {
        throw new ApiError(400, "Videos must be an array");
    }
    playlistDetails.videos = videos;
}

if (isPublic !== undefined) playlistDetails.isPublic = isPublic;

await playlistDetails.save();

return res.status(200).json(
    new ApiResponse(200, playlistDetails, "Playlist updated successfully")
);

});


const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;  
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }
    const videos=await Playlist.findById(playlistId).populate("videos") ;
    res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Playlist fetched successfully"
        )
    );
}   );

// using aggregation to get playlist by id
// const getPlaylistById = asyncHandler(async (req, res) => {
//     // 1. Get playlistId
//     const { playlistId } = req.params;

//     // 2. Validate ObjectId
//     if (!mongoose.isValidObjectId(playlistId)) {
//         throw new ApiError(400, "Invalid playlist id");
//     }

//     // 3. Aggregate
//     const playlist = await Playlist.aggregate([
//         {
//             $match: {
//                 _id: new mongoose.Types.ObjectId(playlistId),
//             },
//         },
//         {
//             $lookup: {
//                 from: "videos",
//                 localField: "videos",
//                 foreignField: "_id",
//                 as: "videos",
//             },
//         },
//     ]);

//     // 4. Check playlist exists
//     if (!playlist.length) {
//         throw new ApiError(404, "Playlist not found");
//     }

//     // 5. Return response
//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             playlist[0],
//             "Playlist fetched successfully"
//         )
//     );
// });

const copyplaylist = asyncHandler(async (req, res) => {

// 1. Get playlistId
// 2. Validate ObjectId
// 3. Find playlist
//      -> 404 if not found
// 4. Check playlist is public
//      -> 403 if private
// 5. Create new playlist
//      name = playlist.name
//      description = playlist.description
//      videos = playlist.videos
//      owner = req.user._id

// 6. Return copied playlist
    const { playlistId } = req.params;
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }   
    // 4. Check playlist is public
    if (!playlist.isPublic) {
        throw new ApiError(403, "This playlist is private");
    }

    // 5. Create a copy
    const copiedPlaylist = await Playlist.create({
        name: playlist.name,
        description: playlist.description,
        videos: playlist.videos,
        owner: req.user._id,
        isPublic: playlist.isPublic,
    });

    // 6. Return response
    return res.status(201).json(
        new ApiResponse(
            201,
            copiedPlaylist,
            "Playlist copied successfully"
        )
    );
});

export { createPlaylist, updateplaylist, getPlaylistById, copyplaylist };
