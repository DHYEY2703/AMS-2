import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, ShieldCheck, ArrowLeft, Mail } from "lucide-react";

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const verifyOTP = useAuthStore((state) => state.verifyOTP);
  const authUser = useAuthStore((state) => state.authUser);

  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [otpData, setOtpData] = useState({ userId: "", email: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step 1: Submit email + password
  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData);
      if (result?.requireOTP) {
        setOtpData({ userId: result.userId, email: result.email });
        setStep(2);
        setCountdown(300);
        toast.success("OTP sent to your email! 📧");
      }
    } catch {
      // Error handled in store
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP
  const handleOTPSubmit = async (e) => {
    e?.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyOTP({ userId: otpData.userId, otp: otpString });
    } catch {
      // Error handled in store
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // OTP input handling
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (index === 5 && value) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        setTimeout(() => handleOTPSubmit(), 200);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split("");
      setOtp(digits);
      otpRefs.current[5]?.focus();
      setTimeout(() => handleOTPSubmit(), 200);
    }
  };

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (step !== 2) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("OTP expired. Please login again.");
          setStep(1);
          setOtp(["", "", "", "", "", ""]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Navigate on successful auth
  useEffect(() => {
    if (authUser) {
      if (authUser.role === "student") navigate("/students");
      else if (authUser.role === "teacher" || authUser.role === "admin") navigate("/teachers");
      else navigate("/dashboard");
    }
  }, [authUser, navigate]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="w-full max-w-md glass-card p-10 space-y-8">
        {step === 1 ? (
          <>
            <h2 className="text-3xl font-bold text-center text-white tracking-widest drop-shadow-md uppercase">
              Login to Your Account
            </h2>
            <form onSubmit={handleCredentialSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Email
                </label>
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
                <label className="block mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Password
                </label>
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
                {loading ? "Verifying..." : "Continue"}
              </button>
            </form>

            <Link to="/forgot-password" className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors mt-2">
              Forgot Password?
            </Link>

            <p className="mt-4 text-center text-sm text-neutral-400 font-medium">
              Contact Administrator to create a new account.
            </p>
          </>
        ) : (
          <>
            {/* OTP Verification Step */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide drop-shadow-md">
                Two-Factor Authentication
              </h2>
              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-neutral-400">
                <Mail className="w-4 h-4" />
                <span>OTP sent to <strong className="text-white">{otpData.email}</strong></span>
              </div>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-6">
              {/* OTP Input Boxes */}
              <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    autoFocus={index === 0}
                    className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none ${
                      digit
                        ? "border-emerald-400 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "border-neutral-700 bg-neutral-900/50 text-white hover:border-neutral-500"
                    } focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20`}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center">
                <span className={`text-sm font-bold tracking-wide ${countdown < 60 ? "text-red-400" : "text-neutral-400"}`}>
                  ⏱ Expires in {formatTime(countdown)}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                className="w-full flex justify-center items-center gap-2 glass-button mt-4 disabled:opacity-50"
              >
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                {loading ? "Verifying OTP..." : "Verify & Login"}
              </button>
            </form>

            {/* Back button */}
            <button
              onClick={() => {
                setStep(1);
                setOtp(["", "", "", "", "", ""]);
              }}
              className="w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mt-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to login
            </button>

            <p className="text-center text-xs text-neutral-600 mt-2">
              💡 Tip: Check <strong className="text-neutral-400">otp.txt</strong> in your project root folder
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
