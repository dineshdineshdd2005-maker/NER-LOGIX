import { LatLng } from '../types';
import { ROUTE_A_COORDS, ROUTE_B_COORDS, ROUTE_C_COORDS, NER_LOCATIONS } from './mockData';

export interface OfflineShelterPoint {
  id: string;
  name: string;
  corridorId: string;
  highway: string;
  kmMarker?: number;
  coords: LatLng;
  type: 'BRO Outpost' | 'Fuel & Mechanical' | 'Medical Emergency' | 'Refuge Shelter' | 'Satellite SOS';
  elevationM: number;
  vhfChannel: string;
  services: string[];
  satellitePhone: string;
  capacityBeds: number;
}

export interface OfflineCorridor {
  id: string;
  name: string;
  highwayCode: string;
  region: string;
  lengthKm: number;
  zoomLevels: string;
  tileCount: number;
  sizeMb: number;
  elevationRange: { minM: number; maxM: number; highPass: string };
  coordinates: LatLng[];
  shelters: OfflineShelterPoint[];
  sosCallboxesCount: number;
  sosCallboxes?: number;
  status: 'CACHED' | 'SYNCED';
  lastVerified?: string;
  allWeatherRating: 'All-Weather' | 'Seasonal Monsoonal' | 'High-Altitude Pass';
  keyStops: string[];
  tacticalNotes: string;
}

export const NER_OFFLINE_CORRIDORS: OfflineCorridor[] = [
  {
    id: 'corridor-nh13',
    name: 'NH-13 Trans-Arunachal Strategic Corridor',
    highwayCode: 'NH-13',
    region: 'Assam Plains to Western Arunachal Ridge',
    lengthKm: 450,
    zoomLevels: 'Zoom 7 – 15',
    tileCount: 1840,
    sizeMb: 14.8,
    elevationRange: { minM: 55, maxM: 4170, highPass: 'Sela Pass (4,170m)' },
    coordinates: ROUTE_A_COORDS,
    status: 'CACHED',
    lastVerified: 'Today, 08:30 IST (Checksum: #9e4f2b)',
    allWeatherRating: 'High-Altitude Pass',
    keyStops: ['Tezpur Supply Depot', 'Bhalukpong Gate', 'Bomdila BRO Base', 'Dirang Valley', 'Sela Pass', 'Tawang Hub'],
    tacticalNotes: 'High risk of slush and avalanches above 3,500m. Pre-cached offline tiles include high-resolution BRO Project Vartak emergency turnouts every 5 km.',
    sosCallboxesCount: 18,
    shelters: [
      {
        id: 'shelter-tezpur',
        name: 'Tezpur Central Freight Staging Depot',
        corridorId: 'corridor-nh13',
        highway: 'NH-13 / NH-15 Junction',
        kmMarker: 0,
        coords: { lat: 26.6528, lng: 92.7926 },
        type: 'Fuel & Mechanical',
        elevationM: 78,
        vhfChannel: 'VHF-148.125 MHz',
        services: ['Bulk Diesel', 'Reefer Cold Charging', 'Tyre vulcanizing', 'Driver Quarters'],
        satellitePhone: '+8816 315 90124 (Iridium)',
        capacityBeds: 45,
      },
      {
        id: 'shelter-bhalukpong',
        name: 'Bhalukpong BRO Checkpost & Gate',
        corridorId: 'corridor-nh13',
        highway: 'NH-13 Km 54',
        coords: { lat: 27.0134, lng: 92.6468 },
        type: 'BRO Outpost',
        elevationM: 310,
        vhfChannel: 'VHF-154.250 MHz (Project Vartak)',
        services: ['ILP Verification', 'Heavy Recovery Crane', 'Emergency Aid Post', 'Secure Compound'],
        satellitePhone: '+8816 315 90125 (Iridium)',
        capacityBeds: 24,
      },
      {
        id: 'shelter-bomdila',
        name: 'Bomdila Mountain Rescue & Medical Staging',
        corridorId: 'corridor-nh13',
        highway: 'NH-13 Km 154',
        coords: { lat: 27.2644, lng: 92.4239 },
        type: 'Medical Emergency',
        elevationM: 2415,
        vhfChannel: 'VHF-156.800 MHz (Disaster Command)',
        services: ['Hyperbaric Oxygen Chamber', 'High-Altitude Clinic', 'Emergency Blood Bank', 'Snow Chains Supply'],
        satellitePhone: '+8816 315 90126 (Iridium)',
        capacityBeds: 35,
      },
      {
        id: 'shelter-dirang',
        name: 'Dirang River Valley Refuge Bay',
        corridorId: 'corridor-nh13',
        highway: 'NH-13 Km 195',
        coords: { lat: 27.3592, lng: 92.2384 },
        type: 'Refuge Shelter',
        elevationM: 1680,
        vhfChannel: 'VHF-152.400 MHz',
        services: ['Heated Barracks', 'Sub-Zero Battery Warmers', 'Food Rations', 'NavIC Uplink Beacon'],
        satellitePhone: '+8816 315 90127 (Iridium)',
        capacityBeds: 30,
      },
      {
        id: 'shelter-sela',
        name: 'Sela Pass BRO Alpine Bunker (4,170m)',
        corridorId: 'corridor-nh13',
        highway: 'NH-13 Km 310',
        coords: { lat: 27.5037, lng: 92.1039 },
        type: 'BRO Outpost',
        elevationM: 4170,
        vhfChannel: 'VHF-155.000 MHz (Vartak Snow Rescue)',
        services: ['Continuous Snowplow Support', 'Emergency Oxygen Cans', 'Extreme Sub-Zero Shelter', 'Emergency Satellite Beacon'],
        satellitePhone: '+8816 315 90128 (Iridium SOS)',
        capacityBeds: 16,
      },
      {
        id: 'shelter-jaswant',
        name: 'Jaswant Garh Staging Outpost',
        corridorId: 'corridor-nh13',
        highway: 'NH-13 Km 360',
        coords: { lat: 27.5450, lng: 91.9850 },
        type: 'Satellite SOS',
        elevationM: 3050,
        vhfChannel: 'VHF-154.600 MHz',
        services: ['Hot Water Supply', 'Emergency Rations', 'Satellite Distress Relay', 'Tire Defrost Bay'],
        satellitePhone: '+8816 315 90129 (Iridium)',
        capacityBeds: 20,
      },
      {
        id: 'shelter-tawang',
        name: 'Tawang District Terminal & Base Hospital',
        corridorId: 'corridor-nh13',
        highway: 'NH-13 Km 450 Terminus',
        coords: { lat: 27.5861, lng: 91.8653 },
        type: 'Medical Emergency',
        elevationM: 3048,
        vhfChannel: 'VHF-156.800 MHz',
        services: ['District Cold Storage Hub', 'ICU Care', 'Government PDS Warehouse', 'Helipad Evacuation'],
        satellitePhone: '+8816 315 90130 (Iridium)',
        capacityBeds: 80,
      }
    ]
  },
  {
    id: 'corridor-sh5',
    name: 'SH-5 Kalaktang-Shergaon Safe Bypass Corridor',
    highwayCode: 'SH-5',
    region: 'Darrang Foothills to West Kameng Valleys',
    lengthKm: 475,
    zoomLevels: 'Zoom 7 – 15',
    tileCount: 1420,
    sizeMb: 11.6,
    elevationRange: { minM: 65, maxM: 2850, highPass: 'Shergaon Pass (2,300m)' },
    coordinates: ROUTE_B_COORDS,
    status: 'CACHED',
    lastVerified: 'Today, 09:15 IST (Checksum: #7c21a4)',
    allWeatherRating: 'All-Weather',
    keyStops: ['Orang Junction', 'Bhairabkunda Tri-Junction', 'Kalaktang Depot', 'Shergaon All-Weather Camp', 'Rupa Valley', 'Dirang Bypass'],
    tacticalNotes: 'Primary recommended safe bypass during Sela Pass weather lockdowns. Features modern slope anchors and concrete box culverts.',
    sosCallboxesCount: 14,
    shelters: [
      {
        id: 'shelter-orang',
        name: 'Orang Highway Transit Fuel Station',
        corridorId: 'corridor-sh5',
        highway: 'SH-5 Km 42',
        coords: { lat: 26.5400, lng: 92.2800 },
        type: 'Fuel & Mechanical',
        elevationM: 92,
        vhfChannel: 'VHF-149.200 MHz',
        services: ['Diesel', 'Air Pressure', 'Mechanic Pit', 'Driver Rest Area'],
        satellitePhone: '+8816 315 90141 (Iridium)',
        capacityBeds: 20,
      },
      {
        id: 'shelter-bhairabkunda',
        name: 'Bhairabkunda Foothills Emergency Outpost',
        corridorId: 'corridor-sh5',
        highway: 'SH-5 Km 98',
        coords: { lat: 26.8500, lng: 92.1600 },
        type: 'Refuge Shelter',
        elevationM: 320,
        vhfChannel: 'VHF-151.750 MHz',
        services: ['Flash Flood Refuge', 'Emergency Genset Power', 'Clean Water', 'River Gauging Station'],
        satellitePhone: '+8816 315 90142 (Iridium)',
        capacityBeds: 35,
      },
      {
        id: 'shelter-kalaktang',
        name: 'Kalaktang Civil Administration Logistic Hub',
        corridorId: 'corridor-sh5',
        highway: 'SH-5 Km 165',
        coords: { lat: 27.1245, lng: 92.1158 },
        type: 'Medical Emergency',
        elevationM: 1450,
        vhfChannel: 'VHF-153.900 MHz',
        services: ['Sub-Divisional Hospital', 'Ambulance Standby', 'Food Storage Warehouse', 'Paved Truck Bay'],
        satellitePhone: '+8816 315 90143 (Iridium)',
        capacityBeds: 50,
      },
      {
        id: 'shelter-shergaon',
        name: 'Shergaon All-Weather Staging Bay',
        corridorId: 'corridor-sh5',
        highway: 'SH-5 Km 210',
        coords: { lat: 27.1894, lng: 92.2612 },
        type: 'BRO Outpost',
        elevationM: 1980,
        vhfChannel: 'VHF-154.800 MHz (BRO Detachment)',
        services: ['Excavator Standby', 'Culvert Inspection Team', 'Tire Chain Fitment', 'Emergency Ration Depot'],
        satellitePhone: '+8816 315 90144 (Iridium)',
        capacityBeds: 28,
      },
      {
        id: 'shelter-rupa',
        name: 'Rupa Valley Supply Station',
        corridorId: 'corridor-sh5',
        highway: 'SH-5 Km 245',
        coords: { lat: 27.2100, lng: 92.3900 },
        type: 'Fuel & Mechanical',
        elevationM: 1720,
        vhfChannel: 'VHF-150.350 MHz',
        services: ['Heavy Tow Rig', 'Engine Coolant Top-Up', 'Medical Dispensary', 'Secure Yard'],
        satellitePhone: '+8816 315 90145 (Iridium)',
        capacityBeds: 25,
      }
    ]
  },
  {
    id: 'corridor-nh27',
    name: 'NH-27 East-West Assam Arterial Corridor',
    highwayCode: 'NH-27',
    region: 'Brahmaputra Valley Lowlands',
    lengthKm: 510,
    zoomLevels: 'Zoom 7 – 15',
    tileCount: 1560,
    sizeMb: 16.2,
    elevationRange: { minM: 52, maxM: 3200, highPass: 'Jamiri Divide (2,200m)' },
    coordinates: ROUTE_C_COORDS,
    status: 'CACHED',
    lastVerified: 'Yesterday, 18:40 IST (Checksum: #5a19df)',
    allWeatherRating: 'Seasonal Monsoonal',
    keyStops: ['Guwahati Central Hub', 'Jagiroad Bypass', 'Nagaon Flood Zone', 'Kolia Bhomora Bridge', 'Jamiri Link'],
    tacticalNotes: 'Vulnerable to river overflow near Nagaon floodplain during monsoons. High-density fuel and multi-lane asphalt.',
    sosCallboxesCount: 22,
    shelters: [
      {
        id: 'shelter-guwahati',
        name: 'Guwahati Regional Central Ingress Warehouse',
        corridorId: 'corridor-nh27',
        highway: 'NH-27 Km 0 Hub',
        coords: { lat: 26.1445, lng: 91.7362 },
        type: 'Fuel & Mechanical',
        elevationM: 55,
        vhfChannel: 'VHF-146.520 MHz',
        services: ['National Highway Control', '24/7 Logistics Control Room', 'Heavy Crane Yard', 'Main PDS Silo'],
        satellitePhone: '+8816 315 90160 (Iridium)',
        capacityBeds: 120,
      },
      {
        id: 'shelter-nagaon',
        name: 'Nagaon Flood Evacuation & Staging Hub',
        corridorId: 'corridor-nh27',
        highway: 'NH-27 Km 122',
        coords: { lat: 26.3500, lng: 92.6800 },
        type: 'Refuge Shelter',
        elevationM: 61,
        vhfChannel: 'VHF-155.600 MHz (SDRF / NDRF)',
        services: ['Inflatable Rescue Boats', 'Raised Embankment Truck Bay', 'Water Purification Plant', 'NDRF Command'],
        satellitePhone: '+8816 315 90161 (Iridium)',
        capacityBeds: 90,
      },
      {
        id: 'shelter-kaliabor',
        name: 'Kolia Bhomora Brahmaputra Bridge Checkpost',
        corridorId: 'corridor-nh27',
        highway: 'NH-27 / NH-715 Junction Km 180',
        coords: { lat: 26.6528, lng: 92.7926 },
        type: 'BRO Outpost',
        elevationM: 72,
        vhfChannel: 'VHF-154.100 MHz',
        services: ['Bridge Structural Sensor Station', 'Toll Control', 'Weigh-in-Motion Bridge Sensor', 'Emergency Medical Van'],
        satellitePhone: '+8816 315 90162 (Iridium)',
        capacityBeds: 30,
      }
    ]
  },
  {
    id: 'corridor-sela-tunnel',
    name: 'Sela All-Weather Twin-Bore Alpine Tunnel Tube',
    highwayCode: 'NH-13 Tunnel Bypass',
    region: 'Sela Ridge (12,000 ft Sea Level Bypass)',
    lengthKm: 68,
    zoomLevels: 'Zoom 10 – 16 (High Resolution)',
    tileCount: 980,
    sizeMb: 8.4,
    elevationRange: { minM: 3000, maxM: 3800, highPass: 'Sela Tunnel Bore (3,000m)' },
    coordinates: [
      { lat: 27.4600, lng: 92.1300 },
      { lat: 27.4800, lng: 92.1150 },
      { lat: 27.5037, lng: 92.1039 },
      { lat: 27.5250, lng: 92.0500 },
      { lat: 27.5450, lng: 91.9850 },
    ],
    status: 'CACHED',
    lastVerified: 'Today, 06:10 IST (Checksum: #3b88e1)',
    allWeatherRating: 'All-Weather',
    keyStops: ['Baisakhi Staging Post', 'South Portal (Tunnel 1)', 'North Portal (Tunnel 2)', 'Nurang Refuge'],
    tacticalNotes: 'Bypasses treacherous Sela Pass crest in winter. Features jet-fan ventilation, escape tubes, and autonomous tunnel lighting.',
    sosCallboxesCount: 26,
    shelters: [
      {
        id: 'shelter-sela-south',
        name: 'Sela Tunnel South Portal Control Center',
        corridorId: 'corridor-sela-tunnel',
        highway: 'NH-13 South Gate',
        coords: { lat: 27.4800, lng: 92.1150 },
        type: 'BRO Outpost',
        elevationM: 3050,
        vhfChannel: 'VHF-155.450 MHz',
        services: ['Tunnel Fire Response', 'CO / Smoke Sensors', 'Autonomous Power Backup', 'Recovery Tow Van'],
        satellitePhone: '+8816 315 90170 (Iridium)',
        capacityBeds: 25,
      },
      {
        id: 'shelter-sela-north',
        name: 'Sela Tunnel North Portal Station',
        corridorId: 'corridor-sela-tunnel',
        highway: 'NH-13 North Gate',
        coords: { lat: 27.5250, lng: 92.0500 },
        type: 'Refuge Shelter',
        elevationM: 3120,
        vhfChannel: 'VHF-155.450 MHz',
        services: ['De-icing Spray Rigs', 'Emergency Heated Bay', 'Satellite Telephone Cabin', 'Thermal Camera Monitor'],
        satellitePhone: '+8816 315 90171 (Iridium)',
        capacityBeds: 25,
      }
    ]
  }
];

// Helper to calculate total offline cache metrics
export const getOfflineCacheSummary = () => {
  const totalTiles = NER_OFFLINE_CORRIDORS.reduce((acc, c) => acc + c.tileCount, 0);
  const totalSizeMb = NER_OFFLINE_CORRIDORS.reduce((acc, c) => acc + c.sizeMb, 0);
  const totalCorridorsKm = NER_OFFLINE_CORRIDORS.reduce((acc, c) => acc + c.lengthKm, 0);
  const totalShelters = NER_OFFLINE_CORRIDORS.reduce((acc, c) => acc + c.shelters.length, 0);
  const totalSosBoxes = NER_OFFLINE_CORRIDORS.reduce((acc, c) => acc + c.sosCallboxesCount, 0);

  return {
    totalTiles,
    totalSizeMb: parseFloat(totalSizeMb.toFixed(1)),
    totalCorridorsKm,
    totalShelters,
    totalSosBoxes,
    cachedCorridorsCount: NER_OFFLINE_CORRIDORS.length,
    storageEngine: 'IndexedDB (CacheStorage API & LevelDB Local)',
    cacheHealth: '100% Verified Offline Ready',
    gnssConstellation: 'Autonomous NavIC (IRNSS) + GPS L5 Lock',
  };
};
