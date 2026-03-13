import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import MarkAttendance from "./pages/MarkAttendance";
import AttendanceReport from "./pages/AttendanceReport";
import Teachers from "./pages/Teachers";
import ClassManagement from "./pages/ClassManagement";
import SubjectManagement from "./pages/SubjectManagement";
import UserManagement from "./pages/UserManagement";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Leaves from "./pages/Leaves";
import Timetable from "./pages/Timetable";
import AuditLogs from "./pages/AuditLogs";
import ParentDashboard from "./pages/ParentDashboard";
import NetworkStatus from "./components/NetworkStatus";
import { useThemeStore } from "./store/useThemeStore";

const ProtectedRoute = ({ children }) => {
  const authUser = useAuthStore((state) => state.authUser);
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppContent = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Apply theme class to body
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  }, [theme]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden text-neutral-100 bg-transparent">
      {/* Sidebar */}
      {authUser && (
        <Sidebar
          user={authUser}
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      )}
      {authUser && sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden bg-black/60 backdrop-blur-md flex items-center justify-center text-white text-sm animate-fade-in"
          onClick={toggleSidebar}
        >
          Tap anywhere to close the menu
        </div>
      )}

      {/* Main Content */}
      <div
        className={`relative z-10 flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out w-full ${
          sidebarOpen ? "pl-64 md:pl-0" : "pl-0"
        }`}
      >
        {/* Navbar */}
        {authUser && <Navbar user={authUser} toggleSidebar={toggleSidebar} />}

        {/* Page Content */}
        <div className="flex flex-col flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {authUser?.role === "student" ? (
                    <StudentDashboard />
                  ) : authUser?.role === "parent" ? (
                    <ParentDashboard />
                  ) : (
                    <Dashboard />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/mark-attendance"
              element={
                <ProtectedRoute>
                  <MarkAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance-report"
              element={
                <ProtectedRoute>
                  <AttendanceReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/studentsdashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute>
                  <Teachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <ClassManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects"
              element={
                <ProtectedRoute>
                  <SubjectManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-management"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaves"
              element={
                <ProtectedRoute>
                  <Leaves />
                </ProtectedRoute>
              }
            />
            <Route
              path="/timetable"
              element={
                <ProtectedRoute>
                  <Timetable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent-dashboard"
              element={
                <ProtectedRoute>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={authUser ? <Navigate to="/" /> : <Login />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
    <NetworkStatus />
    <Toaster />
  </Router>
);

export default App;
