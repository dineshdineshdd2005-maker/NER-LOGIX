import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LiveDemoModal } from './components/LiveDemoModal';
import { DashboardView } from './views/DashboardView';
import { LoginView } from './views/LoginView';
import { MapView } from './views/MapView';
import { AiRiskPredictionView } from './views/AiRiskPredictionView';
import { RouteOptimizerView } from './views/RouteOptimizerView';
import { TrackingView } from './views/TrackingView';
import { WeatherMonitoringView } from './views/WeatherMonitoringView';
import { FieldReportingView } from './views/FieldReportingView';
import { AlertsCenterView } from './views/AlertsCenterView';
import { DeliveriesView } from './views/DeliveriesView';
import { AnalyticsView } from './views/AnalyticsView';
import { AdminPanelView } from './views/AdminPanelView';
import { FcmAlertBanner } from './components/FcmAlertBanner';
import { FcmNotificationCenter } from './components/FcmNotificationCenter';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, toast, isFcmOpen, setIsFcmOpen } = useApp();

  // If user is on the login tab, render a focused login view without the full sidebar
  if (activeTab === 'login') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <LoginView />
        </main>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'map':
        return <MapView />;
      case 'risk-prediction':
        return <AiRiskPredictionView />;
      case 'optimizer':
        return <RouteOptimizerView />;
      case 'tracking':
        return <TrackingView />;
      case 'weather':
        return <WeatherMonitoringView />;
      case 'field-reports':
        return <FieldReportingView />;
      case 'alerts':
        return <AlertsCenterView />;
      case 'deliveries':
        return <DeliveriesView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'admin':
        return <AdminPanelView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white antialiased">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Center Workstation View Area */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-12 bg-slate-100">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating Interactive Live Demo Controller */}
      <LiveDemoModal />

      {/* Firebase Cloud Messaging Real-time Push Alert Banner */}
      <FcmAlertBanner />

      {/* FCM Notification Center & Dispatch Modal */}
      <FcmNotificationCenter isOpen={isFcmOpen} onClose={() => setIsFcmOpen(false)} />

      {/* Global Toast Notification System */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-200">
          <div className={`p-3.5 rounded-xl border shadow-lg backdrop-blur-md flex items-start gap-3 bg-white ${
            toast.type === 'error'
              ? 'border-red-200 text-slate-800'
              : toast.type === 'warning'
                ? 'border-amber-200 text-slate-800'
                : toast.type === 'info'
                  ? 'border-indigo-200 text-slate-800'
                  : 'border-emerald-200 text-slate-800'
          }`}>
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />}
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs font-semibold leading-relaxed text-slate-800">
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
