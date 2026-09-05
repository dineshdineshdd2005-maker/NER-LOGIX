import { RouteOption, SeverityLevel, Vehicle } from '../types';

export interface HistoricalSegmentMetric {
  segmentId: string;
  name: string;
  corridor: string;
  distanceKm: number;
  elevationRangeM: [number, number];
  nominalSpeedKmH: number;
  historicalMonsoonSpeedKmH: number; // Historical average in heavy monsoon (>30mm/hr)
  avgLandslidesPerMonsoon: number;
  avgClearanceDelayMinutes: number; // Border Roads Organisation historical clearance time
  peakTrafficHours: string; // e.g., "06:30 - 08:30 (Army Convoys)"
  trafficDelayMinutes: number;
  historicalRainfallAvgMm: number; // 5-year average monthly monsoon rainfall
  roadSurfaceType: 'Bituminous 2-lane' | 'Single-lane Paved' | 'Unpaved Mountain Mud/Gravel' | 'Stabilized Concrete';
}

export interface RouteHistoricalProfile {
  routeId: string;
  routeName: string;
  corridorHighway: string;
  totalDistanceKm: number;
  fiveYearMonsoonIncidents: number;
  avgHistoricalDelayMinutes: number;
  keyVulnerability: string;
  historicalClearanceProvider: string;
  segments: HistoricalSegmentMetric[];
  historicalMonthlyRainfallMm: {
    june: number;
    july: number;
    august: number;
    september: number;
  };
  checkpointDelays: {
    location: string;
    avgWaitMinutes: number;
    reason: string;
  }[];
}

export interface GeminiEtaPrediction {
  routeId: string;
  routeName: string;
  baseEstimatedMinutes: number;
  baseEtaFormatted: string;
  geminiPredictedMinutes: number;
  geminiEtaFormatted: string;
  predictedArrivalTimestamp: string;
  delayDeltaMinutes: number;
  confidenceScorePercent: number;
  riskSeverity: SeverityLevel;
  delayBreakdown: {
    weatherDelayMinutes: number;
    weatherFactorSummary: string;
    trafficDelayMinutes: number;
    trafficFactorSummary: string;
    terrainAltitudeDelayMinutes: number;
    terrainFactorSummary: string;
    checkpointDelayMinutes: number;
    checkpointFactorSummary: string;
  };
  historicalCitations: string[];
  tacticalRecommendations: string[];
  vehicleSuitabilityNotes: string;
  segmentDelays: {
    segmentName: string;
    nominalMinutes: number;
    adjustedMinutes: number;
    delayMinutes: number;
    primaryCause: string;
  }[];
}

// Extensive Historical Data for North Eastern Region Transit Corridors (2020-2025)
export const NER_HISTORICAL_LOGISTICS_DATABASE: Record<string, RouteHistoricalProfile> = {
  'route-a': {
    routeId: 'route-a',
    routeName: 'Route A (NH-13 Trans-Arunachal)',
    corridorHighway: 'NH-13 via Bhalukpong & Sela Pass',
    totalDistanceKm: 450,
    fiveYearMonsoonIncidents: 47, // 47 major disruption events logged 2020-2025
    avgHistoricalDelayMinutes: 145,
    keyVulnerability: 'High-relief phyllite slope slides on Km 112 and high-altitude freeze-thaw slush at Sela Pass summit (4,170m)',
    historicalClearanceProvider: 'Border Roads Organisation (Project Vartak)',
    historicalMonthlyRainfallMm: {
      june: 420,
      july: 580,
      august: 510,
      september: 390,
    },
    checkpointDelays: [
      {
        location: 'Bhalukpong Inner Line Permit (ILP) Gate',
        avgWaitMinutes: 35,
        reason: 'Commercial permit stamp verification & vehicle axle weight checks (08:00 - 11:00 AM peak)',
      },
      {
        location: 'Tenga Military Transit Post',
        avgWaitMinutes: 20,
        reason: 'One-way convoy clearance synchronization for upward troop movements',
      },
    ],
    segments: [
      {
        segmentId: 'nh13-seg-1',
        name: 'Guwahati Hub to Tezpur Plains',
        corridor: 'NH-15 Multi-Lane Expressway',
        distanceKm: 180,
        elevationRangeM: [55, 120],
        nominalSpeedKmH: 60,
        historicalMonsoonSpeedKmH: 45,
        avgLandslidesPerMonsoon: 0,
        avgClearanceDelayMinutes: 0,
        peakTrafficHours: '16:00 - 19:00 (Inter-state freight)',
        trafficDelayMinutes: 25,
        historicalRainfallAvgMm: 280,
        roadSurfaceType: 'Bituminous 2-lane',
      },
      {
        segmentId: 'nh13-seg-2',
        name: 'Tezpur to Bhalukpong Foothills',
        corridor: 'Assam-Arunachal Border Link',
        distanceKm: 65,
        elevationRangeM: [120, 310],
        nominalSpeedKmH: 50,
        historicalMonsoonSpeedKmH: 35,
        avgLandslidesPerMonsoon: 1.2,
        avgClearanceDelayMinutes: 30,
        peakTrafficHours: '08:00 - 10:30 (ILP Gate Queuing)',
        trafficDelayMinutes: 35,
        historicalRainfallAvgMm: 410,
        roadSurfaceType: 'Bituminous 2-lane',
      },
      {
        segmentId: 'nh13-seg-3',
        name: 'Bhalukpong to Bomdila Escarpment (Km 80 - Km 115)',
        corridor: 'NH-13 Mountain Sector',
        distanceKm: 95,
        elevationRangeM: [310, 2415],
        nominalSpeedKmH: 38,
        historicalMonsoonSpeedKmH: 19,
        avgLandslidesPerMonsoon: 6.4,
        avgClearanceDelayMinutes: 90,
        peakTrafficHours: '06:30 - 08:30 (Northbound Convoy Priority)',
        trafficDelayMinutes: 45,
        historicalRainfallAvgMm: 590,
        roadSurfaceType: 'Single-lane Paved',
      },
      {
        segmentId: 'nh13-seg-4',
        name: 'Bomdila to Sela Pass Summit (4,170m) to Tawang',
        corridor: 'NH-13 Alpine Ridge',
        distanceKm: 110,
        elevationRangeM: [2415, 4170],
        nominalSpeedKmH: 32,
        historicalMonsoonSpeedKmH: 14,
        avgLandslidesPerMonsoon: 8.8,
        avgClearanceDelayMinutes: 120,
        peakTrafficHours: '12:00 - 15:00 (Fog & Heavy Cloudbase Inversion)',
        trafficDelayMinutes: 50,
        historicalRainfallAvgMm: 460,
        roadSurfaceType: 'Unpaved Mountain Mud/Gravel',
      },
    ],
  },
  'route-b': {
    routeId: 'route-b',
    routeName: 'Route B (Kalaktang-Shergaon Safe Corridor)',
    corridorHighway: 'State Highway 5 & Kalaktang Bypass',
    totalDistanceKm: 475,
    fiveYearMonsoonIncidents: 4, // Extremely resilient
    avgHistoricalDelayMinutes: 25,
    keyVulnerability: 'Controlled switchbacks with lower gradient; minor shoulder erosion during prolonged continuous drizzle',
    historicalClearanceProvider: 'Arunachal PWD & BRO Task Force',
    historicalMonthlyRainfallMm: {
      june: 190,
      july: 240,
      august: 220,
      september: 170,
    },
    checkpointDelays: [
      {
        location: 'Balemu Border Gate',
        avgWaitMinutes: 10,
        reason: 'Automated barcode scanner & express green-channel freight clearance',
      },
    ],
    segments: [
      {
        segmentId: 'sh5-seg-1',
        name: 'Guwahati Hub to Orang & Bhairabkunda',
        corridor: 'NH-15 & Orang Valley Link',
        distanceKm: 140,
        elevationRangeM: [55, 180],
        nominalSpeedKmH: 58,
        historicalMonsoonSpeedKmH: 50,
        avgLandslidesPerMonsoon: 0,
        avgClearanceDelayMinutes: 0,
        peakTrafficHours: '17:00 - 19:00 (Local Agricultural Haulers)',
        trafficDelayMinutes: 15,
        historicalRainfallAvgMm: 210,
        roadSurfaceType: 'Bituminous 2-lane',
      },
      {
        segmentId: 'sh5-seg-2',
        name: 'Bhairabkunda to Kalaktang Reinforced Bypass',
        corridor: 'State Highway 5 Protected Corridor',
        distanceKm: 110,
        elevationRangeM: [180, 1650],
        nominalSpeedKmH: 48,
        historicalMonsoonSpeedKmH: 42,
        avgLandslidesPerMonsoon: 0.3,
        avgClearanceDelayMinutes: 15,
        peakTrafficHours: 'Smooth all day',
        trafficDelayMinutes: 8,
        historicalRainfallAvgMm: 230,
        roadSurfaceType: 'Stabilized Concrete',
      },
      {
        segmentId: 'sh5-seg-3',
        name: 'Kalaktang to Shergaon & Rupa Valley',
        corridor: 'SH-5 Gentle Ridge Route',
        distanceKm: 95,
        elevationRangeM: [1650, 2280],
        nominalSpeedKmH: 44,
        historicalMonsoonSpeedKmH: 38,
        avgLandslidesPerMonsoon: 0.5,
        avgClearanceDelayMinutes: 20,
        peakTrafficHours: '10:00 - 12:00 (Local Market Haulers)',
        trafficDelayMinutes: 12,
        historicalRainfallAvgMm: 220,
        roadSurfaceType: 'Bituminous 2-lane',
      },
      {
        segmentId: 'sh5-seg-4',
        name: 'Rupa to Sela Tunnel Bypass link to Tawang',
        corridor: 'West Kameng Stabilized Valley Connector',
        distanceKm: 130,
        elevationRangeM: [2280, 2850],
        nominalSpeedKmH: 40,
        historicalMonsoonSpeedKmH: 35,
        avgLandslidesPerMonsoon: 0.6,
        avgClearanceDelayMinutes: 25,
        peakTrafficHours: '14:00 - 16:00 (Transit Traffic)',
        trafficDelayMinutes: 15,
        historicalRainfallAvgMm: 260,
        roadSurfaceType: 'Bituminous 2-lane',
      },
    ],
  },
  'route-c': {
    routeId: 'route-c',
    routeName: 'Route C (East-West Bypass via Nagaon)',
    corridorHighway: 'NH-27 & Jamiri-Dirang Link',
    totalDistanceKm: 510,
    fiveYearMonsoonIncidents: 19,
    avgHistoricalDelayMinutes: 75,
    keyVulnerability: 'Seasonal river backwater inundation along low-lying Brahmaputra tributaries in Nagaon & Kaziranga buffer',
    historicalClearanceProvider: 'Assam PWD Disaster Cell',
    historicalMonthlyRainfallMm: {
      june: 340,
      july: 460,
      august: 420,
      september: 310,
    },
    checkpointDelays: [
      {
        location: 'Kolia Bhomora Bridge Toll',
        avgWaitMinutes: 25,
        reason: 'Single-file freight weighing during high river flood alert',
      },
    ],
    segments: [
      {
        segmentId: 'nh27-seg-1',
        name: 'Guwahati Hub through Nagaon Plain',
        corridor: 'NH-27 4-Lane East Corridor',
        distanceKm: 210,
        elevationRangeM: [55, 80],
        nominalSpeedKmH: 65,
        historicalMonsoonSpeedKmH: 40,
        avgLandslidesPerMonsoon: 0,
        avgClearanceDelayMinutes: 45, // Flood water pumps
        peakTrafficHours: '08:00 - 11:00 and 17:00 - 20:00 (Heavy Commercial)',
        trafficDelayMinutes: 40,
        historicalRainfallAvgMm: 390,
        roadSurfaceType: 'Bituminous 2-lane',
      },
      {
        segmentId: 'nh27-seg-2',
        name: 'Nagaon Bridge to Jamiri Ascent',
        corridor: 'Rural Spur Road',
        distanceKm: 140,
        elevationRangeM: [80, 1850],
        nominalSpeedKmH: 42,
        historicalMonsoonSpeedKmH: 30,
        avgLandslidesPerMonsoon: 2.1,
        avgClearanceDelayMinutes: 40,
        peakTrafficHours: '09:00 - 12:00',
        trafficDelayMinutes: 20,
        historicalRainfallAvgMm: 350,
        roadSurfaceType: 'Single-lane Paved',
      },
      {
        segmentId: 'nh27-seg-3',
        name: 'Jamiri to Dirang West link to Tawang',
        corridor: 'Himalayan Foothill Cut',
        distanceKm: 160,
        elevationRangeM: [1850, 3200],
        nominalSpeedKmH: 36,
        historicalMonsoonSpeedKmH: 26,
        avgLandslidesPerMonsoon: 3.2,
        avgClearanceDelayMinutes: 55,
        peakTrafficHours: '13:00 - 15:00',
        trafficDelayMinutes: 25,
        historicalRainfallAvgMm: 410,
        roadSurfaceType: 'Single-lane Paved',
      },
    ],
  },
};
