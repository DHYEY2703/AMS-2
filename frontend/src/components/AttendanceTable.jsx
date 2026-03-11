import { useState } from "react";

const AttendanceTable = ({ students, onSubmit }) => {
  const [attendanceStatus, setAttendanceStatus] = useState({});

  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(attendanceStatus);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="overflow-x-auto rounded-3xl border border-white/10 shadow-[8px_8px_32px_rgba(0,0,0,0.5)]">
        <table className="w-full text-left border-collapse backdrop-blur-xl bg-neutral-900/40">
          <thead>
            <tr className="bg-neutral-800/60 uppercase text-xs tracking-widest text-neutral-400 border-b border-white/10">
              <th className="p-4 font-bold">Student</th>
              <th className="p-4 font-bold">Class</th>
              <th className="p-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-6 text-center text-neutral-500 font-medium">No students found in this class.</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} className="transition-colors hover:bg-white-[0.02]">
                  <td className="p-4 font-semibold text-neutral-200">{student.name}</td>
                  <td className="p-4 text-neutral-400">{student.classId?.name || "N/A"}</td>
                  <td className="p-4 flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${attendanceStatus[student._id] === "present" ? "border-white bg-white" : "border-neutral-500 group-hover:border-neutral-300"}`}>
                        {attendanceStatus[student._id] === "present" && <div className="w-2 h-2 rounded-full bg-black"></div>}
                      </div>
                      <input
                        type="radio"
                        name={`status-${student._id}`}
                        value="present"
                        className="hidden"
                        checked={attendanceStatus[student._id] === "present"}
                        onChange={() => handleStatusChange(student._id, "present")}
                        required
                      />
                      <span className={`font-semibold transition-colors ${attendanceStatus[student._id] === "present" ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"}`}>Present</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${attendanceStatus[student._id] === "absent" ? "border-neutral-400 bg-neutral-400" : "border-neutral-600 group-hover:border-neutral-500"}`}>
                        {attendanceStatus[student._id] === "absent" && <div className="w-2 h-2 rounded-full bg-black"></div>}
                      </div>
                      <input
                        type="radio"
                        name={`status-${student._id}`}
                        value="absent"
                        className="hidden"
                        checked={attendanceStatus[student._id] === "absent"}
                        onChange={() => handleStatusChange(student._id, "absent")}
                        required
                      />
                      <span className={`font-semibold transition-colors ${attendanceStatus[student._id] === "absent" ? "text-neutral-300" : "text-neutral-600 group-hover:text-neutral-500"}`}>Absent</span>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="glass-button"
        >
          Submit Attendance
        </button>
      </div>
    </form>
  );
};

export default AttendanceTable;
