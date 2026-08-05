import express from "express";
import {
    createcomment,
    deletecomment,
    editcomment,
    getusercomment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/")
    .post(createcomment)
    .get(getusercomment);

router.route("/:commentId")
    .patch(editcomment)
    .delete(deletecomment);

export default router;