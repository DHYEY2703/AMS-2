import Subject from "../models/SubjectModel.js";
import ClassModel from "../models/ClassModel.js";

// Dummy timetable generation based on assigned subjects & classes
export const getTimetable = async (req, res) => {
    try {
        const { role, id, classId } = req.user;
        let schedule = [];

        // Timetable format we're mocking:
        // schedule: [{ day: "Monday", slots: [{ time: "10:00 AM", subject: "Math", class: "10A" }] }]

        if (role === "teacher") {
            const subjects = await Subject.find({ teacherId: id }).populate("classId", "name");

            const slots = subjects.map((subj, index) => ({
                id: index,
                time: `${9 + index}:00 AM - ${10 + index}:00 AM`,
                subject: subj.name,
                className: subj.classId?.name || "Unassigned Class",
                classId: subj.classId?._id,
                subjectId: subj._id,
            }));

            // Assume similar schedule for weekdays
            schedule = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => ({
                day,
                slots: slots
            }));

        } else if (role === "student") {
            if (!classId) return res.json([]);

            const subjects = await Subject.find({ classId }).populate("teacherId", "name");

            const slots = subjects.map((subj, index) => ({
                id: index,
                time: `${9 + index}:00 AM - ${10 + index}:00 AM`,
                subject: subj.name,
                teacherName: subj.teacherId?.name || "No Teacher",
            }));

            schedule = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => ({
                day,
                slots: slots
            }));
        }

        res.json(schedule);
    } catch (error) {
        console.error("Error generating timetable:", error);
        res.status(500).json({ message: "Server error" });
    }
};
