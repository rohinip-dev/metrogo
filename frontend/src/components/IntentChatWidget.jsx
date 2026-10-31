import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function IntentChatWidget() {
  const { user, login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! 👋 I'm your MetroGo Assistant. Tap an option below, or type your own question." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [awaitingRechargeAmount, setAwaitingRechargeAmount] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && options.length === 0) {
      axios
        .get("http://localhost:5000/api/intent-chat/options")
        .then((res) => setOptions(res.data.options))
        .catch((err) => console.log("Error loading chat options:", err));
    }
  }, [isOpen]);

  const addBotMessage = (text) => {
    setMessages((prev) => [...prev, { role: "assistant", content: text }]);
  };

  const getToken = () => localStorage.getItem("metroToken");

  const performCheckBalance = async () => {
    const token = getToken();
    if (!token) {
      addBotMessage("You'll need to log in first before I can check your wallet balance.");
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/wallet/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      addBotMessage(`Your current wallet balance is ₹${res.data.walletBalance}. 👛`);
    } catch (err) {
      addBotMessage("I couldn't fetch your balance right now — please try again in a moment.");
    }
  };

  const performRecharge = async (amount) => {
    const token = getToken();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/wallet/recharge",
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addBotMessage(`Done! ₹${amount} added. Your new wallet balance is ₹${res.data.walletBalance}. ✅`);

      const updatedUser = { ...user, walletBalance: res.data.walletBalance };
      login(updatedUser, token);
    } catch (err) {
      addBotMessage(err.response?.data?.message || "Something went wrong with the recharge. Please try again.");
    }
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    if (awaitingRechargeAmount) {
      const token = getToken();
      const numericAmount = Number(trimmed.replace(/[^\d.]/g, ""));

      if (!token) {
        addBotMessage("You'll need to log in first before recharging your wallet.");
        setAwaitingRechargeAmount(false);
        setLoading(false);
        return;
      }
      if (!numericAmount || numericAmount <= 0) {
        addBotMessage("That doesn't look like a valid amount — please enter just a number, like 100.");
        setLoading(false);
        return;
      }

      await performRecharge(numericAmount);
      setAwaitingRechargeAmount(false);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/intent-chat", { message: trimmed });
      const { tag, reply } = res.data;

      if (tag === "wallet_balance") {
        await performCheckBalance();
      } else if (tag === "wallet_recharge") {
        addBotMessage("Sure! How much would you like to add? (Just type a number, like 100)");
        setAwaitingRechargeAmount(true);
      } else {
        addBotMessage(reply);
      }
    } catch (err) {
      addBotMessage(err.response?.data?.message || "Sorry, something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleOptionClick = (sampleMessage) => {
    sendMessage(sampleMessage);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#E08E52] text-white text-2xl shadow-[0_8px_24px_rgba(224,142,82,0.4)] hover:shadow-[0_10px_30px_rgba(224,142,82,0.5)] transition-all flex items-center justify-center"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[90vw] h-[540px] bg-white border border-[#E4D9C4] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden">
          <div className="bg-[#3E332A] px-5 py-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8FAF7D]"></span>
            <p className="font-['Fraunces'] text-white font-semibold text-sm">MetroGo Assistant</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FBF6EC]">
            {messages.map((m, i) => (
              <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={
                    "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-['Inter'] whitespace-pre-wrap " +
                    (m.role === "user"
                      ? "bg-[#E08E52] text-white rounded-br-sm"
                      : "bg-white border border-[#E4D9C4] text-[#3E332A] rounded-bl-sm")
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E4D9C4] px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-[#A89985] font-['Inter']">
                  Typing...
                </div>
              </div>
            )}

            {!loading && !awaitingRechargeAmount && options.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {options.map((opt) => (
                  <button
                    key={opt.tag}
                    onClick={() => handleOptionClick(opt.sampleMessage)}
                    className="px-3 py-1.5 bg-white border border-[#9B8AC4]/40 text-[#9B8AC4] text-xs font-['Inter'] font-medium rounded-full hover:bg-[#9B8AC4] hover:text-white transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef}></div>
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-[#E4D9C4] flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={awaitingRechargeAmount ? "Enter an amount, e.g. 100" : "Or type your own question..."}
              className="flex-1 bg-[#FBF6EC] border border-[#E4D9C4] rounded-full px-4 py-2 text-sm font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#E08E52] text-white rounded-full text-sm font-['Inter'] font-medium disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default IntentChatWidget;