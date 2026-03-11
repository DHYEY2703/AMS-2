import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  date: { type: Date, default: Date.now },
  records: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["Present", "Absent"] },
    },
  ],
});
const AttendanceModel = mongoose.model("Attendance", AttendanceSchema);
export default AttendanceModel;