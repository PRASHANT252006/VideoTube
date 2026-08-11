import {subscribed,unsubscribe,getSubscriberCount,getChannelSubscribers,checkSubscription} from "../controllers/subcription.controller.js";
import express from "express";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.use(verifyJWT);

router.route("/:channelId")
    .post(subscribed)
    .delete(unsubscribe);
router.route("/:channelId/count")
    .get(getSubscriberCount);
router.route("/:channelId/subscribers")
    .get(getChannelSubscribers);
router.route("/:channelId/check")
    .get(checkSubscription);

    export default router;