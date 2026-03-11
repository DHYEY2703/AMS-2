import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("teachers");
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch teachers or students
  const fetchUsers = async (role) => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = role === "teachers" ? "/users/teachers" : "/users/students";
      const response = await axiosInstance.get(endpoint);
      setUsers(response.data);
    } catch (err) {
      setError(`Failed to fetch ${role}.`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all classes once
  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get("/classes");
      setClasses(response.data);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    }
  };

  useEffect(() => {
    fetchUsers(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="glass-card flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <h2 className="text-3xl font-bold mb-2 tracking-wide text-white drop-shadow-md">User Management</h2>
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button
          className={`px-6 py-2 rounded-full font-bold tracking-widest uppercase text-xs transition-all ${
            activeTab === "teachers" ? "glass-button shadow-none text-white outline outline-white/20" : "text-neutral-500 hover:text-white"
          }`}
          onClick={() => setActiveTab("teachers")}
        >
          Teachers
        </button>
        <button
          className={`px-6 py-2 rounded-full font-bold tracking-widest uppercase text-xs transition-all ${
            activeTab === "students" ? "glass-button shadow-none text-white outline outline-white/20" : "text-neutral-500 hover:text-white"
          }`}
          onClick={() => setActiveTab("students")}
        >
          Students
        </button>
      </div>

      {loading ? (
        <div>Loading {activeTab}...</div>
      ) : error ? (
        <div className="text-red-400 font-semibold">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-neutral-400 font-medium">No {activeTab} found.</div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10 shadow-[8px_8px_32px_rgba(0,0,0,0.5)]">
          <table className="w-full text-left border-collapse backdrop-blur-xl bg-neutral-900/40 min-w-[600px]">
            <thead>
              <tr className="bg-neutral-800/60 uppercase text-xs tracking-widest text-neutral-400 border-b border-white/10">
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => {
                let className = "N/A";
                if (activeTab === "teachers") {
                  className = classes.find((cls) => cls.teacherId === user._id)?.name || "N/A";
                } else {
                  className = user.classId
                    ? classes.find((cls) => cls._id === user.classId?._id)?.name || "N/A"
                    : "N/A";
                }

                return (
                  <tr key={user._id} className="transition-colors hover:bg-white-[0.02]">
                    <td className="p-4 font-semibold text-neutral-200">{user.name}</td>
                    <td className="p-4 text-neutral-400">{user.email}</td>
                    <td className="p-4 text-neutral-400">{className}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
