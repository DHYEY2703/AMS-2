import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useLanguageStore } from "../store/useLanguageStore";
import { axiosInstance } from "../lib/axios";

const StudentDashboard = () => {
  const { authUser: user } = useAuthStore();
  const { t } = useLanguageStore();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await axiosInstance.get("/attendance/report");
        setAttendanceData(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch attendance data");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [user]);

  // Calculate attendance summary
  const totalPresent = attendanceData.filter((entry) => entry.status === "Present").length;
  const totalAbsent = attendanceData.filter((entry) => entry.status === "Absent").length;
  const attendanceRate = attendanceData.length > 0 ? Math.round((totalPresent / attendanceData.length) * 100) : 0;

  return (
    <div>
      {user && user.name && user.name.length > 0 && (
        <>
          {/* Main Content */}
          <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
            {/* Greeting */}
            <section className="mb-8 glass-card p-6">
              <h2 className="text-3xl font-bold mb-2 tracking-wide text-white drop-shadow-md">Hi, {user.name}!</h2>
              <p className="text-neutral-400">{t("welcomeBack")} {t("studentDashboard")}.</p>
            </section>

            {loading ? (
              <p>{t("loading")}</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <>
                {/* Attendance Summary Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="glass-card flex flex-col items-center justify-center p-6 bg-gradient-to-br from-neutral-800/10 to-neutral-800/20">
                    <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-widest drop-shadow-sm">{t("totalPresent")}</h3>
                    <p className="mt-2 text-4xl font-black text-white drop-shadow-lg">{totalPresent}</p>
                    <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">{t("days")}</p>
                  </div>
                  <div className="glass-card flex flex-col items-center justify-center p-6 bg-gradient-to-br from-neutral-800/10 to-neutral-800/20">
                    <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-widest drop-shadow-sm">{t("totalAbsent")}</h3>
                    <p className="mt-2 text-4xl font-black text-neutral-300 shadow-xl drop-shadow-lg">{totalAbsent}</p>
                    <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">{t("days")}</p>
                  </div>
                  <div className="glass-card flex flex-col items-center justify-center p-6 bg-gradient-to-br from-neutral-800/10 to-neutral-800/20">
                    <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-widest drop-shadow-sm">{t("attendanceRate")}</h3>
                    <p className="mt-2 text-4xl font-black text-white drop-shadow-lg">{attendanceRate}%</p>
                  </div>
                </section>

                {/* Recent Attendance Log */}
                <section className="glass-card mb-8">
                  <h3 className="text-xl font-bold mb-6 tracking-wide drop-shadow-md text-white">{t("recentAttendance")}</h3>
                  <div className="space-y-4">
                    {attendanceData.slice(0, 5).map((entry, index) => {
                      let bgClass = "bg-white/5";
                      let borderClass = "border-neutral-700 block";
                      let textClass = "text-neutral-400";
                      
                      if (entry.status === "Present") {
                        bgClass = "bg-white/10"; borderClass = "border-white/20"; textClass = "text-white";
                      }
                      else if (entry.status === "Absent") {
                        bgClass = "bg-black/20"; borderClass = "border-neutral-800"; textClass = "text-neutral-500";
                      }

                      return (
                        <div key={index} className={`flex justify-between items-center p-4 rounded-2xl border ${bgClass} ${borderClass} transition-all hover:scale-[1.01]`}>
                          <span className="font-semibold text-neutral-300">{new Date(entry.date).toLocaleDateString()}</span>
                          <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${textClass} border ${borderClass}`}>
                            {entry.status === "Present" ? t("present") : t("absent")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {/* Profile Info */}
            <section className="glass-card mb-8">
              <h3 className="text-xl font-bold mb-6 tracking-wide drop-shadow-md text-white">{t("yourInfo")}</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <dt className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{t("student")}</dt>
                  <dd className="font-semibold text-xl text-white">{user.name}</dd>
                </div>
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <dt className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{t("class")}</dt>
                  <dd className="font-semibold text-xl text-white">{user.classId ? user.classId.name : t("noData")}</dd>
                </div>
              </dl>
            </section>
          </main>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
