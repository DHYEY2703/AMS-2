import { useState, useEffect, useRef } from "react";
import { Menu, Search, Bell, Sun, Moon, X, CheckCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { axiosInstance } from "../lib/axios";

const Navbar = ({ user, toggleSidebar }) => {
  const { theme, toggleTheme } = useThemeStore();
  const {
    notifications,
    unreadCount,
    isOpen: notifOpen,
    togglePanel,
    closePanel,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], classes: [] });
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications on mount and poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults({ users: [], classes: [] });
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        closePanel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closePanel]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({ users: [], classes: [] });
      return;
    }
    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(`/notifications/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data);
      } catch {
        setSearchResults({ users: [], classes: [] });
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <nav className="glass-panel mx-4 mt-4 rounded-3xl px-4 sm:px-6 py-3 flex items-center justify-between relative z-30 mb-4 md:mb-0">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-white/10 focus:outline-none md:hidden transition-all"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-neutral-200" />
        </button>
        <div className="text-lg md:text-xl font-bold text-white hidden sm:block drop-shadow-md">
          {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Dashboard
        </div>
      </div>

      {/* Right: Search + Theme + Notifications + Profile */}
      <div className="flex items-center gap-2">
        {/* Global Search */}
        <div ref={searchRef} className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-xl hover:bg-white/10 transition-all"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-neutral-300" />
          </button>

          {searchOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-neutral-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <Search className="w-4 h-4 text-neutral-500" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students, teachers, classes..."
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-neutral-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-4 h-4 text-neutral-500 hover:text-white transition-colors" />
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                {searching && (
                  <div className="px-4 py-6 text-center text-neutral-500 text-sm">Searching...</div>
                )}
                {!searching && searchQuery.length >= 2 && searchResults.users.length === 0 && searchResults.classes.length === 0 && (
                  <div className="px-4 py-6 text-center text-neutral-500 text-sm">No results found</div>
                )}
                {searchResults.users.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-bold text-neutral-500 uppercase tracking-widest">Users</div>
                    {searchResults.users.map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                          navigate("/user-management");
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                          {u.profilePic ? (
                            <img src={u.profilePic} alt="" className="w-full h-full object-cover" />
                          ) : (
                            u.name?.[0]?.toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{u.name}</div>
                          <div className="text-xs text-neutral-500 truncate">{u.email} • <span className="capitalize">{u.role}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.classes.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-bold text-neutral-500 uppercase tracking-widest border-t border-white/5">Classes</div>
                    {searchResults.classes.map((c) => (
                      <div
                        key={c._id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                          navigate("/classes");
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                          📚
                        </div>
                        <div className="text-sm font-semibold text-white">{c.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-white/10 transition-all"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-blue-400" />
          )}
        </button>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={togglePanel}
            className="p-2 rounded-xl hover:bg-white/10 transition-all relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-neutral-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-neutral-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-sm font-bold text-white tracking-wide">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                    🔔 No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 20).map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => {
                        if (!notif.read) markAsRead(notif._id);
                        if (notif.link) {
                          navigate(notif.link);
                          closePanel();
                        }
                      }}
                      className={`flex gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                        !notif.read ? "bg-blue-500/5" : ""
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!notif.read ? "bg-blue-400" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{notif.title}</div>
                        <div className="text-xs text-neutral-400 mt-0.5 line-clamp-2">{notif.message}</div>
                        <div className="text-[10px] text-neutral-600 mt-1">{timeAgo(notif.createdAt)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        {user && user.name && (
          <Link to="/profile">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 font-bold overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform">
              {user.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm">{user.name[0].toUpperCase()}</span>
              )}
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
