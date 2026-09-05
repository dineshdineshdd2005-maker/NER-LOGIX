import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  requestFcmToken, 
  pushEmergencyRoadClosure, 
  pushDeliveryAlert, 
  subscribeToRoadClosureAlerts, 
  subscribeToDeliveryNotifications, 
  RealtimePushAlert, 
  RealtimeDeliveryPush 
} from '../lib/firebase';
import { 
  Bell, 
  BellRing, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Copy, 
  Check, 
  ShieldAlert, 
  Truck, 
  MapPin, 
  Sliders, 
  Volume2, 
  X,
  Smartphone,
  Flame,
  CloudLightning,
  Clock,
  RefreshCw,
  Info
} from 'lucide-react';

interface FcmNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVehicle?: (id: string) => void;
  onSelectRoute?: (routeId: string) => void;
}

export const FcmNotificationCenter: React.FC<FcmNotificationCenterProps> = ({
  isOpen,
  onClose,
  onSelectVehicle,
}) => {
  const { vehicles, deliveries, showToast, setActiveTab } = useApp();

  // FCM Device Registration state
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isRegisteringToken, setIsRegisteringToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Subscribed Topics
  const [subscribedTopics, setSubscribedTopics] = useState({
    roadClosures: true,
    deliveryUpdates: true,
    weatherHazards: true,
  });

  // Recent Live Push History
  const [recentRoadAlerts, setRecentRoadAlerts] = useState<RealtimePushAlert[]>([]);
  const [recentDeliveries, setRecentDeliveries] = useState<RealtimeDeliveryPush[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'alerts' | 'deliveries' | 'dispatch' | 'settings'>('alerts');

  // Push Dispatcher Form States
  const [dispatchType, setDispatchType] = useState<'ROAD_CLOSURE' | 'DELIVERY'>('ROAD_CLOSURE');
  const [alertTitle, setAlertTitle] = useState('CRITICAL: Massive Landslide at Sela Pass km 84');
  const [alertBody, setAlertBody] = useState('NH-13 completely severed by 120-ton boulder collapse. BRO clearing team mobilizing from Tenga. Immediate reroute recommended.');
  const [alertCorridor, setAlertCorridor] = useState('NH-13 (Bomdila - Tawang Corridor)');
  const [alertSeverity, setAlertSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('CRITICAL');
  const [selectedVehicleForPush, setSelectedVehicleForPush] = useState('TRUCK-104');
  const [selectedDeliveryForPush, setSelectedDeliveryForPush] = useState('DEL-701');
  const [deliveryStatusPush, setDeliveryStatusPush] = useState('Delayed - Flash Flood Bypass');
  const [deliveryEtaPush, setDeliveryEtaPush] = useState('14h 30m (+3h delay)');
  const [isPushing, setIsPushing] = useState(false);

  // Request token on mount or retrieve cached
  useEffect(() => {
    const savedToken = localStorage.getItem('ner_logix_fcm_token');
    if (savedToken) {
      setFcmToken(savedToken);
    }
  }, []);

  // Listen to Firestore real-time push collections
  useEffect(() => {
    const unsubAlerts = subscribeToRoadClosureAlerts((alerts) => {
      setRecentRoadAlerts(alerts);
    });

    const unsubDeliveries = subscribeToDeliveryNotifications((notifs) => {
      setRecentDeliveries(notifs);
    });

    return () => {
      unsubAlerts();
      unsubDeliveries();
    };
  }, []);

  const handleRegisterDevice = async () => {
    setIsRegisteringToken(true);
    try {
      const result = await requestFcmToken('REGIONAL-OFFICER-01');
      if (result.token) {
        setFcmToken(result.token);
        localStorage.setItem('ner_logix_fcm_token', result.token);
        setNotificationPermission(result.permission);
        showToast(
          result.isSimulated
            ? 'Device registered with Firebase Cloud Messaging (Sandbox Mode)!'
            : 'Device registered with Firebase Cloud Messaging! Push notifications active.',
          'success'
        );
      } else {
        setNotificationPermission(result.permission);
        showToast(`Could not activate FCM: ${result.error || 'Permission denied'}`, 'warning');
      }
    } catch (e: any) {
      showToast('FCM device registration error: ' + (e?.message || 'Unknown'), 'error');
    } finally {
      setIsRegisteringToken(false);
    }
  };

  const handleCopyToken = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
      showToast('FCM Device Push Token copied to clipboard.', 'info');
    }
  };

  const handleDispatchPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPushing(true);

    try {
      if (dispatchType === 'ROAD_CLOSURE') {
        await pushEmergencyRoadClosure({
          title: alertTitle,
          body: alertBody,
          corridor: alertCorridor,
          severity: alertSeverity,
          vehicleId: selectedVehicleForPush,
          alertType: 'EMERGENCY_ROAD_CLOSURE'
        });
        showToast('FCM Emergency Road Closure broadcasted to all field units!', 'success');
      } else {
        await pushDeliveryAlert({
          deliveryId: selectedDeliveryForPush,
          vehicleId: selectedVehicleForPush,
          title: alertTitle || `Supply Consignment ${selectedDeliveryForPush} Alert`,
          message: alertBody || 'Convoy encountered mountain flash flood; navigating via Kalaktang safe corridor.',
          status: deliveryStatusPush,
          eta: deliveryEtaPush
        });
        showToast(`FCM Delivery Alert for ${selectedDeliveryForPush} pushed to field devices!`, 'success');
      }
      setActiveSubTab(dispatchType === 'ROAD_CLOSURE' ? 'alerts' : 'deliveries');
    } catch (err: any) {
      showToast('Error pushing FCM alert: ' + (err?.message || 'Unknown'), 'error');
    } finally {
      setIsPushing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Firebase Cloud Messaging (FCM) Integration
                </h2>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  Real-time Push
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Instant delivery progress alerts & emergency mountain road closure telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-2.5 bg-indigo-900 text-white flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${fcmToken ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className="font-medium">
              FCM Push Channel: {fcmToken ? 'Device Subscribed & Active' : 'Waiting for Device Token'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {fcmToken ? (
              <div className="flex items-center gap-1.5 bg-indigo-800/80 px-2.5 py-1 rounded font-mono text-[11px] border border-indigo-700">
                <span>Token: {fcmToken.slice(0, 14)}...</span>
                <button
                  onClick={handleCopyToken}
                  className="hover:text-emerald-300 ml-1 cursor-pointer flex items-center gap-1"
                  title="Copy full token"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ) : (
              <button
                onClick={handleRegisterDevice}
                disabled={isRegisteringToken}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1"
              >
                {isRegisteringToken ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                <span>Activate Device Push</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-5 bg-white">
          <button
            onClick={() => setActiveSubTab('alerts')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'alerts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Road Closure Alerts ({recentRoadAlerts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('deliveries')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'deliveries'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery Notifications ({recentDeliveries.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dispatch')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'dispatch'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Push Alert</span>
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'settings'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>FCM Topics</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: Real-time Emergency Road Closure Alerts */}
          {activeSubTab === 'alerts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Emergency Push Feed (Cloud Firestore + FCM Broadcasts)
                </span>
                <span className="text-[11px] text-slate-400">Auto-synced across field devices</span>
              </div>

              {recentRoadAlerts.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium text-slate-600">No emergency road closures pushed yet.</p>
                  <button
                    onClick={() => setActiveSubTab('dispatch')}
                    className="text-xs text-indigo-600 hover:underline font-medium"
                  >
                    Broadcast a test emergency closure push alert →
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentRoadAlerts.map((alert, idx) => (
                    <div
                      key={alert.id || idx}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {alert.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {alert.body}
                      </p>

                      <div className="flex flex-wrap items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500 gap-2">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{alert.corridor}</span>
                          {alert.vehicleId && (
                            <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                              Unit: {alert.vehicleId}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Pushed to FCM Subscribers</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Real-time Delivery Notifications */}
          {activeSubTab === 'deliveries' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Mission Supply & Convoy Delivery Push Stream
                </span>
                <span className="text-[11px] text-slate-400">Live ETA & Reroute Broadcasts</span>
              </div>

              {recentDeliveries.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <Truck className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium text-slate-600">No delivery alerts pushed yet.</p>
                  <button
                    onClick={() => {
                      setDispatchType('DELIVERY');
                      setActiveSubTab('dispatch');
                    }}
                    className="text-xs text-indigo-600 hover:underline font-medium"
                  >
                    Broadcast a test delivery update push alert →
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentDeliveries.map((del, idx) => (
                    <div
                      key={del.id || idx}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded">
                            {del.deliveryId}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{del.title}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {del.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {del.message}
                      </p>

                      <div className="flex flex-wrap items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500 gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-700 font-semibold">
                            Convoy: {del.vehicleId}
                          </span>
                          <span className="text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                            {del.status}
                          </span>
                          <span className="text-slate-600">
                            ETA: <strong className="text-slate-800 font-mono">{del.eta}</strong>
                          </span>
                        </div>

                        <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>FCM Delivered</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Broadcast Push Alert Dispatcher */}
          {activeSubTab === 'dispatch' && (
            <form onSubmit={handleDispatchPush} className="space-y-4">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  Broadcasts trigger both <strong>Google Firebase Cloud Messaging</strong> device pushes and real-time Firestore synchronization across all field terminals.
                </p>
              </div>

              {/* Alert Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Push Notification Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDispatchType('ROAD_CLOSURE');
                      setAlertTitle('CRITICAL: Massive Landslide at Sela Pass km 84');
                      setAlertBody('NH-13 completely severed by 120-ton boulder collapse. BRO clearing team mobilizing from Tenga. Immediate reroute recommended.');
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      dispatchType === 'ROAD_CLOSURE'
                        ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Emergency Road Closure</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Landslides, cloudbursts, bridge washouts
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDispatchType('DELIVERY');
                      setAlertTitle('Delivery DEL-701 Rerouted: Kalaktang Bypass');
                      setAlertBody('Emergency medical plasma shipment rerouted due to flood warning in Dirang valley.');
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      dispatchType === 'DELIVERY'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Truck className="w-4 h-4 text-indigo-600" />
                      <span>Delivery Status & ETA Alert</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Consignment reroutes, convoy delays, priority updates
                    </div>
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Push Notification Headline
                  </label>
                  <input
                    type="text"
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alert Body & Tactical Guidance
                  </label>
                  <textarea
                    value={alertBody}
                    onChange={(e) => setAlertBody(e.target.value)}
                    rows={3}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                {dispatchType === 'ROAD_CLOSURE' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Affected Himalayan Corridor
                      </label>
                      <input
                        type="text"
                        value={alertCorridor}
                        onChange={(e) => setAlertCorridor(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Severity Level
                      </label>
                      <select
                        value={alertSeverity}
                        onChange={(e) => setAlertSeverity(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      >
                        <option value="CRITICAL">CRITICAL (Total Road Cutoff)</option>
                        <option value="HIGH">HIGH (Single Lane / Slow Convoy)</option>
                        <option value="MEDIUM">MEDIUM (Caution / Slippery Mud)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Consignment ID
                      </label>
                      <select
                        value={selectedDeliveryForPush}
                        onChange={(e) => setSelectedDeliveryForPush(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      >
                        {deliveries.map(d => (
                          <option key={d.id} value={d.id}>{d.id} · {d.cargoName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Delivery Status
                      </label>
                      <input
                        type="text"
                        value={deliveryStatusPush}
                        onChange={(e) => setDeliveryStatusPush(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Updated ETA
                      </label>
                      <input
                        type="text"
                        value={deliveryEtaPush}
                        onChange={(e) => setDeliveryEtaPush(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Dispatch Action */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPushing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isPushing ? (
                    <>
                      <Radio className="w-3.5 h-3.5 animate-spin" />
                      <span>Broadcasting to FCM Cloud...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch FCM Push Notification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: FCM Topic Settings */}
          {activeSubTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Subscribed Push Alert Channels (Topics)
                </span>
                <p className="text-xs text-slate-500">
                  Field terminals automatically filter and receive notifications for subscribed tactical disaster categories.
                </p>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Emergency Road Closures</div>
                        <div className="text-[11px] text-slate-500">Immediate alerts when passes or highways close</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={subscribedTopics.roadClosures}
                      onChange={(e) => setSubscribedTopics(prev => ({ ...prev, roadClosures: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Real-Time Delivery & Convoy Alerts</div>
                        <div className="text-[11px] text-slate-500">Milestone updates, ETA variations, and rerouting notifications</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={subscribedTopics.deliveryUpdates}
                      onChange={(e) => setSubscribedTopics(prev => ({ ...prev, deliveryUpdates: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <CloudLightning className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-800">IMD Flash Flood & Cloudburst Warnings</div>
                        <div className="text-[11px] text-slate-500">Doppler radar precipitation thresholds (&gt;35mm/h)</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={subscribedTopics.weatherHazards}
                      onChange={(e) => setSubscribedTopics(prev => ({ ...prev, weatherHazards: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                    />
                  </label>
                </div>
              </div>

              {/* FCM Architecture Information */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>Firebase Cloud Messaging (FCM) Architecture Specs</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
                  <li><strong>Project ID:</strong> gen-lang-client-0389261254</li>
                  <li><strong>Sender ID:</strong> 406499846019</li>
                  <li><strong>Background Worker:</strong> /public/firebase-messaging-sw.js</li>
                  <li><strong>Live Firestore Fallback:</strong> Automated onSnapshot channel ensuring 100% zero-drop alert delivery even in sandboxed environments</li>
                </ul>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
