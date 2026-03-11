import Attendance from '../models/AttendanceModels.js';
import User from '../models/UserModel.js';
import { sendAttendanceEmail } from '../lib/mailService.js';
import mongoose from 'mongoose';
import AuditLog from '../models/AuditLogModel.js';

export const markAttendance = async (req, res) => {
  try {
    const { classId, subjectId, date, attendance } = req.body;

    // Find existing attendance document for class, subject, and date
    const query = { classId, date };
    if (subjectId) query.subjectId = subjectId;
    let attendanceDoc = await Attendance.findOne(query);

    if (attendanceDoc) {
      const auditLogsToInsert = [];

      attendance.forEach((newRecord) => {
        const oldRecord = attendanceDoc.records.find(
          (r) => r.studentId.toString() === newRecord.studentId.toString()
        );
        const formattedNewStatus = newRecord.status.charAt(0).toUpperCase() + newRecord.status.slice(1).toLowerCase();

        if (oldRecord && oldRecord.status !== formattedNewStatus) {
          auditLogsToInsert.push({
            action: "ATTENDANCE_CHANGED",
            performedBy: req.user._id,
            studentId: newRecord.studentId,
            classId,
            subjectId: subjectId || null,
            date,
            oldStatus: oldRecord.status,
            newStatus: formattedNewStatus
          });
        }
      });

      if (auditLogsToInsert.length > 0) {
        await AuditLog.insertMany(auditLogsToInsert);
      }

      // Update records array
      attendanceDoc.records = attendance.map((record) => ({
        studentId: record.studentId,
        status: record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase(),
      }));
    } else {
      // Create new attendance document
      const newDocParams = {
        classId,
        date,
        records: attendance.map((record) => ({
          studentId: record.studentId,
          status: record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase(),
        })),
      };
      if (subjectId) newDocParams.subjectId = subjectId;
      attendanceDoc = new Attendance(newDocParams);
    }

    await attendanceDoc.save();

    // Check for absent students to send email
    // This is optional and requires process.env.EMAIL_USER & process.env.EMAIL_PASS
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      attendance.forEach(async (record) => {
        if (record.status.toLowerCase() === 'absent') {
          try {
            const student = await User.findById(record.studentId);
            if (student && student.email) {
              const subjectName = subjectId ? (await mongoose.model('Subject').findById(subjectId))?.name : "their class";
              await sendAttendanceEmail(student.email, student.name, subjectName, date, "Absent");
            }
          } catch (err) {
            console.error("Failed to process email for absentee", err);
          }
        }
      });
    }

    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const studentId = req.user._id;
    console.log("Fetching attendance report for studentId:", studentId);

    // Find attendance documents where records.studentId matches studentId
    const attendanceDocs = await Attendance.find({ "records.studentId": studentId })
      .populate('classId', 'name')
      .populate('subjectId', 'name');

    // Extract attendance records for the student
    const studentAttendance = attendanceDocs.map((doc) => {
      const record = doc.records.find((r) => r.studentId.toString() === studentId.toString());
      return {
        classId: doc.classId,
        className: doc.classId.name,
        subjectName: doc.subjectId ? doc.subjectId.name : null,
        date: doc.date,
        status: record ? record.status : "Absent",
      };
    });

    console.log("Attendance records found:", studentAttendance.length);
    res.json(studentAttendance);
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    // Aggregate attendance data grouped by classId
    const summary = await Attendance.aggregate([
      {
        $unwind: "$records"
      },
      {
        $group: {
          _id: "$classId",
          totalRecords: { $sum: 1 },
          presentCount: {
            $sum: {
              $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "_id",
          as: "classInfo"
        }
      },
      {
        $unwind: "$classInfo"
      },
      {
        $project: {
          _id: 0,
          classId: "$_id",
          name: "$classInfo.name",
          attendance: {
            $multiply: [
              { $divide: ["$presentCount", "$totalRecords"] },
              100
            ]
          }
        }
      }
    ]);

    res.json(summary);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
