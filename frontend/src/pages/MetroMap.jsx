import { useState } from "react";
import { PURPLE_STATIONS, GREEN_STATIONS } from "../data/metroLines";
import { useMultipleTrainPositions } from "../hooks/useMultipleTrainPositions";
import { getStationTrainInfo } from "../data/trainSchedule";

function LineStrip({ stations, color, lineLabel }) {
  return (
    <div>
      <p className="font-['JetBrains_Mono'] text-[11px] tracking-widest mb-4" style={{ color }}>{lineLabel}</p>
      <div className="overflow-x-auto pb-4">
        <div className="relative inline-flex items-center gap-10 px-4 min-w-max">
          <div className="absolute left-0 right-0 top-[6px] h-[2px] opacity-40" style={{ backgroundColor: color }}></div>
          {stations.map((name) => {
            const isInterchange = name === "Nadaprabhu Kempegowda";
            return (
              <div key={name} className="relative z-10 flex flex-col items-center gap-2 shrink-0">
                <div className={isInterchange ? "w-5 h-5 rounded-full ring-2 ring-offset-2 ring-offset-[#FBF6EC]" : "w-3 h-3 rounded-full"} style={{ backgroundColor: isInterchange ? "#E08E52" : color, "--tw-ring-color": "#E08E52" }}></div>
                <span className="font-['JetBrains_Mono'] text-[10px] text-center max-w-[75px] text-[#3E332A]/80">{name}</span>
                {isInterchange && <span className="text-[9px] text-[#E08E52] font-semibold">⇄ Interchange</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FullNetworkDiagram() {
  const purplePositions = useMultipleTrainPositions(PURPLE_STATIONS.length, 1000);
  const greenPositions = useMultipleTrainPositions(GREEN_STATIONS.length, 1000);
  const [hovered, setHovered] = useState(null);

  const spacing = 62;
  const leftPad = 40;
  const purpleY = 160;
  const greenY = 300;
  const svgHeight = 460;

  const purpleInterchangeIndex = PURPLE_STATIONS.indexOf("Nadaprabhu Kempegowda");
  const greenInterchangeIndex = GREEN_STATIONS.indexOf("Nadaprabhu Kempegowda");

  const width = leftPad * 2 + Math.max(PURPLE_STATIONS.length, GREEN_STATIONS.length) * spacing;

  const purpleInterchangeX = leftPad + purpleInterchangeIndex * spacing;
  const greenInterchangeX = leftPad + greenInterchangeIndex * spacing;

  const showTooltip = (x, y, index, list) => {
    const info = getStationTrainInfo(index, list.length);
    setHovered({ x, y: y - 18, text: info.text });
  };

  return (
    <div className="overflow-x-auto">
      <div className="relative inline-block">
        <svg width={width} height={svgHeight}>
          <line x1={leftPad} y1={purpleY} x2={leftPad + (PURPLE_STATIONS.length - 1) * spacing} y2={purpleY} stroke="#9B8AC4" strokeWidth="3" />
          <line x1={leftPad} y1={greenY} x2={leftPad + (GREEN_STATIONS.length - 1) * spacing} y2={greenY} stroke="#8FAF7D" strokeWidth="3" />
          <line x1={purpleInterchangeX} y1={purpleY} x2={greenInterchangeX} y2={greenY} stroke="#E08E52" strokeWidth="3" strokeDasharray="6,5" />

          {PURPLE_STATIONS.map((name, i) => {
            const isInterchange = name === "Nadaprabhu Kempegowda";
            const x = leftPad + i * spacing;
            return (
              <g key={"p-" + name}>
                <circle cx={x} cy={purpleY} r="14" fill="transparent" onMouseEnter={() => showTooltip(x, purpleY, i, PURPLE_STATIONS)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }} />
                <circle cx={x} cy={purpleY} r={isInterchange ? 8 : 5} fill={isInterchange ? "#E08E52" : "#9B8AC4"} stroke="#FBF6EC" strokeWidth="2" />
                <text x={x + 6} y={purpleY - 10} fontSize="10" fontFamily="JetBrains Mono" fill="#3E332A" textAnchor="start" transform={`rotate(-45, ${x + 6}, ${purpleY - 10})`}>{name}</text>
              </g>
            );
          })}

          {GREEN_STATIONS.map((name, i) => {
            const isInterchange = name === "Nadaprabhu Kempegowda";
            const x = leftPad + i * spacing;
            return (
              <g key={"g-" + name}>
                <circle cx={x} cy={greenY} r="14" fill="transparent" onMouseEnter={() => showTooltip(x, greenY, i, GREEN_STATIONS)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }} />
                <circle cx={x} cy={greenY} r={isInterchange ? 8 : 5} fill={isInterchange ? "#E08E52" : "#8FAF7D"} stroke="#FBF6EC" strokeWidth="2" />
                <text x={x + 6} y={greenY + 10} fontSize="10" fontFamily="JetBrains Mono" fill="#3E332A" textAnchor="start" transform={`rotate(45, ${x + 6}, ${greenY + 10})`}>{name}</text>
              </g>
            );
          })}

          {/* Multiple Purple Line trains, all moving at the same speed, spaced by departure frequency */}
          {purplePositions.map((pos, i) => (
            <g key={"pt-" + i} style={{ transform: `translate(${leftPad + pos * spacing}px, 0px)`, transition: "transform 1s linear" }}>
              <circle cy={purpleY} r="9" fill="#E08E52" stroke="white" strokeWidth="2" />
              <text x="0" y={purpleY + 4} fontSize="9" textAnchor="middle">🚆</text>
            </g>
          ))}

          {/* Multiple Green Line trains */}
          {greenPositions.map((pos, i) => (
            <g key={"gt-" + i} style={{ transform: `translate(${leftPad + pos * spacing}px, 0px)`, transition: "transform 1s linear" }}>
              <circle cy={greenY} r="9" fill="#E08E52" stroke="white" strokeWidth="2" />
              <text x="0" y={greenY + 4} fontSize="9" textAnchor="middle">🚆</text>
            </g>
          ))}

          <text x={(purpleInterchangeX + greenInterchangeX) / 2 + 14} y={(purpleY + greenY) / 2} fontSize="11" fontFamily="JetBrains Mono" fill="#E08E52" fontWeight="bold">⇄ Interchange</text>
        </svg>

        {hovered && (
          <div className="absolute bg-[#3E332A] text-white text-[11px] font-['Inter'] px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none -translate-x-1/2 -translate-y-full" style={{ left: hovered.x, top: hovered.y }}>
            {hovered.text}
          </div>
        )}
      </div>
    </div>
  );
}

function MetroMap() {
  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#3E332A] px-6 pt-32 pb-24">
      <div className="max-w-6xl mx-auto">
        <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#E08E52] mb-3">NETWORK MAP</p>
        <h1 className="font-['Fraunces'] text-4xl font-semibold mb-3 text-[#3E332A]">MetroGo Network</h1>
        <p className="font-['Inter'] text-[#7A6C5D] mb-4">A full reference map of both metro lines and their connecting interchange station.</p>

        <div className="flex items-center gap-6 mb-12 font-['Inter'] text-sm">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#9B8AC4]"></span><span className="text-[#3E332A]">Purple Line</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#8FAF7D]"></span><span className="text-[#3E332A]">Green Line</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#E08E52] ring-2 ring-offset-2 ring-offset-[#FBF6EC] ring-[#E08E52]"></span><span className="text-[#3E332A]">Interchange Station</span></div>
        </div>

        <div className="space-y-14 bg-white border border-[#E4D9C4] rounded-3xl p-8 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
          <LineStrip stations={PURPLE_STATIONS} color="#9B8AC4" lineLabel="PURPLE LINE" />
          <LineStrip stations={GREEN_STATIONS} color="#8FAF7D" lineLabel="GREEN LINE" />
        </div>

        <div className="mt-10 bg-white border border-[#E4D9C4] rounded-3xl p-8 shadow-[0_4px_20px_rgba(155,138,196,0.1)]">
          <p className="font-['JetBrains_Mono'] text-[11px] tracking-widest mb-2 text-[#A89985]">FULL NETWORK — BOTH LINES CONNECTED</p>
          <p className="font-['Inter'] text-xs text-[#A89985] mb-6">Hover over any station to see live train timing. Multiple trains run on each line, all at real metro speed (~2.5 min per station).</p>
          <FullNetworkDiagram />
        </div>
      </div>
    </div>
  );
}

export default MetroMap;