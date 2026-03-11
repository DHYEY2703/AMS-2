import Attendance from '../models/AttendanceModels.js';
import User from '../models/UserModel.js';
import { sendAttendanceEmail } from '../lib/mailService.js';
import { sendAbsentSms } from '../lib/smsService.js';
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

    // Check for absent students to send email & SMS
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      attendance.forEach(async (record) => {
        if (record.status.toLowerCase() === 'absent') {
          try {
            const student = await User.findById(record.studentId);
            if (student) {
              const subjectName = subjectId ? (await mongoose.model('Subject').findById(subjectId))?.name : "their class";

              // Send Email to Student
              if (student.email) {
                await sendAttendanceEmail(student.email, student.name, subjectName, date, "Absent");
              }

              // Formal Warning Logic: Missed 3 days in a row?
              const consecutiveAbsences = await Attendance.find({
                classId,
                date: { $lt: date },
                "records": { $elemMatch: { studentId: student._id, status: { $regex: /^absent$/i } } }
              }).sort({ date: -1 }).limit(2);

              const isConsecutiveWarning = consecutiveAbsences.length === 2;

              // Find Parent and send SMS and Email
              const parents = await User.find({ role: "parent", children: student._id });
              parents.forEach(async (parent) => {
                if (parent.phoneNumber) {
                  await sendAbsentSms(parent.phoneNumber, student.name, subjectName, date);
                }
                if (parent.email) {
                  if (isConsecutiveWarning) {
                    // Automated Warning simulation
                    await sendAttendanceEmail(parent.email, parent.name + " (Formal Warning PDF attached for " + student.name + ")", subjectName, date, "3 CONSECUTIVE ABSENCES WARNING");
                  } else {
                    await sendAttendanceEmail(parent.email, parent.name + " (" + student.name + "'s Parent)", subjectName, date, "Absent");
                  }
                }
              });
            }
          } catch (err) {
            console.error("Failed to process notifications for absentee", err);
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
    const userId = req.user._id;
    const role = req.user.role;
    console.log(`Fetching attendance report for ${role}:`, userId);

    let query = {};
    if (role === "student") {
      query = { "records.studentId": userId };
    }

    const attendanceDocs = await Attendance.find(query)
      .populate('classId', 'name')
      .populate('subjectId', 'name')
      .populate('records.studentId', 'name email');

    // Extract attendance records
    const studentAttendance = [];
    attendanceDocs.forEach((doc) => {
      doc.records.forEach((record) => {
        if (role === "admin" || (role === "student" && record.studentId && record.studentId._id.toString() === userId.toString())) {
          if (record.studentId) {
            studentAttendance.push({
              studentName: record.studentId.name,
              studentEmail: record.studentId.email,
              classId: doc.classId?._id,
              className: doc.classId?.name,
              subjectName: doc.subjectId ? doc.subjectId.name : null,
              date: doc.date,
              status: record.status || "Absent",
            });
          }
        }
      });
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
    // ... logic remains unchanged for getAttendanceSummary ...
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

export const getAttendanceRecord = async (req, res) => {
  try {
    const { classId, subjectId, date } = req.query;

    // Build query to find the specific record
    const query = { classId, date };
    if (subjectId) {
      query.subjectId = subjectId;
    }

    const attendanceDoc = await Attendance.findOne(query);

    if (attendanceDoc) {
      return res.json(attendanceDoc);
    } else {
      // Return empty 200 indicating no record exists yet
      return res.status(200).json(null);
    }
  } catch (err) {
    console.error("Error fetching existing record:", err);
    res.status(500).json({ message: "Server error checking existing records" });
  }
};
