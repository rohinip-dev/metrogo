function getCrowdLevel(hour) {
  const isMorningRush = hour >= 8 && hour <= 10;
  const isEveningRush = hour >= 17 && hour <= 20;
  const isMidday = hour >= 11 && hour <= 16;

  if (isMorningRush || isEveningRush) return "High";
  if (isMidday) return "Moderate";
  return "Low";
}

function getSmartRecommendation() {
  const hour = new Date().getHours();
  const crowdLevel = getCrowdLevel(hour);

  const coaches = [1, 2, 3, 4, 5, 6];
  let recommendedCoach;

  if (crowdLevel === "High") {
    recommendedCoach = Math.random() < 0.5 ? 1 : 6;
  } else if (crowdLevel === "Moderate") {
    const lessCrowdedOptions = [1, 2, 5, 6];
    recommendedCoach = lessCrowdedOptions[Math.floor(Math.random() * lessCrowdedOptions.length)];
  } else {
    recommendedCoach = coaches[Math.floor(Math.random() * coaches.length)];
  }

  const reasons = {
    High: `Coach ${recommendedCoach} tends to be less crowded during peak hours — it's farther from the main escalators where most passengers cluster.`,
    Moderate: `Coach ${recommendedCoach} currently has a comfortable crowd level.`,
    Low: `Trains are quiet right now — Coach ${recommendedCoach} is a great pick, though most coaches will be comfortable.`,
  };

  return {
    crowdLevel,
    recommendedCoach,
    reason: reasons[crowdLevel],
  };
}

module.exports = { getSmartRecommendation };