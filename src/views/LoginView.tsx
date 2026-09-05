import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, User } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Truck, 
  UserCheck, 
  ChevronRight, 
  Sparkles, 
  Compass, 
  Mountain, 
  Radio, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { setCurrentUser, setActiveTab, showToast } = useApp();

  const [email, setEmail] = useState('admin@ner-logix.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Administrator');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Find matching demo user or create session user
      const matched = DEMO_USERS.find(u => u.role === selectedRole) || DEMO_USERS[0];
      setCurrentUser(matched);
      setIsLoading(false);
      showToast(`Welcome ${matched.name}! Authenticated as ${matched.role}.`, 'success');
      setActiveTab('dashboard');
    }, 600);
  };

  const handleQuickLogin = (demoUser: User) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentUser(demoUser);
      setIsLoading(false);
      showToast(`Quick Logged In as ${demoUser.role} (${demoUser.name})`, 'success');
      setActiveTab('dashboard');
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-53px)] bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-400/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-md shadow-indigo-600/20 mb-2">
            NER
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            NER-LOGIX
          </h1>
          <p className="text-xs text-indigo-600 font-semibold tracking-wide">
            Predict. Reroute. Track. Respond.
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            AI-Based Smart Logistics & Accessibility Intelligence Platform for the North Eastern Region of India
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Secure Role-Based Access
            </span>
            <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              SIH Sandbox
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email / ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="name@ner-logix.gov.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operational Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Administrator">Administrator (Ministry & Command)</option>
                <option value="Logistics Operator">Logistics Operator (Fleet Management)</option>
                <option value="Driver">Driver (Mountain Corridor Navigation)</option>
                <option value="Field Officer">Field Officer (BRO / Ground Reporting)</option>
                <option value="Government / Disaster Management Officer">Government / Disaster Management Officer (NDMA / SDMA)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Radio className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick One-Click Demo Logins for Jury */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              One-Click Demo Profiles (For SIH Jury Evaluation):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 border border-slate-200 p-2.5 rounded-lg text-left transition cursor-pointer group shadow-xs"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                    {u.role.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {u.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          Ministry of Development of North Eastern Region (MDoNER) · Border Roads Organisation (BRO)
        </p>
      </div>
    </div>
  );
};
