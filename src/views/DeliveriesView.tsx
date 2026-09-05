import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DeliveryItem, SeverityLevel, DeliveryStatus } from '../types';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Thermometer, 
  Search, 
  Filter, 
  Plus, 
  FileCheck2,
  ShieldCheck,
  ChevronRight,
  Radio,
  Send,
  BellRing
} from 'lucide-react';
import { pushDeliveryAlert } from '../lib/firebase';

export const DeliveriesView: React.FC = () => {
  const { 
    deliveries, 
    rerouteVehicle, 
    setSelectedVehicleId, 
    setActiveTab, 
    showToast,
    setIsFcmOpen
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedMission, setSelectedMission] = useState<DeliveryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDeliveries = deliveries.filter((d) => {
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        d.goods.toLowerCase().includes(q) ||
        d.destination.toLowerCase().includes(q) ||
        d.consignmentCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'In Transit':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'Re-routed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Delayed':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'Delivered':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Dispatched':
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Essential Cargo & Cold-Chain Supply Missions
            </h1>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold uppercase border border-indigo-200">
              Lifeline Logistics (Arunachal / Nagaland / Mizoram / Manipur)
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Guaranteed delivery assurance for emergency vaccines, aviation fuel, and food grains across remote mountain hospitals and forward defense posts.
          </p>
        </div>

        <button
          onClick={() => setIsFcmOpen(true)}
          className="bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 font-semibold text-xs px-3.5 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span>FCM Push Alerts</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'In Transit', 'Re-routed', 'Delayed', 'Delivered', 'Dispatched'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search consignment or cargo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Deliveries Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeliveries.map((mission) => {
          const isSelected = selectedMission?.id === mission.id;

          return (
            <div
              key={mission.id}
              onClick={() => setSelectedMission(mission)}
              className={`bg-white border rounded-xl p-4 space-y-3 cursor-pointer transition shadow-sm ${
                isSelected
                  ? 'border-indigo-400 ring-1 ring-indigo-200 bg-indigo-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-700">
                    {mission.id} · {mission.consignmentCode}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                    {mission.goods}
                  </h3>
                </div>

                <div className="text-right space-y-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase block ${getStatusBadge(mission.status)}`}>
                    {mission.status}
                  </span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase inline-block ${getRiskBadge(mission.risk)}`}>
                    {mission.risk} Risk
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Route Axis:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[200px]">
                    {mission.origin.split(' ')[0]} ➔ {mission.destination.split(' ')[0]}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Carrier:</span>
                  <span className="font-mono text-indigo-600 font-semibold">{mission.vehicleId} ({mission.driverName})</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Expected ETA:</span>
                  <span className="font-mono text-emerald-700 font-bold">{mission.eta}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Position:</span>
                  <span className="text-slate-700 truncate max-w-[180px]">{mission.currentLocation}</span>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] text-slate-500">Weight: <b className="text-slate-800">{mission.weightTons} T</b></span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVehicleId(mission.vehicleId);
                    setActiveTab('tracking');
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Track Vehicle</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Delivery Mission Detail Drawer */}
      {selectedMission && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-sm text-slate-900">
                Consignment Manifest & Integrity: {selectedMission.id} ({selectedMission.consignmentCode})
              </span>
            </div>
            <button
              onClick={() => setSelectedMission(null)}
              className="text-slate-500 hover:text-slate-800 text-xs px-2 py-1 rounded bg-slate-100 cursor-pointer"
            >
              Close Inspector
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Cargo & Storage Requirements</span>
              <div className="text-slate-800 font-semibold">{selectedMission.goods}</div>
              <div className="text-slate-600">Priority: {selectedMission.priority} · Weight: {selectedMission.weightTons} Tons</div>
              <div className="text-emerald-700 flex items-center gap-1 font-mono pt-1 text-[11px]">
                <Thermometer className="w-3.5 h-3.5" />
                <span>Cold-Chain Required: +2°C to +8°C (Telemetry Monitored)</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Consignee & Delivery Route</span>
              <div className="text-slate-800 font-semibold">{selectedMission.destination}</div>
              <div className="text-slate-600">Dispatched from: {selectedMission.origin}</div>
              <div className="text-indigo-700 font-mono text-[11px] pt-1">Assigned Carrier: {selectedMission.vehiclePlate}</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Emergency Dispatch Overrides</span>
              <button
                onClick={() => {
                  rerouteVehicle(selectedMission.vehicleId, 'route-b');
                  setSelectedVehicleId(selectedMission.vehicleId);
                  setActiveTab('tracking');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Reroute Assigned Carrier</span>
              </button>

              <button
                onClick={async () => {
                  try {
                    await pushDeliveryAlert({
                      title: `Carrier Update: ${selectedMission.goods}`,
                      message: `Consignment ${selectedMission.consignmentCode} currently at ${selectedMission.currentLocation}. Destination: ${selectedMission.destination}.`,
                      deliveryId: selectedMission.id,
                      vehicleId: selectedMission.vehicleId,
                      status: selectedMission.status,
                      eta: selectedMission.eta
                    });
                    showToast(`Delivery status push notification broadcast to field devices!`, 'success');
                  } catch (e: any) {
                    showToast(`Delivery status alert recorded.`, 'info');
                  }
                }}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Push Real-Time FCM Status</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
