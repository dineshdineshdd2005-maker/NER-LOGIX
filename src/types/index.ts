export type UserRole = 
  | 'Administrator'
  | 'Logistics Operator'
  | 'Driver'
  | 'Field Officer'
  | 'Government / Disaster Management Officer';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DeliveryPriority = 'Normal' | 'High' | 'Emergency';

export type DeliveryStatus = 'Dispatched' | 'In Transit' | 'Re-routed' | 'Delayed' | 'Delivered';

export type VehicleStatus = 'In Transit' | 'Re-routed' | 'Halted' | 'Delivered' | 'Maintenance';

export type DisruptionType = 
  | 'Landslide'
  | 'Flood'
  | 'Road Damage'
  | 'Bridge Damage'
  | 'Accident'
  | 'Road Blockage'
  | 'Other';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department: string;
  badgeId: string;
  authProvider?: 'google.com' | 'password' | 'ner-portal' | 'firebase';
  isRealAuth?: boolean;
  lastLogin?: string;
  createdAt?: string;
  emailVerified?: boolean;
  sessionToken?: string;
}

export interface UserSessionMeta {
  sessionStartedAt: string;
  lastActivityAt: string;
  authMethod: string;
  tokenExpiresInMinutes: number;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleType: 'Heavy Truck' | 'Refrigerated Medical Van' | '4WD Supply Carrier' | 'Fuel Tanker' | 'Light Cargo';
  currentLocationName: string;
  coords: LatLng;
  destinationName: string;
  destinationCoords: LatLng;
  speedKmH: number;
  eta: string;
  status: VehicleStatus;
  riskLevel: SeverityLevel;
  cargoType: string;
  cargoPriority: DeliveryPriority;
  heading: number;
  assignedRouteId?: string;
  batteryOrFuelPercent: number;
  temperatureCargo?: number;
  routeCoordinates: LatLng[];
  currentRouteIndex: number;
  isSimulating?: boolean;
}

export interface RouteOption {
  id: string;
  name: string;
  title: string;
  description: string;
  distanceKm: number;
  estimatedTime: string;
  timeMinutes: number;
  riskLevel: SeverityLevel;
  riskScore: number;
  isAiRecommended: boolean;
  explanation: string;
  viaHighway: string;
  elevationGainM: number;
  roadConditionRating: 'Poor' | 'Fair' | 'Good';
  coordinates: LatLng[];
  riskFactors: {
    rainfallRisk: SeverityLevel;
    landslideRisk: SeverityLevel;
    roadConditionRisk: SeverityLevel;
    floodRisk: SeverityLevel;
    connectivityRisk: SeverityLevel;
  };
  geminiPredictedEta?: string;
  geminiDelayDelta?: number;
  geminiArrivalTimestamp?: string;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  locationName: string;
  coords: LatLng;
  severity: SeverityLevel;
  source: 'BRO Notice' | 'Field Officer' | 'Automated Sensor' | 'IMD Weather' | 'Disaster Cell';
  timestamp: string;
  recommendedAction: string;
  isAcknowledged: boolean;
  affectedRouteIds?: string[];
  vehicleIdToReroute?: string;
}

export interface FieldReport {
  id: string;
  reportType: DisruptionType;
  locationName: string;
  coords: LatLng;
  description: string;
  severity: SeverityLevel;
  imageUrl?: string;
  timestamp: string;
  officerName: string;
  officerBadge: string;
  isSynced: boolean;
  roadName: string;
  status: 'Pending' | 'Verified' | 'Resolved';
}

export interface DeliveryItem {
  id: string;
  consignmentCode: string;
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  origin: string;
  destination: string;
  goods: 'Medicines' | 'Food Supplies' | 'Fuel' | 'Emergency Supplies' | 'Cold Chain Vaccines';
  priority: DeliveryPriority;
  eta: string;
  status: DeliveryStatus;
  risk: SeverityLevel;
  dispatchTime: string;
  weightTons: number;
  currentLocation: string;
}

export interface RiskZone {
  id: string;
  name: string;
  center: LatLng;
  radiusKm: number;
  severity: SeverityLevel;
  riskType: 'Landslide' | 'Flash Flood' | 'Severe Rain' | 'Rockfall';
  activeAlertCount: number;
  description: string;
}

export interface WeatherStation {
  id: string;
  locationName: string;
  state: string;
  coords: LatLng;
  rainfallMmHr: number;
  temperatureC: number;
  windSpeedKmH: number;
  floodWarning: boolean;
  landslideProbabilityPercent: number;
  roadCondition: 'Normal' | 'Slippery' | 'Waterlogged' | 'Partially Blocked' | 'Closed';
  conditionSummary: string;
}

export interface DemoStep {
  stepNumber: number;
  title: string;
  systemAction: string;
  aiOutput: string;
  activeHighlight: string;
}

export type CommodityCategory = 
  | 'Medicines & Cold Chain' 
  | 'Emergency Food Rations' 
  | 'Fuel & Energy' 
  | 'Potable Water & Hygiene' 
  | 'Disaster Relief & Shelter';

export interface InventoryItem {
  id: string;
  name: string;
  category: CommodityCategory;
  currentStock: number;
  unit: string;
  minBufferThreshold: number;
  dailyBurnRate: number;
  daysOfStockRemaining: number;
  status: 'ADEQUATE' | 'MODERATE' | 'LOW' | 'CRITICAL';
  storageRequirement: 'Refrigerated Cold-Chain (2-8°C)' | 'Dry Ambient' | 'Hazardous / Fuel Depot' | 'Pressurized Oxygen';
}

export interface DistrictSupplyDepot {
  id: string;
  name: string;
  district: string;
  state: string;
  coords: LatLng;
  elevationM: number;
  depotType: 'Remote Hill Depot' | 'Forward Border Staging Post' | 'Regional Buffer Warehouse' | 'Mother Central Hub';
  populationServed: number;
  dependentCorridors: string[];
  inventory: InventoryItem[];
  totalStockTons: number;
  capacityTons: number;
  isolationRiskScore: number; // 0-100
  isIsolated: boolean;
  activeDisruptionCount: number;
  estimatedBlockadeHours: number;
  lastAudited: string;
}

export interface RedistributionSuggestion {
  id: string;
  sourceDepotId: string;
  sourceDepotName: string;
  targetDepotId: string;
  targetDepotName: string;
  commodityId: string;
  commodityName: string;
  category: CommodityCategory;
  transferQuantity: number;
  unit: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reason: string;
  triggeringDisruptions: string[];
  currentStockDays: number;
  projectedStockDaysAfter: number;
  recommendedRoute: string;
  transportMode: '4WD 5-Ton Convoy' | 'Refrigerated Cold-Chain Van' | 'Fuel Tanker Carrier' | 'Emergency Helicopter Air-Drop';
  estimatedTransitHours: number;
  deadlineHours: number;
  status: 'PENDING_APPROVAL' | 'DISPATCHED' | 'COMPLETED';
  approvedAt?: string;
  dispatchVehicleId?: string;
}

export interface WeatherEtaAdjustment {
  vehicleId: string;
  nominalMinutes: number;
  nominalEtaFormatted: string;
  adjustedMinutes: number;
  adjustedEtaFormatted: string;
  delayDeltaMinutes: number;
  delayDeltaFormatted: string;
  predictedArrivalTimestamp: string;
  distanceRemainingKm: number;
  weatherHazardScore: number; // 0 - 100
  weatherConditionSummary: string;
  weatherSeverity: SeverityLevel;
  activeWeatherAlerts: AlertItem[];
  nearestStation?: WeatherStation;
  safeSpeedRecommendationKmH: number;
  delayBreakdown: {
    rainfallDecelerationMinutes: number;
    slopeHazardMinutes: number;
    visibilityOrSlushMinutes: number;
  };
  driverAdvisory: string;
}

export type { OfflineShelterPoint, OfflineCorridor } from '../data/offlineCorridorData';
