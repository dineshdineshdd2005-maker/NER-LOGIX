import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Boxes, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  Coins, 
  FileCheck2, 
  Building2, 
  ChevronRight, 
  RefreshCw,
  ExternalLink,
  Layers,
  ThermometerSnowflake,
  Fuel,
  Apple,
  Droplet
} from 'lucide-react';

interface ResourceAllocationWidgetProps {
  onNavigateSupply?: () => void;
  onNavigateAdmin?: () => void;
}

export const ResourceAllocationWidget: React.FC<ResourceAllocationWidgetProps> = ({
  onNavigateSupply,
  onNavigateAdmin
}) => {
  const { 
    districtDepots, 
    redistributionSuggestions, 
    supplySummary, 
    showToast, 
    executeRedistributionTransfer,
    reEvaluateSupplyChain,
    isEvaluatingSupply 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'MEDICAL' | 'FUEL' | 'FOOD'>('ALL');
  const [approvedTransfers, setApprovedTransfers] = useState<string[]>([]);
  const [isAuthorizing, setIsAuthorizing] = useState<string | null>(null);

  // Critical outposts
  const criticalDepots = districtDepots.filter(d => d.isolationRiskScore >= 70 || d.isIsolated);
  const totalStockTons = districtDepots.reduce((sum, d) => sum + d.totalStockTons, 0);
  const totalCapacityTons = districtDepots.reduce((sum, d) => sum + d.capacityTons, 0);
  const overallCapacityPct = Math.round((totalStockTons / totalCapacityTons) * 100);

  const handleAuthorizeTransfer = async (transferId: string, source: string, target: string, item: string, qty: string) => {
    setIsAuthorizing(transferId);
    try {
      await executeRedistributionTransfer(transferId);
      setApprovedTransfers(prev => [...prev, transferId]);
      showToast(`Administrative Executive Approval: Dispatched ${qty} ${item} from ${source} ➔ ${target}.`, 'success');
    } catch (err: any) {
      showToast(`Authorization failed: ${err?.message || 'Error executing transfer'}`, 'error');
    } finally {
      setIsAuthorizing(null);
    }
  };

  return (
    <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-5 text-slate-800">
      {/* Widget Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Emergency Resource Allocation & Stockpile Cockpit
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-mono">
                Administrator View
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strategic reserve quotas, isolation buffer depletion indices, and inter-district transfer authorizations
            </p>
          </div>
        </div>

        {/* Action Shortcuts for Admin */}
        <div className="flex items-center gap-2">
          {onNavigateSupply && (
            <button
              onClick={onNavigateSupply}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Outpost Inventories</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
          {onNavigateAdmin && (
            <button
              onClick={onNavigateAdmin}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Audit & Permissions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Strategic Admin Executive KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Stock Capacity</span>
            <Boxes className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {totalStockTons.toFixed(1)} T
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            {overallCapacityPct}% of {totalCapacityTons.toFixed(0)} T Capacity
          </div>
        </div>

        <div className="p-3 bg-red-50/70 rounded-xl border border-red-200/70">
          <div className="flex items-center justify-between text-red-700 text-xs font-medium">
            <span>Threatened Outposts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl font-bold font-mono text-red-900 mt-1">
            {criticalDepots.length} Depots
          </div>
          <div className="text-[10px] text-red-700 font-semibold mt-0.5">
            Isolation Risk &gt; 70%
          </div>
        </div>

        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/70">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-medium">
            <span>Relief Quota Allocated</span>
            <Coins className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-950 mt-1">
            ₹4.85 Cr
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            MDoNER / SDRF Emergency Pool
          </div>
        </div>

        <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200/70">
          <div className="flex items-center justify-between text-indigo-700 text-xs font-medium">
            <span>Pending Requisitions</span>
            <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-950 mt-1">
            {redistributionSuggestions.length} Orders
          </div>
          <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">
            Ready for Executive Sign-off
          </div>
        </div>
      </div>

      {/* Main Split: District Stockpile Depletion Monitor & Pending Transfer Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Critical Outpost Allocation & Buffer Depletion (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              Strategic District Depot Allocation Status
            </span>
            <button
              onClick={reEvaluateSupplyChain}
              disabled={isEvaluatingSupply}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isEvaluatingSupply ? 'animate-spin' : ''}`} />
              <span>Recalculate Reserves</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {districtDepots.map(depot => {
              const isHighRisk = depot.isolationRiskScore >= 70;
              const fillPct = Math.round((depot.totalStockTons / depot.capacityTons) * 100);

              // Critical items in this depot
              const criticalItems = depot.inventory.filter(i => i.status === 'CRITICAL' || i.status === 'LOW');

              return (
                <div
                  key={depot.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all space-y-2 ${
                    isHighRisk 
                      ? 'bg-red-50/40 border-red-200' 
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {depot.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600 font-mono">
                          {depot.state}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Elevation: {depot.elevationM}m · Serves: {depot.populationServed.toLocaleString()} residents
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        isHighRisk 
                          ? 'bg-red-100 text-red-800 border border-red-300' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        Risk: {depot.isolationRiskScore}%
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {depot.totalStockTons} / {depot.capacityTons} Tons ({fillPct}%)
                      </div>
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHighRisk ? 'bg-red-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(fillPct, 100)}%` }}
                    />
                  </div>

                  {/* Critical Item Callouts */}
                  {criticalItems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {criticalItems.slice(0, 3).map(item => (
                        <span
                          key={item.id}
                          className="text-[10px] px-2 py-0.5 rounded bg-white border border-red-200 text-red-800 flex items-center gap-1 font-medium"
                        >
                          <TrendingDown className="w-2.5 h-2.5 text-red-600" />
                          <span>{item.name}: <strong>{item.daysOfStockRemaining}d left</strong></span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Executive Inter-District Transfer Approvals (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
              Administrative Redistribution Orders
            </span>
            <span className="text-[10px] text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 font-bold">
              {redistributionSuggestions.length} Pending
            </span>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {redistributionSuggestions.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="font-semibold text-slate-800">All Strategic Stock Reserves Balanced</p>
                <p className="text-[11px]">No urgent inter-district redistribution requisitions pending administrative approval.</p>
              </div>
            ) : (
              redistributionSuggestions.map(order => {
                const isApproved = approvedTransfers.includes(order.id) || order.status === 'In Transit';
                const isBusy = isAuthorizing === order.id;

                return (
                  <div
                    key={order.id}
                    className="p-3.5 bg-white border border-indigo-100 hover:border-indigo-300 rounded-xl text-xs space-y-2.5 shadow-2xs transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-slate-900 text-xs">
                        {order.itemName} ({order.quantityTransfer} {order.unit})
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : order.priority === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {isApproved ? 'AUTHORIZED' : order.priority}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Source Depot:</span>
                        <strong className="text-slate-800">{order.sourceDepotName}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Target Deficit:</span>
                        <strong className="text-red-700">{order.targetDepotName}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-slate-200/60">
                        <span>Safe Bypass Route:</span>
                        <span className="font-mono text-indigo-700 truncate max-w-[170px]">{order.recommendedRouteName}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 italic leading-snug">
                      "{order.rationale}"
                    </p>

                    <div className="pt-1">
                      {isApproved ? (
                        <div className="flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Order Authorized & Logged</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleAuthorizeTransfer(
                            order.id, 
                            order.sourceDepotName, 
                            order.targetDepotName, 
                            order.itemName, 
                            `${order.quantityTransfer} ${order.unit}`
                          )}
                          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{isBusy ? 'Signing Requisition...' : 'Authorize Emergency Allocation'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Emergency Stock Reserve Categories Breakdown */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-slate-600">
          <span className="font-semibold text-slate-800">Critical Category Buffers:</span>
          <span className="flex items-center gap-1">
            <ThermometerSnowflake className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cold-Chain Vaccines: <strong>600 Vials Buffer</strong></span>
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-amber-600" />
            <span>Winter Diesel: <strong>35,000L Buffer</strong></span>
          </span>
          <span className="flex items-center gap-1">
            <Apple className="w-3.5 h-3.5 text-emerald-700" />
            <span>PDS Grains: <strong>120 Tons Buffer</strong></span>
          </span>
        </div>

        {onNavigateSupply && (
          <button
            onClick={onNavigateSupply}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Open Outpost Inventory Balances</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
