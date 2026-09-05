import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  X, 
  Truck, 
  AlertTriangle, 
  ShieldCheck, 
  Navigation, 
  CloudRain, 
  BrainCircuit, 
  FileCheck2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const LiveDemoModal: React.FC = () => {
  const { 
    isDemoRunning, 
    demoStep, 
    nextDemoStep, 
    prevDemoStep, 
    resetDemo, 
    stopDemo, 
    activeTab 
  } = useApp();

  if (!isDemoRunning) return null;

  const demoStepsInfo = [
    {
      step: 1,
      title: 'Mission Initialized: Guwahati → Tawang Medical Corridor',
      narrative: 'Consignment DEL-9901 loaded with Emergency Blood, Saline & Vaccines dispatched on Refrigerated Truck NER-TRUCK-104.',
      aiAction: 'AI initializes multi-source GIS & telematics pipeline. Default route: NH-13 via Bhalukpong.',
      module: 'Dashboard & Mission Control',
      badge: 'Normal Transit',
      badgeColor: 'bg-blue-600',
    },
    {
      step: 2,
      title: 'Monsoon Alert: High Intensity Rainfall Detected',
      narrative: 'Doppler Weather Radar at Tezpur records intense cloudburst (>68mm/hr) in West Kameng hills.',
      aiAction: 'Precipitation index crosses critical threshold. Soil saturation model triggers warning.',
      module: 'Weather & Disaster Intelligence',
      badge: 'Weather Warning',
      badgeColor: 'bg-cyan-600',
    },
    {
      step: 3,
      title: 'AI Prediction: Landslide Risk Escalates to 92/100',
      narrative: 'Steep slopes (>38°) + loose phyllite rock + continuous rain trigger extreme hazard warning.',
      aiAction: 'XGBoost ML engine predicts high probability (88%) of slope failure along NH-13 Sela Pass approach.',
      module: 'AI Route Risk Prediction',
      badge: 'Critical Hazard',
      badgeColor: 'bg-red-600',
    },
    {
      step: 4,
      title: 'Ground Reality: Road Blockage on NH-13 Km 112',
      narrative: 'Active debris fall and boulders block both carriage lanes near Bomdila. Traffic halted.',
      aiAction: 'GIS map updates with red hazard barricade marker. Vehicle NER-TRUCK-104 approaching danger zone.',
      module: 'GIS Map & Sensors',
      badge: 'Road Blocked',
      badgeColor: 'bg-red-600',
    },
    {
      step: 5,
      title: 'Real-Time Alert Broadcast: Reroute Advised',
      narrative: 'Central logistics dashboard generates CRITICAL alert. Driver and fleet command notified.',
      aiAction: 'Automated alert triggers urgent diversion prompt for medical carrier NER-TRUCK-104.',
      module: 'Real-Time Alerts Center',
      badge: 'Critical Alert',
      badgeColor: 'bg-red-600',
    },
    {
      step: 6,
      title: 'Field Officer Verification: Ground Report Synced',
      narrative: 'BRO Field Officer Capt. Anirudh Sharma verifies blockage on site with GPS-tagged damage report.',
      aiAction: 'PostGIS spatial database marks NH-13 corridor CLOSED. Alternate corridor routing enabled.',
      module: 'Field Reporting Module',
      badge: 'Field Validated',
      badgeColor: 'bg-purple-600',
    },
    {
      step: 7,
      title: 'AI Optimizer: Alternate Safe Route B Computed',
      narrative: 'AI analyzes 3 alternate passes and isolates the Orang-Kalaktang-Shergaon bypass.',
      aiAction: 'Route B: 475 km (+45m longer), but Risk Score is only 24/100 (LOW). Designated as AI RECOMMENDED ROUTE.',
      module: 'Smart Route Optimizer',
      badge: 'Corridor Optimized',
      badgeColor: 'bg-emerald-600',
    },
    {
      step: 8,
      title: 'Digital Dispatch: Telematics Reroute Order Sent',
      narrative: 'Reroute instruction sent directly to driver cab interface and regional transport authority.',
      aiAction: 'Dynamic waypoints uploaded to truck navigation unit. Safe corridor waypoints locked.',
      module: 'Live Vehicle Tracking',
      badge: 'Command Sent',
      badgeColor: 'bg-blue-600',
    },
    {
      step: 9,
      title: 'Vehicle Diverted: Moving to Kalaktang Safe Valley',
      narrative: 'Driver Tenzing Norbu executes turn onto State Highway 5 bypass toward Kalaktang.',
      aiAction: 'GPS tracker verifies vehicle diverted away from red landslide zone into emerald safe corridor.',
      module: 'GIS Map Real-Time',
      badge: 'Reroute Executed',
      badgeColor: 'bg-emerald-600',
    },
    {
      step: 10,
      title: 'Safe Transit: Stabilized Terrain & Speed Maintained',
      narrative: 'Truck cruises at 52 km/h through gentle valley slopes with reinforced all-weather drainage.',
      aiAction: 'Risk Level plummets to LOW. Cold chain temperature remains stable at +3.8°C.',
      module: 'Live Telematics',
      badge: 'Safe Navigation',
      badgeColor: 'bg-emerald-600',
    },
    {
      step: 11,
      title: 'Mission Accomplished: Emergency Delivery Completed',
      narrative: 'Consignment DEL-9901 safely reaches Tawang District Hospital without disruption.',
      aiAction: 'Delivery marked COMPLETED. Life-saving medical supplies delivered on schedule through AI resilience!',
      module: 'Logistics Deliveries',
      badge: 'Delivery Completed',
      badgeColor: 'bg-emerald-600',
    },
  ];

  const currentInfo = demoStepsInfo[demoStep - 1] || demoStepsInfo[0];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 select-none">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl p-4 text-slate-800 space-y-3">
        {/* Top Header & Progress Stepper */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-sm tracking-wide text-slate-900 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              SIH LIVE DEMONSTRATION WORKFLOW
            </span>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded-full border border-indigo-200">
              Step {demoStep} of 11
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Active View: <b className="text-slate-800 capitalize">{activeTab}</b>
            </span>
            <button
              onClick={stopDemo}
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition cursor-pointer"
              title="Close Demo Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-between gap-1 py-1">
          {demoStepsInfo.map((s) => (
            <div
              key={s.step}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s.step < demoStep
                  ? 'bg-emerald-500'
                  : s.step === demoStep
                    ? 'bg-indigo-600 ring-2 ring-indigo-300 scale-y-125'
                    : 'bg-slate-200'
              }`}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Current Step Narrative Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="md:col-span-8 space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider text-white ${currentInfo.badgeColor}`}>
                {currentInfo.badge}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {currentInfo.title}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              {currentInfo.narrative}
            </p>
            <p className="text-[11px] text-indigo-700 font-medium flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{currentInfo.aiAction}</span>
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col gap-1.5 justify-center sm:border-l sm:border-slate-200 sm:pl-3">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={prevDemoStep}
                disabled={demoStep <= 1}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 text-xs font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                onClick={nextDemoStep}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
              >
                <span>{demoStep >= 11 ? 'Finish Demo' : 'Next Step'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={resetDemo}
              className="text-[11px] text-slate-500 hover:text-slate-800 py-0.5 flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Start</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
