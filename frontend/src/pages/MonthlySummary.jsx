import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function MonthlySummary() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("metroToken");
    axios
      .get("http://localhost:5000/api/monthly-summary", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.log("Error loading summary:", err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#3E332A] text-white flex items-center justify-center px-6">
        <p className="font-['Inter']">Please log in to see your monthly recap.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#3E332A] text-white flex items-center justify-center px-6">
        <p className="font-['Inter']">Loading your recap...</p>
      </div>
    );
  }

  if (!data.hasTrips) {
    return (
      <div className="min-h-screen bg-[#3E332A] text-white flex flex-col items-center justify-center px-6 text-center">
        <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#E08E52] mb-4">
          {data.monthLabel.toUpperCase()}
        </p>
        <h1 className="font-['Fraunces'] text-3xl font-semibold mb-4">No trips yet this month</h1>
        <p className="font-['Inter'] text-white/70 mb-8">Book a ticket to start building your recap!</p>
        <Link to="/book" className="px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full">
          Book a Ticket
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3E332A] via-[#5A4A3A] to-[#9B8AC4] text-white px-6 py-20">
      <div className="max-w-xl mx-auto text-center">
        <p className="font-['JetBrains_Mono'] text-xs tracking-[0.3em] text-[#E08E52] mb-3">
          YOUR METROGO WRAPPED
        </p>
        <h1 className="font-['Fraunces'] text-4xl md:text-5xl font-semibold mb-2">
          {data.monthLabel}
        </h1>
        <p className="font-['Inter'] text-white/60 mb-12">Here's how you moved through the city.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6">
            <p className="font-['Fraunces'] text-5xl font-bold">{data.totalTrips}</p>
            <p className="font-['Inter'] text-sm text-white/70 mt-2">Trips taken</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6">
            <p className="font-['Fraunces'] text-5xl font-bold">{data.totalDistanceKm}</p>
            <p className="font-['Inter'] text-sm text-white/70 mt-2">Kilometers traveled</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6 mb-6">
          <p className="font-['Inter'] text-sm text-white/70 mb-1">Your most visited station was</p>
          <p className="font-['Fraunces'] text-3xl font-semibold text-[#E08E52]">{data.topStation}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6">
            <p className="font-['Inter'] text-xs text-white/70 mb-1">Favorite line</p>
            <p className="font-['Fraunces'] text-xl font-semibold">{data.topLine}</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6">
            <p className="font-['Inter'] text-xs text-white/70 mb-1">Usually traveled in the</p>
            <p className="font-['Fraunces'] text-xl font-semibold">{data.favoriteTimeOfDay}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6 mb-6">
          <p className="font-['Inter'] text-sm text-white/70 mb-1">Your busiest day</p>
          <p className="font-['Fraunces'] text-2xl font-semibold">
            {new Date(data.busiestDay.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </p>
          <p className="font-['Inter'] text-xs text-white/60 mt-1">{data.busiestDay.trips} trips that day</p>
        </div>

        <div className="bg-[#E08E52]/20 backdrop-blur border border-[#E08E52]/40 rounded-3xl p-6 mb-10">
          <p className="font-['Inter'] text-sm text-white/70 mb-1">You spent a total of</p>
          <p className="font-['Fraunces'] text-4xl font-bold text-[#E08E52]">₹{data.totalSpent}</p>
          <p className="font-['Inter'] text-xs text-white/60 mt-1">
            across {Math.round(data.totalMinutes / 60)} hours of travel
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-white/10 backdrop-blur border border-white/20 text-white font-['Inter'] font-medium rounded-full hover:bg-white/20 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default MonthlySummary;