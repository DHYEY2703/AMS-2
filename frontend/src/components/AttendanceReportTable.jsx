const AttendanceReportTable = ({ attendanceRecords }) => {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    return <p>No attendance records available.</p>;
  }

  const hasStudentName = attendanceRecords.length > 0 && attendanceRecords[0].studentName;

  return (
    <div className="overflow-x-auto rounded-3xl border border-white/10 shadow-[8px_8px_32px_rgba(0,0,0,0.5)]">
      <table className="w-full text-left border-collapse backdrop-blur-xl bg-neutral-900/40 min-w-[600px]">
        <thead>
          <tr className="bg-neutral-800/60 uppercase text-xs tracking-widest text-neutral-400 border-b border-white/10">
            {hasStudentName && <th className="p-4 font-bold">Student</th>}
            <th className="p-4 font-bold">Class</th>
            <th className="p-4 font-bold">Subject</th>
            <th className="p-4 font-bold">Date</th>
            <th className="p-4 font-bold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {attendanceRecords.map((record, index) => (
            <tr key={index} className="transition-colors hover:bg-white-[0.02]">
              {hasStudentName && <td className="p-4 text-neutral-100 font-bold">{record.studentName}</td>}
              <td className="p-4 text-neutral-200 font-semibold">{record.className || "N/A"}</td>
              <td className="p-4 text-neutral-400">{record.subjectName || "N/A"}</td>
              <td className="p-4 text-neutral-300">{new Date(record.date).toLocaleDateString()}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border ${
                  record.status === 'Present' 
                    ? 'bg-white/10 text-white border-white/20' 
                    : 'bg-black/20 text-neutral-500 border-neutral-800'
                }`}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceReportTable;
