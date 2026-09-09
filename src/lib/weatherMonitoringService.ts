import { Vehicle, WeatherStation, AlertItem, LatLng, WeatherEtaAdjustment, SeverityLevel } from '../types';

/**
 * Calculates Great-Circle distance between two coordinates in kilometers using Haversine formula.
 */
export function calculateHaversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const aComp = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(aComp), Math.sqrt(1 - aComp));
  return R * c;
}

/**
 * Formats a duration in minutes to human-readable format like "4h 25m" or "45m"
 */
export function formatDurationMinutes(minutes: number): string {
  const totalMins = Math.max(0, Math.round(minutes));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
}

/**
 * Calculates remaining route distance in km based on vehicle's current index and coordinates.
 */
export function calculateRemainingRouteDistanceKm(vehicle: Vehicle): number {
  const coords = vehicle.routeCoordinates;
  if (!coords || coords.length === 0) {
    // Fallback straight-line distance with winding mountain multiplier 1.65x
    return calculateHaversineDistance(vehicle.coords, vehicle.destinationCoords) * 1.65;
  }

  let distance = 0;
  const currentIndex = Math.min(vehicle.currentRouteIndex, coords.length - 1);

  // Distance from current position to next waypoint
  if (coords[currentIndex]) {
    distance += calculateHaversineDistance(vehicle.coords, coords[currentIndex]);
  }

  // Sum rest of remaining waypoints
  for (let i = currentIndex; i < coords.length - 1; i++) {
    distance += calculateHaversineDistance(coords[i], coords[i + 1]);
  }

  return Math.max(8, Number(distance.toFixed(1)));
}

/**
 * Finds the closest weather monitoring station to a coordinate.
 */
export function findNearestWeatherStation(
  coords: LatLng,
  stations: WeatherStation[]
): { station: WeatherStation; distanceKm: number } | null {
  if (!stations || stations.length === 0) return null;

  let nearest = stations[0];
  let minDistance = calculateHaversineDistance(coords, stations[0].coords);

  for (let i = 1; i < stations.length; i++) {
    const d = calculateHaversineDistance(coords, stations[i].coords);
    if (d < minDistance) {
      minDistance = d;
      nearest = stations[i];
    }
  }

  return { station: nearest, distanceKm: Number(minDistance.toFixed(1)) };
}

/**
 * Gathers all active weather and disruption alerts affecting the vehicle's corridor.
 */
export function getCorridorWeatherAlerts(
  vehicle: Vehicle,
  alerts: AlertItem[],
  maxRadiusKm = 75
): AlertItem[] {
  if (!alerts || alerts.length === 0) return [];

  const vehicleCoords = vehicle.coords;
  const destCoords = vehicle.destinationCoords;
  const routeWaypoints = vehicle.routeCoordinates || [];

  return alerts.filter(alert => {
    // Check if alert source or text is weather related
    const isWeather =
      alert.source === 'IMD Weather' ||
      alert.source === 'Automated Sensor' ||
      alert.title.toLowerCase().includes('rain') ||
      alert.title.toLowerCase().includes('monsoon') ||
      alert.title.toLowerCase().includes('flood') ||
      alert.title.toLowerCase().includes('landslide') ||
      alert.title.toLowerCase().includes('cloudburst') ||
      alert.title.toLowerCase().includes('slump') ||
      alert.title.toLowerCase().includes('fog');

    if (!isWeather) return false;

    // Check proximity to vehicle position or destination
    const distToVehicle = calculateHaversineDistance(alert.coords, vehicleCoords);
    const distToDest = calculateHaversineDistance(alert.coords, destCoords);
    if (distToVehicle <= maxRadiusKm || distToDest <= maxRadiusKm) return true;

    // Check proximity to any upcoming route waypoint
    return routeWaypoints.some(pt => calculateHaversineDistance(alert.coords, pt) <= 35);
  });
}

export interface WeatherScenarioOverride {
  scenarioName?: string;
  rainfallMmHr?: number;
  landslideRiskPercent?: number;
  roadCondition?: WeatherStation['roadCondition'];
  windSpeedKmH?: number;
}

/**
 * Primary Live Weather-Aware ETA Calculation Algorithm.
 * Evaluates real-time weather stations, rainfall rates, road friction penalties,
 * and active IMD alerts to compute dynamic ETA and tactical driver guidance.
 */
export function calculateLiveWeatherEta(
  vehicle: Vehicle,
  weatherStations: WeatherStation[],
  alerts: AlertItem[],
  scenarioOverride?: WeatherScenarioOverride
): WeatherEtaAdjustment {
  const remainingKm = calculateRemainingRouteDistanceKm(vehicle);

  // Determine nominal base speed under optimal dry mountain conditions
  let nominalSpeed = 46; // km/h
  if (vehicle.vehicleType === 'Heavy Truck') nominalSpeed = 38;
  else if (vehicle.vehicleType === 'Fuel Tanker') nominalSpeed = 34;
  else if (vehicle.vehicleType === '4WD Supply Carrier') nominalSpeed = 48;
  else if (vehicle.vehicleType === 'Refrigerated Medical Van') nominalSpeed = 50;

  // Base nominal minutes without adverse weather delays
  const nominalMinutes = Math.max(15, Math.round((remainingKm / nominalSpeed) * 60));

  // Identify nearest weather monitoring station along vehicle's sector
  const nearestResult = findNearestWeatherStation(vehicle.coords, weatherStations);
  const nearestStation = nearestResult?.station;

  // Active weather alerts on corridor
  const activeAlerts = getCorridorWeatherAlerts(vehicle, alerts);

  // Weather parameters (using overrides if set for simulation testing, otherwise live station data)
  const rainfallRate = scenarioOverride?.rainfallMmHr !== undefined
    ? scenarioOverride.rainfallMmHr
    : nearestStation?.rainfallMmHr || 22;

  const landslideProb = scenarioOverride?.landslideRiskPercent !== undefined
    ? scenarioOverride.landslideRiskPercent
    : nearestStation?.landslideProbabilityPercent || 35;

  const roadCondition = scenarioOverride?.roadCondition !== undefined
    ? scenarioOverride.roadCondition
    : nearestStation?.roadCondition || 'Slippery';

  // 1. Rainfall Deceleration Penalty
  // High-altitude winding terrain experiences severe speed reduction in downpours
  let rainDecelerationFactor = 0.08; // 8% normal dampness
  if (rainfallRate > 60) rainDecelerationFactor = 0.55; // Extreme deluge
  else if (rainfallRate > 40) rainDecelerationFactor = 0.40; // Heavy monsoon downpour
  else if (rainfallRate > 20) rainDecelerationFactor = 0.22; // Moderate monsoon showers
  else if (rainfallRate > 5) rainDecelerationFactor = 0.12; // Light mountain drizzle

  let rainfallDecelMinutes = Math.round(nominalMinutes * rainDecelerationFactor);

  // 2. Slope Saturation, Mud Rutting & Landslide Hazard Delay
  let slopeDelayMinutes = 0;
  if (landslideProb > 75) {
    slopeDelayMinutes += 65; // High slide likelihood, crawl mode & rockfall debris clearance
  } else if (landslideProb > 50) {
    slopeDelayMinutes += 35; // Precautionary passing, spotter halts
  } else if (landslideProb > 30) {
    slopeDelayMinutes += 15;
  }

  // Check if there are active CRITICAL or HIGH road blockage alerts
  const criticalBlockAlerts = activeAlerts.filter(a => a.severity === 'CRITICAL');
  const highBlockAlerts = activeAlerts.filter(a => a.severity === 'HIGH');

  if (criticalBlockAlerts.length > 0) {
    slopeDelayMinutes += 75; // Active arterial road rupture or rock slip
  } else if (highBlockAlerts.length > 0) {
    slopeDelayMinutes += 30;
  }

  // 3. Road Surface Friction & Visibility Delay
  let visibilityDelayMinutes = 0;
  if (roadCondition === 'Closed') {
    visibilityDelayMinutes += 120;
  } else if (roadCondition === 'Partially Blocked') {
    visibilityDelayMinutes += 45;
  } else if (roadCondition === 'Waterlogged') {
    visibilityDelayMinutes += 30;
  } else if (roadCondition === 'Slippery') {
    visibilityDelayMinutes += 15;
  }

  // Total Delay in Minutes
  const totalDelayMinutes = rainfallDecelMinutes + slopeDelayMinutes + visibilityDelayMinutes;
  const adjustedMinutes = nominalMinutes + totalDelayMinutes;

  // Arrival timestamp computation
  const now = new Date();
  const arrivalTime = new Date(now.getTime() + adjustedMinutes * 60 * 1000);
  const timeFormatted = arrivalTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const predictedArrivalTimestamp = `${timeFormatted} (IST)`;

  // Safe Speed Recommendation (km/h)
  let safeSpeedKmH = nominalSpeed;
  if (rainfallRate > 50 || landslideProb > 70) {
    safeSpeedKmH = Math.min(22, nominalSpeed * 0.5);
  } else if (rainfallRate > 25 || roadCondition === 'Waterlogged') {
    safeSpeedKmH = Math.min(30, nominalSpeed * 0.7);
  } else if (roadCondition === 'Slippery') {
    safeSpeedKmH = Math.min(36, nominalSpeed * 0.85);
  }
  safeSpeedKmH = Math.round(safeSpeedKmH);

  // Weather Hazard Score (0 - 100)
  const weatherHazardScore = Math.min(
    100,
    Math.round(
      rainfallRate * 0.65 +
      landslideProb * 0.45 +
      (criticalBlockAlerts.length > 0 ? 30 : highBlockAlerts.length > 0 ? 18 : 0) +
      (roadCondition === 'Partially Blocked' || roadCondition === 'Closed' ? 25 : 0)
    )
  );

  // Weather Severity Level
  let weatherSeverity: SeverityLevel = 'LOW';
  if (weatherHazardScore >= 75) weatherSeverity = 'CRITICAL';
  else if (weatherHazardScore >= 50) weatherSeverity = 'HIGH';
  else if (weatherHazardScore >= 25) weatherSeverity = 'MEDIUM';

  // Weather Condition Summary
  let weatherConditionSummary = 'Favorable mountain driving conditions';
  if (rainfallRate > 50) {
    weatherConditionSummary = `Severe Cloudburst Deluge (${rainfallRate} mm/hr) & Mud Slips`;
  } else if (rainfallRate > 25) {
    weatherConditionSummary = `Heavy Monsoon Torrential Rains (${rainfallRate} mm/hr) & Reduced Traction`;
  } else if (rainfallRate > 10) {
    weatherConditionSummary = `Moderate Mountain Rain (${rainfallRate} mm/hr) on Saturated Surface`;
  } else if (landslideProb > 60) {
    weatherConditionSummary = `High Geological Slope Vulnerability (${landslideProb}%)`;
  }

  // Driver Advisory
  let driverAdvisory = 'Normal transit protocols. Maintain steady throttle on switchbacks.';
  if (weatherSeverity === 'CRITICAL') {
    driverAdvisory = `CRITICAL WEATHER WARNING: Saturated slope hazard with ${rainfallRate} mm/hr rain. Engage low-ratio 4WD. Restrict speed below ${safeSpeedKmH} km/h. Maintain 50m vehicle separation. If debris covers roadway, halt at nearest BRO safe turnout.`;
  } else if (weatherSeverity === 'HIGH') {
    driverAdvisory = `ADVERSE MONSOON CONDITIONS: Wet pavement braking distance tripled. Cap speed at ${safeSpeedKmH} km/h. Watch for falling stones near sheer rock cuttings.`;
  } else if (weatherSeverity === 'MEDIUM') {
    driverAdvisory = `MODERATE RAIN ADVISORY: Road surface slippery. Exercise caution on hairpin turns. Keep headlights on low beam.`;
  }

  return {
    vehicleId: vehicle.id,
    nominalMinutes,
    nominalEtaFormatted: formatDurationMinutes(nominalMinutes),
    adjustedMinutes,
    adjustedEtaFormatted: formatDurationMinutes(adjustedMinutes),
    delayDeltaMinutes: totalDelayMinutes,
    delayDeltaFormatted: `+${formatDurationMinutes(totalDelayMinutes)}`,
    predictedArrivalTimestamp,
    distanceRemainingKm: remainingKm,
    weatherHazardScore,
    weatherConditionSummary,
    weatherSeverity,
    activeWeatherAlerts: activeAlerts,
    nearestStation,
    safeSpeedRecommendationKmH: safeSpeedKmH,
    delayBreakdown: {
      rainfallDecelerationMinutes: rainfallDecelMinutes,
      slopeHazardMinutes: slopeDelayMinutes,
      visibilityOrSlushMinutes: visibilityDelayMinutes,
    },
    driverAdvisory,
  };
}
