import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { Users, GraduationCap, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch parent's linked children
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await axiosInstance.get("/parent/children");
        setChildren(res.data);
        if (res.data.length > 0) {
          setSelectedChild(res.data[0]);
        }
      } catch (error) {
        toast.error("Failed to load your children's profiles.");
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  // Fetch specific child's attendance when selected
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedChild) return;
      try {
        const res = await axiosInstance.get(`/parent/children/${selectedChild._id}/attendance`);
        setAttendance(res.data);
      } catch (error) {
        toast.error(`Failed to load attendance for ${selectedChild.name}`);
      }
    };
    fetchAttendance();
  }, [selectedChild]);

  if (loading) return <div className="text-white p-8">Loading your dashboard...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-4 text-white drop-shadow-md">
        <Users className="w-10 h-10 text-neutral-400" />
        <div>
          <h2 className="text-3xl font-bold tracking-wide">Parent Portal</h2>
          <p className="text-neutral-400 text-sm">Monitor your child's academic attendance.</p>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="glass-card p-8 text-center text-neutral-400">
          No children are currently linked to your account. Please contact the administrator.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Children Selection Sidebar */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Your Children</h3>
            {children.map((child) => (
              <button
                key={child._id}
                onClick={() => setSelectedChild(child)}
                className={`text-left p-4 rounded-3xl transition-all border ${
                  selectedChild?._id === child._id
                    ? "bg-white/20 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)] text-white"
                    : "glass-card border-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className={`w-6 h-6 ${selectedChild?._id === child._id ? "text-white" : "text-neutral-500"}`} />
                  <span className="font-bold tracking-wide">{child.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Data Display Panel */}
          <div className="md:col-span-3">
            {selectedChild && (
              <div className="glass-card flex flex-col gap-6 h-full">
                <h3 className="text-2xl font-bold tracking-wide text-white drop-shadow-md flex items-center gap-3">
                   <CalendarDays className="w-6 h-6 text-neutral-400" />
                   Attendance Record for {selectedChild.name}
                </h3>

                {attendance.length === 0 ? (
                  <p className="text-neutral-500 italic">No attendance records found yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-3xl border border-white/10 shadow-[8px_8px_32px_rgba(0,0,0,0.5)]">
                    <table className="w-full text-left border-collapse backdrop-blur-xl bg-neutral-900/40">
                      <thead>
                        <tr className="bg-neutral-800/60 uppercase text-xs tracking-widest text-neutral-400 border-b border-white/10">
                          <th className="p-4 font-bold">Date</th>
                          <th className="p-4 font-bold">Class</th>
                          <th className="p-4 font-bold">Subject</th>
                          <th className="p-4 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {attendance.map((record, index) => (
                          <tr key={index} className="transition-colors hover:bg-white-[0.02]">
                            <td className="p-4 font-medium text-neutral-300">
                               {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-neutral-400">{record.className}</td>
                            <td className="p-4 text-neutral-400">{record.subjectName || "N/A"}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                                record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
