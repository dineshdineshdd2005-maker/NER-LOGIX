import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Vehicle, 
  AlertItem, 
  FieldReport, 
  DeliveryItem, 
  RouteOption, 
  RiskZone, 
  WeatherStation, 
  SeverityLevel 
} from '../types';
import { 
  DEMO_USERS, 
  INITIAL_VEHICLES, 
  INITIAL_ALERTS, 
  INITIAL_FIELD_REPORTS, 
  INITIAL_DELIVERIES, 
  INITIAL_ROUTE_OPTIONS, 
  INITIAL_RISK_ZONES, 
  INITIAL_WEATHER_STATIONS,
  ROUTE_A_COORDS,
  ROUTE_B_COORDS
} from '../data/mockData';

export type NavTab = 
  | 'dashboard'
  | 'tracking'
  | 'optimizer'
  | 'risk-prediction'
  | 'weather'
  | 'field-reports'
  | 'deliveries'
  | 'map'
  | 'analytics'
  | 'alerts'
  | 'admin'
  | 'settings';

interface MapFilters {
  vehicles: boolean;
  weather: boolean;
  landslides: boolean;
  floods: boolean;
  roadBlocks: boolean;
  riskZones: boolean;
  fieldReports: boolean;
  routes: boolean;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  alerts: AlertItem[];
  fieldReports: FieldReport[];
  deliveries: DeliveryItem[];
  routes: RouteOption[];
  setRoutes: React.Dispatch<React.SetStateAction<RouteOption[]>>;
  riskZones: RiskZone[];
  weatherStations: WeatherStation[];
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  offlineQueue: FieldReport[];
  clearOfflineQueue: () => void;
  syncStatus: string | null;
  syncOfflineReports: () => void;
  mapFilters: MapFilters;
  toggleMapFilter: (key: keyof MapFilters) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  acknowledgeAlert: (id: string) => void;
  rerouteVehicle: (vehicleId: string, newRouteId: string) => void;
  addFieldReport: (report: Omit<FieldReport, 'id' | 'timestamp' | 'isSynced' | 'status'>) => void;
  addDelivery: (delivery: Omit<DeliveryItem, 'id'>) => void;
  toggleEmergencyPriority: (deliveryId: string) => void;
  isSimulatingVehicles: boolean;
  toggleVehicleSimulation: () => void;
  // Demo Scenario State
  isDemoRunning: boolean;
  demoStep: number;
  startLiveDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  resetDemo: () => void;
  stopDemo: () => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  aiExplanationRoute: RouteOption | null;
  setAiExplanationRoute: (route: RouteOption | null) => void;
  toast: { message: string; type: 'success' | 'warning' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  // Persistent Offline Caching & Intermittent Connectivity Features
  lastCachedTime: string;
  serviceWorkerActive: boolean;
  clearLocalCache: () => void;
  refreshLocalCache: () => void;
  cacheRecordCount: {
    vehicles: number;
    alerts: number;
    deliveries: number;
    fieldReports: number;
    routes: number;
    riskZones: number;
    weatherStations: number;
    offlineQueue: number;
  };
  // Firebase Cloud Messaging (FCM) Integration
  isFcmOpen: boolean;
  setIsFcmOpen: (open: boolean) => void;
}

const CACHE_KEYS = {
  VEHICLES: 'ner_logix_cached_vehicles_v2',
  ALERTS: 'ner_logix_cached_alerts_v2',
  FIELD_REPORTS: 'ner_logix_cached_field_reports_v2',
  DELIVERIES: 'ner_logix_cached_deliveries_v2',
  ROUTES: 'ner_logix_cached_routes_v2',
  RISK_ZONES: 'ner_logix_cached_risk_zones_v2',
  WEATHER_STATIONS: 'ner_logix_cached_weather_stations_v2',
  OFFLINE_QUEUE: 'ner_logix_cached_offline_queue_v2',
  LAST_CACHED: 'ner_logix_cached_timestamp_v2',
} as const;

function loadCachedData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`[NER Cache] Error reading key ${key}:`, err);
    return fallback;
  }
}

function saveCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[NER Cache] Error persisting key ${key}:`, err);
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with default logged-in Administrator for instant review
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS[0]);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Critical Logistics Datasets initialized with Local-Storage Cache fallbacks
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => loadCachedData(CACHE_KEYS.VEHICLES, INITIAL_VEHICLES));
  const [alerts, setAlerts] = useState<AlertItem[]>(() => loadCachedData(CACHE_KEYS.ALERTS, INITIAL_ALERTS));
  const [fieldReports, setFieldReports] = useState<FieldReport[]>(() => loadCachedData(CACHE_KEYS.FIELD_REPORTS, INITIAL_FIELD_REPORTS));
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>(() => loadCachedData(CACHE_KEYS.DELIVERIES, INITIAL_DELIVERIES));
  const [routes, setRoutes] = useState<RouteOption[]>(() => loadCachedData(CACHE_KEYS.ROUTES, INITIAL_ROUTE_OPTIONS));
  const [riskZones, setRiskZones] = useState<RiskZone[]>(() => loadCachedData(CACHE_KEYS.RISK_ZONES, INITIAL_RISK_ZONES));
  const [weatherStations, setWeatherStations] = useState<WeatherStation[]>(() => loadCachedData(CACHE_KEYS.WEATHER_STATIONS, INITIAL_WEATHER_STATIONS));
  
  // Offline Simulation & Queue with persistence
  const [isOffline, setIsOfflineState] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<FieldReport[]>(() => loadCachedData(CACHE_KEYS.OFFLINE_QUEUE, []));
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Cache & Service Worker state
  const [lastCachedTime, setLastCachedTime] = useState<string>(() =>
    loadCachedData(CACHE_KEYS.LAST_CACHED, new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
  );
  const [serviceWorkerActive, setServiceWorkerActive] = useState<boolean>(false);

  // Map Filter state
  const [mapFilters, setMapFilters] = useState<MapFilters>({
    vehicles: true,
    weather: true,
    landslides: true,
    floods: true,
    roadBlocks: true,
    riskZones: true,
    fieldReports: true,
    routes: true,
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('NER-TRUCK-104');
  const [aiExplanationRoute, setAiExplanationRoute] = useState<RouteOption | null>(INITIAL_ROUTE_OPTIONS[0]);
  const [isSimulatingVehicles, setIsSimulatingVehicles] = useState<boolean>(false);

  // Live Demo Scenario State
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  // FCM Notification Center Modal State
  const [isFcmOpen, setIsFcmOpen] = useState<boolean>(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const toggleMapFilter = (key: keyof MapFilters) => {
    setMapFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setIsOffline = (offline: boolean) => {
    setIsOfflineState(offline);
    if (!offline && offlineQueue.length > 0) {
      syncOfflineReports();
    } else if (offline) {
      showToast('Network Disconnected — Operating in Offline Mode (Local Storage Active)', 'warning');
    } else {
      showToast('Network Restored — Connected to NER Central Cloud Ingress', 'success');
    }
  };

  const syncOfflineReports = () => {
    if (offlineQueue.length === 0) return;
    const count = offlineQueue.length;
    setSyncStatus(`Syncing ${count} pending offline field reports to central PostGIS database...`);
    showToast(`Syncing ${count} pending reports...`, 'info');

    setTimeout(() => {
      setFieldReports(prev => [
        ...offlineQueue.map(r => ({ ...r, isSynced: true, status: 'Verified' as const })),
        ...prev
      ]);
      setOfflineQueue([]);
      setSyncStatus(`All ${count} reports synchronized successfully.`);
      showToast(`All ${count} reports synchronized successfully! Central GIS updated.`, 'success');
      setTimeout(() => setSyncStatus(null), 4000);
    }, 1800);
  };

  const clearOfflineQueue = () => {
    setOfflineQueue([]);
    saveCachedData(CACHE_KEYS.OFFLINE_QUEUE, []);
    showToast('Local offline report queue cleared.', 'info');
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isAcknowledged: true } : a));
    showToast('Alert marked as acknowledged by Regional Command.', 'info');
  };

  const rerouteVehicle = (vehicleId: string, newRouteId: string) => {
    const safeRoute = routes.find(r => r.id === newRouteId) || routes[1];
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          status: 'Re-routed',
          riskLevel: 'LOW',
          assignedRouteId: safeRoute.id,
          routeCoordinates: safeRoute.coordinates,
          currentRouteIndex: 2,
          currentLocationName: 'Kalaktang Safe Valley Corridor (Rerouted)',
          coords: safeRoute.coordinates[3] || v.coords,
          eta: '11h 05m (Safe corridor)'
        };
      }
      return v;
    }));

    setDeliveries(prev => prev.map(d => {
      if (d.vehicleId === vehicleId) {
        return {
          ...d,
          status: 'Re-routed',
          risk: 'LOW',
          eta: '11h 05m'
        };
      }
      return d;
    }));

    showToast(`Vehicle ${vehicleId} successfully re-routed to Safe Corridor (Route B). Risk reduced to LOW!`, 'success');
  };

  const addFieldReport = (reportData: Omit<FieldReport, 'id' | 'timestamp' | 'isSynced' | 'status'>) => {
    const newReport: FieldReport = {
      ...reportData,
      id: `FR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      isSynced: !isOffline,
      status: isOffline ? 'Pending' : 'Verified',
    };

    if (isOffline) {
      setOfflineQueue(prev => [newReport, ...prev]);
      showToast('Offline Mode: Report saved locally in device IndexedDB queue.', 'warning');
    } else {
      setFieldReports(prev => [newReport, ...prev]);
      // If critical or high, automatically spawn an alert
      if (newReport.severity === 'CRITICAL' || newReport.severity === 'HIGH') {
        const generatedAlert: AlertItem = {
          id: `alert-${Date.now()}`,
          title: `${newReport.reportType} Reported: ${newReport.roadName}`,
          description: newReport.description,
          locationName: newReport.locationName,
          coords: newReport.coords,
          severity: newReport.severity,
          source: 'Field Officer',
          timestamp: 'Just now',
          recommendedAction: 'Inspect alternate passes. Verify vehicle clearance.',
          isAcknowledged: false,
        };
        setAlerts(prev => [generatedAlert, ...prev]);
      }
      showToast('Field Report submitted successfully and broadcast to central GIS!', 'success');
    }
  };

  const addDelivery = (deliveryData: Omit<DeliveryItem, 'id'>) => {
    const newDelivery: DeliveryItem = {
      ...deliveryData,
      id: `DEL-${Date.now().toString().slice(-4)}`,
    };
    setDeliveries(prev => [newDelivery, ...prev]);
    showToast(`New consignment ${newDelivery.consignmentCode} registered successfully.`, 'success');
  };

  const toggleEmergencyPriority = (deliveryId: string) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId) {
        const nextPriority = d.priority === 'Emergency' ? 'Normal' : 'Emergency';
        return { ...d, priority: nextPriority };
      }
      return d;
    }));
    showToast('Delivery priority updated. Intelligent transit clearance applied.', 'info');
  };

  const toggleVehicleSimulation = () => {
    setIsSimulatingVehicles(prev => !prev);
    showToast(!isSimulatingVehicles ? 'GPS Tracking Simulation Started (1s updates)' : 'GPS Tracking Simulation Paused', 'info');
  };

  // Periodic vehicle simulation movement tick
  useEffect(() => {
    if (!isSimulatingVehicles) return;
    const interval = setInterval(() => {
      setVehicles(prevVehicles =>
        prevVehicles.map(v => {
          if (v.status === 'Halted' || v.status === 'Delivered') return v;
          const coordsList = v.routeCoordinates;
          if (!coordsList || coordsList.length === 0) return v;

          const nextIndex = (v.currentRouteIndex + 1) % coordsList.length;
          const targetCoords = coordsList[nextIndex];
          const speedVariation = Math.floor(Math.random() * 8) - 4;
          const newSpeed = Math.max(25, Math.min(65, v.speedKmH + speedVariation));

          return {
            ...v,
            coords: targetCoords,
            currentRouteIndex: nextIndex,
            speedKmH: newSpeed,
            batteryOrFuelPercent: Math.max(15, v.batteryOrFuelPercent - 0.2),
          };
        })
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulatingVehicles]);

  // LIVE DEMO WORKFLOW ENGINE (Scenario: Medicine Truck Guwahati to Tawang)
  const startLiveDemo = () => {
    setIsDemoRunning(true);
    setDemoStep(1);
    setActiveTab('dashboard');
    showToast('Live Demonstration Started: Medicine Supply Truck Guwahati → Tawang', 'info');
  };

  const nextDemoStep = () => {
    if (demoStep >= 11) {
      setIsDemoRunning(false);
      setDemoStep(0);
      showToast('Live Demo Completed! Delivery safely arrived at Tawang Hospital.', 'success');
      return;
    }
    const next = demoStep + 1;
    setDemoStep(next);

    // Trigger state modifications aligned with each step
    if (next === 2) {
      // Step 2: Heavy rainfall detected near Bomdila
      setActiveTab('weather');
      setWeatherStations(prev => prev.map(w => w.id === 'WS-BOM' ? {
        ...w,
        rainfallMmHr: 68.4,
        landslideProbabilityPercent: 94,
        conditionSummary: 'Doppler Warning: Cloudburst & Torrential Rain'
      } : w));
      showToast('Step 2: Weather Sensor alert — Cloudburst detected near Bomdila!', 'warning');
    } else if (next === 3) {
      // Step 3: AI increases landslide risk to HIGH/CRITICAL
      setActiveTab('risk-prediction');
      setRoutes(prev => prev.map(r => r.id === 'route-a' ? {
        ...r,
        riskLevel: 'CRITICAL',
        riskScore: 92,
        explanation: 'AI Model v2.4 Alert: Rainfall index +32 & slope 38° triggered CRITICAL landslide hazard warning.',
        riskFactors: {
          ...r.riskFactors,
          rainfallRisk: 'CRITICAL' as SeverityLevel,
          landslideRisk: 'CRITICAL' as SeverityLevel,
        }
      } : r));
      showToast('Step 3: AI Model re-evaluates Route A: Risk Score elevated to 92/100 (CRITICAL)', 'error');
    } else if (next === 4) {
      // Step 4: Road blockage simulated
      setActiveTab('map');
      setRiskZones(prev => prev.map(z => z.id === 'zone-1' ? { ...z, severity: 'CRITICAL', activeAlertCount: 4 } : z));
      showToast('Step 4: Road blockage detected on NH-13 Km 112 at Bomdila corridor', 'error');
    } else if (next === 5) {
      // Step 5: System generates Critical Alert
      setActiveTab('alerts');
      const urgentAlert: AlertItem = {
        id: 'demo-alert-critical',
        title: 'EMERGENCY: NH-13 Completely Blocked near Bomdila',
        description: 'Sudden mudslide has halted all northbound movement. Medicine Truck NER-TRUCK-104 requires immediate diversion.',
        locationName: 'Bomdila - Dirang Stretch',
        coords: { lat: 27.2644, lng: 92.4239 },
        severity: 'CRITICAL',
        source: 'BRO Notice',
        timestamp: 'Just now',
        recommendedAction: 'Divert immediately to Route B (Kalaktang Safe Corridor).',
        isAcknowledged: false,
        vehicleIdToReroute: 'NER-TRUCK-104',
      };
      setAlerts(prev => [urgentAlert, ...prev]);
      showToast('Step 5: Critical Alert broadcast to logistics control and driver cab.', 'error');
    } else if (next === 6) {
      // Step 6: Field Officer submits blockage report
      setActiveTab('field-reports');
      const newFr: FieldReport = {
        id: 'FR-LIVE-DEMO',
        reportType: 'Landslide',
        locationName: 'NH-13 Km 112 Sela Approach',
        coords: { lat: 27.2840, lng: 92.3850 },
        description: 'Massive landslide blocking both carriage-ways. Dozers mobilizing. Transit closed for 8+ hours.',
        severity: 'CRITICAL',
        timestamp: 'Just now',
        officerName: 'Capt. Anirudh Sharma',
        officerBadge: 'BRO-GREF-884',
        isSynced: true,
        roadName: 'NH-13 Trans-Arunachal Highway',
        status: 'Verified',
      };
      setFieldReports(prev => [newFr, ...prev]);
      showToast('Step 6: Field Officer submitted ground confirmation with GPS verification.', 'warning');
    } else if (next === 7) {
      // Step 7: AI Route Optimizer finds safer alternate corridor
      setActiveTab('optimizer');
      showToast('Step 7: AI Route Optimizer dynamically isolates Kalaktang-Shergaon corridor as 100% passable!', 'success');
    } else if (next === 8) {
      // Step 8: Reroute command dispatched to driver
      setActiveTab('tracking');
      showToast('Step 8: Driver cab HUD receives automated reroute command: Divert to Route B.', 'info');
    } else if (next === 9) {
      // Step 9: Driver accepts reroute, vehicle turns onto safe green corridor on map
      rerouteVehicle('NER-TRUCK-104', 'route-b');
      setActiveTab('map');
      showToast('Step 9: Vehicle NER-TRUCK-104 executed diversion onto Kalaktang Safe Valley Route B.', 'success');
    } else if (next === 10) {
      // Step 10: Vehicle continues moving, risk drops to LOW
      setVehicles(prev => prev.map(v => v.id === 'NER-TRUCK-104' ? {
        ...v,
        coords: { lat: 27.1894, lng: 92.2612 },
        currentLocationName: 'Shergaon Valley (Safe Corridor)',
        speedKmH: 52,
        riskLevel: 'LOW',
        eta: '1h 45m',
      } : v));
      showToast('Step 10: Telemetry confirms vehicle cruising safely at 52 km/h. Risk: LOW (18/100).', 'success');
    } else if (next === 11) {
      // Step 11: Delivery Completed at Tawang
      setVehicles(prev => prev.map(v => v.id === 'NER-TRUCK-104' ? {
        ...v,
        coords: { lat: 27.5861, lng: 91.8653 },
        currentLocationName: 'Tawang Civil Hospital',
        speedKmH: 0,
        status: 'Delivered',
        eta: 'Delivered On Schedule',
        riskLevel: 'LOW',
      } : v));
      setDeliveries(prev => prev.map(d => d.vehicleId === 'NER-TRUCK-104' ? {
        ...d,
        status: 'Delivered',
        eta: 'Arrived Safe',
        risk: 'LOW',
      } : d));
      setActiveTab('deliveries');
      showToast('Step 11: Emergency Medical Consignment DEL-9901 safely delivered to Tawang Hospital!', 'success');
    }
  };

  const prevDemoStep = () => {
    if (demoStep > 1) {
      setDemoStep(prev => prev - 1);
    }
  };

  const resetDemo = () => {
    setVehicles(INITIAL_VEHICLES);
    setAlerts(INITIAL_ALERTS);
    setFieldReports(INITIAL_FIELD_REPORTS);
    setDeliveries(INITIAL_DELIVERIES);
    setRoutes(INITIAL_ROUTE_OPTIONS);
    setRiskZones(INITIAL_RISK_ZONES);
    setWeatherStations(INITIAL_WEATHER_STATIONS);
    setDemoStep(0);
    setIsDemoRunning(false);
    showToast('Demo reset to initial baseline state.', 'info');
  };

  const stopDemo = () => {
    setIsDemoRunning(false);
    showToast('Live demonstration stopped.', 'info');
  };

  // Intermittent Connectivity Listeners & Service Worker Registration
  useEffect(() => {
    // Initial check of browser network status
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOfflineState(true);
    }

    const handleBrowserOnline = () => {
      setIsOfflineState(false);
      showToast('Network Restored — Connected to Central Cloud. Synchronizing local offline cache...', 'success');
      syncOfflineReports();
    };

    const handleBrowserOffline = () => {
      setIsOfflineState(true);
      showToast('Network Disconnected — Intermittent Connectivity: Operating with Local-Storage Cache & Offline GIS.', 'warning');
    };

    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);

    // Register Service Worker for offline asset & GIS tile caching
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SW] NER-LOGIX Service Worker registered, scope:', reg.scope);
          setServiceWorkerActive(true);
        })
        .catch((err) => {
          console.warn('[SW] Service Worker registration note:', err);
        });
    }

    return () => {
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
    };
  }, []);

  // Automatic Local-Storage Synchronization on dataset mutations
  useEffect(() => {
    saveCachedData(CACHE_KEYS.VEHICLES, vehicles);
  }, [vehicles]);

  useEffect(() => {
    saveCachedData(CACHE_KEYS.ALERTS, alerts);
  }, [alerts]);

  useEffect(() => {
    saveCachedData(CACHE_KEYS.FIELD_REPORTS, fieldReports);
  }, [fieldReports]);

  useEffect(() => {
    saveCachedData(CACHE_KEYS.DELIVERIES, deliveries);
  }, [deliveries]);

  useEffect(() => {
    saveCachedData(CACHE_KEYS.ROUTES, routes);
  }, [routes]);

  useEffect(() => {
    saveCachedData(CACHE_KEYS.RISK_ZONES, riskZones);
  }, [riskZones]);

  useEffect(() => {
    saveCachedData(CACHE_KEYS.WEATHER_STATIONS, weatherStations);
  }, [weatherStations]);

  useEffect(() => {
    saveCachedData(CACHE_KEYS.OFFLINE_QUEUE, offlineQueue);
  }, [offlineQueue]);

  // Update cached timestamp on dataset changes
  useEffect(() => {
    const stamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastCachedTime(stamp);
    saveCachedData(CACHE_KEYS.LAST_CACHED, stamp);
  }, [vehicles, alerts, fieldReports, deliveries, routes, riskZones, weatherStations, offlineQueue]);

  const clearLocalCache = () => {
    try {
      Object.values(CACHE_KEYS).forEach((k) => localStorage.removeItem(k));
      setVehicles(INITIAL_VEHICLES);
      setAlerts(INITIAL_ALERTS);
      setFieldReports(INITIAL_FIELD_REPORTS);
      setDeliveries(INITIAL_DELIVERIES);
      setRoutes(INITIAL_ROUTE_OPTIONS);
      setRiskZones(INITIAL_RISK_ZONES);
      setWeatherStations(INITIAL_WEATHER_STATIONS);
      setOfflineQueue([]);
      const stamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastCachedTime(stamp);
      showToast('Local storage cache purged and reset to baseline regional datasets.', 'info');
    } catch (e) {
      console.warn('Failed clearing cache:', e);
    }
  };

  const refreshLocalCache = () => {
    const stamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    saveCachedData(CACHE_KEYS.VEHICLES, vehicles);
    saveCachedData(CACHE_KEYS.ALERTS, alerts);
    saveCachedData(CACHE_KEYS.FIELD_REPORTS, fieldReports);
    saveCachedData(CACHE_KEYS.DELIVERIES, deliveries);
    saveCachedData(CACHE_KEYS.ROUTES, routes);
    saveCachedData(CACHE_KEYS.RISK_ZONES, riskZones);
    saveCachedData(CACHE_KEYS.WEATHER_STATIONS, weatherStations);
    saveCachedData(CACHE_KEYS.OFFLINE_QUEUE, offlineQueue);
    saveCachedData(CACHE_KEYS.LAST_CACHED, stamp);
    setLastCachedTime(stamp);
    showToast('Local storage cache snapshot successfully synchronized!', 'success');
  };

  const cacheRecordCount = {
    vehicles: vehicles.length,
    alerts: alerts.length,
    deliveries: deliveries.length,
    fieldReports: fieldReports.length,
    routes: routes.length,
    riskZones: riskZones.length,
    weatherStations: weatherStations.length,
    offlineQueue: offlineQueue.length,
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        vehicles,
        setVehicles,
        alerts,
        fieldReports,
        deliveries,
        routes,
        setRoutes,
        riskZones,
        weatherStations,
        isOffline,
        setIsOffline,
        offlineQueue,
        clearOfflineQueue,
        syncStatus,
        syncOfflineReports,
        mapFilters,
        toggleMapFilter,
        searchQuery,
        setSearchQuery,
        acknowledgeAlert,
        rerouteVehicle,
        addFieldReport,
        addDelivery,
        toggleEmergencyPriority,
        isSimulatingVehicles,
        toggleVehicleSimulation,
        isDemoRunning,
        demoStep,
        startLiveDemo,
        nextDemoStep,
        prevDemoStep,
        resetDemo,
        stopDemo,
        selectedVehicleId,
        setSelectedVehicleId,
        aiExplanationRoute,
        setAiExplanationRoute,
        toast,
        showToast,
        lastCachedTime,
        serviceWorkerActive,
        clearLocalCache,
        refreshLocalCache,
        cacheRecordCount,
        isFcmOpen,
        setIsFcmOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
