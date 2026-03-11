import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignTeacher, setShowAssignTeacher] = useState(false);
  const [assignClassId, setAssignClassId] = useState("");
  const [assignTeacherId, setAssignTeacherId] = useState("");

  const [newClassName, setNewClassName] = useState("");

  const [editClassId, setEditClassId] = useState(null);
  const [editClassName, setEditClassName] = useState("");
  const [editTeacherId, setEditTeacherId] = useState("");

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/classes");
      setClasses(response.data);
      setError(null);
    } catch {
      setError("Failed to fetch classes.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axiosInstance.get("/users/teachers");
      setTeachers(response.data);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const handleAddClass = async () => {
  if (!newClassName.trim()) {
    setError("Class name is required.");
    return;
  }
  try {
    await axiosInstance.post("/classes", { name: newClassName });
    toast.success("Class added!");
    setNewClassName("");
    fetchClasses();
    setError(null);
  } catch (err) {
    if (err.response?.status === 400 && err.response?.data?.message === "Class already exists") {
      toast.error("Class already exists!");
    } else {
      toast.error("Failed to add class.");
    }
  }
};


  const startEditClass = (cls) => {
    setEditClassId(cls._id);
    setEditClassName(cls.name);
    setEditTeacherId(cls.teacherId || "");
  };

  const cancelEdit = () => {
    setEditClassId(null);
    setEditClassName("");
    setEditTeacherId("");
    setError(null);
  };

  const handleUpdateClass = async () => {
    if (!editClassName.trim()) {
      setError("Class name is required.");
      return;
    }
    try {
      await axiosInstance.put(`/classes/${editClassId}`, {
        name: editClassName,
        teacherId: editTeacherId,
      });
      cancelEdit();
      fetchClasses();
    } catch {
      setError("Failed to update class.");
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) {
      return;
    }
    try {
      await axiosInstance.delete(`/classes/${classId}`);
      fetchClasses();
    } catch {
      setError("Failed to delete class.");
    }
  };

  return (
    <div className="glass-card flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <h2 className="text-3xl font-bold mb-2 tracking-wide text-white drop-shadow-md">Class Management</h2>

      {error && <div className="text-red-400 font-semibold mb-2">{error}</div>}

      <div className="mb-6 bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
        <h3 className="text-xl font-bold mb-4 tracking-wide text-white drop-shadow-md">Add New Class</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Class Name"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            className="glass-input flex-grow"
          />
          <button
            onClick={handleAddClass}
            className="glass-button whitespace-nowrap"
          >
            Add Class
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading classes...</div>
      ) : classes.length === 0 ? (
        <div className="text-neutral-400 font-medium">No classes found.</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-3xl border border-white/10 shadow-[8px_8px_32px_rgba(0,0,0,0.5)]">
            <table className="w-full text-left border-collapse backdrop-blur-xl bg-neutral-900/40">
            <thead>
              <tr className="bg-neutral-800/60 uppercase text-xs tracking-widest text-neutral-400 border-b border-white/10">
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Teacher</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {classes.map((cls) => (
                <tr key={cls._id} className="transition-colors hover:bg-white-[0.02]">
                  <td className="p-4 font-semibold text-neutral-200">
                    {editClassId === cls._id ? (
                      <input
                        type="text"
                        value={editClassName}
                        onChange={(e) => setEditClassName(e.target.value)}
                        className="glass-input w-full p-2 py-1"
                      />
                    ) : (
                      cls.name
                    )}
                  </td>
                  <td className="p-4 text-neutral-400">
                    {editClassId === cls._id ? (
                      <select
                        value={editTeacherId}
                        onChange={(e) => setEditTeacherId(e.target.value)}
                        className="glass-input w-full p-2 py-1"
                      >
                        <option value="" className="text-black bg-white">Select a teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher._id} value={teacher._id} className="text-black bg-white">
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      cls.teacherId
                        ? typeof cls.teacherId === "object"
                          ? cls.teacherId.name
                          : (teachers.find((t) => t._id === cls.teacherId)?.name || "Assigned")
                        : "Unassigned"

                    )}
                  </td>
                  <td className="p-4 flex gap-2">
                    {editClassId === cls._id ? (
                      <>
                        <button
                          onClick={handleUpdateClass}
                          className="glass-button text-xs py-1 px-3 bg-white/20 hover:bg-white text-white hover:text-black font-semibold shadow-none rounded-lg border border-white/20"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="glass-button text-xs py-1 px-3 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white font-semibold shadow-none rounded-lg border border-red-500/20"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditClass(cls)}
                          className="glass-button text-xs py-1 px-3 bg-white/10 hover:bg-white text-white hover:text-black font-semibold shadow-none rounded-lg border border-white/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls._id)}
                          className="glass-button text-xs py-1 px-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-semibold shadow-none rounded-lg border border-red-500/10"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          {showAssignTeacher && (
            <div className="mt-6 bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
              <h3 className="text-xl font-bold mb-4 tracking-wide text-white drop-shadow-md">Assign Teacher to Class</h3>
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-neutral-300 tracking-wider text-sm uppercase">Select Class</label>
                <select
                  value={assignClassId}
                  onChange={(e) => setAssignClassId(e.target.value)}
                  className="glass-input w-full"
                >
                  <option value="" className="text-black bg-white">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id} className="text-black bg-white">
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-neutral-300 tracking-wider text-sm uppercase">Select Teacher</label>
                <select
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  className="glass-input w-full"
                >
                  <option value="" className="text-black bg-white">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id} className="text-black bg-white">
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    if (!assignClassId || !assignTeacherId) {
                      setError("Please select both class and teacher.");
                      return;
                    }
                    try {
                      await axiosInstance.put(`/classes/${assignClassId}`, {
                        teacherId: assignTeacherId,
                      });
                      setShowAssignTeacher(false);
                      setAssignClassId("");
                      setAssignTeacherId("");
                      fetchClasses();
                      setError(null);
                    } catch  {
                      setError("Failed to assign teacher.");
                    }
                  }}
                  className="glass-button"
                >
                  Assign
                </button>
                <button
                  onClick={() => {
                    setShowAssignTeacher(false);
                    setAssignClassId("");
                    setAssignTeacherId("");
                    setError(null);
                  }}
                  className="glass-button bg-red-500/20 text-red-300 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClassManagement;
