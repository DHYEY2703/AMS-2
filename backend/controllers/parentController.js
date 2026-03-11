import User from "../models/UserModel.js";
import Attendance from "../models/AttendanceModels.js";
import ClassModel from "../models/ClassModel.js";

// Get all children linked to the logged-in parent
export const getMyChildren = async (req, res) => {
    try {
        const parentId = req.user.id;
        const parent = await User.findById(parentId).populate("children");

        if (!parent || parent.role !== "parent") {
            return res.status(403).json({ message: "Access denied. Parent only." });
        }

        res.status(200).json(parent.children);
    } catch (error) {
        console.error("Error fetching children:", error);
        res.status(500).json({ message: "Server error fetching children" });
    }
};

// Get attendance for a specific child
export const getChildAttendance = async (req, res) => {
    try {
        const parentId = req.user.id;
        const { childId } = req.params;

        // Verify this is their child
        const parent = await User.findById(parentId);
        if (!parent.children.includes(childId)) {
            return res.status(403).json({ message: "Not authorized to view this student's data." });
        }

        const attendanceDocs = await Attendance.find({ "records.studentId": childId })
            .populate("classId", "name")
            .populate("subjectId", "name");

        const attendanceRecords = attendanceDocs.map(doc => {
            const record = doc.records.find(r => r.studentId.toString() === childId.toString());
            return {
                classId: doc.classId,
                className: doc.classId.name,
                subjectName: doc.subjectId ? doc.subjectId.name : null,
                date: doc.date,
                status: record ? record.status : "Absent"
            };
        });

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching child attendance:", error);
        res.status(500).json({ message: "Server error fetching attendance" });
    }
};
