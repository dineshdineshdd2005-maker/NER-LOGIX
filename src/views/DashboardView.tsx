import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { LeafletMap } from '../components/LeafletMap';
import { RealTimeAlertPanel } from '../components/RealTimeAlertPanel';
import { AiRiskExplainModal } from '../components/AiRiskExplainModal';
import { FleetManagementWidget } from '../components/FleetManagementWidget';
import { ResourceAllocationWidget } from '../components/ResourceAllocationWidget';
import { 
  getUserProfileFromFirestore, 
  subscribeToUserProfile, 
  saveUserProfileToFirestore 
} from '../lib/firebase';
import { UserRole } from '../types';
import { 
  Truck, 
  Route as RouteIcon, 
  AlertTriangle, 
  Bell, 
  PackageCheck, 
  Ban, 
  BrainCircuit, 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Boxes,
  RefreshCw,
  Cloud,
  CheckCircle2,
  Layers,
  Sliders,
  UserCheck,
  Building
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    currentUser,
    updateUserRole,
    vehicles, 
    routes, 
    alerts, 
    deliveries, 
    fieldReports, 
    setActiveTab, 
    setSelectedVehicleId,
    startLiveDemo,
    isDemoRunning,
    aiExplanationRoute,
    setAiExplanationRoute,
    redistributionSuggestions,
    supplySummary,
    showToast
  } = useApp();

  const [explainModalOpen, setExplainModalOpen] = useState(false);

  // -------------------------------------------------------------------------
  // Live Firebase User Role Fetching & Synchronization State
  // -------------------------------------------------------------------------
  const [firebaseRole, setFirebaseRole] = useState<UserRole>(currentUser?.role || 'Administrator');
  const [isFetchingFirebase, setIsFetchingFirebase] = useState<boolean>(true);
  const [lastFirebaseSyncTime, setLastFirebaseSyncTime] = useState<string>('Just now');
  const [viewMode, setViewMode] = useState<'AUTO' | 'FLEET' | 'RESOURCE' | 'BOTH'>('AUTO');
  const [isRoleUpdating, setIsRoleUpdating] = useState<boolean>(false);

  // Real-time listener for user profile and role from Cloud Firestore
  useEffect(() => {
    const userId = currentUser?.id || 'session-dinesh';
    setIsFetchingFirebase(true);

    // Initial direct fetch from Firebase Firestore
    getUserProfileFromFirestore(userId)
      .then(profile => {
        if (profile && profile.role) {
          setFirebaseRole(profile.role);
          setLastFirebaseSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } else if (currentUser) {
          // Document does not exist yet in Firestore; seed profile
          saveUserProfileToFirestore(currentUser).then(() => {
            setFirebaseRole(currentUser.role);
            setLastFirebaseSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          });
        }
      })
      .catch(err => {
        console.warn('[Dashboard] Could not fetch role from Firestore, using local session:', err);
      })
      .finally(() => {
        setIsFetchingFirebase(false);
      });

    // Real-time Firestore snapshot subscription
    const unsubscribe = subscribeToUserProfile(userId, (profile, error) => {
      setIsFetchingFirebase(false);
      if (profile && profile.role) {
        setFirebaseRole(profile.role as UserRole);
        setLastFirebaseSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id]);

  // Keep local role in sync if currentUser changes
  useEffect(() => {
    if (currentUser?.role && currentUser.role !== firebaseRole) {
      setFirebaseRole(currentUser.role);
    }
  }, [currentUser?.role]);

  // Handle switching role and writing live to Firebase Firestore
  const handleSwitchRoleInFirebase = async (newRole: UserRole) => {
    setIsRoleUpdating(true);
    try {
      await updateUserRole(newRole);
      setFirebaseRole(newRole);
      setLastFirebaseSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      showToast(`Firebase Role Updated: Now operating as ${newRole}`, 'success');
    } catch (err: any) {
      console.error('Failed to update role in Firebase:', err);
      showToast(`Error updating role in Firebase: ${err?.message}`, 'error');
    } finally {
      setIsRoleUpdating(false);
    }
  };

  // Manual trigger to re-query Firebase Firestore
  const handleManualRefreshRole = async () => {
    const userId = currentUser?.id || 'session-dinesh';
    setIsFetchingFirebase(true);
    try {
      const profile = await getUserProfileFromFirestore(userId);
      if (profile && profile.role) {
        setFirebaseRole(profile.role);
        setLastFirebaseSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        showToast(`Refreshed role from Firebase Firestore: ${profile.role}`, 'info');
      } else {
        showToast('Firestore profile synced and verified.', 'info');
      }
    } catch (err: any) {
      showToast(`Firestore check failed: ${err?.message}`, 'error');
    } finally {
      setIsFetchingFirebase(false);
    }
  };

  // Role detection:
  // - Dispatcher: 'Logistics Operator' or department containing 'dispatch'
  // - Administrator: 'Administrator'
  const isDispatcher = firebaseRole === 'Logistics Operator' || 
    (currentUser?.department || '').toLowerCase().includes('dispatch') ||
    (currentUser?.department || '').toLowerCase().includes('fleet');

  const isAdmin = firebaseRole === 'Administrator';

  // Calculate top statistics
  const activeVehiclesCount = vehicles.filter(v => v.status === 'In Transit' || v.status === 'Re-routed').length;
  const routesMonitoredCount = routes.length;
  const highRiskRoutesCount = routes.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
  const activeAlertsCount = alerts.filter(a => !a.isAcknowledged).length;
  const deliveriesInTransitCount = deliveries.filter(d => d.status === 'In Transit' || d.status === 'Re-routed').length;
  const roadsBlockedCount = alerts.filter(a => 
    a.severity === 'CRITICAL' || a.title.toLowerCase().includes('block') || a.title.toLowerCase().includes('landslide')
  ).length;

  const topStats = [
    {
      label: 'Active Vehicles',
      value: activeVehiclesCount,
      change: '100% GPS connected',
      icon: Truck,
      color: 'text-indigo-600',
      badgeColor: 'text-indigo-600',
      tab: 'tracking' as const,
    },
    {
      label: 'Corridors Monitored',
      value: `${routesMonitoredCount} Routes`,
      change: 'All telemetry active',
      icon: RouteIcon,
      color: 'text-emerald-600',
      badgeColor: 'text-emerald-600',
      tab: 'optimizer' as const,
    },
    {
      label: 'Route Risk Average',
      value: '74.2%',
      change: '↑ 12% from baseline',
      icon: AlertTriangle,
      color: 'text-red-600',
      badgeColor: 'text-red-600',
      tab: 'risk-prediction' as const,
    },
    {
      label: 'Active Live Alerts',
      value: activeAlertsCount,
      change: 'Real-time IMD feeds',
      icon: Bell,
      color: 'text-red-600',
      badgeColor: 'text-red-600',
      tab: 'alerts' as const,
    },
    {
      label: 'Active Deliveries',
      value: `${deliveriesInTransitCount} In Transit`,
      change: 'Essential cold-chain',
      icon: PackageCheck,
      color: 'text-indigo-600',
      badgeColor: 'text-indigo-600',
      tab: 'deliveries' as const,
    },
    {
      label: 'Network Accessibility',
      value: '61.4%',
      change: 'Monsoon impact high',
      icon: Ban,
      color: 'text-amber-600',
      badgeColor: 'text-amber-600',
      tab: 'field-reports' as const,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Sleek Theme Presentation Callout */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              North Eastern Regional Logistics Command & Accessibility Intelligence
            </h1>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-mono font-bold uppercase">
              AI + GIS + GPS + WEATHER
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
            Multi-modal accessibility monitoring across 8 North Eastern states. Real-time predictive risk scoring, dynamic rerouting around landslide blocks, and offline-first ground truth reporting.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setAiExplanationRoute(routes[0]);
              setExplainModalOpen(true);
            }}
            className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4 text-indigo-600" />
            <span>Explain AI Risk Model</span>
          </button>

          {!isDemoRunning && (
            <button
              onClick={startLiveDemo}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Start Live Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FIREBASE ROLE STATUS & ROLE-BASED COCKPIT CONTROLS                        */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Live Firebase Role Identification */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Firebase Role & Session:
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                  isDispatcher 
                    ? 'bg-indigo-500 text-white font-mono'
                    : isAdmin
                    ? 'bg-emerald-500 text-white font-mono'
                    : 'bg-amber-500 text-white font-mono'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  <span>{firebaseRole}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {currentUser?.authProvider === 'google.com' ? 'Google Auth' : 'Operational Session'}
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                <span>User: <strong className="text-white">{currentUser?.name}</strong></span>
                <span>·</span>
                <span className="text-slate-400 font-mono text-[11px]">{currentUser?.email}</span>
                <span>·</span>
                <span className="text-indigo-300 text-[11px]">{currentUser?.department}</span>
              </div>
            </div>
          </div>

          {/* Right: Firebase Live Status & Quick Role Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[11px] text-slate-400 font-mono mr-2 hidden sm:block">
              {isFetchingFirebase ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Syncing Firestore...</span>
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Synced {lastFirebaseSyncTime}</span>
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={isFetchingFirebase || isRoleUpdating}
              onClick={handleManualRefreshRole}
              title="Refresh profile from Firebase Firestore"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFirebase ? 'animate-spin' : ''}`} />
            </button>

            {/* Quick Switch Buttons to evaluate both widgets directly */}
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                disabled={isRoleUpdating}
                onClick={() => handleSwitchRoleInFirebase('Logistics Operator')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  firebaseRole === 'Logistics Operator'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Dispatcher Role</span>
              </button>

              <button
                type="button"
                disabled={isRoleUpdating}
                onClick={() => handleSwitchRoleInFirebase('Administrator')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  firebaseRole === 'Administrator'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrator Role</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Mode Selector bar */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Customized Widget Display:</span>
            <span className="text-white font-medium">
              {viewMode === 'AUTO' 
                ? (isDispatcher ? 'Fleet Management (Auto-selected for Dispatcher)' : 'Resource Allocation (Auto-selected for Administrator)')
                : viewMode === 'FLEET'
                ? 'Fleet Management (Manual Preview)'
                : viewMode === 'RESOURCE'
                ? 'Resource Allocation (Manual Preview)'
                : 'Both Customized Widgets (Full Command)'
              }
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 mr-1 hidden md:inline">Widget Override:</span>
            {(['AUTO', 'FLEET', 'RESOURCE', 'BOTH'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2 py-1 rounded transition cursor-pointer font-medium ${
                  viewMode === mode
                    ? 'bg-slate-700 text-white border border-slate-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'AUTO' ? 'Auto (Role-Based)' : mode === 'FLEET' ? 'Fleet Management' : mode === 'RESOURCE' ? 'Resource Allocation' : 'Show Both'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROLE-CUSTOMIZED WIDGETS SECTION                                           */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Render FLEET MANAGEMENT WIDGET: For Dispatchers or when selected */}
        {(viewMode === 'BOTH' || viewMode === 'FLEET' || (viewMode === 'AUTO' && isDispatcher)) && (
          <div className="animate-in fade-in duration-300">
            <FleetManagementWidget 
              onNavigateTracking={() => setActiveTab('tracking')}
              onNavigateDeliveries={() => setActiveTab('deliveries')}
              onNavigateOptimizer={() => setActiveTab('optimizer')}
            />
          </div>
        )}

        {/* Render RESOURCE ALLOCATION WIDGET: For Administrative Users or when selected */}
        {(viewMode === 'BOTH' || viewMode === 'RESOURCE' || (viewMode === 'AUTO' && (!isDispatcher || isAdmin))) && (
          <div className="animate-in fade-in duration-300">
            <ResourceAllocationWidget 
              onNavigateSupply={() => setActiveTab('supply-inventory')}
              onNavigateAdmin={() => setActiveTab('admin')}
            />
          </div>
        )}
      </div>

      {/* KPI Overview Grid from Sleek Interface Theme */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {topStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(stat.tab)}
              className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="mt-3">
                <div className="text-xl font-bold text-slate-800 font-mono">
                  {stat.value}
                </div>
                <div className={`text-xs font-medium mt-0.5 truncate ${stat.badgeColor}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Referenced Inventory Alert Strip */}
      {redistributionSuggestions.length > 0 && (
        <div className="bg-linear-to-r from-red-50 via-amber-50 to-indigo-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-red-100 text-red-700 rounded-lg shrink-0">
              <Boxes className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Automated Inventory Cross-Reference Alert:</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full">
                  {supplySummary.criticalDepotsCount} Outposts Threatened
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Precipitation Doppler & landslide blocks indicate critical stockouts within 48h. <strong className="text-slate-900">{redistributionSuggestions.length} emergency transfers</strong> prepared for dispatch.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('supply-inventory')}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
          >
            <span>Review Redistribution Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Interactive GIS Map + Real-Time Alert Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            {/* Map Header */}
            <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <h2 className="font-bold text-sm text-slate-800 uppercase tracking-tight">
                  Regional Geospatial Operations (NER Highway Grid)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  EPSG:4326 · 8 States
                </span>
                <button
                  onClick={() => setActiveTab('map')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  Full GIS Workstation →
                </button>
              </div>
            </div>

            {/* Leaflet Map */}
            <LeafletMap height="530px" />

            {/* Critical Route Status Bar */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 border border-red-200 flex items-center justify-center font-bold font-mono">
                  NH13
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Guwahati ➔ Bomdila ➔ Tawang Arterial Axis</span>
                    <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.2 rounded font-bold uppercase">
                      BLOCKADE DETECTED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Landslide at Sela Pass Approach (Km 112). Recommended Safe Bypass: <b className="text-emerald-700">Route B (Kalaktang Valley Corridor)</b>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('optimizer')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>Examine Optimized Routes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Alert Panel (4 cols on desktop) */}
        <div className="lg:col-span-4 h-[650px]">
          <RealTimeAlertPanel />
        </div>
      </div>

      {/* AI Explanation Modal */}
      {explainModalOpen && (
        <AiRiskExplainModal
          route={aiExplanationRoute}
          onClose={() => setExplainModalOpen(false)}
          onNavigateOptimizer={() => setActiveTab('optimizer')}
        />
      )}
    </div>
  );
};
