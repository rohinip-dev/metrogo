import { useState } from "react";

const FACILITY_LABELS = {
  parking: { icon: "🅿️", label: "Parking" },
  restroom: { icon: "🚻", label: "Restroom" },
  atm: { icon: "🏧", label: "ATM" },
  wheelchairAccess: { icon: "♿", label: "Wheelchair Access" },
  elevator: { icon: "🛗", label: "Elevator" },
  foodCourt: { icon: "🍽️", label: "Food Court" },
  wifi: { icon: "📶", label: "Free WiFi" },
};

function StationInfoPopup({ station }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!station) return null;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Station facilities"
        className="w-5 h-5 rounded-full bg-[#FBF6EC] border border-[#E4D9C4] text-[#9B8AC4] text-xs flex items-center justify-center hover:border-[#9B8AC4] transition-colors"
      >
        ⓘ
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

          <div className="absolute z-50 left-0 top-7 w-64 bg-white border border-[#E4D9C4] rounded-2xl shadow-[0_8px_30px_rgba(155,138,196,0.2)] p-4">
            <p className="font-['Fraunces'] text-sm font-semibold text-[#3E332A] mb-3">
              {station.name}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {Object.entries(FACILITY_LABELS).map(([key, { icon, label }]) => {
                const available = station.facilities?.[key];
                return (
                  <div
                    key={key}
                    className={
                      "flex items-center gap-1.5 text-[11px] font-['Inter'] " +
                      (available ? "text-[#3E332A]" : "text-[#C9BFA9] line-through")
                    }
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>

            {station.exits && station.exits.length > 0 && (
              <div className="pt-2 border-t border-dashed border-[#E4D9C4]">
                <p className="font-['JetBrains_Mono'] text-[9px] text-[#A89985] tracking-widest mb-1">EXITS</p>
                {station.exits.map((exit, i) => (
                  <p key={i} className="text-[11px] font-['Inter'] text-[#7A6C5D]">{exit}</p>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StationInfoPopup;