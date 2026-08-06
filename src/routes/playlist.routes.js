import {createPlaylist, updateplaylist, getPlaylistById, copyplaylist} from "../controllers/playlist.controller.js"
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import mongoose from "mongoose";
const router = Router();


router.use(verifyJWT); 

router.route("/").post(createPlaylist);

router.route("/:playlistId").get(getPlaylistById);

// router.route("/:playlistId/videos/:videoId").post(addVideoToPlaylist);

router.route("/:playlistId/copy").post(copyplaylist);
router.route("/:playlistId/update").put(updateplaylist);
export default router;