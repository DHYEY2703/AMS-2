import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, classesRes] = await Promise.all([
          axiosInstance.get("/users/teachers"),
          axiosInstance.get("/classes"),
        ]);
        setTeachers(teachersRes.data);
        setClasses(classesRes.data);
      } catch (err) {
        setError("Failed to fetch teachers or classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading user and class data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="glass-card flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <h2 className="text-3xl font-bold mb-2 tracking-wide text-white drop-shadow-md">User and Class Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
          <h3 className="text-xl font-bold mb-4 tracking-wide text-white drop-shadow-md">Teachers</h3>
          {teachers.length === 0 ? (
            <p className="text-neutral-400 font-medium">No teachers found.</p>
          ) : (
            <ul className="space-y-3">
              {teachers.map((teacher) => (
                <li key={teacher.id} className="flex flex-col p-3 rounded-xl bg-black/20 border border-white/5">
                  <span className="font-semibold text-neutral-200">{teacher.name}</span>
                  <span className="text-sm text-neutral-500">{teacher.email}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
          <h3 className="text-xl font-bold mb-4 tracking-wide text-white drop-shadow-md">Classes</h3>
          {classes.length === 0 ? (
            <p className="text-neutral-400 font-medium">No classes found.</p>
          ) : (
            <ul className="space-y-3">
              {classes.map((cls) => (
                <li key={cls.id} className="flex flex-col p-3 rounded-xl bg-black/20 border border-white/5">
                  <span className="font-semibold text-neutral-200">{cls.name}</span>
                  <span className="text-sm text-neutral-500">{cls.description || "No description"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Teachers;
