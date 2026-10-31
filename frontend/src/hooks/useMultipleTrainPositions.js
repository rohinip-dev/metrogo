import { useState, useEffect } from "react";
import { getMultipleTrainPositions } from "../data/trainSchedule";

export function useMultipleTrainPositions(totalStations, updateEveryMs = 1000, numTrains = 5) {
  const [positions, setPositions] = useState(() => getMultipleTrainPositions(totalStations, Date.now(), numTrains));

  useEffect(() => {
    const timer = setInterval(() => {
      setPositions(getMultipleTrainPositions(totalStations, Date.now(), numTrains));
    }, updateEveryMs);
    return () => clearInterval(timer);
  }, [totalStations, updateEveryMs, numTrains]);

  return positions;
}