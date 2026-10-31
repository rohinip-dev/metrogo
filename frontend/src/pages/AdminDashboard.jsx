import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [stationFilter, setStationFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const [allAlerts, setAllAlerts] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertLine, setAlertLine] = useState("General");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [alertPosting, setAlertPosting] = useState(false);

  const token = localStorage.getItem("metroToken");
  const headers = { Authorization: `Bearer ${token}` };

  const loadBookings = () => {
    setBookingsLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (paymentFilter) params.paymentMethod = paymentFilter;
    if (stationFilter) params.station = stationFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (search) params.search = search;

    axios
      .get("http://localhost:5000/api/admin/bookings", { headers, params })
      .then((res) => setBookings(res.data))
      .catch((err) => console.log("Error loading bookings:", err))
      .finally(() => setBookingsLoading(false));
  };

  const loadAlerts = () => {
    axios
      .get("http://localhost:5000/api/alerts", { headers })
      .then((res) => setAllAlerts(res.data))
      .catch((err) => console.log("Error loading alerts:", err));
  };
    const loadEmergencyAlerts = () => {
    axios
      .get("http://localhost:5000/api/emergency", { headers })
      .then((res) => setEmergencyAlerts(res.data))
      .catch((err) => console.log("Error loading emergency alerts:", err));
  };

  const handleResolveEmergency = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/emergency/${id}/resolve`, {}, { headers });
      loadEmergencyAlerts();
    } catch (err) {
      console.log("Error resolving alert:", err);
    }
  };

   useEffect(() => {
    if (!user || user.role !== "admin") return;
    axios
      .get("http://localhost:5000/api/admin/stats", { headers })
      .then((res) => setStats(res.data))
      .catch((err) => console.log("Error loading stats:", err))
      .finally(() => setLoading(false));
    loadBookings();
    loadAlerts();
    loadEmergencyAlerts();
  }, [user]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    loadBookings();
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setPaymentFilter("");
    setStationFilter("");
    setStartDate("");
    setEndDate("");
    setSearch("");
    setTimeout(loadBookings, 0);
  };

  const handlePostAlert = async (e) => {
    e.preventDefault();
    if (!alertMessage.trim()) return;
    setAlertPosting(true);
    try {
      await axios.post(
        "http://localhost:5000/api/alerts",
        { message: alertMessage, line: alertLine, severity: alertSeverity },
        { headers }
      );
      setAlertMessage("");
      loadAlerts();
    } catch (err) {
      console.log("Error posting alert:", err);
    }
    setAlertPosting(false);
  };

  const handleDeactivateAlert = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/alerts/${id}/deactivate`, {}, { headers });
      loadAlerts();
    } catch (err) {
      console.log("Error deactivating alert:", err);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-['Fraunces'] text-2xl font-semibold mb-3">Access Denied</p>
          <p className="text-[#7A6C5D] font-['Inter'] mb-6">This area is for admins only.</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] flex items-center justify-center">
        <p className="font-['Inter'] text-[#7A6C5D]">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] px-6 pt-32 pb-24">
      <div className="max-w-6xl mx-auto">
        <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#E08E52] mb-3">CONTROL ROOM</p>
        <h1 className="font-['Fraunces'] text-4xl font-semibold mb-10 text-[#3E332A]">Admin Dashboard</h1>

        {/* ===== Stat Cards ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-[#E4D9C4] rounded-3xl p-6 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <p className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">TOTAL BOOKINGS</p>
            <p className="font-['Fraunces'] text-4xl font-semibold mt-2 text-[#9B8AC4]">{stats.totalBookings}</p>
          </div>
          <div className="bg-white border border-[#E4D9C4] rounded-3xl p-6 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <p className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">TOTAL USERS</p>
            <p className="font-['Fraunces'] text-4xl font-semibold mt-2 text-[#9B8AC4]">{stats.totalUsers}</p>
          </div>
          <div className="bg-white border border-[#E4D9C4] rounded-3xl p-6 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <p className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">TOTAL REVENUE</p>
            <p className="font-['Fraunces'] text-4xl font-semibold mt-2 text-[#8FAF7D]">₹{stats.totalRevenue}</p>
          </div>
        </div>
        
        {/* ===== Active Emergency Alerts ===== */}
        {emergencyAlerts.length > 0 && (
          <div className="mb-12">
            <h2 className="font-['Fraunces'] text-xl font-semibold mb-4 text-red-500">
              🚨 Active Emergency Alerts ({emergencyAlerts.length})
            </h2>
            <div className="bg-white border-2 border-red-300 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(239,68,68,0.15)]">
              {emergencyAlerts.map((alert) => (
                <div key={alert._id} className="flex justify-between items-center px-6 py-4 border-b border-red-100 last:border-0">
                  <div>
                    <p className="font-['Inter'] text-sm font-medium text-[#3E332A]">{alert.userName}</p>
                    <p className="font-['Inter'] text-xs text-[#7A6C5D] mt-1">{alert.message}</p>
                    <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleResolveEmergency(alert._id)}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-['Inter'] font-medium rounded-full hover:bg-red-600 transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Most Popular Routes ===== */}
        <div className="mb-12">
          <h2 className="font-['Fraunces'] text-xl font-semibold mb-4 text-[#3E332A]">Most Popular Routes</h2>
          <div className="bg-white border border-[#E4D9C4] rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            {stats.topRoutes.map((route, i) => (
              <div key={i} className="flex justify-between items-center px-6 py-4 border-b border-[#F0E9DA] last:border-0">
                <p className="font-['Inter'] text-sm text-[#3E332A]">
                  {route._id.source} <span className="text-[#E08E52]">→</span> {route._id.destination}
                </p>
                <p className="font-['JetBrains_Mono'] text-xs text-[#A89985]">{route.count} bookings</p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Service Alerts ===== */}
        <div className="mb-12">
          <h2 className="font-['Fraunces'] text-xl font-semibold mb-4 text-[#3E332A]">Service Alerts</h2>

          <form onSubmit={handlePostAlert} className="bg-white border border-[#E4D9C4] rounded-3xl p-6 shadow-[0_4px_20px_rgba(155,138,196,0.1)] mb-4">
            <label className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">POST A NEW ALERT</label>
            <textarea
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              placeholder="e.g. Green Line delayed by 10 minutes due to signal maintenance"
              rows={2}
              className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-sm text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
            />
            <div className="flex gap-3 mt-3 items-center flex-wrap">
              <select value={alertLine} onChange={(e) => setAlertLine(e.target.value)} className="bg-white border border-[#E4D9C4] rounded-lg px-3 py-2 text-sm font-['Inter'] text-[#3E332A] focus:outline-none">
                <option value="General">General</option>
                <option value="Purple Line">Purple Line</option>
                <option value="Green Line">Green Line</option>
                <option value="Both Lines">Both Lines</option>
              </select>
              <select value={alertSeverity} onChange={(e) => setAlertSeverity(e.target.value)} className="bg-white border border-[#E4D9C4] rounded-lg px-3 py-2 text-sm font-['Inter'] text-[#3E332A] focus:outline-none">
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
              <button type="submit" disabled={alertPosting} className="px-5 py-2 bg-[#E08E52] text-white font-['Inter'] text-sm font-medium rounded-full shadow-sm hover:shadow-md transition-shadow disabled:opacity-50">
                {alertPosting ? "Posting..." : "Post Alert"}
              </button>
            </div>
          </form>

          <div className="bg-white border border-[#E4D9C4] rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            {allAlerts.length === 0 && (
              <p className="px-6 py-6 text-sm text-[#A89985] font-['Inter']">No alerts posted yet.</p>
            )}
            {allAlerts.map((alert) => (
              <div key={alert._id} className="flex justify-between items-center px-6 py-4 border-b border-[#F0E9DA] last:border-0">
                <div>
                  <p className="font-['Inter'] text-sm text-[#3E332A]">
                    <span className="font-medium">{alert.line}</span> · {alert.message}
                  </p>
                  <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] mt-1">
                    {alert.severity.toUpperCase()} · {alert.isActive ? "Active" : "Inactive"} · {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                {alert.isActive && (
                  <button onClick={() => handleDeactivateAlert(alert._id)} className="text-xs text-red-400 hover:text-red-500 font-['Inter'] font-medium">
                    Deactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== Filters + Bookings ===== */}
        <div className="mb-6">
          <h2 className="font-['Fraunces'] text-xl font-semibold mb-4 text-[#3E332A]">All Bookings ({bookings.length})</h2>

          <form onSubmit={handleApplyFilters} className="bg-white border border-[#E4D9C4] rounded-3xl p-6 shadow-[0_4px_20px_rgba(155,138,196,0.1)] mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">STATUS</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full mt-1 bg-white border border-[#E4D9C4] rounded-lg px-2 py-2 text-sm font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]">
                  <option value="">All</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">PAYMENT</label>
                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="w-full mt-1 bg-white border border-[#E4D9C4] rounded-lg px-2 py-2 text-sm font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]">
                  <option value="">All</option>
                  <option value="wallet">Wallet</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">STATION</label>
                <input type="text" value={stationFilter} onChange={(e) => setStationFilter(e.target.value)} placeholder="e.g. Whitefield" className="w-full mt-1 bg-white border border-[#E4D9C4] rounded-lg px-2 py-2 text-sm font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]" />
              </div>
              <div>
                <label className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">FROM DATE</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full mt-1 bg-white border border-[#E4D9C4] rounded-lg px-2 py-2 text-sm font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]" />
              </div>
              <div>
                <label className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">TO DATE</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full mt-1 bg-white border border-[#E4D9C4] rounded-lg px-2 py-2 text-sm font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]" />
              </div>
              <div>
                <label className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">USER SEARCH</label>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or email" className="w-full mt-1 bg-white border border-[#E4D9C4] rounded-lg px-2 py-2 text-sm font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]" />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="submit" className="px-5 py-2 bg-[#E08E52] text-white font-['Inter'] text-sm font-medium rounded-full shadow-sm hover:shadow-md transition-shadow">
                Apply Filters
              </button>
              <button type="button" onClick={handleClearFilters} className="px-5 py-2 border border-[#E4D9C4] text-[#7A6C5D] font-['Inter'] text-sm rounded-full hover:bg-[#FBF6EC] transition-colors">
                Clear
              </button>
            </div>
          </form>

          <div className="bg-white border border-[#E4D9C4] rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-[#E4D9C4] font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">
              <span>USER</span>
              <span>ROUTE</span>
              <span>FARE</span>
              <span>STATUS</span>
              <span>DATE</span>
            </div>

            {bookingsLoading && (
              <p className="px-6 py-6 text-sm text-[#A89985] font-['Inter']">Loading bookings...</p>
            )}

            {!bookingsLoading && bookings.length === 0 && (
              <p className="px-6 py-6 text-sm text-[#A89985] font-['Inter']">No bookings match these filters.</p>
            )}

            {!bookingsLoading && bookings.map((b) => (
              <div key={b._id} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-[#F0E9DA] last:border-0 font-['Inter'] text-sm items-center">
                <span className="text-[#3E332A]">{b.user?.name || "Unknown"}</span>
                <span className="text-xs text-[#7A6C5D]">{b.source} → {b.destination}</span>
                <span className="text-[#8FAF7D] font-['JetBrains_Mono']">₹{b.fare}</span>
                <span className="text-xs text-[#3E332A]">{b.status}</span>
                <span className="text-xs text-[#A89985]">{new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;