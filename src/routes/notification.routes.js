import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from "../controllers/notification.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(createNotification)
    .get(getNotifications);

router.route("/read-all")
    .patch(markAllNotificationsAsRead);

router.route("/:notificationId")
    .patch(markNotificationAsRead)
    .delete(deleteNotification);

export default router;