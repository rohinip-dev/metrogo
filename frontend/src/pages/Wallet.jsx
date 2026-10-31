import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Wallet() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("metroToken");
  const headers = { Authorization: `Bearer ${token}` };

  const loadWalletData = () => {
    Promise.all([
      axios.get("http://localhost:5000/api/wallet/balance", { headers }),
      axios.get("http://localhost:5000/api/wallet/transactions", { headers }),
    ]).then(([balRes, txnRes]) => {
      setBalance(balRes.data.walletBalance);
      setTransactions(txnRes.data);
    }).catch((err) => console.log("Error loading wallet:", err)).finally(() => setLoading(false));
  };

  useEffect(() => { if (!user) return; loadWalletData(); }, [user]);

  const handleRecharge = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!amount || amount <= 0) { setError("Please enter a valid amount"); return; }
    setRechargeLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/wallet/recharge", { amount: Number(amount) }, { headers });
      setBalance(res.data.walletBalance);
      setSuccess(`₹${amount} added successfully!`);
      setAmount("");
      const updatedUser = { ...user, walletBalance: res.data.walletBalance };
      login(updatedUser, token);
      loadWalletData();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setRechargeLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-['Fraunces'] text-2xl font-semibold mb-3">You need to log in first</p>
          <p className="text-[#7A6C5D] font-['Inter'] mb-6">Log in to view and recharge your wallet.</p>
          <button onClick={() => navigate("/login")} className="px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)]">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] px-6 pt-32 pb-24">
      <div className="max-w-2xl mx-auto">
        <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#E08E52] mb-3">MY WALLET</p>
        <h1 className="font-['Fraunces'] text-4xl font-semibold mb-8 text-[#3E332A]">Wallet & Recharge</h1>

        <div className="bg-white border border-[#9B8AC4]/25 rounded-3xl p-8 shadow-[0_8px_30px_rgba(155,138,196,0.15)] mb-8">
          <p className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">CURRENT BALANCE</p>
          <p className="font-['Fraunces'] text-5xl font-semibold mt-2 text-[#8FAF7D]">{loading ? "..." : `₹${balance}`}</p>
        </div>

        <div className="bg-white border border-[#E4D9C4] rounded-3xl p-6 shadow-[0_4px_20px_rgba(155,138,196,0.1)] mb-10">
          <p className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest mb-3">RECHARGE WALLET</p>
          <form onSubmit={handleRecharge} className="flex gap-3">
            <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount (₹)" className="flex-1 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]" />
            <button type="submit" disabled={rechargeLoading} className="px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)] hover:shadow-[0_6px_20px_rgba(224,142,82,0.45)] transition-shadow disabled:opacity-50">
              {rechargeLoading ? "Adding..." : "Add Money"}
            </button>
          </form>
          <div className="flex gap-2 mt-3">
            {[50, 100, 200, 500].map((val) => (
              <button key={val} onClick={() => setAmount(String(val))} className="px-3 py-1.5 text-xs font-['Inter'] bg-[#FBF6EC] border border-[#E4D9C4] rounded-full text-[#7A6C5D] hover:border-[#9B8AC4] transition-colors">+₹{val}</button>
            ))}
          </div>
          {error && <p className="mt-3 text-sm text-red-500 font-['Inter']">{error}</p>}
          {success && <p className="mt-3 text-sm text-[#8FAF7D] font-['Inter']">{success}</p>}
        </div>

        <p className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest mb-3">TRANSACTION HISTORY</p>
        <div className="bg-white border border-[#E4D9C4] rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
          {transactions.length === 0 && !loading && <p className="p-6 text-[#7A6C5D] font-['Inter'] text-sm">No transactions yet.</p>}
          {transactions.map((txn) => (
            <div key={txn._id} className="flex justify-between items-center px-6 py-4 border-b border-[#F0E9DA] last:border-0">
              <div>
                <p className="font-['Inter'] text-sm text-[#3E332A]">{txn.description}</p>
                <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] mt-1">{new Date(txn.createdAt).toLocaleString()}</p>
              </div>
              <p className="font-['Fraunces'] font-semibold" style={{ color: txn.type === "recharge" ? "#8FAF7D" : "#E08E52" }}>{txn.type === "recharge" ? "+" : "-"}₹{txn.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Wallet;