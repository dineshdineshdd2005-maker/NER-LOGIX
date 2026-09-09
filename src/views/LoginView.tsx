import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, User } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User as UserIcon,
  ChevronRight, 
  Sparkles, 
  Radio, 
  CheckCircle2,
  Building,
  KeyRound,
  LogOut,
  ArrowRight,
  Clock,
  ExternalLink
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    setActiveTab, 
    showToast,
    loginWithGoogle,
    loginWithOperationalSession,
    logoutUser,
    sessionDurationMinutes,
    sessionStartTime
  } = useApp();

  const [authMode, setAuthMode] = useState<'google' | 'operational'>('google');
  const [name, setName] = useState('Dinesh D');
  const [email, setEmail] = useState('dineshdineshdd2005@gmail.com');
  const [password, setPassword] = useState('NER-Secure-Auth-2025');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Administrator');
  const [department, setDepartment] = useState('Ministry of Development of North Eastern Region (MDoNER)');
  const [badgeId, setBadgeId] = useState('NER-ADM-704');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Quick department presets for operational profile configuration
  const DEPARTMENT_OPTIONS = [
    {
      role: 'Administrator' as UserRole,
      dept: 'Ministry of Development of North Eastern Region (MDoNER)',
      badge: 'NER-ADM-704',
      name: 'Dinesh D',
      email: 'dineshdineshdd2005@gmail.com'
    },
    {
      role: 'Logistics Operator' as UserRole,
      dept: 'Northeastern Fleet Logistics & Dispatch Command',
      badge: 'NER-LOG-302',
      name: 'Priyanka Gogoi',
      email: 'logistics.dispatch@ner-logix.gov.in'
    },
    {
      role: 'Government / Disaster Management Officer' as UserRole,
      dept: 'State Disaster Management Authority (SDMA / NDMA)',
      badge: 'NER-DMA-512',
      name: 'K. Lalrinzuala, IAS',
      email: 'disaster.coord@sdma.gov.in'
    },
    {
      role: 'Field Officer' as UserRole,
      dept: 'Border Roads Organisation (BRO / Project Vartak)',
      badge: 'BRO-GREF-884',
      name: 'Capt. Anirudh Sharma',
      email: 'field.bomdila@bro.gov.in'
    },
    {
      role: 'Driver' as UserRole,
      dept: 'Essential Mountain Fleet - Unit 4 (Tawang Corridor)',
      badge: 'NER-DRV-104',
      name: 'Tenzing Norbu',
      email: 'driver.tenzing@ner-logix.gov.in'
    }
  ];

  const handleApplyPreset = (preset: typeof DEPARTMENT_OPTIONS[0]) => {
    setSelectedRole(preset.role);
    setDepartment(preset.dept);
    setBadgeId(preset.badge);
    setName(preset.name);
    setEmail(preset.email);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google sign-in attempt warning:', err);
      setAuthError(err?.message || 'Google Auth Popup closed or cancelled. You can also use the Operational Session form below.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOperationalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      await loginWithOperationalSession({
        name,
        email,
        role: selectedRole,
        department,
        badgeId
      });
    } catch (err: any) {
      console.error('Operational auth error:', err);
      setAuthError(err?.message || 'Failed to initialize session. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-53px)] bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-400/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 my-6">
        {/* Header Branding */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-md shadow-indigo-600/20 mb-2">
            NER
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            NER-LOGIX
          </h1>
          <p className="text-xs text-indigo-600 font-semibold tracking-wide uppercase">
            AI-Based Smart Logistics & Disaster Management Platform
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Persistent Multi-Role Session Management · Cloud Firestore Synchronized
          </p>
        </div>

        {/* ACTIVE SESSION CARD (If User already has an authenticated session) */}
        {currentUser && (
          <div className="mb-5 bg-white border border-indigo-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-indigo-50 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-800">Current Active Session</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                {currentUser.authProvider === 'google.com' ? 'Google Auth' : 'Operational Portal'}
              </span>
            </div>

            <div className="flex items-start justify-between gap-3 text-xs mb-3">
              <div>
                <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
                <div className="text-slate-500 text-[11px] font-mono">{currentUser.email}</div>
                <div className="text-indigo-600 font-semibold mt-0.5">{currentUser.role}</div>
                <div className="text-slate-400 text-[10px]">{currentUser.department}</div>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <div>Badge: <span className="font-mono font-bold text-slate-700">{currentUser.badgeId}</span></div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 justify-end">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Session: {sessionDurationMinutes}m</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Continue to Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={logoutUser}
                className="px-3 py-2 border border-slate-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                title="End current active session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Authentication Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Secure Session Authentication
            </span>
            <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              Firestore Persistent
            </span>
          </div>

          {/* Auth Method Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setAuthMode('google')}
              className={`py-2 px-3 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'google'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google Sign-In</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('operational')}
              className={`py-2 px-3 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'operational'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Operational Portal</span>
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>Authentication Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-700">{authError}</p>
            </div>
          )}

          {/* TAB 1: GOOGLE FIREBASE AUTHENTICATION */}
          {authMode === 'google' ? (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
                <p className="font-semibold text-slate-800">
                  Authenticate with your official Google Workspace / Google Account:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
                  <li>Direct Firebase Authentication token exchange via popup</li>
                  <li>Automatic profile persistence to Firestore (<span className="font-mono text-indigo-600">/users/{'{userId}'}</span>)</li>
                  <li>Restores existing role privileges and custom clearances</li>
                </ul>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Radio className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Contacting Firebase Auth...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase font-semibold">Or configure operational session</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={() => setAuthMode('operational')}
                className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 py-1 cursor-pointer"
              >
                Use Official Officer / Agency Passcode Sign-In →
              </button>
            </div>
          ) : (
            /* TAB 2: OPERATIONAL PORTAL FORM */
            <form onSubmit={handleOperationalSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Personnel Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Dinesh D"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="dineshdineshdd2005@gmail.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Logistics Operator">Logistics Operator</option>
                    <option value="Driver">Driver</option>
                    <option value="Field Officer">Field Officer</option>
                    <option value="Government / Disaster Management Officer">Disaster Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge / Unit ID
                  </label>
                  <input
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Organization
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Security Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Radio className="w-4 h-4 animate-spin text-white" />
                    <span>Synchronizing Session to Firestore...</span>
                  </>
                ) : (
                  <>
                    <span>Activate Operational Session</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Preset Roles for Quick Evaluation & Testing */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Quick Select Department Persona:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DEPARTMENT_OPTIONS.map((preset) => (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-2 rounded-lg text-left transition border text-xs cursor-pointer ${
                    selectedRole === preset.role
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-semibold truncate">{preset.role}</div>
                  <div className="text-[10px] text-slate-500 truncate">{preset.name}</div>
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
