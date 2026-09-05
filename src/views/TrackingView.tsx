import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LeafletMap } from '../components/LeafletMap';
import { Vehicle, SeverityLevel } from '../types';
import { 
  Truck, 
  Navigation, 
  Play, 
  Pause, 
  Compass, 
  Gauge, 
  Battery, 
  Thermometer, 
  Phone, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Radio, 
  RotateCcw,
  Sparkles,
  Search
} from 'lucide-react';

export const TrackingView: React.FC = () => {
  const { 
    vehicles, 
    selectedVehicleId, 
    setSelectedVehicleId, 
    isSimulatingVehicles, 
    toggleVehicleSimulation,
    rerouteVehicle,
    setActiveTab,
    showToast
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const filteredVehicles = vehicles.filter(v => 
    v.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
    v.driverName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    v.destinationName.toLowerCase().includes(searchFilter.toLowerCase())
  );

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

  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'In Transit':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'Re-routed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Halted':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'Delivered':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Simulation Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Live Vehicle Fleet Tracking & Telematics
            </h1>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold uppercase border border-indigo-200">
              GPS + Sat-Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time positional monitoring across remote NER terrain with automated speed, elevation, and corridor risk telemetry.
          </p>
        </div>

        {/* SIMULATE VEHICLE MOVEMENT BUTTON */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVehicleSimulation}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs ${
              isSimulatingVehicles
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isSimulatingVehicles ? (
              <>
                <Pause className="w-4 h-4 fill-current animate-pulse" />
                <span>Pause GPS Simulation</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Simulate Vehicle Movement</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Selected Vehicle Telemetry Card + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Telemetry Cockpit (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Vehicle Card */}
          {selectedVehicle && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm text-slate-800">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-slate-900">
                      {selectedVehicle.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getStatusBadge(selectedVehicle.status)}`}>
                      {selectedVehicle.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    Plate: {selectedVehicle.plateNumber} · {selectedVehicle.vehicleType}
                  </p>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getRiskBadge(selectedVehicle.riskLevel)}`}>
                  {selectedVehicle.riskLevel} Risk
                </span>
              </div>

              {/* Driver & Trip Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Driver</span>
                  <span className="font-semibold text-slate-800">{selectedVehicle.driverName}</span>
                  <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{selectedVehicle.driverPhone}</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Estimated Arrival (ETA)</span>
                  <span className="font-bold text-emerald-700 text-sm font-mono">{selectedVehicle.eta}</span>
                  <span className="text-[10px] text-slate-500 block truncate">Dest: {selectedVehicle.destinationName}</span>
                </div>
              </div>

              {/* Real-Time Telemetry Gauges (Speed, Battery, Cargo Temp) */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <Gauge className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">Current Speed</span>
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {selectedVehicle.speedKmH} <span className="text-xs font-normal text-slate-400">km/h</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <Battery className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">Fuel / Energy</span>
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {Math.round(selectedVehicle.batteryOrFuelPercent)}%
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <Thermometer className="w-4 h-4 mx-auto text-cyan-600 mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">Cargo Temp</span>
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {selectedVehicle.temperatureCargo ? `${selectedVehicle.temperatureCargo}°C` : 'Amb.'}
                  </span>
                </div>
              </div>

              {/* Route & Cargo details */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Current Position:</span>
                  <span className="font-medium text-slate-800">{selectedVehicle.currentLocationName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Cargo Payload:</span>
                  <span className="font-semibold text-slate-800">{selectedVehicle.cargoType}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Priority Level:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    selectedVehicle.cargoPriority === 'Emergency' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}>
                    {selectedVehicle.cargoPriority}
                  </span>
                </div>
              </div>

              {/* Reroute Action Button if High/Critical Risk */}
              {(selectedVehicle.riskLevel === 'HIGH' || selectedVehicle.riskLevel === 'CRITICAL') && (
                <button
                  onClick={() => {
                    rerouteVehicle(selectedVehicle.id, 'route-b');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Execute Emergency Reroute to Safe Corridor B</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Fleet Selection Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm text-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fleet Roster ({vehicles.length} Units)
              </span>
              <div className="relative w-36">
                <input
                  type="text"
                  placeholder="Filter fleet..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-[11px] rounded-lg px-2 py-1 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredVehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition ${
                    v.id === selectedVehicleId
                      ? 'bg-indigo-50/70 border-indigo-300 text-slate-900 ring-1 ring-indigo-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5 text-slate-900">
                      <span>{v.id}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${getRiskBadge(v.riskLevel)}`}>
                        {v.riskLevel}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {v.driverName} · ➔ {v.destinationName.split(' ')[0]}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-800">{v.speedKmH} km/h</span>
                    <span className="text-[10px] text-slate-400 block">{v.eta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Full GPS Leaflet Map View (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Radio className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>Live Geospatial GPS Feed · Centered on {selectedVehicle?.id}</span>
            </div>
            {isSimulatingVehicles && (
              <span className="text-[10px] text-emerald-600 font-mono font-bold animate-pulse">
                ● Live Updates Active (2.8s telemetry ping)
              </span>
            )}
          </div>

          <LeafletMap 
            height="550px" 
            focusedVehicleId={selectedVehicleId} 
            showControls={true}
          />
        </div>
      </div>
    </div>
  );
};
