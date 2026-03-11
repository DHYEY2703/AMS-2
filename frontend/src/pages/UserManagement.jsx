import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("teachers");
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    classId: "",
    phoneNumber: "",
    children: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch teachers or students
  const fetchUsers = async (role) => {
    try {
      setLoading(true);
      setError(null);
      let endpoint = "/users/students";
      if (role === "teachers") endpoint = "/users/teachers";
      else if (role === "parents") endpoint = "/users/parents";
      
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

  const fetchAllStudents = async () => {
    try {
      const response = await axiosInstance.get("/users/students");
      setAllStudents(response.data);
    } catch (err) {
      console.error("Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchUsers(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchClasses();
    fetchAllStudents();
  }, []);

  return (
    <div className="glass-card flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <h2 className="text-3xl font-bold mb-2 tracking-wide text-white drop-shadow-md">User Management</h2>
      <div className="flex justify-between items-center border-b border-white/10 pb-4 flex-wrap gap-4">
        <div className="flex gap-4">
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
          <button
            className={`px-6 py-2 rounded-full font-bold tracking-widest uppercase text-xs transition-all ${
              activeTab === "parents" ? "glass-button shadow-none text-white outline outline-white/20" : "text-neutral-500 hover:text-white"
            }`}
            onClick={() => setActiveTab("parents")}
          >
            Parents
          </button>
        </div>
        <button 
          onClick={() => {
            const defaultRole = activeTab === "teachers" ? "teacher" : (activeTab === "parents" ? "parent" : "student");
            setFormData({ ...formData, role: defaultRole, children: [], phoneNumber: "" });
            setShowModal(true);
          }}
          className="glass-button text-xs py-2 px-4 bg-white/20 text-white"
        >
          Add New {activeTab === "teachers" ? "Teacher" : (activeTab === "parents" ? "Parent" : "Student")}
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
                <th className="p-4 font-bold">Class / Linked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => {
                let info = "N/A";
                if (activeTab === "teachers") {
                  info = classes.find((cls) => cls.teacherId === user._id)?.name || "N/A";
                } else if (activeTab === "parents") {
                  info = user.children?.map(c => c.name).join(", ") || "No children linked";
                } else {
                  info = user.classId
                    ? classes.find((cls) => cls._id === user.classId?._id)?.name || "N/A"
                    : "N/A";
                }

                return (
                  <tr key={user._id} className="transition-colors hover:bg-white-[0.02]">
                    <td className="p-4 font-semibold text-neutral-200">
                       {user.name}
                       {activeTab === "parents" && <span className="block text-xs text-neutral-500 mt-1">{user.phoneNumber || "No Phone"}</span>}
                    </td>
                    <td className="p-4 text-neutral-400">{user.email}</td>
                    <td className="p-4 text-neutral-400 text-sm">{info}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 pt-12 md:pt-16 flex items-start justify-center">
          <div className="glass-card max-w-2xl w-full p-5 sm:p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition-all text-sm font-bold z-10"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold tracking-wide text-white mb-4 uppercase">Register {formData.role}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              try {
                const res = await axiosInstance.post("/users/create", formData);
                setUsers([...users, res.data]);
                toast.success(`${formData.role} created successfully!`);
                setShowModal(false);
                setFormData({ name: "", email: "", password: "", role: "student", classId: "", phoneNumber: "", children: [] });
                fetchUsers(activeTab); // Re-fetch to ensure relations show up cleanly
              } catch (error) {
                toast.error(error.response?.data?.msg || "Failed to create user");
              } finally {
                setIsSubmitting(false);
              }
            }} className="flex flex-col gap-3">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="glass-input w-full" required />
                 </div>
               <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="glass-input w-full" required />
               </div>
               <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Password</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="glass-input w-full" required minLength="6" />
               </div>
               
               <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Role</label>
                  <input type="text" value={formData.role} disabled className="glass-input w-full uppercase text-neutral-500 bg-black/20 border-white/5 cursor-not-allowed" />
               </div>
               
               {formData.role === "parent" && (
                 <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Phone Number (SMS)</label>
                    <input type="tel" value={formData.phoneNumber || ""} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="glass-input w-full" placeholder="+1234567890" required />
                 </div>
               )}

               {(formData.role === "teacher" || formData.role === "student") && (
                 <div>
                   <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Assign to Class</label>
                   <select value={formData.classId} onChange={(e) => setFormData({...formData, classId: e.target.value})} className="glass-input w-full bg-neutral-900 border border-white/10" required>
                      <option value="" disabled>Select a Class</option>
                      {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>{cls.name}</option>
                      ))}
                   </select>
                 </div>
               )}
               </div>

               {formData.role === "parent" && (
                 <div>
                   <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Link to Children (Students)</label>
                   <div className="max-h-24 overflow-y-auto glass-input bg-neutral-900 border border-white/10 p-2 rounded-lg flex flex-col gap-1">
                      {allStudents.length === 0 ? <span className="text-neutral-500 text-sm">No students found.</span> : (
                        allStudents.map(student => (
                           <label key={student._id} className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                              <input 
                                 type="checkbox" 
                                 checked={formData.children.includes(student._id)}
                                 onChange={(e) => {
                                    if(e.target.checked) setFormData({...formData, children: [...formData.children, student._id]});
                                    else setFormData({...formData, children: formData.children.filter(id => id !== student._id)});
                                 }}
                              />
                              {student.name} ({student.email})
                           </label>
                        ))
                      )}
                   </div>
                 </div>
               )}

               <div className="flex justify-end gap-3 mt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-bold tracking-widest uppercase text-xs text-neutral-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="glass-button text-xs py-2 px-6">
                    {isSubmitting ? "Creating..." : "Create Account"}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
