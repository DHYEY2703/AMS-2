import { useNavigate, NavLink } from "react-router-dom";
import { Home, ClipboardList, Users, BookOpen, LogOut, ShieldAlert } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = ({ user, isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const navClass = ({ isActive }) =>
    `flex items-center p-3 rounded-2xl mb-2 transition-all duration-300 ${
      isActive ? "bg-white/20 font-semibold shadow-[inset_0_1px_3px_rgba(255,255,255,0.4)]" : "hover:bg-white/5"
    }`;

  return (
    <aside
      className={`glass-panel p-6 flex flex-col h-full absolute md:static top-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} w-72 max-w-full md:w-72 md:mx-4 md:my-4 md:h-[calc(100vh-32px)] md:rounded-3xl`}
      aria-label="Sidebar Navigation"
    >
      <div className="text-2xl font-bold text-white mb-6 uppercase tracking-widest drop-shadow-md">School</div>

      <h3 className="text-xs font-bold text-neutral-400 mb-3 tracking-wider uppercase">Main</h3>
      <ul className="space-y-2">
        {user?.role !== "student" && (
          <li>
            <NavLink to="/" end className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
              <Home className="mr-2 w-4 h-4" />
              Dashboard
            </NavLink>
          </li>
        )}

        {user?.role === "teacher" && (
          <>
            <li>
              <NavLink to="/mark-attendance" className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                <ClipboardList className="mr-2 w-4 h-4" />
                Mark Attendance
              </NavLink>
            </li>
            <li>
              <NavLink to="/timetable" className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                <BookOpen className="mr-2 w-4 h-4" />
                My Timetable
              </NavLink>
            </li>
            <li>
              <NavLink to="/leaves" className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                <ClipboardList className="mr-2 w-4 h-4" />
                Leave Requests
              </NavLink>
            </li>
          </>
        )}

        {user?.role === "student" && (
          <>
            <li>
              <NavLink to="/studentsdashboard" className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                <Home className="mr-2 w-4 h-4" />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/timetable" className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                <BookOpen className="mr-2 w-4 h-4" />
                My Timetable
              </NavLink>
            </li>
            <li>
              <NavLink to="/attendance-report" className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                <ClipboardList className="mr-2 w-4 h-4" />
                My Attendance
              </NavLink>
            </li>
            <li>
              <NavLink to="/leaves" className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                <ClipboardList className="mr-2 w-4 h-4" />
                My Leaves
              </NavLink>
            </li>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <h3 className="text-xs font-bold text-neutral-400 mt-8 mb-3 tracking-wider uppercase">Administration</h3>
            <li>
              <NavLink to="/user-management" className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                <Users className="mr-2 w-4 h-4" />
                User Management
              </NavLink>
            </li>
            <li>
              <NavLink to="/classes" className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                <BookOpen className="mr-2 w-4 h-4" />
                Class Management
              </NavLink>
            </li>
            <li>
              <NavLink to="/subjects" className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                <BookOpen className="mr-2 w-4 h-4" />
                Subject Management
              </NavLink>
            </li>
            <li>
              <NavLink to="/leaves" className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                <ClipboardList className="mr-2 w-4 h-4" />
                Manage Leaves
              </NavLink>
            </li>
            <h3 className="text-xs font-bold text-neutral-400 mt-8 mb-3 tracking-wider uppercase">Security</h3>
            <li>
              <NavLink to="/audit-logs" className={navClass} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                <ShieldAlert className="mr-2 w-4 h-4" />
                Audit Logs
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="mt-auto">
        <NavLink 
          to="/profile" 
          className={navClass} 
          onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
        >
          <Users className="mr-2 w-5 h-5" />
          My Profile
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center p-3 rounded-2xl hover:bg-white/10 w-full transition-all text-neutral-300 hover:text-white mt-1"
        >
          <LogOut className="mr-2 w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
