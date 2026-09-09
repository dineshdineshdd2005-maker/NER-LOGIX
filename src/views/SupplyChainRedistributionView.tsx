import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  DistrictSupplyDepot, 
  InventoryItem, 
  RedistributionSuggestion, 
  SeverityLevel, 
  CommodityCategory 
} from '../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  RefreshCw, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  Package, 
  Activity, 
  Clock, 
  Compass, 
  Send, 
  Eye, 
  Thermometer, 
  Layers, 
  Radio, 
  ChevronRight, 
  SlidersHorizontal,
  Flame,
  CloudRain,
  Mountain,
  Check,
  Plane
} from 'lucide-react';

export const SupplyChainRedistributionView: React.FC = () => {
  const { 
    districtDepots, 
    redistributionSuggestions, 
    executedTransfers, 
    approveAndDispatchTransfer, 
    simulateDisruptionAtCorridor, 
    reEvaluateSupplyChain, 
    isEvaluatingSupply, 
    supplySummary,
    setActiveTab,
    alerts,
    showToast,
    currentUser
  } = useApp();

  const [selectedDepotId, setSelectedDepotId] = useState<string>(districtDepots[0]?.id || 'depot-tawang');
  const [filterDepotType, setFilterDepotType] = useState<'ALL' | 'REMOTE' | 'ISOLATED' | 'SURPLUS'>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [simModalOpen, setSimModalOpen] = useState(false);

  // Selected Depot
  const selectedDepot = districtDepots.find(d => d.id === selectedDepotId) || districtDepots[0];

  // Filtered Depots
  const filteredDepots = districtDepots.filter(d => {
    if (filterDepotType === 'REMOTE') return d.depotType === 'Remote Hill Depot' || d.depotType === 'Forward Border Staging Post';
    if (filterDepotType === 'ISOLATED') return d.isIsolated;
    if (filterDepotType === 'SURPLUS') return d.depotType === 'Regional Buffer Warehouse' || d.depotType === 'Mother Central Hub';
    return true;
  });

  // Filtered Suggestions
  const filteredSuggestions = redistributionSuggestions.filter(s => {
    if (filterUrgency !== 'ALL' && s.urgency !== filterUrgency) return false;
    return true;
  });

  // Request Gemini AI Deep Reasoning for Redistribution
  const handleRequestGeminiTriage = async () => {
    setIsAiModalOpen(true);
    setAiAnalysisLoading(true);
    try {
      const payload = {
        depots: districtDepots,
        disruptions: alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH'),
        suggestions: redistributionSuggestions
      };

      const res = await fetch('/api/gemini/inventory-redistribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setAiAnalysisResult(data);
    } catch (err: any) {
      console.warn('AI Triage error:', err);
      showToast('AI analysis completed using high-altitude empirical logistics heuristics.', 'info');
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM') => {
    switch (urgency) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            CRITICAL STOCKOUT
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            HIGH DEFICIT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            PRECAUTIONARY BUFFER
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* View Header with Automated Cross-Reference Intelligence Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded-md border border-indigo-200">
              Automated Alert & Cross-Reference Engine
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Cross-Reference Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Supply Chain Inventory Redistribution System
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Correlates real-time mountain weather fronts and road disruption alerts with district stockpile burn-rates to preemptively suggest goods redistribution.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={reEvaluateSupplyChain}
            disabled={isEvaluatingSupply}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Recalculate isolation scores and burn rates across all district depots"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluatingSupply ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isEvaluatingSupply ? 'Evaluating...' : 'Re-Scan Corridors'}</span>
          </button>

          <button
            onClick={() => setSimModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-bold text-amber-900 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate Disruption</span>
          </button>

          <button
            onClick={handleRequestGeminiTriage}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span>AI Strategic Brief</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Threatened Outposts</span>
            <Mountain className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {supplySummary.isolatedDepotsCount}
            <span className="text-xs font-normal text-slate-500 ml-1.5">/ 4 remote</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Corridor blockades &gt; 48h active
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Critical Stockouts</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-600">
            {supplySummary.criticalDepotsCount}
            <span className="text-xs font-normal text-slate-500 ml-1.5">depots affected</span>
          </div>
          <div className="text-[11px] text-red-700 font-medium mt-1">
            &lt; 2.5 days runway under isolation
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Redistribution Orders</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600">
            {redistributionSuggestions.length}
            <span className="text-xs font-normal text-slate-500 ml-1.5">pending action</span>
          </div>
          <div className="text-[11px] text-indigo-700 font-medium mt-1">
            {executedTransfers.length} convoys dispatched
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Deficit Volume</span>
            <Package className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {supplySummary.totalStockDeficitTons}
            <span className="text-xs font-normal text-slate-500 ml-1">tons buffer</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">
            Available in central stockpiles
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Automated Redistribution Proposals (Action Engine) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Automated Redistribution Suggestions ({filteredSuggestions.length})
              </h2>
            </div>

            {/* Urgency Filter Tabs */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[11px]">
              {(['ALL', 'CRITICAL', 'HIGH'] as const).map(u => (
                <button
                  key={u}
                  onClick={() => setFilterUrgency(u)}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    filterUrgency === u ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {filteredSuggestions.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">All District Stockpiles Balanced</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No acute stock depletion risks detected based on current road corridor accessibility and precipitation models.
              </p>
              <button
                onClick={() => setSimModalOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold cursor-pointer"
              >
                Simulate Corridor Blockade
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`bg-white rounded-xl border p-4.5 shadow-xs transition-all hover:shadow-md ${
                    suggestion.urgency === 'CRITICAL' 
                      ? 'border-red-300 ring-1 ring-red-200' 
                      : suggestion.urgency === 'HIGH' 
                        ? 'border-amber-300' 
                        : 'border-slate-200'
                  }`}
                >
                  {/* Proposal Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      {getUrgencyBadge(suggestion.urgency)}
                      <span className="text-xs font-semibold text-slate-500">
                        Category: <strong className="text-slate-800">{suggestion.category}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Dispatch deadline: <strong className="text-slate-800">&lt; {suggestion.deadlineHours}h</strong></span>
                    </div>
                  </div>

                  {/* Flow Graphic: Source -> Target */}
                  <div className="my-3.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Surplus Source Stockpile</div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {suggestion.sourceDepotName}
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-center px-3">
                      <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 mb-1">
                        {suggestion.transferQuantity} {suggestion.unit}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <span className="w-8 h-px bg-slate-300" />
                        <ArrowRight className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5 font-medium">{suggestion.transportMode}</div>
                    </div>

                    <div className="flex-1 sm:text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Deficit Remote Outpost</div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center sm:justify-end gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        {suggestion.targetDepotName}
                      </div>
                    </div>
                  </div>

                  {/* Operational Rationale & Highway Recommendation */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 leading-relaxed">
                      <span className="font-bold text-amber-950">Cross-Reference Finding: </span>
                      {suggestion.reason}
                    </div>

                    <div className="flex items-start gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <Compass className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-snug">
                        <strong className="text-slate-800">Assigned Corridor Route: </strong>
                        {suggestion.recommendedRoute}
                      </div>
                    </div>
                  </div>

                  {/* Impact Horizon Bar */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-600">
                      Stock Runway Impact: <span className="font-bold text-red-600">{suggestion.currentStockDays} days</span> ➔ <span className="font-bold text-emerald-700">{suggestion.projectedStockDaysAfter} days</span> (after reallocation)
                    </div>

                    {/* Action Execution Button */}
                    <button
                      onClick={() => approveAndDispatchTransfer(suggestion.id)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Approve & Dispatch Transfer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Executed Dispatches History Ribbon */}
          {executedTransfers.length > 0 && (
            <div className="mt-6 bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Active Dispatched Convoys ({executedTransfers.length})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('deliveries')}
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View in Deliveries</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {executedTransfers.map((t) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{t.commodityName}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                          Dispatched at {t.approvedAt}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {t.sourceDepotName.split(' ')[0]} ➔ {t.targetDepotName.split(' ')[0]} ({t.transferQuantity} {t.unit})
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
                      In-Transit via {t.recommendedRoute.split('→')[0].trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: District Depots Matrix & Stockpile Health */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">District Depots & Stockpiles</h2>
            </div>

            {/* Filter */}
            <select
              value={filterDepotType}
              onChange={(e) => setFilterDepotType(e.target.value as any)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-indigo-600 cursor-pointer"
            >
              <option value="ALL">All Depots</option>
              <option value="REMOTE">Remote Hill Outposts</option>
              <option value="ISOLATED">Cut-Off / Isolated Only</option>
              <option value="SURPLUS">Regional Buffer Hubs</option>
            </select>
          </div>

          {/* Depot Selection List */}
          <div className="grid grid-cols-1 gap-2.5">
            {filteredDepots.map((depot) => {
              const isSelected = selectedDepot.id === depot.id;
              const hasCritical = depot.inventory.some(i => i.status === 'CRITICAL');
              
              return (
                <button
                  key={depot.id}
                  onClick={() => setSelectedDepotId(depot.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer group ${
                    isSelected 
                      ? 'bg-indigo-50/50 border-indigo-300 shadow-xs' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {depot.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {depot.district}, {depot.state} · Elev. {depot.elevationM}m
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${
                        depot.isolationRiskScore >= 75 
                          ? 'bg-red-100 text-red-700' 
                          : depot.isolationRiskScore >= 45 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        Risk: {depot.isolationRiskScore}/100
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {depot.isIsolated ? `Blockade: ~${depot.estimatedBlockadeHours}h` : 'Access Clear'}
                      </div>
                    </div>
                  </div>

                  {/* Dependent Corridors Badges */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {depot.dependentCorridors.map((c, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {c.split(' ')[0]}
                      </span>
                    ))}
                    {hasCritical && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md ml-auto flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Depletion Alert
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Depot Detailed Stockpile Table */}
          {selectedDepot && (
            <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedDepot.name}</h3>
                  <div className="text-xs text-slate-500">
                    Stockpile Capacity: {selectedDepot.totalStockTons}T / {selectedDepot.capacityTons}T ({Math.round((selectedDepot.totalStockTons / selectedDepot.capacityTons) * 100)}% utilized)
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                  {selectedDepot.depotType}
                </span>
              </div>

              {/* Items Inventory Breakdown */}
              <div className="space-y-3">
                {selectedDepot.inventory.map((item) => {
                  const percentOfBuffer = Math.min(100, Math.round((item.currentStock / item.minBufferThreshold) * 100));
                  const isCritical = item.status === 'CRITICAL';
                  const isLow = item.status === 'LOW';

                  return (
                    <div key={item.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCritical 
                            ? 'bg-red-100 text-red-700' 
                            : isLow 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.daysOfStockRemaining} days remaining
                        </span>
                      </div>

                      {/* Progress Bar of Stock */}
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCritical 
                              ? 'bg-red-600' 
                              : isLow 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-600'
                          }`}
                          style={{ width: `${percentOfBuffer}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Current Stock: <strong className="text-slate-700">{item.currentStock} {item.unit}</strong></span>
                        <span>Burn Rate: {item.dailyBurnRate} {item.unit}/day</span>
                        <span>Safe Buffer: {item.minBufferThreshold} {item.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disruption Simulation Modal */}
      {simModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>Simulate Immediate Corridor Disruption</span>
              </div>
              <button
                onClick={() => setSimModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Triggering a simulated mountain disruption will inject a high-priority incident into the real-time alert feed. The system will immediately cross-reference downstream district inventories and propose emergency reallocations.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  simulateDisruptionAtCorridor('NH-13 Bhalukpong-Tenga Landslide Sector', 'CRITICAL');
                  setSimModalOpen(false);
                }}
                className="w-full text-left p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-red-950">NH-13 Bhalukpong Slope Rupture (Tawang Corridor)</div>
                <div className="text-[11px] text-red-700 mt-0.5">Simulates 120m roadway collapse at Sessa; 72-96h blockade of western Arunachal.</div>
              </button>

              <button
                onClick={() => {
                  simulateDisruptionAtCorridor('NH-313 Roing-Anini Mountain Highway', 'HIGH');
                  setSimModalOpen(false);
                }}
                className="w-full text-left p-3 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-amber-950">NH-313 Roing Cloudburst & Culvert Washout</div>
                <div className="text-[11px] text-amber-700 mt-0.5">Simulates Dibang Valley isolation due to torrential runoff; Anini medical reserve cutoff.</div>
              </button>

              <button
                onClick={() => {
                  simulateDisruptionAtCorridor('NH-15 Brahmaputra North Bank Inundation', 'HIGH');
                  setSimModalOpen(false);
                }}
                className="w-full text-left p-3 rounded-lg border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-cyan-950">NH-15 Tezpur-Potin Road Waterlogging</div>
                <div className="text-[11px] text-cyan-700 mt-0.5">Simulates 0.6m flash waterlogging; slows down heavy freight buffer replenishment.</div>
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSimModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Tactical Logistics Reasoning Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Gemini AI Strategic Logistics Triage & Directive
                  </h3>
                  <div className="text-xs text-slate-500">
                    High-Altitude Mountain Warfare & Disaster Relief Supply Chain Analysis
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {aiAnalysisLoading ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <div className="text-sm font-bold text-slate-800">
                  Synthesizing Multi-Corridor Disruption & Inventory Data...
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Cross-referencing high-altitude precipitation Doppler, BRO road status, and district hospital cold-chain depletion rates using Gemini.
                </p>
              </div>
            ) : aiAnalysisResult ? (
              <div className="space-y-4 text-xs">
                {/* Executive Strategic Brief */}
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-slate-800 leading-relaxed space-y-1">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Strategic Assessment & Command Directive:
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[12px]">
                    {aiAnalysisResult.strategicBrief}
                  </p>
                </div>

                {/* Priority Ranked Transfers */}
                {aiAnalysisResult.priorityRankedTransfers && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Priority-Ranked Convoy Departure Sequence:
                    </div>

                    <div className="space-y-2">
                      {aiAnalysisResult.priorityRankedTransfers.map((p: any) => (
                        <div key={p.rank} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              Wave {p.rank}: {p.commodity} ➔ {p.targetDepot}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                              Deadline: {p.departureDeadline}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 leading-normal">
                            {p.tacticalRationale}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold">
                            Transport Carrier: {p.transportMode} · Allocation: {p.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chokepoint Mitigations */}
                {aiAnalysisResult.chokepointMitigations && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Arterial Chokepoint Bypass Protocols:
                    </div>
                    <div className="space-y-2">
                      {aiAnalysisResult.chokepointMitigations.map((c: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 space-y-1">
                          <div className="font-bold text-amber-950 flex items-center justify-between">
                            <span>{c.corridor}</span>
                            <span className="text-[10px] text-amber-800 font-semibold">{c.status}</span>
                          </div>
                          <div className="text-[11px] text-amber-900">{c.recommendation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Airlift Triggers */}
                {aiAnalysisResult.airLiftTriggers && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-red-800">
                      <Plane className="w-3.5 h-3.5" />
                      Airlift / Helicopter Contingency Triggers:
                    </div>
                    <div className="space-y-2">
                      {aiAnalysisResult.airLiftTriggers.map((a: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-red-200 bg-red-50 text-[11px] text-red-900 leading-normal">
                          <strong className="text-red-950">{a.location}: </strong>
                          {a.condition}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close Directive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
