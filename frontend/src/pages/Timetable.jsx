import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Timetable = () => {
  const { authUser } = useAuthStore();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await axiosInstance.get("/timetable");
        setSchedule(res.data);
      } catch (error) {
        toast.error("Failed to load timetable.");
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const handleStartClass = (classId, subjectId) => {
    navigate("/mark-attendance", { state: { classId, subjectId, autoSelect: true } });
  };

  if (loading) return <div>Loading Schedule...</div>;

  return (
    <div className="glass-card flex flex-col gap-6 max-w-6xl mx-auto w-full p-4 sm:p-8">
      <h2 className="text-3xl font-bold tracking-wide text-white drop-shadow-md mb-2">My Timetable</h2>
      
      {schedule.length === 0 ? (
        <p className="text-neutral-400 font-medium">No schedule available.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {schedule.map((daySchedule) => (
             <div 
               key={daySchedule.day} 
               className={`glass-card bg-white/5 p-6 rounded-3xl ${currentDay === daySchedule.day ? 'border-2 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'opacity-70'}`}
             >
               <h3 className="text-xl font-bold mb-4 tracking-wide text-white drop-shadow-md">
                 {daySchedule.day} 
                 {currentDay === daySchedule.day && <span className="ml-3 text-xs bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest text-white">Today</span>}
               </h3>
               
               {daySchedule.slots.length === 0 ? (
                 <p className="text-neutral-500 italic">No classes scheduled</p>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {daySchedule.slots.map((slot) => (
                     <div key={slot.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-2 transition-all hover:-translate-y-1 hover:bg-white/5">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{slot.time}</span>
                        <span className="text-lg font-bold text-white tracking-wide">{slot.subject}</span>
                        
                        {authUser?.role === "student" ? (
                          <span className="text-neutral-400 text-sm">{slot.teacherName}</span>
                        ) : (
                          <div className="flex justify-between items-center mt-2">
                             <span className="text-neutral-400 text-sm">{slot.className}</span>
                             <button 
                               onClick={() => handleStartClass(slot.classId, slot.subjectId)}
                               className="glass-button text-xs py-1 px-3 shadow-none bg-white/10 hover:bg-white/30 truncate" 
                               title="Quick Start Attendance"
                             >
                               Mark
                             </button>
                          </div>
                        )}
                     </div>
                   ))}
                 </div>
               )}
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timetable;
