import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { ShieldAlert, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axiosInstance.get("/audit-logs");
        setLogs(res.data);
      } catch (error) {
        toast.error("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <div>Loading logs...</div>;

  return (
    <div className="glass-card flex flex-col gap-6 max-w-6xl mx-auto w-full p-4 sm:p-8">
      <div className="flex items-center gap-3 mb-2 text-white">
        <ShieldAlert className="w-8 h-8 text-neutral-400" />
        <h2 className="text-3xl font-bold tracking-wide drop-shadow-md">Audit Logs</h2>
      </div>
      <p className="text-neutral-400">Security and history tracking for attendance modifications.</p>

      {logs.length === 0 ? (
        <p className="text-neutral-500 italic">No attendance modifications found.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10 shadow-[8px_8px_32px_rgba(0,0,0,0.5)]">
          <table className="w-full text-left border-collapse backdrop-blur-xl bg-neutral-900/40 min-w-[800px]">
            <thead>
              <tr className="bg-neutral-800/60 uppercase text-xs tracking-widest text-neutral-400 border-b border-white/10">
                <th className="p-4 font-bold">Date Changed</th>
                <th className="p-4 font-bold">Performed By</th>
                <th className="p-4 font-bold">Student</th>
                <th className="p-4 font-bold">Class / Date</th>
                <th className="p-4 font-bold">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log._id} className="transition-colors hover:bg-white-[0.02]">
                  <td className="p-4 text-neutral-400 text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 text-neutral-200">
                    <span className="font-semibold">{log.performedBy?.name || "Unknown"}</span>
                    <span className="block text-xs text-neutral-500 capitalize">{log.performedBy?.role || ""}</span>
                  </td>
                  <td className="p-4 font-semibold text-neutral-300">
                    {log.studentId?.name || "Unknown"}
                  </td>
                  <td className="p-4 text-neutral-400 text-sm">
                    <span className="block">{log.classId?.name || "N/A"}</span>
                    <span className="block italic">{log.date ? new Date(log.date).toLocaleDateString() : ""}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                          log.oldStatus === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                       }`}>
                         {log.oldStatus || "None"}
                       </span>
                       <ArrowRight className="w-3 h-3 text-neutral-500" />
                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                          log.newStatus === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                       }`}>
                         {log.newStatus}
                       </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
