import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getUserProfile,
    updateAccountProfile,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannel,
    getWatchHistory
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public Routes
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }, // Use the same name everywhere
    ]),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected Routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/current-user").get(
    verifyJWT,
    getUserProfile
);

router.route("/change-password").post(
    verifyJWT,
    changeCurrentPassword
);

router.route("/update-account").patch(
    verifyJWT,
    updateAccountProfile
);

router.route("/avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
);

router.route("/cover-image").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);

router.route("/history").get(
    verifyJWT,
    getWatchHistory
);

// Channel Routes
router.route("/c/:username").get(
    verifyJWT,
    getUserChannel
);

// Public Channel Route
router.route("/:username").get(getUserChannel);

export default router;