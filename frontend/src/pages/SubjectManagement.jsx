import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectClassId, setNewSubjectClassId] = useState("");
  const [newSubjectTeacherId, setNewSubjectTeacherId] = useState("");

  const [editSubjectId, setEditSubjectId] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editTeacherId, setEditTeacherId] = useState("");

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/subjects");
      setSubjects(response.data);
      setError(null);
    } catch {
      setError("Failed to fetch subjects.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get("/classes");
      setClasses(response.data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
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
    fetchSubjects();
    fetchClasses();
    fetchTeachers();
  }, []);

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      setError("Subject name is required.");
      return;
    }
    if (!newSubjectClassId) {
      setError("Please select a class for the subject.");
      return;
    }
    try {
      await axiosInstance.post("/subjects", { 
        name: newSubjectName, 
        classId: newSubjectClassId,
        teacherId: newSubjectTeacherId || null
      });
      toast.success("Subject added!");
      setNewSubjectName("");
      setNewSubjectClassId("");
      setNewSubjectTeacherId("");
      fetchSubjects();
      setError(null);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message === "Subject already exists in this class") {
        toast.error("Subject already exists in this class!");
      } else {
        toast.error("Failed to add subject.");
      }
    }
  };

  const startEditSubject = (subj) => {
    setEditSubjectId(subj._id);
    setEditSubjectName(subj.name);
    setEditTeacherId(subj.teacherId?._id || subj.teacherId || "");
  };

  const cancelEdit = () => {
    setEditSubjectId(null);
    setEditSubjectName("");
    setEditTeacherId("");
    setError(null);
  };

  const handleUpdateSubject = async () => {
    if (!editSubjectName.trim()) {
      setError("Subject name is required.");
      return;
    }
    try {
      await axiosInstance.put(`/subjects/${editSubjectId}`, {
        name: editSubjectName,
        teacherId: editTeacherId || null,
      });
      toast.success("Subject updated successfully!");
      cancelEdit();
      fetchSubjects();
    } catch {
      setError("Failed to update subject.");
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) {
      return;
    }
    try {
      await axiosInstance.delete(`/subjects/${subjectId}`);
      toast.success("Subject deleted successfully!");
      fetchSubjects();
    } catch {
      setError("Failed to delete subject.");
    }
  };

  return (
    <div className="glass-card flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <h2 className="text-3xl font-bold mb-2 tracking-wide text-white drop-shadow-md">Subject Management</h2>

      {error && <div className="text-red-400 font-semibold mb-2">{error}</div>}

      <div className="mb-6 bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
        <h3 className="text-xl font-bold mb-4 tracking-wide text-white drop-shadow-md">Add New Subject</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Subject Name"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            className="glass-input"
          />
          <select
            value={newSubjectClassId}
            onChange={(e) => setNewSubjectClassId(e.target.value)}
            className="glass-input"
          >
            <option value="" className="text-black bg-white">Select Class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id} className="text-black bg-white">
                {cls.name}
              </option>
            ))}
          </select>
          <select
            value={newSubjectTeacherId}
            onChange={(e) => setNewSubjectTeacherId(e.target.value)}
            className="glass-input"
          >
            <option value="" className="text-black bg-white">Select Teacher (Optional)</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id} className="text-black bg-white">
                {teacher.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAddSubject}
          className="glass-button w-full sm:w-auto"
        >
          Add Subject
        </button>
      </div>

      {loading ? (
        <div>Loading subjects...</div>
      ) : subjects.length === 0 ? (
        <div>No subjects found.</div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10 shadow-[8px_8px_32px_rgba(0,0,0,0.5)]">
          <table className="w-full text-left border-collapse backdrop-blur-xl bg-neutral-900/40">
            <thead>
              <tr className="bg-neutral-800/60 uppercase text-xs tracking-widest text-neutral-400 border-b border-white/10">
                <th className="p-4 font-bold">Subject Name</th>
                <th className="p-4 font-bold">Class</th>
                <th className="p-4 font-bold">Teacher</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subjects.map((subj) => (
                <tr key={subj._id} className="transition-colors hover:bg-white-[0.02]">
                  <td className="p-4 font-semibold text-neutral-200">
                    {editSubjectId === subj._id ? (
                      <input
                        type="text"
                        value={editSubjectName}
                        onChange={(e) => setEditSubjectName(e.target.value)}
                        className="glass-input w-full p-2 py-1"
                      />
                    ) : (
                      subj.name
                    )}
                  </td>
                  <td className="p-4 text-neutral-400">
                    {subj.classId?.name || "Unknown Class"}
                  </td>
                  <td className="p-4 text-neutral-400">
                    {editSubjectId === subj._id ? (
                      <select
                        value={editTeacherId}
                        onChange={(e) => setEditTeacherId(e.target.value)}
                        className="glass-input w-full p-2 py-1"
                      >
                        <option value="" className="text-black bg-white">Select a teacher</option>
                        {teachers.map((t) => (
                          <option key={t._id} value={t._id} className="text-black bg-white">
                            {t.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      subj.teacherId?.name || "Unassigned"
                    )}
                  </td>
                  <td className="p-4 flex gap-2">
                    {editSubjectId === subj._id ? (
                      <>
                        <button
                          onClick={handleUpdateSubject}
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
                          onClick={() => startEditSubject(subj)}
                          className="glass-button text-xs py-1 px-3 bg-white/10 hover:bg-white text-white hover:text-black font-semibold shadow-none rounded-lg border border-white/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subj._id)}
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
      )}
    </div>
  );
};

export default SubjectManagement;
