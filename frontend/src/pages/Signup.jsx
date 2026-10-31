import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [stage, setStage] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup/request-otp", {
        name, email, password,
      });
      setSignupToken(res.data.signupToken);
      setMessage(`OTP sent! (Dev mode — your OTP is: ${res.data.devOtp})`);
      setStage(2);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup/verify-otp", {
        signupToken, otp,
      });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#E08E52] mb-3 text-center">
          {stage === 1 ? "JOIN THE NETWORK" : "VERIFY YOUR EMAIL"}
        </p>
        <h1 className="font-['Fraunces'] text-3xl font-semibold text-center mb-8 text-[#3E332A]">
          {stage === 1 ? "Create your account" : "Enter the OTP"}
        </h1>

        {stage === 1 ? (
          <form onSubmit={handleRequestOtp} className="bg-white border border-[#E4D9C4] rounded-3xl p-8 space-y-5 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">FULL NAME</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
                placeholder="Rohini Pandit" />
            </div>
            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
                placeholder="you@gmail.com" />
            </div>
            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">PASSWORD</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
                placeholder="At least 8 characters, 1 letter + 1 number" />
            </div>

            {error && <p className="text-sm text-red-500 font-['Inter']">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)] hover:shadow-[0_6px_20px_rgba(224,142,82,0.45)] transition-shadow disabled:opacity-50">
              {loading ? "Sending OTP..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="bg-white border border-[#E4D9C4] rounded-3xl p-8 space-y-5 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <p className="text-sm text-[#7A6C5D] font-['Inter']">
              We've sent a 6-digit code to <span className="font-medium text-[#3E332A]">{email}</span>.
            </p>

            {message && (
              <div className="bg-[#FBF6EC] border border-dashed border-[#E4D9C4] rounded-xl px-4 py-3">
                <p className="font-['JetBrains_Mono'] text-xs text-[#A89985]">🧪 {message}</p>
              </div>
            )}

            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">OTP CODE</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6}
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['JetBrains_Mono'] text-2xl tracking-[0.3em] text-center text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
                placeholder="000000" />
            </div>

            {error && <p className="text-sm text-red-500 font-['Inter']">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)] hover:shadow-[0_6px_20px_rgba(224,142,82,0.45)] transition-shadow disabled:opacity-50">
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>

            <button type="button" onClick={() => setStage(1)}
              className="w-full text-sm text-[#7A6C5D] font-['Inter'] hover:text-[#3E332A]">
              ← Back
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-sm text-[#7A6C5D] font-['Inter']">
          Already have an account?{" "}
          <Link to="/login" className="text-[#9B8AC4] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;