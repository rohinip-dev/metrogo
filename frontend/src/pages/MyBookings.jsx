import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import TicketFullView from "../components/TicketFullView";

function MyBookings() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [correctingId, setCorrectingId] = useState(null);
  const [actualDestination, setActualDestination] = useState("");
  const [correctLoading, setCorrectLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fullViewTicket, setFullViewTicket] = useState(null);
  const token = localStorage.getItem("metroToken");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/stations")
      .then((res) => setStations(res.data))
      .catch((err) => console.log("Error fetching stations:", err));
  }, []);

  const loadBookings = () => {
    axios
      .get("http://localhost:5000/api/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookings(res.data))
      .catch((err) => console.log("Error fetching bookings:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    loadBookings();
  }, [user]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/bookings/${cancelTarget._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`Ticket cancelled. ₹${cancelTarget.fare} refunded to your wallet.`);

      const updatedUser = { ...user, walletBalance: res.data.walletBalance };
      login(updatedUser, token);

      loadBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
    setCancelTarget(null);
  };

  const handleCorrectJourney = async (bookingId) => {
    if (!actualDestination) {
      setMessage("Please select the station you actually got off at");
      return;
    }
    setCorrectLoading(true);
    try {
      const res = await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/correct`,
        { actualDestination },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);

      const updatedUser = { ...user, walletBalance: res.data.walletBalance };
      login(updatedUser, token);

      setCorrectingId(null);
      setActualDestination("");
      loadBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
    setCorrectLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-['Fraunces'] text-2xl font-semibold mb-3">You need to log in first</p>
          <p className="text-[#7A6C5D] font-['Inter'] mb-6">Log in to see your booking history.</p>
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

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] px-6 pt-32 pb-24">
      <div className="max-w-2xl mx-auto">
        <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#E08E52] mb-3">
          TRAVEL HISTORY
        </p>
        <h1 className="font-['Fraunces'] text-4xl font-semibold mb-6 text-[#3E332A]">
          My Bookings
        </h1>

        {message && (
          <div className="mb-6 bg-[#F0F5EB] border border-[#8FAF7D]/30 rounded-xl px-4 py-3">
            <p className="font-['Inter'] text-sm text-[#4A6741]">{message}</p>
          </div>
        )}

        {loading && <p className="text-[#7A6C5D] font-['Inter']">Loading your tickets...</p>}

        {!loading && bookings.length === 0 && (
          <div className="bg-white border border-[#E4D9C4] rounded-3xl p-10 text-center shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
            <p className="font-['Inter'] text-[#7A6C5D] mb-4">You haven't booked any tickets yet.</p>
            <button
              onClick={() => navigate("/book")}
              className="px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)]"
            >
              Book Your First Ticket
            </button>
          </div>
        )}

        <div className="space-y-6">
          {bookings.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-white border border-[#9B8AC4]/25 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(155,138,196,0.1)]"
            >
              <div className="p-6 flex justify-between items-start gap-6">
                <div className="flex-1">
                  <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest mb-3">
                    METRO TICKET · {ticket.status.toUpperCase()}
                    {ticket.wasCorrected && " · CORRECTED"}
                  </p>

                  <div className="flex items-center gap-4 mb-5">
                    <div>
                      <p className="font-['Fraunces'] text-lg font-semibold text-[#3E332A]">{ticket.source}</p>
                      <p className="font-['JetBrains_Mono'] text-xs text-[#9B8AC4]">{ticket.sourceLine}</p>
                    </div>
                    <div className="text-[#E08E52]">→</div>
                    <div>
                      <p className="font-['Fraunces'] text-lg font-semibold text-[#3E332A]">{ticket.destination}</p>
                      <p className="font-['JetBrains_Mono'] text-xs text-[#9B8AC4]">{ticket.destinationLine}</p>
                    </div>
                  </div>

                  {ticket.wasCorrected && ticket.originalDestination && (
                    <p className="text-xs text-[#A89985] font-['Inter'] mb-4">
                      Originally booked to {ticket.originalDestination}
                    </p>
                  )}

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985]">STOPS</p>
                      <p className="font-['Fraunces'] font-semibold mt-1 text-[#3E332A]">{ticket.numberOfStops}</p>
                    </div>
                    <div>
                      <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985]">DISTANCE</p>
                      <p className="font-['Fraunces'] font-semibold mt-1 text-[#3E332A]">{ticket.distanceKm} km</p>
                    </div>
                    <div>
                      <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985]">TIME</p>
                      <p className="font-['Fraunces'] font-semibold mt-1 text-[#3E332A]">{ticket.estimatedTimeMinutes} min</p>
                    </div>
                    <div>
                      <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985]">FARE</p>
                      <p className="font-['Fraunces'] font-semibold mt-1 text-[#8FAF7D]">₹{ticket.fare}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setFullViewTicket(ticket)}
                  className="bg-[#FBF6EC] border border-[#E4D9C4] p-2 rounded-xl shrink-0 hover:border-[#9B8AC4] transition-colors"
                  title="Tap to view full ticket"
                >
                  <img src={ticket.qrCode} alt="Ticket QR Code" className="w-20 h-20" />
                </button>
              </div>

              <div className="border-t border-dashed border-[#E4D9C4] px-6 py-3 bg-[#FBF6EC] flex justify-between items-center">
                <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985]">
                  Booked on {new Date(ticket.createdAt).toLocaleString()}
                </p>

                {ticket.status === "confirmed" && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setCorrectingId(correctingId === ticket._id ? null : ticket._id);
                        setActualDestination("");
                        setMessage("");
                      }}
                      className="text-xs font-['Inter'] text-[#9B8AC4] hover:text-[#7C6BA8] font-medium"
                    >
                      I got off at a different station
                    </button>
                    <button
                      onClick={() => setCancelTarget(ticket)}
                      className="text-xs font-['Inter'] text-red-400 hover:text-red-500 font-medium"
                    >
                      Cancel Ticket
                    </button>
                  </div>
                )}
                {ticket.status === "cancelled" && (
                  <span className="text-xs font-['Inter'] text-[#A89985]">Cancelled & refunded</span>
                )}
              </div>

              {correctingId === ticket._id && (
                <div className="border-t border-[#E4D9C4] px-6 py-4 bg-white">
                  <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest mb-2">
                    WHICH STATION DID YOU ACTUALLY EXIT AT?
                  </p>
                  <div className="flex gap-2">
                    <select
                      value={actualDestination}
                      onChange={(e) => setActualDestination(e.target.value)}
                      className="flex-1 bg-white border border-[#E4D9C4] rounded-xl px-3 py-2 text-sm font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
                    >
                      <option value="">Select station</option>
                      {stations
                        .filter((s) => s.name !== ticket.source)
                        .map((s) => (
                          <option key={s._id} value={s.name}>{s.name}</option>
                        ))}
                    </select>
                    <button
                      onClick={() => handleCorrectJourney(ticket._id)}
                      disabled={correctLoading}
                      className="px-4 py-2 bg-[#9B8AC4] text-white text-sm font-['Inter'] font-medium rounded-xl disabled:opacity-50"
                    >
                      {correctLoading ? "Updating..." : "Confirm"}
                    </button>
                  </div>
                  {ticket.paymentMethod !== "wallet" && (
                    <p className="text-xs text-[#A89985] font-['Inter'] mt-2">
                      Note: this ticket wasn't paid via Wallet, so automatic fare correction isn't available for it.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Cancel this ticket?"
        message={
          cancelTarget
            ? `Cancel your ${cancelTarget.source} → ${cancelTarget.destination} ticket? ₹${cancelTarget.fare} will be refunded to your wallet.`
            : ""
        }
        confirmText="Cancel Ticket"
        danger
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTarget(null)}
      />
            <TicketFullView ticket={fullViewTicket} onClose={() => setFullViewTicket(null)} />
    </div>
  );
}

export default MyBookings;