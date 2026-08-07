import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {getAllVideosOwner,
    uploadVideo,
    getAllPublishedVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus } from "../controllers/video.controller.js";
    

const router = Router();
router.use(verifyJWT);

router.post(
    "/upload",
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    uploadVideo
);

router.get(
    "/my-videos",
    getAllVideosOwner
);

router.get(
    "/published",
    getAllPublishedVideos
);

router.get(
    "/:videoId",
    getVideoById
);

router.patch(
    "/:videoId",
    updateVideo
);

router.delete(
    "/:videoId",
    deleteVideo
);

router.patch(
    "/toggle/:videoId",
    togglePublishStatus
);

export default router;