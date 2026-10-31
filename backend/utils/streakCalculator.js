// Converts a booking's timestamp into just a date string (YYYY-MM-DD),
// so we can compare "which days" someone traveled on, ignoring the exact time.
function toDateString(date) {
  return new Date(date).toISOString().split("T")[0];
}

// Works out the current streak (consecutive days ending today or yesterday)
// and the longest streak ever achieved, based on a list of booking dates.
function calculateStreaks(bookingDates) {
  if (bookingDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get unique days only (multiple trips on the same day count as one streak day)
  const uniqueDays = [...new Set(bookingDates.map(toDateString))].sort().reverse();
  // uniqueDays is now newest-first, e.g. ["2026-09-12", "2026-09-11", "2026-09-09", ...]

  const oneDayMs = 24 * 60 * 60 * 1000;
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - oneDayMs));

  // ===== Current streak =====
  let currentStreak = 0;
  if (uniqueDays[0] === today || uniqueDays[0] === yesterday) {
    currentStreak = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const current = new Date(uniqueDays[i]);
      const next = new Date(uniqueDays[i + 1]);
      const diffDays = Math.round((current - next) / oneDayMs);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // ===== Longest streak ever =====
  let longestStreak = 1;
  let running = 1;
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const current = new Date(uniqueDays[i]);
    const next = new Date(uniqueDays[i + 1]);
    const diffDays = Math.round((current - next) / oneDayMs);
    if (diffDays === 1) {
      running++;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 1;
    }
  }

  return { currentStreak, longestStreak };
}

// Checks the passenger's stats against a fixed list of badge milestones,
// and returns which ones they've earned (plus the ones still locked, so
// the UI can show "almost there" progress too).
function calculateBadges({ totalTrips, uniqueStations, linesUsed, currentStreak, carbonSavedKg }) {
  const badges = [
    {
      id: "first_ride",
      label: "First Ride",
      icon: "🎫",
      description: "Booked your very first ticket",
      earned: totalTrips >= 1,
    },
    {
      id: "regular_rider",
      label: "Regular Rider",
      icon: "🚇",
      description: "Completed 10 trips",
      earned: totalTrips >= 10,
    },
    {
      id: "metro_veteran",
      label: "Metro Veteran",
      icon: "🏆",
      description: "Completed 25 trips",
      earned: totalTrips >= 25,
    },
    {
      id: "explorer",
      label: "Explorer",
      icon: "🗺️",
      description: "Visited 10 different stations",
      earned: uniqueStations >= 10,
    },
    {
      id: "line_master",
      label: "Line Master",
      icon: "⚡",
      description: "Traveled on both Purple and Green lines",
      earned: linesUsed >= 2,
    },
    {
      id: "week_warrior",
      label: "Week Warrior",
      icon: "🔥",
      description: "7-day travel streak",
      earned: currentStreak >= 7,
    },
    {
      id: "eco_warrior",
      label: "Eco Warrior",
      icon: "🌱",
      description: "Saved 5kg+ of CO₂ by taking the metro",
      earned: carbonSavedKg >= 5,
    },
  ];

  return badges;
}

module.exports = { calculateStreaks, calculateBadges };