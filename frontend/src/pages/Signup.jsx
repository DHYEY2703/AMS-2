import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const signup = useAuthStore((state) => state.signup);
  const authUser = useAuthStore((state) => state.authUser);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    classId: "",
  });
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosInstance.get("/classes");
        setClasses(res.data);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await signup(formData);
    setLoading(false);
  };

  useEffect(() => {
    if (authUser) {
      if (authUser.role === "student") navigate("/students");
      else if (authUser.role === "teacher" || authUser.role === "admin") navigate("/teachers");
      else navigate("/dashboard");
    }
  }, [authUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-10">
      <div className="w-full max-w-md glass-card p-10 space-y-8">
        <h2 className="text-3xl font-bold text-center text-white tracking-widest drop-shadow-md uppercase">Create an Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="glass-input w-full"
            >
              <option value="student" className="text-black bg-white">Student</option>
              <option value="teacher" className="text-black bg-white">Teacher</option>
              <option value="admin" className="text-black bg-white">Admin</option>
            </select>
          </div>

          {formData.role != "admin" && (
            <div>
              <label className="block mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Select Class</label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 glass-button mt-4 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin h-5 w-5" />}
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-400 font-medium">
         Already have an account?{" "}
          <Link to="/login" className="text-white font-bold hover:underline tracking-wide">
           Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
