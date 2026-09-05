import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LeafletMap } from '../components/LeafletMap';
import { RealTimeAlertPanel } from '../components/RealTimeAlertPanel';
import { AiRiskExplainModal } from '../components/AiRiskExplainModal';
import { 
  Truck, 
  Route as RouteIcon, 
  AlertTriangle, 
  Bell, 
  PackageCheck, 
  Ban, 
  Compass, 
  BrainCircuit, 
  Radio, 
  ArrowUpRight, 
  Activity,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
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
    setAiExplanationRoute
  } = useApp();

  const [explainModalOpen, setExplainModalOpen] = useState(false);

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
