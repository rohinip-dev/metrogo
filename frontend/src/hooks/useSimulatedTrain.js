import { useState, useEffect, useRef } from "react";

export function useSimulatedTrain(totalStations, intervalMs = 2200) {
  const [index, setIndex] = useState(0);
  const direction = useRef(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => {
        let next = prev + direction.current;
        if (next >= totalStations - 1) {
          next = totalStations - 1;
          direction.current = -1;
        } else if (next <= 0) {
          next = 0;
          direction.current = 1;
        }
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [totalStations, intervalMs]);

  return index;
}