import React from 'react';
import { useApp, NavTab } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Navigation, 
  Route, 
  BrainCircuit, 
  CloudRain, 
  FileText, 
  Truck, 
  Map as MapIcon, 
  BarChart3, 
  Bell, 
  ShieldCheck, 
  Settings,
  Sparkles,
  ChevronRight,
  WifiOff,
  Boxes
} from 'lucide-react';

interface SidebarItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  sihHighlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    alerts, 
    vehicles, 
    fieldReports, 
    deliveries,
    redistributionSuggestions,
    isOffline,
    currentUser,
    startLiveDemo,
    isDemoRunning
  } = useApp();

  const unacknowledgedAlerts = alerts.filter(a => !a.isAcknowledged).length;
  const activeVehicles = vehicles.filter(v => v.status === 'In Transit').length;
  const pendingReports = fieldReports.filter(r => r.status === 'Pending').length;
  const criticalRedistributions = redistributionSuggestions.filter(r => r.urgency === 'CRITICAL').length;

  const coreNavItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'supply-inventory',
      label: 'Supply Redistribution',
      icon: Boxes,
      badge: criticalRedistributions > 0 ? `${criticalRedistributions} Alert` : redistributionSuggestions.length || undefined,
      badgeColor: criticalRedistributions > 0 ? 'bg-red-600' : 'bg-indigo-600',
      sihHighlight: true,
    },
    {
      id: 'tracking',
      label: 'Live Tracking',
      icon: Navigation,
      badge: activeVehicles,
      badgeColor: 'bg-indigo-600',
    },
    {
      id: 'optimizer',
      label: 'Route Optimizer',
      icon: Route,
      sihHighlight: true,
    },
    {
      id: 'risk-prediction',
      label: 'AI Risk Prediction',
      icon: BrainCircuit,
      sihHighlight: true,
    },
    {
      id: 'weather',
      label: 'Weather Intelligence',
      icon: CloudRain,
      badge: 'Monsoon',
      badgeColor: 'bg-cyan-600',
    },
    {
      id: 'field-reports',
      label: 'Field Reports',
      icon: FileText,
      badge: pendingReports > 0 ? pendingReports : undefined,
      badgeColor: 'bg-purple-600',
    },
    {
      id: 'map',
      label: 'GIS Map',
      icon: MapIcon,
    },
  ];

  const managementNavItems: SidebarItem[] = [
    {
      id: 'deliveries',
      label: 'Deliveries',
      icon: Truck,
      badge: deliveries.length,
      badgeColor: 'bg-slate-700',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: unacknowledgedAlerts > 0 ? unacknowledgedAlerts : undefined,
      badgeColor: 'bg-red-600',
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: ShieldCheck,
    },
    {
      id: 'login',
      label: 'Session & Auth',
      icon: ShieldCheck,
      badge: currentUser?.authProvider === 'google.com' ? 'Google' : 'Live',
      badgeColor: 'bg-indigo-600',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-white text-slate-700 border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-64px)] sticky top-16 select-none flex-shrink-0 shadow-xs">
      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Core Operations
        </div>

        {coreNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : item.sihHighlight 
                      ? 'border border-indigo-200 bg-indigo-50/60 text-indigo-600' 
                      : 'border border-slate-200 bg-slate-50 text-slate-500 group-hover:border-slate-300'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${item.badgeColor || 'bg-slate-500'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 pb-2 px-3 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Management
        </div>

        {managementNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'border border-slate-200 bg-slate-50 text-slate-500 group-hover:border-slate-300'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${item.badgeColor || 'bg-slate-500'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Start Live Demo Action */}
      <div className="p-4 border-t border-slate-200 space-y-2 bg-slate-50/50">
        <button
          onClick={startLiveDemo}
          className="w-full flex items-center gap-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-xs font-bold cursor-pointer justify-center transition-colors shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isDemoRunning ? 'RESUME LIVE DEMO' : 'START LIVE DEMO'}</span>
        </button>

        {isOffline && (
          <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-[11px] text-amber-800 flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold">Offline Mode Active</div>
              <div className="text-[9px] text-amber-700">Local queue active</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
