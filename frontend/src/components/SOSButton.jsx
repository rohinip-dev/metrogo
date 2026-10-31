import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function SOSButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const handleTriggerSOS = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("metroToken");
      await axios.post(
        "http://localhost:5000/api/emergency",
        { message: "SOS button pressed from the app" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please call station staff directly.");
    }
    setLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSent(false);
    setError("");
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-24 z-50 w-14 h-14 rounded-full bg-red-500 text-white font-bold text-xs shadow-[0_8px_24px_rgba(239,68,68,0.4)] hover:shadow-[0_10px_30px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center"
        title="Emergency SOS"
      >
        SOS
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">

            {sent === false && (
              <div>
                <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-red-500 mb-2">EMERGENCY SUPPORT</p>
                <h2 className="font-['Fraunces'] text-2xl font-semibold text-[#3E332A] mb-4">Do you need help?</h2>
                <p className="font-['Inter'] text-sm text-[#7A6C5D] mb-6">
                  Pressing this will immediately alert station staff with your account details. Only use this in a genuine emergency.
                </p>

                {error && <p className="text-sm text-red-500 font-['Inter'] mb-4">{error}</p>}

                <button
                  onClick={handleTriggerSOS}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-red-500 text-white font-['Inter'] font-semibold rounded-full shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50 mb-3"
                >
                  Send Emergency Alert
                </button>

                <div className="border-t border-[#E4D9C4] pt-4 mt-4">
                  <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest mb-2">OR CALL DIRECTLY</p>

                  <a href="tel:112" className="block text-center w-full px-6 py-3 bg-[#FBF6EC] border border-[#E4D9C4] text-[#3E332A] font-['Inter'] font-medium rounded-full hover:border-[#9B8AC4] transition-colors mb-2">
                    National Emergency 112
                  </a>

                  <a href="tel:18004252525" className="block text-center w-full px-6 py-3 bg-[#FBF6EC] border border-[#E4D9C4] text-[#3E332A] font-['Inter'] font-medium rounded-full hover:border-[#9B8AC4] transition-colors">
                    Namma Metro Helpline
                  </a>
                </div>

                <button onClick={handleClose} className="w-full mt-4 text-sm text-[#A89985] font-['Inter']">
                  Cancel
                </button>
              </div>
            )}

            {sent === true && (
              <div>
                <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#8FAF7D] mb-2">ALERT SENT</p>
                <h2 className="font-['Fraunces'] text-2xl font-semibold text-[#3E332A] mb-4">Help is on the way</h2>
                <p className="font-['Inter'] text-sm text-[#7A6C5D] mb-6">
                  Station staff have been notified with your details. Stay where you are if it's safe to do so.
                </p>
                <button onClick={handleClose} className="w-full px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full">
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default SOSButton;