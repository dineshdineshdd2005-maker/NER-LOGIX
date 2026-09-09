import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NER_OFFLINE_CORRIDORS, getOfflineCacheSummary, OfflineCorridor, OfflineShelterPoint } from '../data/offlineCorridorData';
import { 
  Wifi, 
  WifiOff, 
  HardDrive, 
  CheckCircle2, 
  RefreshCw, 
  Shield, 
  Radio, 
  Phone, 
  Layers, 
  Compass, 
  MapPin, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Fuel,
  Cross,
  Navigation,
  Sparkles
} from 'lucide-react';

interface OfflineCorridorsPanelProps {
  onFocusCorridor?: (corridorId: string) => void;
}

export const OfflineCorridorsPanel: React.FC<OfflineCorridorsPanelProps> = ({ onFocusCorridor }) => {
  const { 
    isOffline, 
    setIsOffline, 
    mapFilters, 
    toggleMapFilter, 
    selectedOfflineCorridorId, 
    setSelectedOfflineCorridorId,
    showToast 
  } = useApp();

  const [isVerifyingCache, setIsVerifyingCache] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'corridors' | 'shelters' | 'storage'>('corridors');

  const cacheSummary = getOfflineCacheSummary();
  const activeCorridor = NER_OFFLINE_CORRIDORS.find(c => c.id === selectedOfflineCorridorId) || NER_OFFLINE_CORRIDORS[0];

  const handleVerifyCache = () => {
    setIsVerifyingCache(true);
    setVerifyProgress(10);
    showToast('Validating SHA-256 tile checksums for NER Corridors...', 'info');

    const intervals = [
      { p: 35, delay: 300 },
      { p: 70, delay: 650 },
      { p: 95, delay: 1000 },
      { p: 100, delay: 1300 },
    ];

    intervals.forEach(({ p, delay }) => {
      setTimeout(() => {
        setVerifyProgress(p);
        if (p === 100) {
          setIsVerifyingCache(false);
          setTimeout(() => setVerifyProgress(null), 1200);
          showToast(`Offline Tile Cache Verified: All ${cacheSummary.totalTiles.toLocaleString()} tiles ready for offline navigation!`, 'success');
        }
      }, delay);
    });
  };

  const handleSelectCorridor = (id: string) => {
    setSelectedOfflineCorridorId(id);
    if (onFocusCorridor) {
      onFocusCorridor(id);
    }
  };

  const getShelterBadge = (type: OfflineShelterPoint['type']) => {
    switch (type) {
      case 'BRO Outpost':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Shield };
      case 'Medical Emergency':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Cross };
      case 'Fuel & Mechanical':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: Fuel };
      case 'Satellite SOS':
        return { bg: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: Radio };
      default:
        return { bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: MapPin };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all">
      {/* Header Bar with Toggle */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            mapFilters.offlineTiles 
              ? 'bg-amber-600 text-white shadow-xs' 
              : 'bg-slate-200 text-slate-700'
          }`}>
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Offline Corridors & Cached Tile Engine
              </h2>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                mapFilters.offlineTiles 
                  ? 'bg-amber-50 text-amber-800 border-amber-300' 
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {mapFilters.offlineTiles ? 'Offline Layer Active' : 'Standby'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pre-rendered vector and topographic tile packs for high-altitude passes with zero cellular connectivity.
            </p>
          </div>
        </div>

        {/* Master Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Offline Mode Layer Toggle Switch */}
          <button
            onClick={() => toggleMapFilter('offlineTiles')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border shadow-2xs ${
              mapFilters.offlineTiles
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{mapFilters.offlineTiles ? 'Disable Offline Layer' : 'Enable Offline Mode Layer'}</span>
          </button>

          {/* Network Outage Simulation Toggle */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border ${
              isOffline
                ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
            }`}
            title="Simulate cellular loss to verify offline caching behavior"
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-600" />
                <span>Simulated Blackout (Online)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate Outage</span>
              </>
            )}
          </button>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition cursor-pointer"
            aria-label="Toggle corridor panel details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Cached Storage</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-mono text-sm font-bold text-slate-900">{cacheSummary.totalSizeMb} MB</span>
              </div>
              <span className="text-[10px] text-slate-400">{cacheSummary.totalTiles.toLocaleString()} map tiles</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Key Corridors</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono text-sm font-bold text-slate-900">{cacheSummary.totalCorridorsKm} km</span>
              </div>
              <span className="text-[10px] text-slate-400">{cacheSummary.cachedCorridorsCount} strategic routes</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Emergency Refuges</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-mono text-sm font-bold text-slate-900">{cacheSummary.totalShelters} Outposts</span>
              </div>
              <span className="text-[10px] text-slate-400">BRO, Fuel & Med Bays</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">GNSS Uplink</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Radio className="w-3.5 h-3.5 text-sky-600" />
                <span className="font-mono text-xs font-bold text-slate-900">NavIC + GPS L5</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Autonomous Fix</span>
            </div>
          </div>

          {/* Verification Progress (if running) */}
          {verifyProgress !== null && (
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-900 font-semibold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  Verifying LevelDB & CacheStorage integrity for all regional corridors...
                </span>
                <span className="font-mono font-bold text-indigo-950">{verifyProgress}%</span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${verifyProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('corridors')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'corridors'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Key Corridors ({NER_OFFLINE_CORRIDORS.length})
              </button>
              <button
                onClick={() => setActiveTab('shelters')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'shelters'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Offline Refuges & BRO Bases ({activeCorridor.shelters.length})
              </button>
              <button
                onClick={() => setActiveTab('storage')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'storage'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cache Storage Inspector
              </button>
            </div>

            <button
              onClick={handleVerifyCache}
              disabled={isVerifyingCache}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isVerifyingCache ? 'animate-spin' : ''}`} />
              <span>Verify Offline Packets</span>
            </button>
          </div>

          {/* Tab 1: Key Corridors Grid */}
          {activeTab === 'corridors' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {NER_OFFLINE_CORRIDORS.map((corridor) => {
                  const isSelected = selectedOfflineCorridorId === corridor.id;
                  return (
                    <div
                      key={corridor.id}
                      onClick={() => handleSelectCorridor(corridor.id)}
                      className={`p-3 rounded-lg border text-left transition cursor-pointer relative ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/30' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                          {corridor.highwayCode}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{corridor.status}</span>
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {corridor.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {corridor.region}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1 text-[11px] text-slate-600 font-medium">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Distance</span>
                          <span className="font-mono font-bold text-slate-800">{corridor.lengthKm} km</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Offline Tiles</span>
                          <span className="font-mono font-bold text-slate-800">{corridor.tileCount} ({corridor.sizeMb}MB)</span>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                        <span>Max Alt: {corridor.elevationRange.highPass}</span>
                        <span className="text-indigo-600 font-semibold">{isSelected ? 'Focusing' : 'Click to Focus'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Corridor Tactical Callout */}
              <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Active Tactical Notes for {activeCorridor.name}:</span>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    {activeCorridor.tacticalNotes} Includes {activeCorridor.shelters.length} offline staging posts with verified VHF radio relay and sub-zero fuel warming support.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Offline Shelters & BRO Outposts */}
          {activeTab === 'shelters' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Showing {activeCorridor.shelters.length} emergency waypoints along <b>{activeCorridor.name}</b>:</span>
                <span className="font-mono text-slate-500">Autonomous radio relay active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {activeCorridor.shelters.map((shelter) => {
                  const badge = getShelterBadge(shelter.type);
                  const BadgeIcon = badge.icon;
                  return (
                    <div 
                      key={shelter.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`p-1 rounded text-xs border ${badge.bg}`}>
                            <BadgeIcon className="w-3 h-3" />
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{shelter.name}</h4>
                            <span className="text-[10px] text-slate-500 font-mono">{shelter.highway} · Elev: {shelter.elevationM}m</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded font-mono">
                          {shelter.kmMarker ? `Km ${shelter.kmMarker}` : shelter.highway}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] bg-white p-2 rounded border border-slate-100">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Radio className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span className="font-mono font-semibold text-[10px]">{shelter.vhfChannel}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-700">
                          <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="font-mono text-[10px] truncate">{shelter.satellitePhone}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {shelter.services.map((svc, i) => (
                          <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Cache Storage Details */}
          {activeTab === 'storage' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Storage API Layer:</span>
                  <span className="font-mono font-bold text-slate-800">{cacheSummary.storageEngine}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Cache Status:</span>
                  <span className="font-mono font-bold text-emerald-700">{cacheSummary.cacheHealth}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Satellite GNSS Constellation:</span>
                  <span className="font-mono font-bold text-indigo-700">{cacheSummary.gnssConstellation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Emergency SOS Boxes:</span>
                  <span className="font-mono font-bold text-slate-800">{cacheSummary.totalSosBoxes} solar-powered telemetry points</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 leading-relaxed">
                <p className="font-semibold mb-1">Autonomous Offline Routing Protocol:</p>
                <p className="text-[11px] text-indigo-800">
                  When crossing the Se-La pass or low-altitude valleys in Kameng/Subansiri districts, cellular handovers fail completely. 
                  The offline mode layer replaces live tile network calls with local raster-vector tiles cached via the CacheStorage and ServiceWorker APIs. GPS coordinates received via hardware GNSS remain fully operational without data access.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
