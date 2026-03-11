import AuditLog from "../models/AuditLogModel.js";

export const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate("performedBy", "name email role")
            .populate("studentId", "name email")
            .populate("classId", "name")
            .populate("subjectId", "name")
            .sort({ timestamp: -1 })
            .limit(100); // Limit to recent 100 logs for performance

        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).json({ message: "Server error" });
    }
};
