import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SeverityLevel, AlertItem } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Filter, 
  Eye, 
  Navigation,
  Compass,
  BellRing
} from 'lucide-react';

interface RealTimeAlertPanelProps {
  onFocusRoute?: (routeId: string) => void;
}

export const RealTimeAlertPanel: React.FC<RealTimeAlertPanelProps> = ({ onFocusRoute }) => {
  const { 
    alerts, 
    acknowledgeAlert, 
    rerouteVehicle, 
    vehicles, 
    setActiveTab, 
    setSelectedVehicleId,
    showToast 
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'ALL'>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  const getSeverityStyle = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50 border border-red-200 text-slate-900',
          badge: 'bg-red-100 text-red-700 border border-red-200',
          borderAccent: 'border-l-4 border-l-red-600',
          iconColor: 'text-red-600',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50 border border-orange-200 text-slate-900',
          badge: 'bg-orange-100 text-orange-700 border border-orange-200',
          borderAccent: 'border-l-4 border-l-orange-500',
          iconColor: 'text-orange-600',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 border border-amber-200 text-slate-900',
          badge: 'bg-amber-100 text-amber-700 border border-amber-200',
          borderAccent: 'border-l-4 border-l-amber-500',
          iconColor: 'text-amber-600',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-slate-50 border border-slate-200 text-slate-900',
          badge: 'bg-slate-100 text-slate-700 border border-slate-200',
          borderAccent: 'border-l-4 border-l-slate-400',
          iconColor: 'text-slate-600',
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full shadow-sm overflow-hidden text-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <BellRing className="w-4 h-4 text-red-600" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          </div>
          <h2 className="font-bold text-sm text-slate-800 uppercase tracking-tight">Real-Time Alert Feed</h2>
        </div>
        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold uppercase">
          {filteredAlerts.length} Active
        </span>
      </div>

      {/* Severity Filter Pills */}
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-1 overflow-x-auto text-[11px]">
        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer shrink-0 ${
              severityFilter === sev
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alert Items Feed */}
      <div className="p-3 space-y-3 overflow-y-auto flex-1">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <ShieldAlert className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-60" />
            No active alerts matching severity filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);

            return (
              <div
                key={alert.id}
                className={`${style.bg} ${style.borderAccent} rounded-lg p-3 transition shadow-xs space-y-2`}
              >
                {/* Top Title & Severity Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${style.iconColor}`} />
                    <span className="font-bold text-xs text-slate-900 leading-snug">
                      {alert.title}
                    </span>
                  </div>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${style.badge}`}>
                    {alert.severity}
                  </span>
                </div>

                {/* Description & Location */}
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {alert.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>📍 {alert.locationName}</span>
                  <span>⏱ {alert.timestamp}</span>
                </div>

                {/* Recommended Action Box */}
                <div className="bg-white border border-slate-200 p-2 rounded text-[11px] text-emerald-800 font-medium flex items-start gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700">Recommendation: </span>
                    {alert.recommendedAction}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/80">
                  {/* Action 1: View Route on Map */}
                  <button
                    onClick={() => {
                      setActiveTab('map');
                      if (alert.affectedRouteIds && alert.affectedRouteIds.length > 0) {
                        onFocusRoute?.(alert.affectedRouteIds[0]);
                      }
                      showToast(`Focused map view on incident area: ${alert.locationName}`, 'info');
                    }}
                    className="flex-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold py-1 px-2 rounded flex items-center justify-center gap-1 transition cursor-pointer border border-slate-200 shadow-xs"
                  >
                    <Eye className="w-3 h-3 text-indigo-600" />
                    <span>View Map</span>
                  </button>

                  {/* Action 2: Reroute Vehicle (if vehicle specified) */}
                  {alert.vehicleIdToReroute && (
                    <button
                      onClick={() => {
                        rerouteVehicle(alert.vehicleIdToReroute!, 'route-b');
                        setSelectedVehicleId(alert.vehicleIdToReroute!);
                        setActiveTab('tracking');
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-1 px-2 rounded flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
                    >
                      <Compass className="w-3 h-3" />
                      <span>Reroute {alert.vehicleIdToReroute}</span>
                    </button>
                  )}

                  {/* Action 3: Acknowledge */}
                  {!alert.isAcknowledged ? (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold py-1 px-2 rounded flex items-center gap-1 transition cursor-pointer border border-slate-200"
                      title="Acknowledge Alert"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Acknowledge</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-700 flex items-center gap-1 px-1.5 py-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Integrated Feeds: BRO + IMD Doppler + GIS</span>
        <button 
          onClick={() => setActiveTab('alerts')}
          className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
        >
          Incident Command →
        </button>
      </div>
    </div>
  );
};
