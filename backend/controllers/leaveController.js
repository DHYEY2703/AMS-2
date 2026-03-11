import Leave from "../models/LeaveModel.js";

// Apply for leave (Student only)
export const applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;
        const studentId = req.user.id;
        const classId = req.user.classId;

        if (!startDate || !endDate || !reason) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        const leave = new Leave({
            studentId,
            classId,
            startDate,
            endDate,
            reason,
            status: "Pending"
        });

        await leave.save();
        res.status(201).json(leave);
    } catch (error) {
        console.error("Error applying for leave:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get leaves based on role
export const getLeaves = async (req, res) => {
    try {
        const { role, id, classId } = req.user;
        let leaves = [];

        if (role === "student") {
            // Student sees only their own leaves
            leaves = await Leave.find({ studentId: id }).populate("studentId", "name email").sort({ createdAt: -1 });
        } else if (role === "teacher") {
            // Teacher sees leaves for their classes (Wait, user.classId might not be enough if a teacher has multiple classes, but going by existing logic, teacher logs in and has access to their class/subjects. Let's just fetch all leaves for the teacher's classId if provided, or return all if we iterate).
            // If we just want all leaves for now or filter by class:
            if (classId) {
                leaves = await Leave.find({ classId }).populate("studentId", "name email").populate("classId", "name").sort({ createdAt: -1 });
            } else {
                // Generic access
                leaves = await Leave.find().populate("studentId", "name email").populate("classId", "name").sort({ createdAt: -1 });
            }
        } else if (role === "admin") {
            // Admin sees all leaves
            leaves = await Leave.find().populate("studentId", "name email").populate("classId", "name").sort({ createdAt: -1 });
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

        res.json(leave);
    } catch (error) {
        console.error("Error updating leave:", error);
        res.status(500).json({ message: "Server error" });
    }
};
