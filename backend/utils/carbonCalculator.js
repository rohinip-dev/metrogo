// Real-world-ish average emission factors (grams of CO2 per passenger-km).
// A petrol car averages roughly 120g CO2/km per passenger; a metro system
// (shared across many passengers, electric-powered) averages far lower,
// commonly cited around 25-35g CO2/km per passenger. We use 30g here.
const CAR_EMISSIONS_G_PER_KM = 120;
const METRO_EMISSIONS_G_PER_KM = 30;

function calculateCarbonSaved(distanceKm) {
  const carEmissionsGrams = distanceKm * CAR_EMISSIONS_G_PER_KM;
  const metroEmissionsGrams = distanceKm * METRO_EMISSIONS_G_PER_KM;
  const savedGrams = carEmissionsGrams - metroEmissionsGrams;

  return {
    carEmissionsKg: Number((carEmissionsGrams / 1000).toFixed(2)),
    metroEmissionsKg: Number((metroEmissionsGrams / 1000).toFixed(2)),
    savedKg: Number((savedGrams / 1000).toFixed(2)),
  };
}

module.exports = { calculateCarbonSaved };