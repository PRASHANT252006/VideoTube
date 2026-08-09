import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";
import mongoose from "mongoose";

// Create Notification
const createNotification = asyncHandler(async (req, res) => {
    const { receiver, type, message, referenceId } = req.body;

    if (!receiver || !type || !message) {
        throw new ApiError(400, "All required fields are mandatory");
    }

    const notification = await Notification.create({
        receiver,
        sender: req.user._id,
        type,
        message,
        referenceId
    });

    return res.status(201).json(
        new ApiResponse(201, notification, "Notification created successfully")
    );
});

// Get Logged-in User Notifications
const getNotifications = asyncHandler(async (req, res) => {

    const notifications = await Notification.find({
        receiver: req.user._id
    })
        .populate("sender", "username fullName avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, notifications, "Notifications fetched successfully")
    );
});

// Mark One Notification as Read
const markNotificationAsRead = asyncHandler(async (req, res) => {

    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new ApiError(400, "Invalid notification id");
    }

    const notification = await Notification.findOneAndUpdate(
        {
            _id: notificationId,
            receiver: req.user._id
        },
        {
            isRead: true
        },
        {
            new: true
        }
    );

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return res.status(200).json(
        new ApiResponse(200, notification, "Notification marked as read")
    );
});

// Mark All Notifications as Read
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {

    await Notification.updateMany(
        {
            receiver: req.user._id,
            isRead: false
        },
        {
            $set: {
                isRead: true
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "All notifications marked as read")
    );
});

// Delete Notification
const deleteNotification = asyncHandler(async (req, res) => {

    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new ApiError(400, "Invalid notification id");
    }

    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        receiver: req.user._id
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Notification deleted successfully")
    );
});

export {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
};