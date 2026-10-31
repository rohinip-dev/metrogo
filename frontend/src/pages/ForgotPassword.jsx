import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
  const [stage, setStage] = useState(1);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password/request-otp",
        { email }
      );
      setUserId(res.data.userId);
      setMessage(`OTP sent! (Dev mode — your OTP is: ${res.data.devOtp})`);
      setStage(2);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password/reset", {
        userId, otp, newPassword,
      });
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#E08E52] mb-3 text-center">
          {stage === 1 ? "ACCOUNT RECOVERY" : "SET NEW PASSWORD"}
        </p>
        <h1 className="font-['Fraunces'] text-3xl font-semibold text-center mb-8 text-[#3E332A]">
          {stage === 1 ? "Forgot your password?" : "Enter OTP & new password"}
        </h1>

        {stage === 1 ? (
          <form onSubmit={handleRequestOtp} className="bg-white border border-[#E4D9C4] rounded-3xl p-8 space-y-5 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
                placeholder="you@example.com" />
            </div>

            {error && <p className="text-sm text-red-500 font-['Inter']">{error}</p>}
            {message && <p className="text-sm text-[#8FAF7D] font-['Inter']">{message}</p>}

            <button type="submit" disabled={loading}
              className="w-full px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)] hover:shadow-[0_6px_20px_rgba(224,142,82,0.45)] transition-shadow disabled:opacity-50">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="bg-white border border-[#E4D9C4] rounded-3xl p-8 space-y-5 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">OTP CODE</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
                placeholder="6-digit code" />
            </div>
            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">NEW PASSWORD</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
                placeholder="At least 8 characters, 1 letter + 1 number" />
            </div>

            {error && <p className="text-sm text-red-500 font-['Inter']">{error}</p>}
            {message && <p className="text-sm text-[#8FAF7D] font-['Inter']">{message}</p>}

            <button type="submit" disabled={loading}
              className="w-full px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)] hover:shadow-[0_6px_20px_rgba(224,142,82,0.45)] transition-shadow disabled:opacity-50">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-sm text-[#7A6C5D] font-['Inter']">
          Remembered it?{" "}
          <Link to="/login" className="text-[#9B8AC4] hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;