import { Router } from "express";
import { 
    toggleVideoLike,
   getVideoById
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);


// Like / Unlike video
router.route("/:videoId")
    .post(toggleVideoLike);


// Get like count
router.route("/:id/count")
    .get(getVideoById);


export default router;