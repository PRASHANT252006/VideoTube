import express from "express";
import {
    createcomment,
    deletecomment,
    editcomment,
    getusercomment,
    getTargetComments
} from "../controllers/comment.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.use(verifyJWT);


// Create comment
router.route("/")
    .post(createcomment);


// Get comments of video/tweet
router.route("/target/:targetId")
    .get(getTargetComments);


// Get comments created by logged-in user
router.route("/user")
    .get(getusercomment);


// Edit and delete comment
router.route("/:commentId")
    .patch(editcomment)
    .delete(deletecomment);


export default router;