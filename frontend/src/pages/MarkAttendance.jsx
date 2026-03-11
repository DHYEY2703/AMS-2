import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import AttendanceTable from "../components/AttendanceTable";
import ProgressBars from "../components/Progressbars";
import ActivityFeed from "../components/ActivityFeed";
import BarChart from "../components/BarChart";

const MarkAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [activities, setActivities] = useState([]);
  const [lineChartData, setLineChartData] = useState(null);
  const [existingRecord, setExistingRecord] = useState(null);
  const [fetchingRecord, setFetchingRecord] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosInstance.get("/classes");
        setClasses(res.data);
        if (res.data.length > 0 && selectedClass !== res.data[0]._id) {
          setSelectedClass(res.data[0]._id);
        }
      } catch (err) {
        setError("Failed to load classes.");
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClass) {
        setSubjects([]);
        setSelectedSubject(null);
        return;
      }
      try {
        const res = await axiosInstance.get(`/subjects/class/${selectedClass}`);
        setSubjects(res.data);
        if (res.data.length > 0) {
          setSelectedSubject(res.data[0]._id);
        } else {
          setSelectedSubject(null);
        }
      } catch (err) {
        setError("Failed to load subjects.");
      }
    };
    fetchSubjects();
  }, [selectedClass]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return;
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/classes/${selectedClass}/students`);
        setStudents(res.data);
      } catch (err) {
        setError("Failed to load students.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  // Fetch Existing Record to pre-fill table if updating past date
  useEffect(() => {
     const checkExistingRecord = async () => {
        if (!selectedClass || !date) return;
        setFetchingRecord(true);
        try {
           let queryUrl = `/attendance/record?classId=${selectedClass}&date=${date}`;
           if (selectedSubject) queryUrl += `&subjectId=${selectedSubject}`;
           const res = await axiosInstance.get(queryUrl);
           setExistingRecord(res.data ? res.data.records : null);
        } catch (err) {
           console.error("Failed to fetch existing record");
           setExistingRecord(null);
        } finally {
           setFetchingRecord(false);
        }
     };
     checkExistingRecord();
  }, [selectedClass, selectedSubject, date]);

  const fetchAttendanceSummary = async () => {
    try {
      const res = await axiosInstance.get("/attendance/summary");
      setAttendanceSummary(res.data);

      // Prepare line chart data from attendance summary
      const labels = res.data.map((cls) => cls.name);
      const data = {
        labels,
        datasets: [
          {
            label: "Attendance %",
            data: res.data.map((cls) => cls.attendance),
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      };
      setLineChartData(data);
    } catch (err) {
      console.error("Failed to fetch attendance summary:", err);
    }
  };

  useEffect(() => {
    fetchAttendanceSummary();
  }, []);

  const handleSubmit = async (attendanceData) => {
    try {
      // Transform attendanceData object to array of {studentId, status}
      const attendanceArray = Object.entries(attendanceData).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      await axiosInstance.post("/attendance/mark", {
        classId: selectedClass,
        subjectId: selectedSubject || undefined,
        date,
        attendance: attendanceArray,
      });

      setSuccessMessage("Attendance marked successfully.");
      setError(null);

      // Update attendance summary, activities, and line chart data
      fetchAttendanceSummary();
      setActivities((prev) => [
        { message: `Attendance marked for class ${selectedClass}${selectedSubject ? ` / subject ${selectedSubject}` : ''} on ${date}` },
        ...prev,
      ]);
    } catch (err) {
      setError("Failed to submit attendance.");
      setSuccessMessage(null);
    }
  };

  return (
    <div className="glass-card flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold mb-2 tracking-wide text-white drop-shadow-md">Mark Attendance</h2>

      {error && <div className="text-red-400 font-semibold mb-2">{error}</div>}
      {successMessage && <div className="text-green-400 font-semibold mb-2">{successMessage}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-semibold text-neutral-300 tracking-wider text-sm uppercase">Select Class</label>
          <select
            value={selectedClass || ""}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="glass-input w-full"
          >
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id} className="text-black bg-white">
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {subjects.length > 0 && (
          <div>
            <label className="block mb-2 font-semibold text-neutral-300 tracking-wider text-sm uppercase">Select Subject</label>
            <select
              value={selectedSubject || ""}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="glass-input w-full"
            >
              {subjects.map((subj) => (
                <option key={subj._id} value={subj._id} className="text-black bg-white">
                  {subj.name} {subj.teacherId ? `(${subj.teacherId.name})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block mb-2 font-semibold text-neutral-300 tracking-wider text-sm uppercase">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="glass-input w-full [&::-webkit-calendar-picker-indicator]:filter-invert"
          />
        </div>
      </div>

      {loading || fetchingRecord ? (
        <div className="text-neutral-400 font-medium">Loading {fetchingRecord ? 'existing records' : 'students'}...</div>
      ) : (
        <AttendanceTable
          students={students}
          onSubmit={handleSubmit}
          existingRecord={existingRecord}
        />
      )}

      <ProgressBars classes={attendanceSummary} />
      {/* <LineChart data={lineChartData} /> */}
      <ActivityFeed activities={activities} />
    </div>
  );
};

export default MarkAttendance;
