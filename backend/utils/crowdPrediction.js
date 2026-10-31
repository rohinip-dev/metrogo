
// Simulates crowd prediction using time-of-day patterns, since no real
// live sensor/footfall data exists for this project. This mirrors how
// many real transit apps estimate crowding without live sensors.

function getCrowdLevelForHour(hour) {
  const isMorningRush = hour >= 8 && hour <= 10;
  const isEveningRush = hour >= 17 && hour <= 20;
  const isMidday = hour >= 11 && hour <= 16;
  const isLateNight = hour >= 22 || hour <= 5;

  if (isMorningRush || isEveningRush) return "High";
  if (isMidday) return "Moderate";
  if (isLateNight) return "Very Low";
  return "Low";
}

function getCrowdPercent(level) {
  const map = { "High": 85, "Moderate": 55, "Low": 30, "Very Low": 10 };
  return map[level];
}

function predictCrowd() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentLevel = getCrowdLevelForHour(currentHour);

  const hourlyForecast = [];
  for (let i = 0; i < 6; i++) {
    const hour = (currentHour + i) % 24;
    const level = getCrowdLevelForHour(hour);
    hourlyForecast.push({
      hour,
      label: i === 0 ? "Now" : `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? "AM" : "PM"}`,
      level,
      percent: getCrowdPercent(level),
    });
  }

  return {
    currentLevel,
    currentPercent: getCrowdPercent(currentLevel),
    hourlyForecast,
  };
}

module.exports = { predictCrowd };