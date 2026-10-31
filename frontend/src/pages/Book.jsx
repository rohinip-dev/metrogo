import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";

const PAYMENT_METHODS = [
  { id: "wallet", label: "MetroGo Wallet", icon: "👛", note: "Deducted from your real balance" },
  { id: "upi", label: "UPI / Scan & Pay", icon: "📱", note: "⚠️ Payment gateway not added" },
  { id: "card", label: "Debit / Credit Card", icon: "💳", note: "⚠️ Payment gateway not added" },
  { id: "cash", label: "Cash at Station Kiosk", icon: "🏧", note: "⚠️ Payment gateway not added" },
];

function Book() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/stations")
      .then((res) => setStations(res.data))
      .catch((err) => console.log("Error fetching stations:", err));
  }, []);

  const handleBookClick = () => {
    setError("");
    if (!source || !destination) { setError("Please select both source and destination"); return; }
    if (paymentMethod !== "wallet") { setError("Payment gateway is not added yet. Please select Wallet to complete your booking."); return; }
    setShowConfirm(true);
  };

  const handleConfirmBooking = async () => {
    setShowConfirm(false);
    setTicket(null);
    const token = localStorage.getItem("metroToken");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/bookings", { source, destination, paymentMethod }, { headers: { Authorization: `Bearer ${token}` } });
      setTicket(res.data.booking);
      const updatedUser = { ...user, walletBalance: res.data.walletBalance };
      login(updatedUser, token);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const methodLabel = PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || "";

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-['Fraunces'] text-2xl font-semibold mb-3">You need to log in first</p>
          <p className="text-[#7A6C5D] font-['Inter'] mb-6">Create an account or log in to book a ticket.</p>
          <button onClick={() => navigate("/login")} className="px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)]">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] px-6 pt-32 pb-24">
      <div className="max-w-2xl mx-auto">
        <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#E08E52] mb-3">BOOK A JOURNEY</p>
        <h1 className="font-['Fraunces'] text-4xl font-semibold mb-8 text-[#3E332A]">Where are you headed?</h1>

        <div className="bg-white border border-[#E4D9C4] rounded-3xl p-6 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">FROM</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]">
                <option value="">Select station</option>
                {stations.map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">TO</label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]">
                <option value="">Select station</option>
                {stations.map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">PAYMENT METHOD</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {PAYMENT_METHODS.map((m) => (
                <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                  className={"text-left px-4 py-3 rounded-xl border transition-colors " + (paymentMethod === m.id ? "border-[#9B8AC4] bg-[#F7F4FB]" : "border-[#E4D9C4] bg-white hover:border-[#D8C9B0]")}>
                  <p className="font-['Inter'] text-sm text-[#3E332A]">{m.icon} {m.label}</p>
                  <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] mt-1">{m.note}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleBookClick} disabled={loading} className="mt-6 w-full px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)] hover:shadow-[0_6px_20px_rgba(224,142,82,0.45)] transition-shadow disabled:opacity-50">
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
          {error && <p className="mt-4 text-sm text-red-500 font-['Inter']">{error}</p>}
        </div>

        {ticket && (
          <div className="mt-8 bg-white border border-[#9B8AC4]/25 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(155,138,196,0.15)]">
            <div className="p-8 flex justify-between items-start gap-6">
              <div className="flex-1">
                <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest mb-4">METRO TICKET · {ticket.status.toUpperCase()} · PAID VIA {ticket.paymentMethod?.toUpperCase()}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <p className="font-['Fraunces'] text-xl font-semibold text-[#3E332A]">{ticket.source}</p>
                    <p className="font-['JetBrains_Mono'] text-xs text-[#9B8AC4]">{ticket.sourceLine}</p>
                  </div>
                  <div className="text-[#E08E52] text-xl">→</div>
                  <div>
                    <p className="font-['Fraunces'] text-xl font-semibold text-[#3E332A]">{ticket.destination}</p>
                    <p className="font-['JetBrains_Mono'] text-xs text-[#9B8AC4]">{ticket.destinationLine}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div><p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985]">STOPS</p><p className="font-['Fraunces'] font-semibold mt-1 text-[#3E332A]">{ticket.numberOfStops}</p></div>
                  <div><p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985]">DISTANCE</p><p className="font-['Fraunces'] font-semibold mt-1 text-[#3E332A]">{ticket.distanceKm} km</p></div>
                  <div><p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985]">TIME</p><p className="font-['Fraunces'] font-semibold mt-1 text-[#3E332A]">{ticket.estimatedTimeMinutes} min</p></div>
                  <div><p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985]">FARE</p><p className="font-['Fraunces'] font-semibold mt-1 text-[#8FAF7D]">₹{ticket.fare}</p></div>
                </div>
              </div>
              <div className="bg-[#FBF6EC] border border-[#E4D9C4] p-2 rounded-xl shrink-0">
                <img src={ticket.qrCode} alt="Ticket QR Code" className="w-24 h-24" />
              </div>
            </div>
            <div className="border-t border-dashed border-[#E4D9C4] px-8 py-4 bg-[#FBF6EC]">
              <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985]">Booked on {new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal isOpen={showConfirm} title="Confirm your booking" message={`Book a ticket from ${source} to ${destination}, paying via ${methodLabel}?`} confirmText="Book Ticket" onConfirm={handleConfirmBooking} onCancel={() => setShowConfirm(false)} />
    </div>
  );
}

export default Book;