import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Loader2, Mail, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // Step 1: Request password reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/users/forgot-password", { email });
      toast.success(res.data.message || "OTP sent to your email!");
      setResetToken(res.data.resetToken);
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to send reset OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/users/verify-reset-otp", { 
        email, 
        otp, 
        resetToken 
      });
      toast.success("OTP verified! Set your new password.");
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/users/reset-password", { 
        email, 
        resetToken, 
        newPassword 
      });
      toast.success(res.data.message || "Password reset successful!");
      setStep(4); // success
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="w-full max-w-md glass-card p-10 space-y-6">
        
        {step === 1 && (
          <>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Forgot Password?</h2>
              <p className="text-neutral-400 text-sm mt-2">Enter your email and we'll send you an OTP to reset your password.</p>
            </div>
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass-input w-full"
                  placeholder="your@email.com"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 glass-button disabled:opacity-50">
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                {loading ? "Sending..." : "Send Reset OTP"}
              </button>
            </form>
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Enter OTP</h2>
              <p className="text-neutral-400 text-sm mt-2">Check <strong className="text-white">{email}</strong> for the 6-digit code</p>
            </div>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  className="glass-input w-full text-center text-2xl tracking-[0.5em] font-bold"
                  placeholder="000000"
                />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6} className="w-full flex justify-center items-center gap-2 glass-button disabled:opacity-50">
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            <button onClick={() => setStep(1)} className="w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Use different email
            </button>
            <p className="text-center text-xs text-neutral-600">💡 Also check <strong className="text-neutral-400">otp.txt</strong> in the project root</p>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Set New Password</h2>
              <p className="text-neutral-400 text-sm mt-2">Choose a strong password for your account.</p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="glass-input w-full"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="glass-input w-full"
                  placeholder="Re-enter your password"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 glass-button disabled:opacity-50">
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {step === 4 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Password Reset! ✅</h2>
            <p className="text-neutral-400 text-sm">Your password has been successfully changed. You can now login with your new password.</p>
            <Link to="/login" className="inline-flex items-center gap-2 glass-button mt-4">
              <ArrowLeft className="w-4 h-4" /> Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
