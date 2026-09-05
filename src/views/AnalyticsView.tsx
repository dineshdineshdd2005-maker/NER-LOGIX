import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Mountain, 
  Percent, 
  Layers, 
  Download,
  Calendar
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { routes, vehicles, alerts, showToast } = useApp();

  const monthlyLandslides = [
    { month: 'May', incidents: 14, rainfallMm: 120 },
    { month: 'Jun', incidents: 42, rainfallMm: 380 },
    { month: 'Jul', incidents: 86, rainfallMm: 620 },
    { month: 'Aug', incidents: 94, rainfallMm: 690 },
    { month: 'Sep (Current)', incidents: 51, rainfallMm: 410 },
    { month: 'Oct (Proj)', incidents: 18, rainfallMm: 140 },
  ];

  const maxIncidents = Math.max(...monthlyLandslides.map(m => m.incidents));

  const corridorRisks = [
    { highway: 'NH-13 (Bhalukpong-Tawang Axis)', riskScore: 88, status: 'Critical', slides: 34 },
    { highway: 'NH-29 (Dimapur-Kohima Corridor)', riskScore: 72, status: 'High', slides: 21 },
    { highway: 'NH-06 (Shillong-Silchar Axis)', riskScore: 64, status: 'Moderate', slides: 16 },
    { highway: 'NH-102 (Imphal-Moreh Gateway)', riskScore: 48, status: 'Moderate', slides: 9 },
    { highway: 'NH-27 (Guwahati-Nagaon East-West)', riskScore: 22, status: 'Low', slides: 3 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Regional Accessibility & Safety Analytics
            </h1>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold uppercase border border-indigo-200">
              Monsoon Season Threat Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Historical incident metrics, AI disruption avoidance benchmarks, and infrastructure vulnerability indices for the North Eastern Region.
          </p>
        </div>

        <button
          onClick={() => showToast('Exporting NER Accessibility Audit Report (PDF/GeoJSON)...', 'info')}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {/* Top 4 Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-1 text-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Safety Improvement</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            +38.4%
          </div>
          <p className="text-[11px] text-slate-500">
            Reduction in stranded freight vehicles via predictive rerouting.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-1 text-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Average Delay Reduction</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600">
            -4.2 Hours
          </div>
          <p className="text-[11px] text-slate-500">
            Saved per critical medical delivery run to remote hill districts.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-1 text-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Monsoon Incidents</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">
            287 Logged
          </div>
          <p className="text-[11px] text-slate-500">
            Landslides, flash floods & bridge damage records across 8 states.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-1 text-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Essential Deliveries Completed</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600">
            99.2%
          </div>
          <p className="text-[11px] text-slate-500">
            Zero loss of emergency life-saving cold-chain consignments.
          </p>
        </div>
      </div>

      {/* Main Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Landslide Frequency Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-amber-600" />
              Monsoon Landslide Frequency & Precipitation Correlation
            </span>
            <span className="text-[10px] text-slate-400 font-mono">2026 NER Weather Archive</span>
          </div>

          {/* Custom Responsive High-Contrast Bar Chart */}
          <div className="space-y-3 pt-2">
            {monthlyLandslides.map((item) => {
              const barWidth = Math.round((item.incidents / maxIncidents) * 100);
              return (
                <div key={item.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 w-28">{item.month}</span>
                    <div className="flex items-center gap-4 text-[11px] font-mono">
                      <span className="text-slate-500">Rainfall: <b className="text-cyan-700">{item.rainfallMm} mm</b></span>
                      <span className="font-bold text-amber-700 w-20 text-right">{item.incidents} slides</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.incidents > 70 ? 'bg-red-500' :
                        item.incidents > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <span className="font-semibold text-slate-800">Analytical Finding: </span>
            Peak vulnerability occurs between July and August when cumulative soil moisture saturation exceeds 85%, triggering deep-seated rotational slides in phyllite geological formations.
          </div>
        </div>

        {/* Right: Prone Highways & Bottlenecks Vulnerability Table (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              High-Risk Corridor Vulnerability Index
            </span>
            <span className="text-[10px] text-slate-400 font-mono">GIS Ranking</span>
          </div>

          <div className="space-y-2.5">
            {corridorRisks.map((corridor, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">{corridor.highway}</div>
                  <div className="text-[10px] text-slate-500">
                    Documented slides this season: <b className="text-amber-700">{corridor.slides}</b>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    corridor.riskScore > 75 ? 'bg-red-50 text-red-700 border border-red-200' :
                    corridor.riskScore > 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {corridor.riskScore}/100 Risk
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs text-slate-700 leading-relaxed">
            <span className="font-bold block text-indigo-900 mb-1">AI Recommendation for Ministry Planners:</span>
            Prioritize rock-netting and prefabricated Bailey bridge staging at NH-13 Km 112 (Bomdila) and NH-29 Pagla Pahar to ensure round-the-clock accessibility.
          </div>
        </div>
      </div>
    </div>
  );
};
