import { PURPLE_STATIONS, GREEN_STATIONS } from "../data/metroLines";
import { useRealTimeTrainPosition } from "../hooks/useRealTimeTrainPosition";

function LiveTrainStatus() {
  const purplePosition = useRealTimeTrainPosition(PURPLE_STATIONS.length, 2000);
  const greenPosition = useRealTimeTrainPosition(GREEN_STATIONS.length, 2000);

  const purpleIndex = Math.round(purplePosition);
  const greenIndex = Math.round(greenPosition);

  return (
    <div className="flex flex-wrap items-center gap-6 font-['Inter'] text-sm">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9B8AC4] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9B8AC4]"></span>
        </span>
        <span className="text-[#7A6C5D]">
          Purple Line train near <span className="text-[#3E332A] font-medium">{PURPLE_STATIONS[purpleIndex]}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8FAF7D] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8FAF7D]"></span>
        </span>
        <span className="text-[#7A6C5D]">
          Green Line train near <span className="text-[#3E332A] font-medium">{GREEN_STATIONS[greenIndex]}</span>
        </span>
      </div>
    </div>
  );
}

export default LiveTrainStatus;