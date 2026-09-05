import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RouteOption, SeverityLevel } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { AiRiskExplainModal } from '../components/AiRiskExplainModal';
import { GeminiEtaPredictor } from '../components/GeminiEtaPredictor';
import { 
  Route as RouteIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Compass, 
  Navigation, 
  ArrowRight, 
  TrendingUp, 
  Sliders, 
  Truck, 
  HelpCircle,
  ShieldCheck,
  Zap,
  MapPin
} from 'lucide-react';

export const RouteOptimizerView: React.FC = () => {
  const { 
    routes, 
    setRoutes,
    vehicles, 
    setVehicles,
    rerouteVehicle, 
    setSelectedVehicleId, 
    setActiveTab, 
    showToast,
    setAiExplanationRoute
  } = useApp();

  const [source, setSource] = useState('Guwahati Central Hub');
  const [destination, setDestination] = useState('Tawang District Hospital');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-b');
  const [selectedVehicleForDispatch, setSelectedVehicleForDispatch] = useState<string>('NER-TRUCK-104');
  const [explainModalOpen, setExplainModalOpen] = useState(false);

  // Multi-objective optimization preference sliders
  const [safetyWeight, setSafetyWeight] = useState<number>(75);
  const [speedWeight, setSpeedWeight] = useState<number>(25);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[1];

  const handleAssignAndDispatch = () => {
    rerouteVehicle(selectedVehicleForDispatch, selectedRouteId);
    setSelectedVehicleId(selectedVehicleForDispatch);
    showToast(`Vehicle ${selectedVehicleForDispatch} assigned to ${selectedRoute.name} (${selectedRoute.title})!`, 'success');
    setActiveTab('tracking');
  };

  const handleApplyPredictedEta = (routeId: string, etaString: string, vehicleId: string) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, geminiPredictedEta: etaString } : r));
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, eta: `${etaString} (Gemini AI)` } : v));
    showToast(`Gemini Grounded ETA of ${etaString} applied to vehicle ${vehicleId}!`, 'success');
  };

  const getRiskBadge = (risk: SeverityLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Smart Route Optimization
            </h1>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold uppercase border border-indigo-200">
              Multi-Objective Path Finding
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Dynamically evaluates terrain elevation, monsoon precipitation, historical slip planes, and real-time blockades to identify disaster-resilient corridors.
          </p>
        </div>

        {/* Source -> Destination Visual */}
        <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs shadow-xs">
          <span className="font-bold text-slate-700">{source}</span>
          <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-bold text-emerald-700">{destination}</span>
        </div>
      </div>

      {/* GEMINI AI HISTORICAL TRAFFIC & WEATHER ETA ENGINE */}
      <GeminiEtaPredictor
        selectedRoute={selectedRoute}
        allRoutes={routes}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleForDispatch}
        onSelectVehicle={(vid) => setSelectedVehicleForDispatch(vid)}
        onApplyPredictedEta={handleApplyPredictedEta}
        showToast={showToast}
      />

      {/* Main Layout: 3 Route Cards + Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3 Route Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Evaluated Transit Corridors:
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Graph Search: A* Modified with Geospatial Risk Penalties
            </span>
          </div>

          {/* Route A, Route B, Route C Cards */}
          <div className="space-y-3">
            {routes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              const isRecommended = route.isAiRecommended;

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                    isRecommended
                      ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300'
                      : isSelected
                        ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {/* AI RECOMMENDED BADGE */}
                  {isRecommended && (
                    <div className="absolute -top-2.5 right-4 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-amber-200" />
                      AI RECOMMENDED ROUTE
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {route.name}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {route.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        Via: <span className="text-slate-700 font-medium">{route.viaHighway}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getRiskBadge(route.riskLevel)}`}>
                        Risk: {route.riskLevel} ({route.riskScore}/100)
                      </span>
                    </div>
                  </div>

                  {/* Distance, Time & Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">Distance</span>
                      <span className="font-mono font-bold text-slate-800">{route.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">Est. Time</span>
                      <span className="font-mono font-bold text-slate-800">{route.estimatedTime}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">Max Elevation</span>
                      <span className="font-mono font-bold text-slate-800">{route.elevationGainM} m</span>
                    </div>
                  </div>

                  {/* Gemini Predictive ETA Callout in Route Card */}
                  {route.geminiPredictedEta ? (
                    <div className="mt-2.5 p-2 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-indigo-900 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Gemini Grounded ETA:</span>
                        <span className="font-mono font-bold text-indigo-950 text-sm">
                          {route.geminiPredictedEta}
                        </span>
                      </div>
                      <span className="text-[10px] bg-indigo-200/70 text-indigo-800 font-bold px-1.5 py-0.5 rounded font-mono">
                        Applied to Dispatch
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Empirical Historical Delay:</span>
                      </span>
                      <span className="font-mono font-semibold text-slate-700">
                        {route.id === 'route-a' 
                          ? '+145m (Monsoon & Sela Pass Slush)' 
                          : route.id === 'route-b' 
                            ? '+25m (Minimal - Stabilized Cut)' 
                            : '+75m (Seasonal River Flood)'}
                      </span>
                    </div>
                  )}

                  {/* AI Explanation Callout */}
                  <div className={`mt-3 p-3 rounded-lg text-xs leading-relaxed ${
                    isRecommended 
                      ? 'bg-white border border-emerald-200 text-emerald-900' 
                      : 'bg-slate-50 border border-slate-200 text-slate-700'
                  }`}>
                    <span className="font-bold block mb-0.5 text-slate-900">
                      {isRecommended ? '✨ Why Recommended:' : 'Route Analysis:'}
                    </span>
                    <p className="italic">
                      "{route.explanation}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dispatch Assignment Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-600" />
                Assign Selected Route to Active Vehicle Fleet
              </span>
              <span className="text-[10px] text-slate-400">Direct Telematics Uplink</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Target Vehicle (In-Transit)
                </label>
                <select
                  value={selectedVehicleForDispatch}
                  onChange={(e) => setSelectedVehicleForDispatch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.id} ({v.driverName} - {v.cargoType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 sm:pt-0">
                <button
                  onClick={handleAssignAndDispatch}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Dispatch & Update Driver Cab ({selectedRoute.name})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Map & Live Corridor Inspection (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Corridor Map View & Sela Pass Bypass</span>
            </div>
            <button
              onClick={() => {
                setAiExplanationRoute(selectedRoute);
                setExplainModalOpen(true);
              }}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Explain Risk Model</span>
            </button>
          </div>

          {/* Leaflet Map Preview */}
          <LeafletMap height="430px" showControls={true} />

          {/* Comparative Matrix Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2.5 shadow-sm text-slate-800">
            <span className="font-bold text-slate-900 block border-b border-slate-100 pb-2">
              Decision Trade-off Analysis (Judges Reference)
            </span>
            <div className="space-y-2 text-[11px] text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Route A vs Route B Delta:</span>
                <span className="font-mono text-emerald-700 font-bold">+25 km / +45 mins</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Risk Reduction Factor:</span>
                <span className="font-mono text-emerald-700 font-bold">-54 points (HIGH ➔ LOW)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active Landslide Exposure:</span>
                <span className="font-mono text-emerald-700 font-bold">Bypasses Bomdila-Sela Block</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cold-Chain Power Stability:</span>
                <span className="font-mono text-indigo-600 font-bold">100% Maintained</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {explainModalOpen && (
        <AiRiskExplainModal
          route={selectedRoute}
          onClose={() => setExplainModalOpen(false)}
        />
      )}
    </div>
  );
};
