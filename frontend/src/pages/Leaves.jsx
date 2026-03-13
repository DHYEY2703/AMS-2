import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useLanguageStore } from "../store/useLanguageStore";

const Leaves = () => {
  const { authUser } = useAuthStore();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguageStore();

  // Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeaves = async () => {
    try {
      const res = await axiosInstance.get("/leaves");
      setLeaves(res.data);
    } catch (error) {
      toast.error("Failed to load leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post("/leaves", { startDate, endDate, reason });
      setLeaves([res.data, ...leaves]);
      setShowForm(false);
      setStartDate("");
      setEndDate("");
      setReason("");
      toast.success("Leave request submitted!");
    } catch (error) {
      toast.error("Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (leaveId, newStatus) => {
    try {
      await axiosInstance.put(`/leaves/${leaveId}`, { status: newStatus });
      setLeaves(leaves.map(l => l._id === leaveId ? { ...l, status: newStatus } : l));
      toast.success(`Leave marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  if (loading) return <div>Loading leaves...</div>;

  return (
    <div className="glass-card flex flex-col gap-6 max-w-6xl mx-auto w-full p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h2 className="text-3xl font-bold tracking-wide text-white drop-shadow-md">{t("leaveRequests")}</h2>
        {(authUser?.role === "student" || authUser?.role === "teacher") && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="glass-button"
          >
            {showForm ? t("cancel") : t("applyLeave")}
          </button>
        )}
      </div>

      {showForm && (authUser?.role === "student" || authUser?.role === "teacher") && (
        <form onSubmit={handleApplyLeave} className="glass-card bg-white/5 p-6 rounded-3xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">{t("startDate")}</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="glass-input w-full" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">{t("endDate")}</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="glass-input w-full" required />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">{t("reason")}</label>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              className="glass-input w-full h-24 resize-none" 
              placeholder="Why are you requesting a leave?" 
              required
            />
          </div>
          <button type="submit" className="glass-button w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? t("loading") : t("submit")}
          </button>
        </form>
      )}

      {leaves.length === 0 ? (
        <p className="text-neutral-400 font-medium">No leave records found.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10 shadow-[8px_8px_32px_rgba(0,0,0,0.5)]">
          <table className="w-full text-left border-collapse backdrop-blur-xl bg-neutral-900/40">
            <thead>
              <tr className="bg-neutral-800/60 uppercase text-xs tracking-widest text-neutral-400 border-b border-white/10">
                {authUser?.role !== "student" && <th className="p-4 font-bold">User (Role)</th>}
                <th className="p-4 font-bold">{t("date")}</th>
                <th className="p-4 font-bold">{t("reason")}</th>
                <th className="p-4 font-bold">{t("status")}</th>
                {authUser?.role !== "student" && <th className="p-4 font-bold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaves.map((leave) => (
                <tr key={leave._id} className="transition-colors hover:bg-white-[0.02]">
                  {authUser?.role !== "student" && (
                    <td className="p-4 font-semibold text-neutral-200">
                      {leave.userId?.name || leave.studentId?.name || "Unknown"} <span className="text-neutral-500 text-xs font-normal uppercase">({leave.role || "student"})</span>
                    </td>
                  )}
                  <td className="p-4 text-neutral-300">
                    <span className="block">{new Date(leave.startDate).toLocaleDateString()}</span>
                    <span className="block text-neutral-500 text-sm">to {new Date(leave.endDate).toLocaleDateString()}</span>
                  </td>
                  <td className="p-4 text-neutral-400 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border ${
                      leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      leave.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  {authUser?.role !== "student" && (
                    <td className="p-4 flex gap-2 justify-end">
                      {leave.status === "Pending" ? (
                         (authUser?.role === "admin" || (authUser?.role === "teacher" && leave.role === "student")) ? (
                            <>
                              <button onClick={() => handleUpdateStatus(leave._id, "Approved")} className="glass-button text-xs py-1 px-3 bg-emerald-500/20 text-emerald-200">Approve</button>
                              <button onClick={() => handleUpdateStatus(leave._id, "Rejected")} className="glass-button text-xs py-1 px-3 bg-red-500/20 text-red-200">Reject</button>
                            </>
                         ) : (
                            <span className="text-neutral-500 text-sm italic">Waiting Admin</span>
                         )
                      ) : (
                        <span className="text-neutral-500 text-sm italic">Resolved</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaves;
