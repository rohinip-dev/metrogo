import { PURPLE_STATIONS, GREEN_STATIONS, INTERCHANGE_STATION } from "../data/metroLines";

function StationRow({ stations, color, highlightSet }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative inline-flex items-center gap-8 px-4 min-w-max">
        <div className="absolute left-0 right-0 top-[6px] h-[2px] opacity-30" style={{ backgroundColor: color }}></div>
        {stations.map((name) => {
          const isHighlighted = highlightSet.has(name);
          return (
            <div key={name} className="relative z-10 flex flex-col items-center gap-2 shrink-0">
              <div
                className={isHighlighted ? "w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-white" : "w-2.5 h-2.5 rounded-full"}
                style={{
                  backgroundColor: isHighlighted ? "#E08E52" : color,
                  opacity: isHighlighted ? 1 : 0.35,
                  "--tw-ring-color": "#E08E52",
                }}
              ></div>
              <span
                className="font-['JetBrains_Mono'] text-[9px] text-center max-w-[65px]"
                style={{ color: isHighlighted ? "#3E332A" : "#B8AC98", fontWeight: isHighlighted ? 600 : 400 }}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RouteHighlightMap({ source, destination, sourceLine, destinationLine }) {
  const highlightPurple = new Set();
  const highlightGreen = new Set();

  const addRange = (arr, from, to, set) => {
    const i1 = arr.indexOf(from);
    const i2 = arr.indexOf(to);
    if (i1 === -1 || i2 === -1) return;
    const [start, end] = i1 < i2 ? [i1, i2] : [i2, i1];
    for (let i = start; i <= end; i++) set.add(arr[i]);
  };

  if (sourceLine === destinationLine) {
    const list = sourceLine === "Purple Line" ? PURPLE_STATIONS : GREEN_STATIONS;
    const set = sourceLine === "Purple Line" ? highlightPurple : highlightGreen;
    addRange(list, source, destination, set);
  } else {
    if (sourceLine === "Purple Line") {
      addRange(PURPLE_STATIONS, source, INTERCHANGE_STATION, highlightPurple);
      addRange(GREEN_STATIONS, INTERCHANGE_STATION, destination, highlightGreen);
    } else {
      addRange(GREEN_STATIONS, source, INTERCHANGE_STATION, highlightGreen);
      addRange(PURPLE_STATIONS, INTERCHANGE_STATION, destination, highlightPurple);
    }
  }

  return (
    <div className="mt-6 bg-white border border-[#E4D9C4] rounded-2xl p-6">
      <p className="font-['JetBrains_Mono'] text-[10px] tracking-widest text-[#A89985] mb-4">
        YOUR ROUTE HIGHLIGHTED
      </p>
      {highlightPurple.size > 0 && (
        <div className="mb-4">
          <p className="font-['JetBrains_Mono'] text-[10px] text-[#9B8AC4] mb-2">PURPLE LINE</p>
          <StationRow stations={PURPLE_STATIONS} color="#9B8AC4" highlightSet={highlightPurple} />
        </div>
      )}
      {highlightGreen.size > 0 && (
        <div>
          <p className="font-['JetBrains_Mono'] text-[10px] text-[#8FAF7D] mb-2">GREEN LINE</p>
          <StationRow stations={GREEN_STATIONS} color="#8FAF7D" highlightSet={highlightGreen} />
        </div>
      )}
    </div>
  );
}

export default RouteHighlightMap;