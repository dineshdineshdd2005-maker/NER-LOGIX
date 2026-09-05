import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LeafletMap } from '../components/LeafletMap';
import { WeatherStation, SeverityLevel, AlertItem } from '../types';
import { 
  CloudRain, 
  Wind, 
  Thermometer, 
  Waves, 
  Mountain, 
  AlertTriangle, 
  Ban, 
  Radio, 
  CheckCircle2, 
  BellRing,
  Droplets,
  Eye,
  Sliders
} from 'lucide-react';

export const WeatherMonitoringView: React.FC = () => {
  const { 
    weatherStations, 
    riskZones, 
    alerts, 
    addFieldReport, 
    showToast, 
    setActiveTab 
  } = useApp();

  const [selectedStationId, setSelectedStationId] = useState<string>('WS-BOM');

  const selectedStation = weatherStations.find(w => w.id === selectedStationId) || weatherStations[0];

  // Calculate aggregates
  const stationsAboveRainThreshold = weatherStations.filter(w => w.rainfallMmHr > 30).length;
  const criticalLandslideCount = weatherStations.filter(w => w.landslideProbabilityPercent > 70).length;
  const activeFloodWarnings = weatherStations.filter(w => w.floodWarning).length;
  const blockedRoadCount = weatherStations.filter(w => w.roadCondition === 'Closed' || w.roadCondition === 'Partially Blocked').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Weather & Disaster Intelligence
            </h1>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold uppercase border border-indigo-200">
              IMD Doppler Radar & Geological Slope Sensors
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time multi-hazard telemetry tracking monsoon squall lines, soil moisture saturation, and flood gauges across the North Eastern Region.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 shadow-xs font-semibold">
            Doppler Stream: IMD Tezpur/Shillong
          </span>
        </div>
      </div>

      {/* 4 Dedicated Required Disaster Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: HEAVY RAINFALL */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
              Heavy Rainfall
            </span>
            <CloudRain className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {stationsAboveRainThreshold} <span className="text-xs font-normal text-slate-500">Districts &gt; 30mm/h</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Max recorded: <b className="text-amber-600">46.2 mm/hr</b> in West Kameng sector. Monsoon moisture feed active.
          </p>
        </div>

        {/* Card 2: LANDSLIDE RISK */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-amber-600 tracking-wider">
              Landslide Risk
            </span>
            <Mountain className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">
            {criticalLandslideCount} <span className="text-xs font-normal text-slate-500">High Risk Sectors</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Sela Pass & Bomdila slopes at <b className="text-red-600">88-91%</b> slide probability due to fractured rock layers.
          </p>
        </div>

        {/* Card 3: FLOOD RISK */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-cyan-600 tracking-wider">
              Flood Risk
            </span>
            <Waves className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-700">
            {activeFloodWarnings} <span className="text-xs font-normal text-slate-500">Basin Inundations</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Barak Basin (Silchar) & Jia Bhoreli at high water mark. Low causeways inundated.
          </p>
        </div>

        {/* Card 4: ROAD BLOCKAGE */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-red-600 tracking-wider">
              Road Blockage
            </span>
            <Ban className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-600">
            {blockedRoadCount} <span className="text-xs font-normal text-slate-500">Corridors Closed</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            NH-13 Km 112 blocked by boulder slide. Heavy machinery deployed by BRO.
          </p>
        </div>
      </div>

      {/* Main Layout: Weather Station Inspector + Regional Risk Zones Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weather Stations Telemetry List & Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Station Deep Dive */}
          {selectedStation && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm text-slate-800">
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h2 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span>{selectedStation.locationName}</span>
                  </h2>
                  <span className="text-xs text-slate-500">
                    State: {selectedStation.state} · Telemetry Station ID: {selectedStation.id}
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  selectedStation.roadCondition === 'Closed' ? 'bg-red-50 text-red-700 border border-red-200' :
                  selectedStation.roadCondition === 'Partially Blocked' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  Road: {selectedStation.roadCondition}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <Droplets className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
                  <span className="text-[10px] text-slate-500 block">Rainfall</span>
                  <span className="font-bold font-mono text-slate-900 text-sm">{selectedStation.rainfallMmHr} mm/h</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <Thermometer className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                  <span className="text-[10px] text-slate-500 block">Temperature</span>
                  <span className="font-bold font-mono text-slate-900 text-sm">{selectedStation.temperatureC}°C</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <Wind className="w-4 h-4 mx-auto text-cyan-600 mb-1" />
                  <span className="text-[10px] text-slate-500 block">Wind Speed</span>
                  <span className="font-bold font-mono text-slate-900 text-sm">{selectedStation.windSpeedKmH} km/h</span>
                </div>
              </div>

              {/* Landslide & Flood Alert Status */}
              <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Landslide Hazard Probability:</span>
                  <span className={`font-mono font-bold ${
                    selectedStation.landslideProbabilityPercent > 70 ? 'text-red-600' :
                    selectedStation.landslideProbabilityPercent > 40 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {selectedStation.landslideProbabilityPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">River Basin Flood Warning:</span>
                  <span className={`font-bold ${selectedStation.floodWarning ? 'text-red-600' : 'text-emerald-600'}`}>
                    {selectedStation.floodWarning ? 'ACTIVE WARNING' : 'Normal'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Weather Condition Summary:</span>
                  <span className="text-slate-800 font-medium">{selectedStation.conditionSummary}</span>
                </div>
              </div>
            </div>
          )}

          {/* Station Selection List */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm text-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block border-b border-slate-100 pb-2">
              Regional Weather Stations Roster:
            </span>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {weatherStations.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => setSelectedStationId(ws.id)}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition ${
                    ws.id === selectedStationId
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-medium'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{ws.locationName}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({ws.state})</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Rain: <b className="text-slate-800">{ws.rainfallMmHr} mm/h</b> · Slide: <b className={ws.landslideProbabilityPercent > 60 ? 'text-red-600' : 'text-slate-700'}>{ws.landslideProbabilityPercent}%</b>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    ws.roadCondition === 'Closed' ? 'bg-red-50 text-red-700 border border-red-200' :
                    ws.roadCondition === 'Partially Blocked' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {ws.roadCondition}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Regional GIS Map with Weather Radar & Risk Zones (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Mountain className="w-4 h-4 text-amber-600" />
              <span>Multi-Hazard Risk Zones & Weather Overlays</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Safe</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Moderate</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span> High Risk</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span> Critical</span>
            </div>
          </div>

          <LeafletMap height="540px" showControls={true} />
        </div>
      </div>
    </div>
  );
};
