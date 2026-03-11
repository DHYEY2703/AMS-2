import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g., "ATTENDANCE_UPDATED"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The teacher/admin making the change
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // The student whose attendance was changed
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    date: { type: Date }, // The date of the attendance record
    oldStatus: { type: String }, // Present/Absent
    newStatus: { type: String }, // Present/Absent
    timestamp: { type: Date, default: Date.now },
});

const AuditLogModel = mongoose.model("AuditLog", AuditLogSchema);
export default AuditLogModel;
