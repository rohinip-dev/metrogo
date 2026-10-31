import { useState, useEffect } from "react";
import axios from "axios";
import RouteHighlightMap from "../components/RouteHighlightMap";
import LiveTrainStatus from "../components/LiveTrainStatus";
import JourneyGuide from "../components/JourneyGuide";
import StationInfoPopup from "../components/StationInfoPopup";

function Home() {
  const [stations, setStations] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [crowdData, setCrowdData] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/stations")
      .then((res) => setStations(res.data))
      .catch((err) => console.log("Error fetching stations:", err));
  }, []);

    const loadFavorites = () => {
    const token = localStorage.getItem("metroToken");
    if (!token) return; // not logged in, so skip loading favorites

    axios
      .get("http://localhost:5000/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFavorites(res.data))
      .catch((err) => console.log("Error loading favorites:", err));
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleSearch = async () => {
    setError("");
    setResult(null);
    if (!source || !destination) {
      setError("Please select both source and destination");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/stations/route-search", {
        params: { source, destination },
      });
      setResult(res.data);

      try {
        const crowdRes = await axios.get("http://localhost:5000/api/crowd");
        setCrowdData(crowdRes.data);
      } catch (crowdErr) {
        console.log("Crowd prediction unavailable:", crowdErr);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };
    const handleSaveFavorite = async () => {
    const token = localStorage.getItem("metroToken");
    if (!token) {
      setError("Please log in to save favorite routes");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/favorites",
        {
          source: result.source,
          destination: result.destination,
          sourceLine: result.sourceLine,
          destinationLine: result.destinationLine,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadFavorites();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleUseFavorite = (fav) => {
    setSource(fav.source);
    setDestination(fav.destination);
  };
    const handleDeleteFavorite = async (favId, e) => {
    e.stopPropagation(); // stop the click from also triggering "use this favorite"
    const token = localStorage.getItem("metroToken");
    try {
      await axios.delete(`http://localhost:5000/api/favorites/${favId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadFavorites();
    } catch (err) {
      console.log("Error deleting favorite:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A]">
      <section className="max-w-6xl mx-auto px-6 pt-40 pb-24">
        <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#E08E52] mb-4">
          NAMMA METRO · LIVE NETWORK
        </p>
        <h1 className="font-['Fraunces'] text-5xl md:text-6xl font-semibold leading-[1.15] max-w-2xl text-[#3E332A]">
          Your city moves.
          <br />
          <span className="text-[#9B8AC4]">So should you.</span>
        </h1>
        <p className="font-['Inter'] text-[#7A6C5D] mt-6 max-w-md text-lg">
          Book tickets, check fares, and track your route across the metro network — in one place.
        </p>
        <div className="mt-6">
          <LiveTrainStatus />
        </div>
                {favorites.length > 0 && (
          <div className="mt-6 max-w-2xl">
            <p className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest mb-2">
              ⭐ YOUR FAVORITE ROUTES
            </p>
            <div className="flex flex-wrap gap-2">
               {favorites.map((fav) => (
                <div
                  key={fav._id}
                  onClick={() => handleUseFavorite(fav)}
                  className="px-4 py-2 bg-white border border-[#E4D9C4] rounded-full text-sm font-['Inter'] text-[#3E332A] hover:border-[#9B8AC4] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>{fav.source} → {fav.destination}</span>
                  <button
                    onClick={(e) => handleDeleteFavorite(fav._id, e)}
                    className="text-[#A89985] hover:text-red-500 font-bold"
                    title="Remove from favorites"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 bg-white border border-[#E4D9C4] rounded-3xl p-6 max-w-2xl shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">FROM</label>
                {source && <StationInfoPopup station={stations.find((s) => s.name === source)} />}
              </div>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
              >
                <option value="">Select station</option>
                {stations.map((s) => (
                  <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">TO</label>
                {destination && <StationInfoPopup station={stations.find((s) => s.name === destination)} />}
              </div>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full mt-2 bg-white border border-[#E4D9C4] rounded-xl px-4 py-3 font-['Inter'] text-[#3E332A] focus:outline-none focus:border-[#9B8AC4]"
              >
                <option value="">Select station</option>
                {stations.map((s) => (
                  <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="mt-5 w-full px-6 py-3 bg-[#E08E52] text-white font-['Inter'] font-medium rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)] hover:shadow-[0_6px_20px_rgba(224,142,82,0.45)] transition-shadow disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Route"}
          </button>

          {error && <p className="mt-4 text-sm text-red-500 font-['Inter']">{error}</p>}
        </div>

        {result && (
          <div className="mt-8 max-w-2xl bg-white border border-[#9B8AC4]/25 rounded-3xl p-8 shadow-[0_8px_30px_rgba(155,138,196,0.15)]">
            <div className="flex justify-between items-start pb-6 border-b border-dashed border-[#E4D9C4]">
              <div>
                <p className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">FROM</p>
                <p className="font-['Fraunces'] text-xl font-semibold mt-1 text-[#3E332A]">{result.source}</p>
                <p className="font-['JetBrains_Mono'] text-xs text-[#9B8AC4] mt-1">{result.sourceLine}</p>
              </div>
              <div className="text-[#E08E52] text-2xl mt-2">→</div>
              <div className="text-right">
                <p className="font-['JetBrains_Mono'] text-[11px] text-[#A89985] tracking-widest">TO</p>
                <p className="font-['Fraunces'] text-xl font-semibold mt-1 text-[#3E332A]">{result.destination}</p>
                <p className="font-['JetBrains_Mono'] text-xs text-[#9B8AC4] mt-1">{result.destinationLine}</p>
              </div>
            </div>
                        <button
              onClick={handleSaveFavorite}
              className="mt-3 text-sm font-['Inter'] text-[#E08E52] hover:text-[#c9793f] flex items-center gap-1"
            >
              ⭐ Save this route to favorites
            </button>

            <div className="grid grid-cols-4 gap-4 mt-6">
              <div>
                <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">STOPS</p>
                <p className="font-['Fraunces'] text-lg font-semibold mt-1 text-[#3E332A]">{result.numberOfStops}</p>
              </div>
              <div>
                <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">DISTANCE</p>
                <p className="font-['Fraunces'] text-lg font-semibold mt-1 text-[#3E332A]">{result.distanceKm} km</p>
              </div>
              <div>
                <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">TIME</p>
                <p className="font-['Fraunces'] text-lg font-semibold mt-1 text-[#3E332A]">{result.estimatedTimeMinutes} min</p>
              </div>
              <div>
                <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">FARE</p>
                <p className="font-['Fraunces'] text-lg font-semibold mt-1 text-[#8FAF7D]">₹{result.fare}</p>
              </div>
            </div>

            {crowdData && (
              <div className="mt-6 bg-[#FBF6EC] border border-[#E4D9C4] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">
                    CROWD PREDICTION
                  </p>
                  <span
                    className="font-['Inter'] text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      color:
                        crowdData.currentLevel === "High" ? "#C0654A" :
                        crowdData.currentLevel === "Moderate" ? "#B8860B" : "#4A6741",
                      backgroundColor:
                        crowdData.currentLevel === "High" ? "#FBEAE5" :
                        crowdData.currentLevel === "Moderate" ? "#FBF3DC" : "#F0F5EB",
                    }}
                  >
                    {crowdData.currentLevel} now
                  </span>
                </div>

                <div className="flex items-end justify-between gap-2">
                  {crowdData.hourlyForecast.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full h-16 bg-white border border-[#E4D9C4] rounded-lg flex items-end overflow-hidden">
                        <div
                          className="w-full transition-all"
                          style={{
                            height: `${h.percent}%`,
                            backgroundColor:
                              h.level === "High" ? "#E08E52" :
                              h.level === "Moderate" ? "#D9B65C" :
                              h.level === "Low" ? "#9BB88A" : "#B8CBB0",
                          }}
                        ></div>
                      </div>
                      <span className="font-['JetBrains_Mono'] text-[9px] text-[#A89985]">{h.label}</span>
                    </div>
                  ))}
                </div>
                <p className="font-['Inter'] text-xs text-[#A89985] mt-3">
                  Based on typical time-of-day travel patterns.
                </p>
              </div>
            )}

            <RouteHighlightMap
              source={result.source}
              destination={result.destination}
              sourceLine={result.sourceLine}
              destinationLine={result.destinationLine}
            />

            <JourneyGuide
              source={result.source}
              destination={result.destination}
              sourceLine={result.sourceLine}
              destinationLine={result.destinationLine}
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;