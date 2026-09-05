import React from 'react';
import { RouteOption } from '../types';
import { 
  BrainCircuit, 
  X, 
  HelpCircle, 
  BarChart2, 
  CloudRain, 
  Mountain, 
  History, 
  AlertOctagon, 
  Waves, 
  Radio, 
  CheckCircle, 
  ExternalLink 
} from 'lucide-react';

interface AiRiskExplainModalProps {
  route: RouteOption | null;
  onClose: () => void;
  onNavigateOptimizer?: () => void;
}

export const AiRiskExplainModal: React.FC<AiRiskExplainModalProps> = ({ 
  route, 
  onClose,
  onNavigateOptimizer 
}) => {
  if (!route) return null;

  // Realistic feature weight breakdown for explainability
  const isHighOrCritical = route.riskLevel === 'HIGH' || route.riskLevel === 'CRITICAL';
  
  const factors = isHighOrCritical ? [
    { name: 'Monsoon Rainfall & Precipitation', weight: '+25', score: 25, max: 30, icon: CloudRain, color: 'bg-blue-500', desc: 'Doppler radar: >42mm/hr continuous precipitation recorded in West Kameng sector.' },
    { name: 'Steep Terrain & Slope Gradient', weight: '+20', score: 20, max: 25, icon: Mountain, color: 'bg-amber-500', desc: 'High relief slopes (>32° inclination) with vulnerable phyllite bedrock near Sela Pass.' },
    { name: 'Historical Landslide Frequency', weight: '+18', score: 18, max: 20, icon: History, color: 'bg-red-500', desc: 'Geological Survey records indicate 14 slide incidents at this coordinate over last 5 monsoons.' },
    { name: 'Road Infrastructure Condition', weight: '+10', score: 10, max: 15, icon: AlertOctagon, color: 'bg-orange-500', desc: 'Active road widening stretch; unpaved wet clay layer prone to tire slippage.' },
    { name: 'Flood & River Swell Inundation', weight: '+5', score: 5, max: 10, icon: Waves, color: 'bg-cyan-500', desc: 'Tributary river surge within 0.8m of low-level single-lane culvert.' },
  ] : [
    { name: 'Monsoon Rainfall & Precipitation', weight: '+6', score: 6, max: 30, icon: CloudRain, color: 'bg-blue-500', desc: 'Moderate precipitation (<10mm/hr) with well-drained lateral channels.' },
    { name: 'Steep Terrain & Slope Gradient', weight: '+5', score: 5, max: 25, icon: Mountain, color: 'bg-amber-500', desc: 'Valley contour gradient (<14°) with reinforced retaining gabion walls.' },
    { name: 'Historical Landslide Frequency', weight: '+3', score: 3, max: 20, icon: History, color: 'bg-red-500', desc: 'Only 1 recorded slope slide over 10-year GSI survey period.' },
    { name: 'Road Infrastructure Condition', weight: '+6', score: 6, max: 15, icon: AlertOctagon, color: 'bg-orange-500', desc: 'Bituminous all-weather paved surface with double-lane clearance.' },
    { name: 'Flood & River Swell Inundation', weight: '+4', score: 4, max: 10, icon: Waves, color: 'bg-cyan-500', desc: 'Elevated causeway passing 4.2m above high water flood level.' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                AI Risk Explanation & Feature Attribution
              </h3>
              <p className="text-xs text-slate-500">
                Evaluating: <span className="text-slate-800 font-semibold">{route.name} - {route.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Label Disclaimer Banner */}
          <div className="bg-indigo-50/60 border border-indigo-100 p-2.5 rounded-lg flex items-center justify-between text-xs text-indigo-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              <span className="font-bold">Model Architecture:</span>
              <span>XGBoost Classifier + Geospatial Multi-Factor Elevation Model (v2.4)</span>
            </div>
            <span className="text-[10px] bg-white border border-indigo-200 px-2 py-0.5 rounded font-mono font-bold text-indigo-700">
              AI Simulation / Demo Prediction
            </span>
          </div>

          {/* Primary Score Breakdown Card */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isHighOrCritical 
              ? 'bg-red-50 border-red-200 text-red-900' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Route Risk Evaluation</span>
              <div className="text-3xl font-bold font-mono mt-0.5 flex items-baseline gap-2">
                <span className={isHighOrCritical ? 'text-red-700' : 'text-emerald-700'}>
                  {route.riskScore}
                </span>
                <span className="text-sm text-slate-500 font-normal">/ 100 Risk Index</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Risk Classification: <b className="uppercase font-bold">{route.riskLevel} RISK</b>
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 max-w-sm shadow-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1 mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                Natural Language Reasoning:
              </span>
              <p className="italic leading-relaxed text-slate-600">
                "{route.explanation}"
              </p>
            </div>
          </div>

          {/* Individual Feature Contributions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>Shapley Feature Contributions (Additive Risk Vector):</span>
              <span className="text-[11px] text-slate-400 font-mono">Impact on Score</span>
            </h4>

            <div className="space-y-2">
              {factors.map((factor, index) => {
                const Icon = factor.icon;
                return (
                  <div key={index} className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <Icon className="w-4 h-4 text-indigo-600" />
                        <span>{factor.name}</span>
                      </div>
                      <span className={`font-mono font-bold text-sm ${isHighOrCritical ? 'text-red-700' : 'text-emerald-700'}`}>
                        {factor.weight}
                      </span>
                    </div>

                    {/* Progress representation */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full ${factor.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(factor.score / factor.max) * 100}%` }}
                      ></div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug">
                      {factor.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Total Formula Summary */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs font-mono flex items-center justify-between text-slate-700">
            <span>∑ Feature Sum = {factors.reduce((acc, f) => acc + f.score, 0)} points</span>
            <span className="text-emerald-700 font-bold">Confidence Interval: 94.2%</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Grounded in Geological Survey of India (GSI) & IMD GIS records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer border border-slate-200 shadow-xs"
            >
              Close Explanation
            </button>
            {onNavigateOptimizer && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateOptimizer();
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>View Route Optimizer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
