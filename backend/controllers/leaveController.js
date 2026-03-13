import Leave from "../models/LeaveModel.js";
import User from "../models/UserModel.js";
import { createNotification } from "./notificationController.js";

// Apply for leave
export const applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;
        const userId = req.user.id || req.user._id;
        const role = req.user.role;
        const classId = req.user.classId || null;

        if (!startDate || !endDate || !reason) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        const leaveParams = {
            userId,
            role,
            startDate,
            endDate,
            reason,
            status: "Pending"
        };

        if (role === "student" && classId) {
            leaveParams.classId = classId;
        }

        const leave = new Leave(leaveParams);
        await leave.save();

        // Notify all admins about the new leave request
        try {
            const admins = await User.find({ role: "admin" });
            for (const admin of admins) {
                await createNotification(
                    admin._id,
                    "leave_request",
                    `New Leave Request`,
                    `${req.user.name} (${role}) has requested leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
                    "/leaves"
                );
            }
        } catch (e) {
            console.error("Failed to create leave notification:", e);
        }

        res.status(201).json(leave);
    } catch (error) {
        console.error("Error applying for leave:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get leaves based on role
export const getLeaves = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id || req.user._id;
        const classId = req.user.classId;

        let leaves = [];

        if (role === "student") {
            // Student sees only their own leaves
            leaves = await Leave.find({ userId }).populate("userId", "name email").sort({ createdAt: -1 });
        } else if (role === "teacher") {
            // Teacher sees their own leaves AND leaves of their class
            if (classId) {
                leaves = await Leave.find({ $or: [{ userId }, { classId }] }).populate("userId", "name email").populate("classId", "name").sort({ createdAt: -1 });
            } else {
                leaves = await Leave.find({ userId }).populate("userId", "name email").sort({ createdAt: -1 });
            }
        } else if (role === "admin") {
            // Admin sees all leaves
            leaves = await Leave.find().populate("userId", "name email").populate("classId", "name").sort({ createdAt: -1 });
        }

        res.json(leaves);
    } catch (error) {
        console.error("Error fetching leaves:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update leave status (Teacher / Admin)
export const updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const leaveId = req.params.id;

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const leave = await Leave.findById(leaveId);
        if (!leave) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        leave.status = status;
        await leave.save();

        // Notify the user about the decision
        try {
            await createNotification(
                leave.userId,
                "leave_status",
                `Leave ${status}`,
                `Your leave request has been ${status.toLowerCase()} by the admin.`,
                "/leaves"
            );
        } catch (e) {
            console.error("Failed to create status notification:", e);
        }

        res.json(leave);
    } catch (error) {
        console.error("Error updating leave:", error);
        res.status(500).json({ message: "Server error" });
    }
};
