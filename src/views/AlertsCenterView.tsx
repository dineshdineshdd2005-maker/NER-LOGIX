import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SeverityLevel, AlertItem } from '../types';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Compass, 
  Eye, 
  Plus, 
  Filter, 
  Search, 
  Clock, 
  MapPin, 
  Radio, 
  Send,
  Boxes
} from 'lucide-react';
import { pushEmergencyRoadClosure } from '../lib/firebase';

export const AlertsCenterView: React.FC = () => {
  const { 
    alerts, 
    acknowledgeAlert, 
    rerouteVehicle, 
    vehicles, 
    setActiveTab, 
    setSelectedVehicleId, 
    showToast,
    setIsFcmOpen,
    redistributionSuggestions,
    supplySummary
  } = useApp();

  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNACKNOWLEDGED' | 'ACKNOWLEDGED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // New broadcast form states
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDesc, setBroadcastDesc] = useState('');
  const [broadcastLocation, setBroadcastLocation] = useState('NH-27 Nagaon - Jamiri stretch');
  const [broadcastSeverity, setBroadcastSeverity] = useState<SeverityLevel>('HIGH');
  const [broadcastAction, setBroadcastAction] = useState('Divert all heavy multi-axle freight to southern bypass.');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus === 'UNACKNOWLEDGED' && a.isAcknowledged) return false;
    if (filterStatus === 'ACKNOWLEDGED' && !a.isAcknowledged) return false;
    if (searchTerm) {
      const match = 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle) return;

    try {
      await pushEmergencyRoadClosure({
        title: broadcastTitle,
        body: `${broadcastDesc} · Directive: ${broadcastAction}`,
        corridor: broadcastLocation || 'Northeast Strategic Corridor',
        severity: broadcastSeverity === 'CRITICAL' ? 'CRITICAL' : broadcastSeverity === 'HIGH' ? 'HIGH' : 'MEDIUM'
      });
      showToast(`Emergency alert pushed via FCM to all mobile & field terminals!`, 'success');
    } catch (err: any) {
      showToast(`Command Alert "${broadcastTitle}" broadcast locally.`, 'warning');
    }

    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastDesc('');
  };

  const getSeverityStyle = (sev: SeverityLevel) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          card: 'bg-white border border-red-200 text-slate-800 shadow-sm',
          badge: 'bg-red-50 text-red-700 border border-red-200 font-bold',
          border: 'border-l-4 border-l-red-500',
        };
      case 'HIGH':
        return {
          card: 'bg-white border border-orange-200 text-slate-800 shadow-sm',
          badge: 'bg-orange-50 text-orange-700 border border-orange-200 font-bold',
          border: 'border-l-4 border-l-orange-500',
        };
      case 'MEDIUM':
        return {
          card: 'bg-white border border-amber-200 text-slate-800 shadow-sm',
          badge: 'bg-amber-50 text-amber-700 border border-amber-200 font-bold',
          border: 'border-l-4 border-l-amber-500',
        };
      case 'LOW':
      default:
        return {
          card: 'bg-white border border-slate-200 text-slate-800 shadow-sm',
          badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold',
          border: 'border-l-4 border-l-indigo-500',
        };
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Incident & Threat Alert Center
            </h1>
            <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-mono font-bold uppercase border border-red-200">
              Multi-Agency Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time threat notifications with automated action triggers: Landslide closures, flood surge warnings, cloudbursts, and rapid vehicle diversions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFcmOpen(true)}
            className="bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 font-semibold text-xs px-3.5 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Open Firebase Cloud Messaging (FCM) Push Console"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>FCM Push Console</span>
          </button>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Broadcast Incident Alert</span>
          </button>
        </div>
      </div>

      {/* Automated Supply Chain Inventory Cross-Reference Banner */}
      {redistributionSuggestions.length > 0 && (
        <div className="bg-linear-to-r from-red-50 via-amber-50 to-indigo-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-red-100 text-red-700 rounded-lg shrink-0">
              <Boxes className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Supply Chain Vulnerability Alert:</span>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full">
                  {supplySummary.criticalDepotsCount} Remote Outposts Threatened
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Incoming weather & road disruptions cross-referenced with stockpiles. <strong className="text-slate-800">{redistributionSuggestions.length} emergency reallocations</strong> suggested to prevent stock exhaustion.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('supply-inventory')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
          >
            <span>Review Redistribution Orders</span>
            <span>&rarr;</span>
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded font-bold transition cursor-pointer text-xs ${
                  filterSeverity === sev
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded transition cursor-pointer text-xs ${
                filterStatus === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200' : 'text-slate-600'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilterStatus('UNACKNOWLEDGED')}
              className={`px-2.5 py-1 rounded transition cursor-pointer text-xs ${
                filterStatus === 'UNACKNOWLEDGED' ? 'bg-red-50 text-red-700 font-bold border border-red-200' : 'text-slate-600'
              }`}
            >
              Unacknowledged
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts by location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Alert Feed Cards */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl text-slate-500 text-xs shadow-sm">
            <ShieldAlert className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
            No alerts match your current filter parameters.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);

            return (
              <div
                key={alert.id}
                className={`${style.card} ${style.border} border rounded-xl p-4 space-y-3 shadow-sm transition`}
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${style.badge}`}>
                      {alert.severity}
                    </span>
                    <h2 className="font-bold text-sm text-slate-900">
                      {alert.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span>Source: <b className="text-slate-800">{alert.source}</b></span>
                    <span>⏱ {alert.timestamp}</span>
                  </div>
                </div>

                {/* Description & Location */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 space-y-2">
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {alert.description}
                    </p>
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{alert.locationName} ({alert.coords.lat}°N, {alert.coords.lng}°E)</span>
                    </div>

                    <div className="bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100 text-xs text-slate-700 font-medium flex items-start gap-2">
                      <Compass className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">Recommended Action: </span>
                        {alert.recommendedAction}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons (Right Column) */}
                  <div className="md:col-span-4 flex flex-col gap-2 justify-center sm:border-l sm:border-slate-100 sm:pl-4">
                    {/* Action 1: View Route */}
                    <button
                      onClick={() => {
                        setActiveTab('map');
                        showToast(`Focused map view on alert location: ${alert.locationName}`, 'info');
                      }}
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View Route on GIS Map</span>
                    </button>

                    {/* Action 2: Reroute Vehicle */}
                    {alert.vehicleIdToReroute ? (
                      <button
                        onClick={() => {
                          rerouteVehicle(alert.vehicleIdToReroute!, 'route-b');
                          setSelectedVehicleId(alert.vehicleIdToReroute!);
                          setActiveTab('tracking');
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Reroute Vehicle ({alert.vehicleIdToReroute})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          rerouteVehicle('NER-TRUCK-104', 'route-b');
                          setActiveTab('optimizer');
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Reroute Approaching Fleet</span>
                      </button>
                    )}

                    {/* Action 3: Acknowledge Alert */}
                    {!alert.isAcknowledged ? (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Acknowledge Alert</span>
                      </button>
                    ) : (
                      <div className="text-center py-1.5 px-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Acknowledged by Regional Command</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Broadcast Alert Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl p-5 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Broadcast Disaster & Threat Alert
              </span>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alert Headline
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  required
                  placeholder="e.g. Flash Flood Warning on Barak Lowlands"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Severity Rating
                </label>
                <select
                  value={broadcastSeverity}
                  onChange={(e) => setBroadcastSeverity(e.target.value as SeverityLevel)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="CRITICAL">CRITICAL (Total Highway Closure)</option>
                  <option value="HIGH">HIGH (Severe Weather & Caution)</option>
                  <option value="MEDIUM">MEDIUM (Moderate Transit Slowdown)</option>
                  <option value="LOW">LOW (Advisory)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corridor Location
                </label>
                <input
                  type="text"
                  value={broadcastLocation}
                  onChange={(e) => setBroadcastLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recommended Transit Action
                </label>
                <input
                  type="text"
                  value={broadcastAction}
                  onChange={(e) => setBroadcastAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs border border-slate-200 shadow-xs cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  Dispatch Regional Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
