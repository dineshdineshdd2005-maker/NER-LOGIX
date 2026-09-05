import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/mockData';
import { 
  Search, 
  Bell, 
  CloudRain, 
  Wifi, 
  WifiOff, 
  Play, 
  UserCheck, 
  ChevronDown, 
  Sparkles, 
  Radio,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    alerts, 
    isOffline, 
    setIsOffline, 
    offlineQueue,
    syncStatus,
    searchQuery, 
    setSearchQuery,
    startLiveDemo,
    isDemoRunning,
    demoStep,
    nextDemoStep,
    prevDemoStep,
    resetDemo,
    setActiveTab,
    acknowledgeAlert,
    lastCachedTime,
    serviceWorkerActive,
    setIsFcmOpen
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const unacknowledgedAlerts = alerts.filter(a => !a.isAcknowledged);

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-slate-200 text-slate-800 px-4 sm:px-6 flex flex-col justify-center shadow-xs">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Branding & Welcome Greeting */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded flex items-center justify-center font-bold text-white text-sm shadow-sm transition-transform group-hover:scale-105">
              NL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-900 font-bold leading-none text-base tracking-tight font-mono">NER-LOGIX</span>
                <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded uppercase">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest hidden sm:block">AI Intelligence</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          {/* Welcome Greeting from Sleek Theme */}
          <div className="hidden lg:flex items-center gap-3 text-sm">
            <span className="text-slate-500 font-medium">
              Welcome, <span className="text-slate-900 font-bold underline decoration-indigo-500">{currentUser?.role || 'Disaster Management Officer'}</span>
            </span>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className="text-slate-600 font-medium uppercase tracking-wider text-[11px]" title={`Last cached at: ${lastCachedTime} | SW: ${serviceWorkerActive ? 'Ready' : 'Initializing'}`}>
                {isOffline ? 'System: Offline Cache' : 'System: Online'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search & Weather Telemetry */}
        <div className="hidden md:flex items-center gap-2.5 flex-1 max-w-sm mx-2">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search corridor or vehicle (Tawang, TRUCK-104)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Real-time Weather Telemetry Pill */}
          <div 
            onClick={() => setActiveTab('weather')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer whitespace-nowrap transition text-slate-700"
            title="View Weather & Disaster Intelligence"
          >
            <CloudRain className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-500 text-[11px] hidden xl:inline">Kameng:</span>
            <span className="font-bold text-slate-800 text-[11px]">38.5 mm/h</span>
          </div>
        </div>

        {/* Right Action Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Geographic Coordinates from Sleek Theme */}
          <div className="px-2.5 py-1 bg-slate-100 rounded text-xs font-mono border border-slate-200 text-slate-700 hidden sm:block">
            26.14°N | 91.73°E
          </div>

          {/* OFFLINE MODE TOGGLE */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              isOffline
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
            title="Toggle offline simulated mode"
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">OFFLINE ({offlineQueue.length})</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">ONLINE</span>
              </>
            )}
          </button>

          {/* FCM Push Notifications Center Trigger */}
          <button
            onClick={() => setIsFcmOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
            title="Firebase Cloud Messaging (FCM) — Push Alerts & Device Stream"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">FCM PUSH</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unacknowledgedAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unacknowledgedAlerts.length}
                </span>
              )}
            </button>

            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 text-slate-800">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Active Live Alerts</span>
                  <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.2 rounded font-bold uppercase">
                    {unacknowledgedAlerts.length} Critical
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 my-1">
                  {alerts.slice(0, 5).map((a) => (
                    <div key={a.id} className="p-2 hover:bg-slate-50 rounded text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          a.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' :
                          a.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {a.severity}
                        </span>
                        <span className="text-[10px] text-slate-400">{a.timestamp}</span>
                      </div>
                      <p className="font-semibold text-slate-800 leading-snug">{a.title}</p>
                      <p className="text-[11px] text-slate-500">{a.locationName}</p>
                      {!a.isAcknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(a.id)}
                          className="mt-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                        >
                          ✓ Acknowledge Alert
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowAlertsDropdown(false);
                    setActiveTab('alerts');
                  }}
                  className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 py-1.5 border-t border-slate-100 font-semibold cursor-pointer"
                >
                  View All Alerts in Incident Center →
                </button>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg px-2.5 py-1 text-xs cursor-pointer transition"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 text-slate-800 font-bold flex items-center justify-center text-xs">
                {currentUser?.name.charAt(0) || 'D'}
              </div>
              <div className="text-left hidden lg:block">
                <div className="font-bold text-slate-800 text-xs leading-none">{currentUser?.name.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight">{currentUser?.role}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 text-slate-800">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                  <div className="text-xs font-bold text-slate-900">{currentUser?.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser?.department}</div>
                  <div className="text-[10px] text-indigo-600 font-mono mt-0.5">Badge: {currentUser?.badgeId}</div>
                </div>

                <div className="text-[10px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Select User Persona:
                </div>

                <div className="space-y-1">
                  {DEMO_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition cursor-pointer ${
                        currentUser?.id === u.id
                          ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-[10px] text-slate-500">{u.role}</div>
                      </div>
                      {currentUser?.id === u.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      setShowRoleDropdown(false);
                      setActiveTab('login');
                    }}
                    className="w-full text-center text-xs text-red-600 hover:text-red-700 py-1 font-semibold cursor-pointer"
                  >
                    Switch to Login Screen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync Status Banner when syncing */}
      {syncStatus && (
        <div className="bg-emerald-50 border-t border-emerald-200 text-emerald-800 text-xs px-3 py-1 flex items-center justify-center gap-2 mt-1 -mx-4 -mb-2">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
          <span>{syncStatus}</span>
        </div>
      )}
    </header>
  );
};
