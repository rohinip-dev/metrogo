import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g. name@example.com)");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
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
          WELCOME BACK
        </p>
        <h1 className="font-['Fraunces'] text-3xl font-semibold text-center mb-8 text-[#3E332A]">
          Log in to MetroGo
        </h1>

        <form onSubmit={handleSubmit} className="bg-white border border-[#E4D9C4] rounded-3xl p-8 space-y-5 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
          <div>
            <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
              placeholder="icelatte@gmail.com"
            />
          </div>
          <div>
            <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
              placeholder="••••••••"
            />
            <Link to="/forgot-password" className="text-xs text-[#9B8AC4] hover:underline mt-2 inline-block">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-sm text-red-500 font-['Inter']">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)] hover:shadow-[0_6px_20px_rgba(224,142,82,0.45)] transition-shadow disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[#7A6C5D] font-['Inter']">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#9B8AC4] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;