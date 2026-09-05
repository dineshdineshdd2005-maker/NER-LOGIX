import React from 'react';
import { useApp } from '../context/AppContext';
import { LeafletMap } from '../components/LeafletMap';
import { Map, Layers, Compass, ShieldAlert, Sparkles, Navigation } from 'lucide-react';

export const MapView: React.FC = () => {
  const { vehicles, routes, alerts, fieldReports, setActiveTab, startLiveDemo, isDemoRunning } = useApp();

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              North Eastern Regional Geospatial Command (GIS / PostGIS)
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Multi-layer spatial view displaying live GPS vehicle coordinates, high-resolution terrain corridors, Doppler weather sweeps, and verified ground-truth blockades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isDemoRunning && (
            <button
              onClick={startLiveDemo}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Demonstrate Landslide & Reroute Flow</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('optimizer')}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5 text-indigo-600" />
            <span>Route Optimizer</span>
          </button>
        </div>
      </div>

      {/* Full Size GIS Workstation */}
      <LeafletMap height="680px" showControls={true} />
    </div>
  );
};
