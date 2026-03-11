import { useState, useEffect } from "react";
import AttendanceReportTable from "../components/AttendanceReportTable";
import { axiosInstance } from "../lib/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Download, FileText } from "lucide-react";

const AttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceReport = async () => {
      try {
        const res = await axiosInstance.get("/attendance/report");
        console.log("Attendance report response data:", res.data);
        if (Array.isArray(res.data)) {
          setAttendanceData(res.data);
        } else {
          console.error("Unexpected attendance report data format:", res.data);
          setError("Unexpected data format received from server.");
          setAttendanceData([]);
        }
      } catch {
        setError("Failed to fetch attendance report.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceReport();
  }, []);

  if (loading) return <div>Loading attendance report...</div>;
  if (error) return <div>{error}</div>;

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Report", 14, 15);
    
    const tableColumn = ["Class", "Subject", "Date", "Status"];
    const tableRows = [];

    attendanceData.forEach(record => {
      const rowData = [
        record.className || "N/A",
        record.subjectName || "N/A",
        new Date(record.date).toLocaleDateString(),
        record.status
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
    });
    
    doc.save("attendance_report.pdf");
  };

  const exportToExcel = () => {
    const tableData = attendanceData.map(record => ({
      Class: record.className || "N/A",
      Subject: record.subjectName || "N/A",
      Date: new Date(record.date).toLocaleDateString(),
      Status: record.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AttendanceReport");
    XLSX.writeFile(workbook, "attendance_report.xlsx");
  };

  return (
    <div className="glass-card flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <h2 className="text-3xl font-bold tracking-wide text-white drop-shadow-md">Attendance Report</h2>
        {attendanceData.length > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={exportToPDF}
              className="glass-button text-xs py-2 px-4 flex items-center gap-2 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border-red-500/20"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
            <button 
              onClick={exportToExcel}
              className="glass-button text-xs py-2 px-4 flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-200 hover:text-white border-emerald-500/20"
            >
              <Download className="w-4 h-4" /> Excel
            </button>
          </div>
        )}
      </div>
      {attendanceData.length === 0 ? (
        <p className="text-neutral-400 font-medium">No attendance data available.</p>
      ) : (
        <AttendanceReportTable attendanceRecords={attendanceData} />
      )}
    </div>
  );
};

export default AttendanceReport;
