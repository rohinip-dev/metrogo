import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Electronics", "Bag/Luggage", "Wallet/Purse", "Documents", "Clothing", "Other"];

function LostFound() {
  const { user } = useAuth();
  const [view, setView] = useState("browse");

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [station, setStation] = useState("");
  const [dateLost, setDateLost] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const loadItems = () => {
    setLoadingItems(true);
    axios
      .get("http://localhost:5000/api/lost-items")
      .then((res) => setItems(res.data))
      .catch((err) => console.log("Error loading lost items:", err))
      .finally(() => setLoadingItems(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!user) {
      setFormError("Please log in to report a lost item.");
      return;
    }

    setFormLoading(true);
    try {
      const token = localStorage.getItem("metroToken");
      await axios.post(
        "http://localhost:5000/api/lost-items",
        { itemName, description, category, station, dateLost, contactPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormSuccess("Your report has been submitted. We'll reach out if a match is found!");
      setItemName("");
      setDescription("");
      setCategory("Other");
      setStation("");
      setDateLost("");
      setContactPhone("");
      loadItems();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong");
    }
    setFormLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] px-6 pt-32 pb-24">
      <div className="max-w-2xl mx-auto">
        <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#E08E52] mb-3">
          LOST & FOUND
        </p>
        <h1 className="font-['Fraunces'] text-4xl font-semibold mb-6 text-[#3E332A]">
          Lost something on the metro?
        </h1>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setView("browse")}
            className={
              "px-5 py-2.5 rounded-full text-sm font-['Inter'] font-medium transition-colors " +
              (view === "browse" ? "bg-[#E08E52] text-white" : "bg-white border border-[#E4D9C4] text-[#7A6C5D]")
            }
          >
            Browse Reports
          </button>
          <button
            onClick={() => setView("report")}
            className={
              "px-5 py-2.5 rounded-full text-sm font-['Inter'] font-medium transition-colors " +
              (view === "report" ? "bg-[#E08E52] text-white" : "bg-white border border-[#E4D9C4] text-[#7A6C5D]")
            }
          >
            Report a Lost Item
          </button>
        </div>

        {view === "browse" && (
          <div className="space-y-4">
            {loadingItems && <p className="text-[#7A6C5D] font-['Inter']">Loading reports...</p>}

            {!loadingItems && items.length === 0 && (
              <div className="bg-white border border-[#E4D9C4] rounded-3xl p-10 text-center shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
                <p className="font-['Inter'] text-[#7A6C5D]">No items reported yet.</p>
              </div>
            )}

            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-[#E4D9C4] rounded-2xl p-5 shadow-[0_4px_20px_rgba(155,138,196,0.08)]"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-['Fraunces'] text-lg font-semibold text-[#3E332A]">{item.itemName}</p>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#9B8AC4] bg-[#FBF6EC] px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>
                <p className="font-['Inter'] text-sm text-[#7A6C5D] mb-3">{item.description}</p>
                <div className="flex gap-4 font-['JetBrains_Mono'] text-[10px] text-[#A89985]">
                  <span>📍 {item.station}</span>
                  <span>📅 {new Date(item.dateLost).toLocaleDateString()}</span>
                  <span className="capitalize">● {item.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === "report" && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#E4D9C4] rounded-3xl p-8 space-y-5 shadow-[0_4px_20px_rgba(155,138,196,0.1)]"
          >
            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">ITEM NAME</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                placeholder="e.g. Black Backpack"
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
              />
            </div>

            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">DESCRIPTION</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="Color, brand, any distinguishing details..."
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">STATION</label>
                <input
                  type="text"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  required
                  placeholder="e.g. MG Road"
                  className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
                />
              </div>
              <div>
                <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">DATE LOST</label>
                <input
                  type="date"
                  value={dateLost}
                  onChange={(e) => setDateLost(e.target.value)}
                  required
                  className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
                />
              </div>
            </div>

            <div>
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">CONTACT PHONE</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                placeholder="10-digit number"
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
              />
            </div>

            {formError && <p className="text-sm text-red-500 font-['Inter']">{formError}</p>}
            {formSuccess && <p className="text-sm text-[#8FAF7D] font-['Inter']">{formSuccess}</p>}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)] hover:shadow-[0_6px_20px_rgba(224,142,82,0.45)] transition-shadow disabled:opacity-50"
            >
              {formLoading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LostFound;