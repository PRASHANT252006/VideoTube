import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
    getAllVideosOwner,
    uploadVideo,
    getAllPublishedVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";

const router = Router();

router.use(verifyJWT);

// Upload new video
router.post(
    "/upload",
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    uploadVideo
);


// Get all videos of logged-in user
router.get(
    "/my-videos",
    getAllVideosOwner
);


// Get all published videos
router.get(
    "/published",
    getAllPublishedVideos
);


// Get single video by id
router.get(
    "/:videoId",
    getVideoById
);


// Update video details
router.patch(
    "/:videoId",
    upload.single("thumbnail"),   // if thumbnail update is allowed
    updateVideo
);


// Delete video
router.delete(
    "/:videoId",
    deleteVideo
);


// Toggle publish/unpublish status
router.patch(
    "/:videoId/toggle-publish",
    togglePublishStatus
);


export default router;