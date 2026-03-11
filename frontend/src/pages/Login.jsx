import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const authUser = useAuthStore((state) => state.authUser);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      // navigation will be handled by useEffect
    } catch (error) {
      toast.error("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      if (authUser.role === "student") navigate("/students");
      else if (authUser.role === "teacher" || authUser.role === "admin") navigate("/teachers");
      else navigate("/dashboard");
    }
  }, [authUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="w-full max-w-md glass-card p-10 space-y-8">
        <h2 className="text-3xl font-bold text-center text-white tracking-widest drop-shadow-md uppercase">Login to Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 glass-button mt-4 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin h-5 w-5" />}
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400 font-medium">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-white font-bold hover:underline tracking-wide">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
