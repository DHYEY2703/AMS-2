import Notification from "../models/NotificationModel.js";
import User from "../models/UserModel.js";

// Get notifications for the logged-in user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
    try {
        const notif = await Notification.findById(req.params.id);
        if (!notif) return res.status(404).json({ message: "Not found" });
        notif.read = true;
        await notif.save();
        res.json(notif);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Mark all notifications as read for the user
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all as read:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Helper: Create a notification (used by other controllers)
export const createNotification = async (userId, type, title, message, link = null) => {
    try {
        const notif = new Notification({ userId, type, title, message, link });
        await notif.save();
        return notif;
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

// Global search
export const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json({ users: [], classes: [] });

        const regex = new RegExp(q, "i");

        const users = await User.find({
            $or: [{ name: regex }, { email: regex }],
        })
            .select("name email role profilePic")
            .limit(10);

        const Class = (await import("../models/ClassModel.js")).default;
        const classes = await Class.find({ name: regex }).select("name").limit(5);

        res.json({ users, classes });
    } catch (error) {
        console.error("Error in global search:", error);
        res.status(500).json({ message: "Server error" });
    }
};
