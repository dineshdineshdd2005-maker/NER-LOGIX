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
