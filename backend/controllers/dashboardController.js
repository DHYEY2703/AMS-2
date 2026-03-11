import Class from '../models/ClassModel.js';
import AttendanceModel from '../models/AttendanceModels.js';

export const getDashboardData = async (req, res) => {
  try {
    // Fetch all classes
    const classes = await Class.find();

    // Fetch attendance records grouped by classId and date
    const attendanceRecords = await AttendanceModel.find();

    // Calculate attendance percentage per class
    const classAttendanceMap = {};

    classes.forEach(cls => {
      classAttendanceMap[cls._id.toString()] = {
        name: cls.name,
        totalRecords: 0,
        presentCount: 0,
      };
    });

    attendanceRecords.forEach(record => {
      const classIdStr = record.classId.toString();
      if (classAttendanceMap[classIdStr]) {
        record.records.forEach(r => {
          classAttendanceMap[classIdStr].totalRecords += 1;
          if (r.status === 'Present') {
            classAttendanceMap[classIdStr].presentCount += 1;
          }
        });
      }
    });

    // Prepare classes array with attendance percentage
    const classesWithAttendance = Object.values(classAttendanceMap).map(cls => {
      const attendance = cls.totalRecords > 0 ? Math.round((cls.presentCount / cls.totalRecords) * 100) : 0;
      return {
        name: cls.name,
        attendance,
      };
    });

    // Prepare chart data for line chart - attendance over last 4 months (example)
    // Group attendance by month and calculate average attendance percentage per month
    const monthLabels = [];
    const monthAttendanceMap = {};

    // Get last 4 months labels
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'long' });
      monthLabels.push(label);
      monthAttendanceMap[label] = { present: 0, total: 0 };
    }

    attendanceRecords.forEach(record => {
      const recordDate = new Date(record.date);
      const label = recordDate.toLocaleString('default', { month: 'long' });
      if (monthAttendanceMap[label]) {
        record.records.forEach(r => {
          monthAttendanceMap[label].total += 1;
          if (r.status === 'Present') {
            monthAttendanceMap[label].present += 1;
          }
        });
      }
    });

    const attendanceData = monthLabels.map(label => {
      const data = monthAttendanceMap[label];
      return data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
    });

    const chartData = {
      labels: monthLabels,
      datasets: [
        {
          label: 'Attendance',
          data: attendanceData,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderColor: 'rgba(255,255,255,1)',
          fill: true,
        },
      ],
    };

    // Placeholder activities - could be enhanced to fetch real activities
    const activities = [
      { id: 1, message: 'Student A marked present', date: new Date() },
      { id: 2, message: 'Student B marked absent', date: new Date() },
    ];

    res.json({ classes: classesWithAttendance, chartData, activities });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
