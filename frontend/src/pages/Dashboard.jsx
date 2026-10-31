import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("metroToken");
    axios
      .get("http://localhost:5000/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch(() => setError("Couldn't load your dashboard. Please try again."))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-['Fraunces'] text-2xl font-semibold mb-3">You need to log in first</p>
          <p className="text-[#7A6C5D] font-['Inter'] mb-6">Log in to see your personal dashboard.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] flex items-center justify-center px-6">
        <p className="font-['Inter'] text-[#7A6C5D]">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] flex items-center justify-center px-6">
        <p className="font-['Inter'] text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] px-6 pt-32 pb-24">
      <div className="max-w-4xl mx-auto">
        <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#E08E52] mb-3">
          YOUR DASHBOARD
        </p>
        <h1 className="font-['Fraunces'] text-4xl font-semibold mb-8 text-[#3E332A]">
          Hey, {data.user.name.split(" ")[0]} 👋
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#9B8AC4]/25 rounded-2xl p-5 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">WALLET</p>
            <p className="font-['Fraunces'] text-2xl font-semibold mt-1 text-[#8FAF7D]">₹{data.user.walletBalance}</p>
          </div>
          <div className="bg-white border border-[#E4D9C4] rounded-2xl p-5 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">TOTAL TRIPS</p>
            <p className="font-['Fraunces'] text-2xl font-semibold mt-1 text-[#3E332A]">{data.stats.totalTrips}</p>
          </div>
          <div className="bg-white border border-[#E4D9C4] rounded-2xl p-5 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">TOTAL SPENT</p>
            <p className="font-['Fraunces'] text-2xl font-semibold mt-1 text-[#E08E52]">₹{data.stats.totalSpent}</p>
          </div>
                   <div className="bg-white border border-[#E4D9C4] rounded-2xl p-5 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">DISTANCE TRAVELED</p>
            <p className="font-['Fraunces'] text-2xl font-semibold mt-1 text-[#3E332A]">{data.stats.totalDistanceKm} km</p>
          </div>
          <div className="bg-white border border-[#8FAF7D]/30 rounded-2xl p-5 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">CO₂ SAVED</p>
            <p className="font-['Fraunces'] text-2xl font-semibold mt-1 text-[#8FAF7D]">{data.stats.carbonSavedKg} kg 🌱</p>
          </div>
        </div>

                <div className="bg-gradient-to-r from-[#E08E52] to-[#D97B3A] rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="font-['JetBrains_Mono'] text-[10px] text-white/70 tracking-widest">CURRENT STREAK</p>
            <p className="font-['Fraunces'] text-3xl font-semibold text-white mt-1">
              {data.stats.currentStreak} day{data.stats.currentStreak !== 1 ? "s" : ""} 🔥
            </p>
          </div>
          <div className="text-right">
            <p className="font-['JetBrains_Mono'] text-[10px] text-white/70 tracking-widest">LONGEST STREAK</p>
            <p className="font-['Fraunces'] text-xl font-semibold text-white mt-1">{data.stats.longestStreak} days</p>
          </div>
        </div>
                <p className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest mb-3">BADGES</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {data.badges.map((badge) => (
            <div
              key={badge.id}
              className={
                "rounded-2xl p-4 text-center border " +
                (badge.earned
                  ? "bg-white border-[#9B8AC4]/30 shadow-[0_4px_20px_rgba(155,138,196,0.1)]"
                  : "bg-[#F0E9DA]/40 border-[#E4D9C4] opacity-50")
              }
            >
              <p className="text-2xl mb-1">{badge.icon}</p>
              <p className="font-['Fraunces'] text-sm font-semibold text-[#3E332A]">{badge.label}</p>
              <p className="font-['Inter'] text-[10px] text-[#A89985] mt-1">{badge.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link to="/book" className="px-5 py-2.5 bg-[#E08E52] text-white font-['Inter'] text-sm font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)]">
            Book a Ticket
          </Link>
                    <Link to="/monthly-summary" className="px-5 py-2.5 bg-[#3E332A] text-white font-['Inter'] text-sm font-medium rounded-full shadow-[0_4px_14px_rgba(62,51,42,0.35)]">
            ✨ Monthly Recap
          </Link>
          <Link to="/wallet" className="px-5 py-2.5 bg-white border border-[#E4D9C4] text-[#3E332A] font-['Inter'] text-sm font-medium rounded-full hover:border-[#9B8AC4] transition-colors">
            Recharge Wallet
          </Link>
          <Link to="/my-bookings" className="px-5 py-2.5 bg-white border border-[#E4D9C4] text-[#3E332A] font-['Inter'] text-sm font-medium rounded-full hover:border-[#9B8AC4] transition-colors">
            View All Tickets
          </Link>
        </div>

        <p className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest mb-3">RECENT TRIPS</p>

        {data.recentBookings.length === 0 ? (
          <div className="bg-white border border-[#E4D9C4] rounded-3xl p-10 text-center shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <p className="font-['Inter'] text-[#7A6C5D] mb-4">You haven't booked any tickets yet.</p>
            <Link
              to="/book"
              className="inline-block px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)]"
            >
              Book Your First Ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.recentBookings.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white border border-[#E4D9C4] rounded-2xl p-5 flex items-center justify-between shadow-[0_4px_20px_rgba(155,138,196,0.08)]"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-['Fraunces'] font-semibold text-[#3E332A]">{ticket.source}</p>
                    <p className="font-['JetBrains_Mono'] text-[10px] text-[#9B8AC4]">{ticket.sourceLine}</p>
                  </div>
                  <div className="text-[#E08E52]">→</div>
                  <div>
                    <p className="font-['Fraunces'] font-semibold text-[#3E332A]">{ticket.destination}</p>
                    <p className="font-['JetBrains_Mono'] text-[10px] text-[#9B8AC4]">{ticket.destinationLine}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-['Fraunces'] font-semibold text-[#8FAF7D]">₹{ticket.fare}</p>
                  <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] mt-1">{ticket.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;