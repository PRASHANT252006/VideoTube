import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["like", "comment", "subscribe", "tweet"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);