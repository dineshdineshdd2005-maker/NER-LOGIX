import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle } from '../types';
import { 
  Truck, 
  Navigation, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Thermometer, 
  Fuel, 
  ArrowUpRight, 
  ShieldAlert, 
  PhoneCall, 
  RotateCcw,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers
} from 'lucide-react';

interface FleetManagementWidgetProps {
  onNavigateTracking?: () => void;
  onNavigateDeliveries?: () => void;
  onNavigateOptimizer?: () => void;
}

export const FleetManagementWidget: React.FC<FleetManagementWidgetProps> = ({
  onNavigateTracking,
  onNavigateDeliveries,
  onNavigateOptimizer
}) => {
  const { 
    vehicles, 
    setSelectedVehicleId, 
    showToast, 
    rerouteVehicle,
    alerts
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_TRANSIT' | 'RE_ROUTED' | 'DELAYED'>('ALL');
  const [activeTabSub, setActiveTabSub] = useState<'convoy' | 'corridors' | 'quick_actions'>('convoy');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicles[0] || null);

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'IN_TRANSIT') return v.status === 'In Transit';
    if (filterStatus === 'RE_ROUTED') return v.status === 'Re-routed';
    if (filterStatus === 'DELAYED') return v.status === 'Delayed';
    return true;
  });

  const inTransitCount = vehicles.filter(v => v.status === 'In Transit').length;
  const reroutedCount = vehicles.filter(v => v.status === 'Re-routed').length;
  const delayedCount = vehicles.filter(v => v.status === 'Delayed').length;
  const coldChainCount = vehicles.filter(v => v.temperatureCargo !== undefined).length;

  const handlePingVehicle = (v: Vehicle) => {
    showToast(`Telemetry Ping: ${v.plateNumber} responding. GPS fix locked at ${v.currentLocationName}.`, 'info');
  };

  const handleRerouteClick = (v: Vehicle) => {
    rerouteVehicle(v.id, 'SH-5 Kalaktang Safe Bypass (AI Diverted)');
    showToast(`Dispatcher Re-Route Command: Diverted ${v.plateNumber} onto Kalaktang Safe Bypass.`, 'success');
  };

  const handleSelectInspect = (v: Vehicle) => {
    setSelectedVehicle(v);
    setSelectedVehicleId(v.id);
    if (onNavigateTracking) {
      onNavigateTracking();
    }
  };

  return (
    <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-xs space-y-5 text-slate-800">
      {/* Widget Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Fleet Management & Mountain Convoy Control
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase font-mono">
                Dispatcher View
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live mountain transit telemetry, telemetry telemetry, and active landslide diversion commands
            </p>
          </div>
        </div>

        {/* Action Shortcuts for Dispatcher */}
        <div className="flex items-center gap-2">
          {onNavigateTracking && (
            <button
              onClick={onNavigateTracking}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>GPS Workstation</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
          {onNavigateDeliveries && (
            <button
              onClick={onNavigateDeliveries}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Cargo Manifests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dispatcher Key Telemetry Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>In Transit</span>
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{inTransitCount} Units</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Active mountain convoys</div>
        </div>

        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Re-Routed</span>
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-900 mt-1">{reroutedCount} Diverted</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Bypassing Sela Pass block</div>
        </div>

        <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200/70">
          <div className="flex items-center justify-between text-indigo-700 text-xs font-medium">
            <span>Cold-Chain Telemetry</span>
            <Thermometer className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-900 mt-1">{coldChainCount} Refrig</div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">2°C – 8°C vaccines & IV</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pass Clearance</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl font-bold font-mono text-red-700 mt-1">1 Blocked</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">NH-13 Sela Km 112</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1">Filter Fleet:</span>
          {(['ALL', 'IN_TRANSIT', 'RE_ROUTED', 'DELAYED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredVehicles.length} of {vehicles.length} Convoys
        </div>
      </div>

      {/* Live Vehicle Fleet Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
        {filteredVehicles.map(vehicle => {
          const isCritical = vehicle.riskLevel === 'CRITICAL' || vehicle.status === 'Delayed';
          const isRerouted = vehicle.status === 'Re-routed';

          return (
            <div
              key={vehicle.id}
              className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between gap-3 ${
                isRerouted 
                  ? 'bg-amber-50/40 border-amber-300' 
                  : isCritical 
                  ? 'bg-red-50/30 border-red-200' 
                  : 'bg-slate-50/70 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {vehicle.plateNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-white border border-slate-200 text-slate-600">
                      {vehicle.vehicleType}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1.5">
                    <span>Driver: <strong>{vehicle.driverName}</strong></span>
                    <span>·</span>
                    <a 
                      href={`tel:${vehicle.driverPhone}`} 
                      className="text-indigo-600 hover:underline flex items-center gap-0.5"
                    >
                      <PhoneCall className="w-2.5 h-2.5" />
                      <span>{vehicle.driverPhone}</span>
                    </a>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                  vehicle.status === 'Re-routed'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : vehicle.status === 'In Transit'
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {vehicle.status}
                </span>
              </div>

              {/* Corridor Position & Cargo */}
              <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Corridor Sector:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                    {vehicle.currentLocationName} ➔ {vehicle.destinationName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Cargo Payload:</span>
                  <span className="font-semibold text-indigo-900 truncate max-w-[200px]">
                    {vehicle.cargoType} ({vehicle.cargoPriority})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-[10px]">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Compass className="w-3 h-3 text-slate-400" />
                    <span>{vehicle.speedKmH} km/h</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Fuel className="w-3 h-3 text-slate-400" />
                    <span>{vehicle.batteryOrFuelPercent}% Fuel</span>
                  </div>
                  {vehicle.temperatureCargo !== undefined && (
                    <div className="flex items-center gap-1 text-indigo-700 font-bold">
                      <Thermometer className="w-3 h-3 text-indigo-500" />
                      <span>{vehicle.temperatureCargo}°C</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dispatcher Actions */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handlePingVehicle(vehicle)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition"
                >
                  <Radio className="w-3 h-3 text-indigo-600" />
                  <span>Radio Ping</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {vehicle.status !== 'Re-routed' && (
                    <button
                      type="button"
                      onClick={() => handleRerouteClick(vehicle)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs"
                      title="Issue dynamic bypass route around Sela Pass block"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Order Re-Route</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSelectInspect(vehicle)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <span>Track Unit</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mountain Corridor Pass Status Feed */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-bold text-slate-800">Mountain Arterial Clearances:</span>
          <span className="text-slate-500 text-[11px]">
            Kalaktang Safe Bypass: <strong className="text-emerald-700">OPEN</strong> · Sela Pass (NH13): <strong className="text-red-700">BLOCKED (Km 112)</strong> · Barapani NH6: <strong className="text-amber-700">CAUTION</strong>
          </span>
        </div>

        {onNavigateOptimizer && (
          <button
            onClick={onNavigateOptimizer}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Examine AI Rerouting Engine</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
