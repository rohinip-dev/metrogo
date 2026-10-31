import { useState, useEffect } from "react";
import { getContinuousTrainPosition, getMultipleTrainPositions } from "../data/trainSchedule";

export function useRealTimeTrainPosition(totalStations, updateEveryMs = 1000) {
  const [position, setPosition] = useState(() => getContinuousTrainPosition(totalStations));

  useEffect(() => {
    const timer = setInterval(() => {
      setPosition(getContinuousTrainPosition(totalStations));
    }, updateEveryMs);
    return () => clearInterval(timer);
  }, [totalStations, updateEveryMs]);

  return position;
}

export function useMultipleTrainPositions(totalStations, numTrains = 3, updateEveryMs = 1000) {
  const [positions, setPositions] = useState(() =>
    getMultipleTrainPositions(totalStations, numTrains)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setPositions(getMultipleTrainPositions(totalStations, numTrains));
    }, updateEveryMs);
    return () => clearInterval(timer);
  }, [totalStations, numTrains, updateEveryMs]);

  return positions;
}