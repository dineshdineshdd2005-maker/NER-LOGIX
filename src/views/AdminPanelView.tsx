import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/mockData';
import { 
  ShieldCheck, 
  Users, 
  Sliders, 
  Database, 
  Activity, 
  RotateCcw, 
  CheckCircle2, 
  Radio, 
  Save, 
  AlertCircle,
  HardDrive,
  Cpu,
  Lock,
  Wifi,
  WifiOff,
  RefreshCw,
  BellRing,
  Send,
  Smartphone
} from 'lucide-react';
import { pushEmergencyRoadClosure, pushDeliveryAlert } from '../lib/firebase';

export const AdminPanelView: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    resetDemo, 
    clearOfflineQueue, 
    offlineQueue, 
    showToast,
    lastCachedTime,
    serviceWorkerActive,
    clearLocalCache,
    refreshLocalCache,
    cacheRecordCount,
    isOffline,
    setIsOffline,
    setIsFcmOpen
  } = useApp();

  // Model parameters state
  const [rainThreshold, setRainThreshold] = useState(30);
  const [slopeMultiplier, setSlopeMultiplier] = useState(1.4);
  const [autoRerouteCutoff, setAutoRerouteCutoff] = useState(75);
  const [postGisStatus, setPostGisStatus] = useState('Online · 3,420 Spatial Nodes');

  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('AI Risk Model hyperparameters updated across all regional nodes!', 'success');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Platform Administration & System Governance
            </h1>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold uppercase border border-indigo-200">
              NER Command Master Node
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Configure AI risk scoring thresholds, manage multi-agency role privileges, monitor PostGIS spatial database sync, and control demo states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetDemo();
              showToast('System demo state restored to baseline.', 'info');
            }}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Grid: AI Hyperparameters & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Model Sensitivity Tuning (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              AI Risk Model Calibration & Thresholds
            </span>
            <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              XGBoost Engine v2.4
            </span>
          </div>

          <form onSubmit={handleSaveParameters} className="space-y-4">
            {/* Slider 1: Rainfall Risk Threshold */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700">
                  Critical Rainfall Trigger Threshold
                </label>
                <span className="font-mono text-indigo-600 font-bold">{rainThreshold} mm/hr</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                value={rainThreshold}
                onChange={(e) => setRainThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[10px] text-slate-500">
                Precipitation rates exceeding this limit automatically boost route risk score by +30 points.
              </p>
            </div>

            {/* Slider 2: Slope Hazard Multiplier */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700">
                  Steep Slope Hazard Multiplier (Angles &gt; 35°)
                </label>
                <span className="font-mono text-amber-600 font-bold">{slopeMultiplier}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={slopeMultiplier}
                onChange={(e) => setSlopeMultiplier(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <p className="text-[10px] text-slate-500">
                Weights Himalayan cliff gradient steepness in the composite landslide index.
              </p>
            </div>

            {/* Slider 3: Auto-Reroute Confidence Cutoff */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700">
                  Automated Proactive Reroute Risk Cutoff
                </label>
                <span className="font-mono text-red-600 font-bold">{autoRerouteCutoff}/100</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={autoRerouteCutoff}
                onChange={(e) => setAutoRerouteCutoff(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <p className="text-[10px] text-slate-500">
                When a route exceeds this score, the dispatcher issues an automated diversion prompt to the driver.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply & Synchronize Model Weights</span>
            </button>
          </form>
        </div>

        {/* Right: Infrastructure & Data Node Health (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* PostGIS & Infrastructure Status Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                Backend & Geospatial Telemetry Health
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-medium">
                All Systems Normal
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">PostGIS Geospatial DB Engine:</span>
                <span className="font-mono text-emerald-700 font-bold">{postGisStatus}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">IMD Doppler Radar Uplink (Tezpur/Shillong):</span>
                <span className="font-mono text-indigo-600 font-bold">Latency 42ms · Connected</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">ISRO NavIC / GPS Telemetry Stream:</span>
                <span className="font-mono text-purple-600 font-bold">100% Sat Constellation Lock</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Local Offline Reports Queue:</span>
                <span className="font-mono text-amber-600 font-bold">
                  {offlineQueue.length} Pending Records
                </span>
              </div>
            </div>

            {offlineQueue.length > 0 && (
              <button
                onClick={clearOfflineQueue}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-1.5 px-3 rounded-lg border border-slate-200 cursor-pointer font-medium"
              >
                Flush Local Offline Cache
              </button>
            )}
          </div>

          {/* Local-Storage & Service Worker Offline Caching Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-600" />
                Intermittent Connectivity & Local-Storage Cache
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border ${
                isOffline 
                  ? 'bg-amber-50 text-amber-800 border-amber-300' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {isOffline ? 'Offline Mode Active' : 'Online Sync Active'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Continuous persistence engine protects mission data during connectivity blackouts across Arunachal Pradesh, Nagaland, and Meghalaya valleys.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Vehicles Cached</div>
                <div className="font-mono text-sm font-bold text-slate-800">{cacheRecordCount.vehicles} Units</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Alerts & Threats</div>
                <div className="font-mono text-sm font-bold text-slate-800">{cacheRecordCount.alerts} Items</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Consignments</div>
                <div className="font-mono text-sm font-bold text-slate-800">{cacheRecordCount.deliveries} Active</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Field Reports</div>
                <div className="font-mono text-sm font-bold text-slate-800">{cacheRecordCount.fieldReports} Ground</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Himalayan Corridors</div>
                <div className="font-mono text-sm font-bold text-slate-800">{cacheRecordCount.routes} Routes</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Radar Stations</div>
                <div className="font-mono text-sm font-bold text-slate-800">{cacheRecordCount.weatherStations} Doppler</div>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Service Worker Caching:</span>
                <span className="font-mono text-indigo-700 font-semibold flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${serviceWorkerActive ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
                  {serviceWorkerActive ? 'Active (GIS Tiles & Shell Cached)' : 'Standby / Registered'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Last Local-Storage Snapshot:</span>
                <span className="font-mono text-slate-700 font-semibold">{lastCachedTime}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={refreshLocalCache}
                className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium py-2 px-3 rounded-lg text-xs transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Force Snapshot</span>
              </button>
              <button
                type="button"
                onClick={clearLocalCache}
                className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-medium py-2 px-3 rounded-lg text-xs transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Local Cache</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOffline(!isOffline)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                isOffline
                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isOffline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-amber-700" />
                  <span>Restore Simulated Online Connectivity</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Simulate Intermittent Mountain Blackout</span>
                </>
              )}
            </button>
          </div>

          {/* Role & Authorized Personnel Directory */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm text-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Role-Based Access Sandbox Directory
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {DEMO_USERS.map((usr) => (
                <div
                  key={usr.id}
                  className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">{usr.name}</span>
                    <span className="text-[10px] text-slate-500 block">{usr.department}</span>
                  </div>

                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium border border-indigo-200">
                    {usr.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Firebase Cloud Messaging (FCM) Real-time Pipeline Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-indigo-600" />
                Firebase Cloud Messaging (FCM) Pipeline
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold font-mono">
                Cloud Ingress Ready
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Dispatches real-time web push notifications to officer handhelds and logistics terminals for emergency road cutoffs and mission delivery reroutes.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">FCM Project</div>
                <div className="font-mono text-xs font-bold text-slate-800 truncate" title="gen-lang-client-0389261254">
                  gen-lang-client
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Messaging Sender ID</div>
                <div className="font-mono text-xs font-bold text-slate-800">
                  406499846019
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsFcmOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition cursor-pointer shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open FCM Push & Topics Console</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
