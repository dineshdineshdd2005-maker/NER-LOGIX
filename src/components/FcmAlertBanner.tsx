import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  subscribeToRoadClosureAlerts, 
  subscribeToDeliveryNotifications, 
  RealtimePushAlert, 
  RealtimeDeliveryPush 
} from '../lib/firebase';
import { 
  BellRing, 
  ShieldAlert, 
  Truck, 
  X, 
  ExternalLink, 
  MapPin, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface ActivePushBanner {
  id: string;
  type: 'ROAD_CLOSURE' | 'DELIVERY';
  title: string;
  message: string;
  severity?: string;
  corridor?: string;
  vehicleId?: string;
  timestamp: string;
}

export const FcmAlertBanner: React.FC = () => {
  const { rerouteVehicle, setActiveTab, setSelectedVehicleId } = useApp();
  const [activeBanner, setActiveBanner] = useState<ActivePushBanner | null>(null);
  const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState<number>(Date.now());

  // Listen to live road closures
  useEffect(() => {
    const unsub = subscribeToRoadClosureAlerts((alerts) => {
      if (alerts.length > 0) {
        const latest = alerts[0];
        // Display banner
        setActiveBanner({
          id: latest.id || `rc-${Date.now()}`,
          type: 'ROAD_CLOSURE',
          title: latest.title,
          message: latest.body,
          severity: latest.severity,
          corridor: latest.corridor,
          vehicleId: latest.vehicleId,
          timestamp: latest.timestamp
        });
      }
    });

    return () => unsub();
  }, []);

  // Listen to live delivery alerts
  useEffect(() => {
    const unsub = subscribeToDeliveryNotifications((deliveries) => {
      if (deliveries.length > 0) {
        const latest = deliveries[0];
        setActiveBanner({
          id: latest.id || `del-${Date.now()}`,
          type: 'DELIVERY',
          title: latest.title,
          message: `${latest.message} · Status: ${latest.status} · ETA: ${latest.eta}`,
          vehicleId: latest.vehicleId,
          timestamp: latest.timestamp
        });
      }
    });

    return () => unsub();
  }, []);

  if (!activeBanner) return null;

  const handleAction = () => {
    if (activeBanner.vehicleId) {
      setSelectedVehicleId(activeBanner.vehicleId);
      setActiveTab('map');
    } else {
      setActiveTab('map');
    }
    setActiveBanner(null);
  };

  const handleQuickReroute = () => {
    if (activeBanner.vehicleId) {
      rerouteVehicle(activeBanner.vehicleId, 'route-b');
    }
    setActiveBanner(null);
  };

  return (
    <div className="fixed top-18 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
      <div className={`p-4 rounded-xl shadow-xl border backdrop-blur-md ${
        activeBanner.type === 'ROAD_CLOSURE'
          ? 'bg-rose-900/95 text-white border-rose-700'
          : 'bg-indigo-900/95 text-white border-indigo-700'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 shrink-0 mt-0.5">
              {activeBanner.type === 'ROAD_CLOSURE' ? (
                <ShieldAlert className="w-5 h-5 text-rose-300 animate-bounce" />
              ) : (
                <Truck className="w-5 h-5 text-indigo-300 animate-pulse" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-white/20">
                  {activeBanner.type === 'ROAD_CLOSURE' ? 'FCM Road Closure Push' : 'FCM Delivery Alert'}
                </span>
                <span className="text-[11px] text-white/60 font-mono">{activeBanner.timestamp}</span>
              </div>
              <h4 className="text-xs font-bold leading-tight">{activeBanner.title}</h4>
              <p className="text-xs text-white/80 leading-relaxed line-clamp-2">
                {activeBanner.message}
              </p>
              {activeBanner.corridor && (
                <div className="flex items-center gap-1 text-[11px] text-rose-200 pt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{activeBanner.corridor}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveBanner(null)}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-white/10 text-xs">
          {activeBanner.vehicleId && activeBanner.type === 'ROAD_CLOSURE' && (
            <button
              onClick={handleQuickReroute}
              className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
            >
              <span>Reroute Fleet</span>
            </button>
          )}

          <button
            onClick={handleAction}
            className="px-3 py-1 rounded bg-white/20 hover:bg-white/30 text-white font-medium text-[11px] transition cursor-pointer flex items-center gap-1"
          >
            <span>View on GIS Map</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
