// Real-world-ish timing assumptions, based on typical Namma Metro spacing
export const MINUTES_PER_STATION = 2.5;
export const TRAIN_FREQUENCY_MINUTES = 6; // a new train departs the start of the line every 6 minutes
export const DOOR_OPEN_SECONDS = 20; // how long doors stay open at each station

export function getStationTrainInfo(stationIndex, totalStations, referenceTimeMs = Date.now()) {
  const cycleLengthMinutes = (totalStations - 1) * MINUTES_PER_STATION * 2;
  const cycleLengthMs = cycleLengthMinutes * 60 * 1000;

  const elapsedInCycle = referenceTimeMs % cycleLengthMs;

  const forwardTimeMs = stationIndex * MINUTES_PER_STATION * 60 * 1000;
  const backwardTimeMs = cycleLengthMs - stationIndex * MINUTES_PER_STATION * 60 * 1000;

  const candidates = [forwardTimeMs, backwardTimeMs, forwardTimeMs + cycleLengthMs, backwardTimeMs - cycleLengthMs];
  let closest = candidates[0];
  for (const c of candidates) {
    if (Math.abs(c - elapsedInCycle) < Math.abs(closest - elapsedInCycle)) closest = c;
  }

  const diffMinutes = Math.round((closest - elapsedInCycle) / 60000);

  if (diffMinutes === 0) {
    return { status: "here", text: "Train is at this station now" };
  } else if (diffMinutes > 0) {
    return { status: "arriving", text: `Next train in ${diffMinutes} min` };
  } else {
    return { status: "departed", text: `Train left ${Math.abs(diffMinutes)} min ago` };
  }
}

// Single train position (0.3 = 30% of the way from station 0 to station 1), used
// internally by getMultipleTrainPositions below.
export function getContinuousTrainPosition(totalStations, referenceTimeMs = Date.now()) {
  const legDurationMs = (totalStations - 1) * MINUTES_PER_STATION * 60 * 1000;
  const cycleMs = legDurationMs * 2;
  const elapsed = referenceTimeMs % cycleMs;

  if (elapsed <= legDurationMs) {
    return elapsed / (MINUTES_PER_STATION * 60 * 1000);
  } else {
    const remaining = cycleMs - elapsed;
    return remaining / (MINUTES_PER_STATION * 60 * 1000);
  }
}

// Returns the positions of ALL trains currently in service on a line — real
// metros run several trains at once, spaced apart by TRAIN_FREQUENCY_MINUTES,
// all moving at the same speed. We simulate this by taking multiple "copies"
// of the single-train calculation, each shifted in time by one departure gap.
export function getMultipleTrainPositions(totalStations, referenceTimeMs = Date.now(), numTrains = 5) {
  const legDurationMs = (totalStations - 1) * MINUTES_PER_STATION * 60 * 1000;
  const cycleMs = legDurationMs * 2;

  // Space the fixed number of trains evenly across the full there-and-back cycle
  const gapMs = cycleMs / numTrains;
  const positions = [];

  for (let k = 0; k < numTrains; k++) {
    const shiftedTime = referenceTimeMs + k * gapMs;
    positions.push(getContinuousTrainPosition(totalStations, shiftedTime));
  }

  return positions;
}