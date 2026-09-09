import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole,
  Vehicle, 
  AlertItem, 
  FieldReport, 
  DeliveryItem, 
  RouteOption, 
  RiskZone, 
  WeatherStation, 
  SeverityLevel,
  DistrictSupplyDepot,
  InventoryItem,
  RedistributionSuggestion 
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
import { INITIAL_DISTRICT_DEPOTS } from '../data/inventoryData';
import { evaluateSupplyChainCrossReference } from '../lib/inventoryCrossReference';
import { 
  recordRedistributionTransferToFirestore,
  signInWithGoogle,
  createOperationalSession,
  signOutActiveSession,
  saveUserProfileToFirestore,
  getUserProfileFromFirestore,
  listenToAuthSession
} from '../lib/firebase';

export type NavTab = 
  | 'dashboard'
  | 'supply-inventory'
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
  | 'settings'
  | 'login';

interface MapFilters {
  vehicles: boolean;
  weather: boolean;
  landslides: boolean;
  floods: boolean;
  roadBlocks: boolean;
  riskZones: boolean;
  fieldReports: boolean;
  routes: boolean;
  offlineTiles: boolean;
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
  selectedOfflineCorridorId: string;
  setSelectedOfflineCorridorId: (id: string) => void;
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
  // Supply Chain Inventory Redistribution System
  districtDepots: DistrictSupplyDepot[];
  setDistrictDepots: React.Dispatch<React.SetStateAction<DistrictSupplyDepot[]>>;
  redistributionSuggestions: RedistributionSuggestion[];
  executedTransfers: RedistributionSuggestion[];
  approveAndDispatchTransfer: (suggestionId: string) => Promise<void>;
  simulateDisruptionAtCorridor: (corridorName: string, severity?: SeverityLevel) => void;
  reEvaluateSupplyChain: () => void;
  isEvaluatingSupply: boolean;
  supplySummary: {
    criticalDepotsCount: number;
    isolatedDepotsCount: number;
    totalStockDeficitTons: number;
    activeDisruptionsCorrelated: number;
    lastEvaluationTime: string;
  };
  // Real Session & Authentication Management
  loginWithGoogle: () => Promise<User>;
  loginWithOperationalSession: (params: {
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    badgeId?: string;
    avatar?: string;
  }) => Promise<User>;
  logoutUser: () => Promise<void>;
  updateUserRole: (newRole: UserRole) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  sessionDurationMinutes: number;
  sessionStartTime: string;
}

export const DEFAULT_AUTHENTIC_USER: User = {
  id: 'session-dinesh',
  name: 'Dinesh D',
  email: 'dineshdineshdd2005@gmail.com',
  role: 'Administrator',
  department: 'Ministry of Development of North Eastern Region (MDoNER)',
  badgeId: 'NER-ADM-704',
  authProvider: 'ner-portal',
  isRealAuth: true,
  lastLogin: new Date().toISOString(),
  emailVerified: true
};

const CACHE_KEYS = {
  ACTIVE_SESSION: 'ner_logix_active_session_v3',
  SESSION_START_TIME: 'ner_logix_session_start_v3',
  VEHICLES: 'ner_logix_cached_vehicles_v2',
  ALERTS: 'ner_logix_cached_alerts_v2',
  FIELD_REPORTS: 'ner_logix_cached_field_reports_v2',
  DELIVERIES: 'ner_logix_cached_deliveries_v2',
  ROUTES: 'ner_logix_cached_routes_v2',
  RISK_ZONES: 'ner_logix_cached_risk_zones_v2',
  WEATHER_STATIONS: 'ner_logix_cached_weather_stations_v2',
  OFFLINE_QUEUE: 'ner_logix_cached_offline_queue_v2',
  LAST_CACHED: 'ner_logix_cached_timestamp_v2',
  DISTRICT_DEPOTS: 'ner_logix_cached_depots_v2',
  EXECUTED_TRANSFERS: 'ner_logix_cached_transfers_v2',
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
  // User Session Management: Persistent, non-demo authenticated state
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadCachedData<User | null>(CACHE_KEYS.ACTIVE_SESSION, DEFAULT_AUTHENTIC_USER)
  );
  const [sessionStartTime, setSessionStartTime] = useState<string>(() =>
    loadCachedData<string>(CACHE_KEYS.SESSION_START_TIME, new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
  );
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number>(0);
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
    offlineTiles: false,
  });

  const [selectedOfflineCorridorId, setSelectedOfflineCorridorId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('NER-TRUCK-104');
  const [aiExplanationRoute, setAiExplanationRoute] = useState<RouteOption | null>(INITIAL_ROUTE_OPTIONS[0]);
  const [isSimulatingVehicles, setIsSimulatingVehicles] = useState<boolean>(false);

  // Live Demo Scenario State
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  // FCM Notification Center Modal State
  const [isFcmOpen, setIsFcmOpen] = useState<boolean>(false);

  // Supply Chain Inventory Redistribution System State
  const [districtDepots, setDistrictDepots] = useState<DistrictSupplyDepot[]>(() =>
    loadCachedData(CACHE_KEYS.DISTRICT_DEPOTS, INITIAL_DISTRICT_DEPOTS)
  );
  const [executedTransfers, setExecutedTransfers] = useState<RedistributionSuggestion[]>(() =>
    loadCachedData(CACHE_KEYS.EXECUTED_TRANSFERS, [])
  );
  const [redistributionSuggestions, setRedistributionSuggestions] = useState<RedistributionSuggestion[]>([]);
  const [isEvaluatingSupply, setIsEvaluatingSupply] = useState<boolean>(false);
  const [supplySummary, setSupplySummary] = useState({
    criticalDepotsCount: 2,
    isolatedDepotsCount: 2,
    totalStockDeficitTons: 18.5,
    activeDisruptionsCorrelated: 4,
    lastEvaluationTime: 'Just now'
  });

  const reEvaluateSupplyChain = () => {
    setIsEvaluatingSupply(true);
    try {
      const result = evaluateSupplyChainCrossReference(
        districtDepots,
        weatherStations,
        alerts,
        fieldReports,
        riskZones
      );
      // Filter out suggestions that are already in executedTransfers
      const pendingSuggestions = result.suggestions.filter(
        (s) => !executedTransfers.some((ex) => ex.id === s.id && ex.status === 'DISPATCHED')
      );
      setRedistributionSuggestions(pendingSuggestions);
      setSupplySummary(result.summary);
      setDistrictDepots(result.depotsWithUpdatedRisk);
      saveCachedData(CACHE_KEYS.DISTRICT_DEPOTS, result.depotsWithUpdatedRisk);
    } catch (e) {
      console.warn('Cross-reference evaluation error:', e);
    } finally {
      setTimeout(() => setIsEvaluatingSupply(false), 300);
    }
  };

  // Re-run cross-referencing on mounts and whenever alerts, weather stations, or field reports change
  useEffect(() => {
    reEvaluateSupplyChain();
  }, [alerts.length, weatherStations.length, fieldReports.length]);

  const approveAndDispatchTransfer = async (suggestionId: string) => {
    const suggestion = redistributionSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    // Deduct stock from source depot and increment in-transit buffer at destination
    setDistrictDepots(prevDepots => {
      const updated = prevDepots.map(depot => {
        if (depot.id === suggestion.sourceDepotId) {
          return {
            ...depot,
            inventory: depot.inventory.map(item => {
              if (item.id === suggestion.commodityId || item.category === suggestion.category) {
                const newStock = Math.max(0, item.currentStock - suggestion.transferQuantity);
                return {
                  ...item,
                  currentStock: newStock,
                  daysOfStockRemaining: Number((newStock / (item.dailyBurnRate || 1)).toFixed(1))
                };
              }
              return item;
            })
          };
        }
        if (depot.id === suggestion.targetDepotId) {
          return {
            ...depot,
            inventory: depot.inventory.map(item => {
              if (item.id === suggestion.commodityId) {
                const updatedDays = Number((suggestion.projectedStockDaysAfter).toFixed(1));
                return {
                  ...item,
                  daysOfStockRemaining: updatedDays,
                  status: (updatedDays < 3 ? 'LOW' : 'ADEQUATE') as InventoryItem['status']
                };
              }
              return item;
            })
          };
        }
        return depot;
      });
      saveCachedData(CACHE_KEYS.DISTRICT_DEPOTS, updated);
      return updated;
    });

    const dispatchedRecord: RedistributionSuggestion = {
      ...suggestion,
      status: 'DISPATCHED',
      approvedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setExecutedTransfers(prev => {
      const updated = [dispatchedRecord, ...prev];
      saveCachedData(CACHE_KEYS.EXECUTED_TRANSFERS, updated);
      return updated;
    });
    setRedistributionSuggestions(prev => prev.filter(s => s.id !== suggestionId));

    // Create a new delivery consignment for tracking
    const newDelivery: Omit<DeliveryItem, 'id'> = {
      consignmentCode: `REDIST-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: 'NER-REDIST-01',
      vehiclePlate: 'AS-01-RD-9901',
      driverName: 'Subedar T. Wangchu (4WD Escort)',
      origin: suggestion.sourceDepotName,
      destination: suggestion.targetDepotName,
      goods: suggestion.commodityName.includes('Vaccine') || suggestion.commodityName.includes('Cold') ? 'Cold Chain Vaccines' :
             suggestion.commodityName.includes('Medicine') || suggestion.commodityName.includes('Antibiotic') ? 'Medicines' :
             suggestion.commodityName.includes('Diesel') || suggestion.commodityName.includes('Fuel') ? 'Fuel' :
             suggestion.commodityName.includes('Rice') || suggestion.commodityName.includes('Food') ? 'Food Supplies' : 'Emergency Supplies',
      priority: 'Emergency',
      eta: `${suggestion.estimatedTransitHours} hours`,
      status: 'Dispatched',
      risk: suggestion.urgency === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      dispatchTime: 'Immediate',
      weightTons: Number((suggestion.transferQuantity * 0.004).toFixed(1)) || 4.2,
      currentLocation: suggestion.recommendedRoute.split('→')[0].trim() || suggestion.sourceDepotName
    };
    addDelivery(newDelivery);

    // Save to Firestore
    try {
      await recordRedistributionTransferToFirestore({
        transferId: suggestion.id,
        sourceDistrict: suggestion.sourceDepotName,
        targetDistrict: suggestion.targetDepotName,
        commodity: suggestion.commodityName,
        quantity: suggestion.transferQuantity,
        unit: suggestion.unit,
        urgency: suggestion.urgency,
        status: 'Dispatched',
        approvedBy: currentUser?.name || 'Logistics Operator'
      });
    } catch (err) {
      console.warn('Firestore transfer recording notice:', err);
    }

    showToast(`Emergency Redistribution Dispatched: ${suggestion.transferQuantity} ${suggestion.unit} of ${suggestion.commodityName} routed to ${suggestion.targetDepotName}`, 'success');
  };

  const simulateDisruptionAtCorridor = (corridorName: string, severity: SeverityLevel = 'CRITICAL') => {
    const newAlert: AlertItem = {
      id: `alert-sim-${Date.now()}`,
      title: `⚡ Road Blockage & Slump: ${corridorName}`,
      description: `Heavy slope subsidence and washed-out roadway section on ${corridorName}. Projected arterial blockade: 72-96 hours.`,
      locationName: corridorName,
      coords: { lat: 27.35, lng: 92.42 },
      severity,
      source: 'Automated Sensor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendedAction: 'Trigger emergency buffer reallocation from central stockpile immediately.',
      isAcknowledged: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
    showToast(`Simulated disruption triggered on ${corridorName}. Recalculating isolation risks...`, 'warning');
  };

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // ------------------------------------------------------------------------
  // Real User Session Management & Firebase Auth Integration
  // ------------------------------------------------------------------------

  // Session duration timer (increments active session minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDurationMinutes(prev => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Sync session state to localStorage and Firestore
  useEffect(() => {
    if (currentUser) {
      saveCachedData(CACHE_KEYS.ACTIVE_SESSION, currentUser);
      saveUserProfileToFirestore(currentUser).catch(() => {});
    }
  }, [currentUser]);

  // Listen for live Firebase Authentication state changes
  useEffect(() => {
    const unsubscribe = listenToAuthSession((authUser) => {
      if (authUser) {
        console.log('[Auth Session] Firebase user session detected:', authUser.email);
        setCurrentUser(authUser);
        saveCachedData(CACHE_KEYS.ACTIVE_SESSION, authUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<User> => {
    try {
      const user = await signInWithGoogle();
      setCurrentUser(user);
      const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setSessionStartTime(nowTime);
      setSessionDurationMinutes(0);
      saveCachedData(CACHE_KEYS.ACTIVE_SESSION, user);
      saveCachedData(CACHE_KEYS.SESSION_START_TIME, nowTime);
      showToast(`Authenticated via Google: ${user.email}`, 'success');
      setActiveTab('dashboard');
      return user;
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      showToast(`Google Sign-In: ${err?.message || 'Could not complete popup sign-in. Please check popup permissions.'}`, 'error');
      throw err;
    }
  };

  const loginWithOperationalSession = async (params: {
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    badgeId?: string;
    avatar?: string;
  }): Promise<User> => {
    try {
      const user = await createOperationalSession(params);
      setCurrentUser(user);
      const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setSessionStartTime(nowTime);
      setSessionDurationMinutes(0);
      saveCachedData(CACHE_KEYS.ACTIVE_SESSION, user);
      saveCachedData(CACHE_KEYS.SESSION_START_TIME, nowTime);
      showToast(`Welcome ${user.name}! Operational session activated.`, 'success');
      setActiveTab('dashboard');
      return user;
    } catch (err: any) {
      console.error('Session creation failed:', err);
      showToast(`Failed to initialize session: ${err?.message}`, 'error');
      throw err;
    }
  };

  const logoutUser = async (): Promise<void> => {
    try {
      await signOutActiveSession();
      setCurrentUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CACHE_KEYS.ACTIVE_SESSION);
      }
      showToast('Session ended. Signed out securely.', 'info');
      setActiveTab('login');
    } catch (err: any) {
      showToast(`Sign out error: ${err?.message}`, 'error');
    }
  };

  const updateUserRole = async (newRole: UserRole): Promise<void> => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      role: newRole,
      lastLogin: new Date().toISOString()
    };
    setCurrentUser(updated);
    saveCachedData(CACHE_KEYS.ACTIVE_SESSION, updated);
    await saveUserProfileToFirestore(updated).catch(() => {});
    showToast(`Operational role switched to ${newRole}`, 'info');
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      ...updates,
      lastLogin: new Date().toISOString()
    };
    setCurrentUser(updated);
    saveCachedData(CACHE_KEYS.ACTIVE_SESSION, updated);
    await saveUserProfileToFirestore(updated).catch(() => {});
    showToast('User profile updated and saved to Firestore.', 'success');
  };

  const toggleMapFilter = (key: keyof MapFilters) => {
    setMapFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setIsOffline = (offline: boolean) => {
    setIsOfflineState(offline);
    if (!offline && offlineQueue.length > 0) {
      syncOfflineReports();
    } else if (offline) {
      // Auto-activate offline corridor cached tiles when network is lost
      setMapFilters(prev => ({ ...prev, offlineTiles: true }));
      showToast('Network Disconnected — Switched to Offline Tactical Map Tiles & Local Storage', 'warning');
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
        selectedOfflineCorridorId,
        setSelectedOfflineCorridorId,
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
        districtDepots,
        setDistrictDepots,
        redistributionSuggestions,
        executedTransfers,
        approveAndDispatchTransfer,
        simulateDisruptionAtCorridor,
        reEvaluateSupplyChain,
        isEvaluatingSupply,
        supplySummary,
        loginWithGoogle,
        loginWithOperationalSession,
        logoutUser,
        updateUserRole,
        updateUserProfile,
        sessionDurationMinutes,
        sessionStartTime,
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
