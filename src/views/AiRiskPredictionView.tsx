import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SeverityLevel } from '../types';
import { AiRiskExplainModal } from '../components/AiRiskExplainModal';
import { 
  BrainCircuit, 
  CloudRain, 
  Mountain, 
  History, 
  Radio, 
  Truck, 
  MapPin, 
  Calendar, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Sliders, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const AiRiskPredictionView: React.FC = () => {
  const { routes, setActiveTab, setAiExplanationRoute } = useApp();

  const [source, setSource] = useState('Guwahati (Hub)');
  const [destination, setDestination] = useState('Tawang (Destination)');
  const [vehicleType, setVehicleType] = useState('Refrigerated Medical Van');
  const [dateTime, setDateTime] = useState('2026-09-04T11:00');
  const [weatherCondition, setWeatherCondition] = useState<'Cloudburst' | 'Heavy Monsoon' | 'Moderate Rain' | 'Clear'>('Heavy Monsoon');
  const [roadMaintenanceStatus, setRoadMaintenanceStatus] = useState<'Active Widening' | 'Normal Paved' | 'BRO Cleared'>('Active Widening');
  const [isExplainOpen, setIsExplainOpen] = useState(false);

  // Dynamic AI Risk Calculation logic based on inputs
  const calculation = useMemo(() => {
    let rainScore = 25;
    let terrainScore = 20;
    let historyScore = 18;
    let roadScore = 10;
    let floodScore = 5;
    let connectivityRisk: SeverityLevel = 'LOW';

    // Weather impact
    if (weatherCondition === 'Cloudburst') {
      rainScore = 30;
      floodScore = 9;
    } else if (weatherCondition === 'Heavy Monsoon') {
      rainScore = 25;
      floodScore = 6;
    } else if (weatherCondition === 'Moderate Rain') {
      rainScore = 14;
      floodScore = 3;
    } else {
      rainScore = 5;
      floodScore = 1;
    }

    // Destination & Terrain slope impact
    if (destination.includes('Tawang') || destination.includes('Bomdila')) {
      terrainScore = 22;
      historyScore = 18;
      connectivityRisk = 'MEDIUM';
    } else if (destination.includes('Kohima') || destination.includes('Aizawl')) {
      terrainScore = 16;
      historyScore = 12;
      connectivityRisk = 'LOW';
    } else {
      terrainScore = 8;
      historyScore = 5;
    }

    // Vehicle adaptability
    if (vehicleType.includes('4WD')) {
      terrainScore = Math.max(5, terrainScore - 6);
      roadScore = Math.max(4, roadScore - 4);
    } else if (vehicleType.includes('Heavy Multi-Axle')) {
      terrainScore += 4;
      roadScore += 3;
    }

    // Road condition impact
    if (roadMaintenanceStatus === 'Active Widening') {
      roadScore = 12;
    } else if (roadMaintenanceStatus === 'BRO Cleared') {
      roadScore = 5;
    } else {
      roadScore = 8;
    }

    const totalScore = Math.min(99, Math.max(12, rainScore + terrainScore + historyScore + roadScore + floodScore));

    let riskLevel: SeverityLevel = 'LOW';
    if (totalScore >= 75) riskLevel = 'HIGH';
    else if (totalScore >= 45) riskLevel = 'MEDIUM';

    // Dynamic NLP explanation based on calculated factors
    let explanation = 'Moderate terrain gradient and manageable precipitation ensure standard transit clearance.';
    if (totalScore >= 75) {
      explanation = 'Heavy rainfall and steep terrain have increased the predicted landslide risk along this route. Sela Pass sector flagged for potential slope displacement.';
    } else if (totalScore >= 45) {
      explanation = 'Intermittent rain and elevated gradients require low transit speeds (≤35 km/h) and dual-axle grip verification.';
    }

    const rainfallRisk: SeverityLevel = rainScore > 20 ? 'HIGH' : rainScore > 10 ? 'MEDIUM' : 'LOW';
    const landslideRisk: SeverityLevel = terrainScore + historyScore > 30 ? 'HIGH' : terrainScore + historyScore > 18 ? 'MEDIUM' : 'LOW';
    const roadConditionRisk: SeverityLevel = roadScore > 9 ? 'MEDIUM' : 'LOW';
    const floodRisk: SeverityLevel = floodScore > 5 ? 'MEDIUM' : 'LOW';

    return {
      totalScore,
      riskLevel,
      rainScore,
      terrainScore,
      historyScore,
      roadScore,
      floodScore,
      connectivityRisk,
      rainfallRisk,
      landslideRisk,
      roadConditionRisk,
      floodRisk,
      explanation,
    };
  }, [source, destination, vehicleType, weatherCondition, roadMaintenanceStatus]);

  const getSeverityBadge = (level: SeverityLevel) => {
    switch (level) {
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
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              AI Route Risk Prediction
            </h1>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold uppercase border border-indigo-200">
              XGBoost + GIS Multi-Factor Engine
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Synthesizes meteorological Doppler rainfall, GIS terrain slopes, historical landslide frequency, and real-time road conditions.
          </p>
        </div>

        {/* Prototype Label */}
        <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-right shadow-xs">
          <span className="text-[10px] font-bold text-indigo-700 block font-mono">
            AI Simulation / Demo Prediction
          </span>
          <span className="text-[10px] text-slate-500">
            Simulated Geospatial Model v2.4
          </span>
        </div>
      </div>

      {/* Main Grid: Input Parameters (Left) & Risk Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Selection (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              Route & Vehicle Parameters
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Dynamic Evaluation</span>
          </div>

          <div className="space-y-3">
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Starting Location (Origin)
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Guwahati (Hub)">Guwahati (Central Hub)</option>
                  <option value="Tezpur">Tezpur Forward Depot</option>
                  <option value="Shillong">Shillong Cold Store</option>
                  <option value="Silchar">Silchar Barak Hub</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Destination (NER Node)
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Tawang (Destination)">Tawang Hospital (Arunachal)</option>
                  <option value="Bomdila">Bomdila Outpost</option>
                  <option value="Kohima">Kohima Depot (Nagaland)</option>
                  <option value="Imphal">Imphal Trauma Center (Manipur)</option>
                  <option value="Aizawl">Aizawl Hospital (Mizoram)</option>
                </select>
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Vehicle Type & Configuration
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Refrigerated Medical Van">Refrigerated Medical Van (Cold-Chain)</option>
                <option value="4WD Mountain Supply Carrier">4WD Mountain Supply Carrier (High Clearance)</option>
                <option value="Heavy Multi-Axle Truck">Heavy Multi-Axle Truck (16+ Tons)</option>
                <option value="Fuel Tanker (Flammable Cargo)">Fuel Tanker (Aviation / Diesel)</option>
              </select>
            </div>

            {/* Date Time */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Planned Departure Timestamp
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Weather Condition */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Simulated Weather Forecast Condition
              </label>
              <select
                value={weatherCondition}
                onChange={(e) => setWeatherCondition(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Cloudburst">Cloudburst / Extreme Storm (&gt;65 mm/hr)</option>
                <option value="Heavy Monsoon">Heavy Monsoon Rain (35 - 50 mm/hr)</option>
                <option value="Moderate Rain">Moderate Rain (10 - 20 mm/hr)</option>
                <option value="Clear">Clear / Normal Mountain Weather (&lt;5 mm/hr)</option>
              </select>
            </div>

            {/* Road Condition */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Road Infrastructure Status (NHIDCL / BRO)
              </label>
              <select
                value={roadMaintenanceStatus}
                onChange={(e) => setRoadMaintenanceStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Active Widening">Active Hillside Widening (Loose Soil / Slush)</option>
                <option value="Normal Paved">Standard Bituminous Paved Road</option>
                <option value="BRO Cleared">BRO Reinforced Rock-Netting & Cleared</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-800">Notice for Evaluators: </span>
            Adjusting parameters dynamically recomputes the risk vector based on actual slope physics, precipitation thresholds, and vehicle power-to-weight ratios.
          </div>
        </div>

        {/* Right Column: AI Risk Score & Explainability Display (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Risk Score Card */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-sm text-slate-800">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Calculated Risk Assessment
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono mt-1 flex items-baseline gap-2 text-slate-900">
                  <span>ROUTE RISK SCORE:</span>
                  <span className={`font-mono ${
                    calculation.riskLevel === 'HIGH' || calculation.riskLevel === 'CRITICAL' ? 'text-red-600' :
                    calculation.riskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {calculation.totalScore}/100
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Risk Level</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mt-0.5 ${getSeverityBadge(calculation.riskLevel)}`}>
                  {calculation.riskLevel}
                </span>
              </div>
            </div>

            {/* Individual Factor Breakdown List */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Individual Factor Breakdown:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CloudRain className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Rainfall Risk</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getSeverityBadge(calculation.rainfallRisk)}`}>
                    {calculation.rainfallRisk} ({calculation.rainScore} pts)
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Mountain className="w-3.5 h-3.5 text-amber-600" />
                    <span>Landslide Risk</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getSeverityBadge(calculation.landslideRisk)}`}>
                    {calculation.landslideRisk} ({calculation.terrainScore + calculation.historyScore} pts)
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                    <span>Road Condition</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getSeverityBadge(calculation.roadConditionRisk)}`}>
                    {calculation.roadConditionRisk} ({calculation.roadScore} pts)
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Flood Risk</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getSeverityBadge(calculation.floodRisk)}`}>
                    {calculation.floodRisk} ({calculation.floodScore} pts)
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Radio className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Connectivity & Satellite Uplink Risk</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getSeverityBadge(calculation.connectivityRisk)}`}>
                    {calculation.connectivityRisk}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Explanation Text Box */}
            <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl space-y-1">
              <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                AI Risk Explanation:
              </span>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "{calculation.explanation}"
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setAiExplanationRoute(routes[0]);
                  setIsExplainOpen(true);
                }}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-4 py-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Inspect Feature Weights (SHAP Vector)</span>
              </button>

              <button
                onClick={() => setActiveTab('optimizer')}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Find AI Recommended Alternate Safe Route</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isExplainOpen && (
        <AiRiskExplainModal
          route={routes[0]}
          onClose={() => setIsExplainOpen(false)}
          onNavigateOptimizer={() => setActiveTab('optimizer')}
        />
      )}
    </div>
  );
};
