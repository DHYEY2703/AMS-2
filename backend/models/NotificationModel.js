import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["leave_request", "leave_status", "absent_alert", "announcement", "general"],
        default: "general",
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    link: {
        type: String,
        default: null,
    },
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
