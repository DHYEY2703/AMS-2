import { Menu, Search, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = ({ user, toggleSidebar }) => {
  return (
    <nav className="glass-panel mx-4 mt-4 rounded-3xl px-6 py-4 flex items-center justify-between relative z-10 mb-4 md:mb-0">
      {/* Hamburger (mobile only) */}
      <button
        onClick={toggleSidebar}
        className="p-2 mr-4 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-neutral-400 md:hidden transition-all"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-6 h-6 text-neutral-200" />
      </button>

      {/* Role-Specific Dashboard Title */}
      <div className="text-xl md:text-2xl font-bold text-white hidden sm:block drop-shadow-md">
        {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Dashboard
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3">
        {user && user.name && (
          <div className="flex items-center gap-2">
            <Link to="/profile">
              <div
                onClick={() => {
                  if (window.innerWidth < 640) toggleSidebar();
                }}
                className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 font-bold overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform"
              >
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name[0].toUpperCase()
                )}
              </div>
            </Link>
            <div className="hidden sm:flex flex-col text-sm ml-1">
              <span className="font-bold text-white tracking-wide">{user.name}</span>
              <span className="text-neutral-400 capitalize">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
