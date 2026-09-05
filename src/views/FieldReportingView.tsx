import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { DisruptionType, SeverityLevel, FieldReport } from '../types';
import { 
  FileText, 
  MapPin, 
  AlertTriangle, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Send, 
  Clock, 
  Smartphone, 
  Monitor,
  ShieldCheck,
  Radio,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Trash2,
  Check,
  Mic,
  MicOff,
  Volume2,
  Car
} from 'lucide-react';
import { VoiceReportingAssistant, VoiceParsedData } from '../components/VoiceReportingAssistant';

const FIELD_REPORT_DRAFT_KEY = 'ner_logix_field_report_draft_v1';

interface FieldReportDraftData {
  reportType: DisruptionType;
  locationName: string;
  roadName: string;
  lat: number;
  lng: number;
  severity: SeverityLevel;
  description: string;
  photoPreview: string | null;
  savedAt: string;
}

const DEFAULT_FORM_VALUES = {
  reportType: 'Landslide' as DisruptionType,
  locationName: 'NH-13 Km 112 between Bomdila and Dirang',
  roadName: 'NH-13 Trans-Arunachal Highway',
  lat: 27.2840,
  lng: 92.3850,
  severity: 'CRITICAL' as SeverityLevel,
  description: 'Severe slope failure across both carriage lanes following heavy morning cloudburst. Estimated 80 tons of mud and boulder debris.',
  photoPreview: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80' as string | null,
};

const getSavedDraft = (): FieldReportDraftData | null => {
  try {
    const raw = localStorage.getItem(FIELD_REPORT_DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as FieldReportDraftData;
      }
    }
  } catch (err) {
    console.warn('Unable to load field report draft from local storage:', err);
  }
  return null;
};

export const FieldReportingView: React.FC = () => {
  const { 
    fieldReports, 
    addFieldReport, 
    isOffline, 
    setIsOffline, 
    offlineQueue, 
    syncOfflineReports, 
    syncStatus,
    currentUser,
    setActiveTab,
    showToast 
  } = useApp();

  const [mobileViewMode, setMobileViewMode] = useState<boolean>(false);

  const initialDraft = getSavedDraft();

  // Form states initialized with local storage draft if available
  const [reportType, setReportType] = useState<DisruptionType>(() => initialDraft?.reportType || DEFAULT_FORM_VALUES.reportType);
  const [locationName, setLocationName] = useState<string>(() => initialDraft?.locationName ?? DEFAULT_FORM_VALUES.locationName);
  const [roadName, setRoadName] = useState<string>(() => initialDraft?.roadName ?? DEFAULT_FORM_VALUES.roadName);
  const [lat, setLat] = useState<number>(() => initialDraft?.lat ?? DEFAULT_FORM_VALUES.lat);
  const [lng, setLng] = useState<number>(() => initialDraft?.lng ?? DEFAULT_FORM_VALUES.lng);
  const [severity, setSeverity] = useState<SeverityLevel>(() => initialDraft?.severity || DEFAULT_FORM_VALUES.severity);
  const [description, setDescription] = useState<string>(() => initialDraft?.description ?? DEFAULT_FORM_VALUES.description);
  const [officerName, setOfficerName] = useState(currentUser?.name || 'Capt. Anirudh Sharma');
  const [officerBadge, setOfficerBadge] = useState(currentUser?.badgeId || 'BRO-GREF-884');
  const [photoPreview, setPhotoPreview] = useState<string | null>(() => initialDraft?.photoPreview ?? DEFAULT_FORM_VALUES.photoPreview);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Auto-save & draft restoration tracking
  const [lastDraftSavedTime, setLastDraftSavedTime] = useState<string | null>(() => initialDraft?.savedAt || null);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(() => Boolean(initialDraft?.savedAt));
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);

  // Automatically persist form draft to local storage on every edit
  useEffect(() => {
    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      try {
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const draft: FieldReportDraftData = {
          reportType,
          locationName,
          roadName,
          lat,
          lng,
          severity,
          description,
          photoPreview,
          savedAt: timeString,
        };
        localStorage.setItem(FIELD_REPORT_DRAFT_KEY, JSON.stringify(draft));
        setLastDraftSavedTime(timeString);
      } catch (e) {
        // Fallback without image if local storage quota is reached
        try {
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const draft: FieldReportDraftData = {
            reportType,
            locationName,
            roadName,
            lat,
            lng,
            severity,
            description,
            photoPreview: null,
            savedAt: timeString,
          };
          localStorage.setItem(FIELD_REPORT_DRAFT_KEY, JSON.stringify(draft));
          setLastDraftSavedTime(timeString);
        } catch (innerError) {
          console.warn('Failed to persist draft to local storage', innerError);
        }
      } finally {
        setIsAutoSaving(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [reportType, locationName, roadName, lat, lng, severity, description, photoPreview]);

  const handleDiscardDraft = () => {
    localStorage.removeItem(FIELD_REPORT_DRAFT_KEY);
    setReportType('Landslide');
    setLocationName('');
    setRoadName('');
    setLat(27.2840);
    setLng(92.3850);
    setSeverity('MEDIUM');
    setDescription('');
    setPhotoPreview(null);
    setLastDraftSavedTime(null);
    setShowRestoredNotice(false);
    showToast('Draft discarded. Form cleared for fresh reporting.', 'info');
  };

  // Hands-Free Web Speech API states
  const [isHandsFreeActive, setIsHandsFreeActive] = useState<boolean>(false);
  const [activeFieldDictating, setActiveFieldDictating] = useState<'description' | 'locationName' | 'roadName' | null>(null);
  const fieldRecognitionRef = useRef<any>(null);

  const startFieldDictation = (field: 'description' | 'locationName' | 'roadName') => {
    if (activeFieldDictating === field) {
      if (fieldRecognitionRef.current) {
        try { fieldRecognitionRef.current.stop(); } catch (e) {}
      }
      setActiveFieldDictating(null);
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      showToast('Web Speech API not supported in this browser. Use the Hands-Free Voice Simulation presets.', 'warning');
      return;
    }

    try {
      if (fieldRecognitionRef.current) {
        try { fieldRecognitionRef.current.stop(); } catch (e) {}
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setActiveFieldDictating(field);
        showToast(`Microphone active. Dictate your ${field === 'description' ? 'situation description' : field === 'locationName' ? 'landmark' : 'highway'} now...`, 'info');
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          }
        }

        if (finalStr) {
          const trimmed = finalStr.trim();
          if (field === 'description') {
            setDescription(prev => (prev ? `${prev} ${trimmed}` : trimmed));
          } else if (field === 'locationName') {
            setLocationName(prev => (prev ? `${prev} ${trimmed}` : trimmed));
          } else if (field === 'roadName') {
            setRoadName(prev => (prev ? `${prev} ${trimmed}` : trimmed));
          }
          showToast(`Voice transcribed into ${field === 'description' ? 'description' : 'field'}.`, 'success');
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Field voice recognition error:', err);
        setActiveFieldDictating(null);
      };

      recognition.onend = () => {
        setActiveFieldDictating(null);
      };

      fieldRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start single field dictation:', err);
      setActiveFieldDictating(null);
    }
  };

  const handleApplyVoiceParsedData = (data: VoiceParsedData) => {
    if (data.reportType) {
      setReportType(data.reportType);
    }
    if (data.severity) {
      setSeverity(data.severity);
    }
    if (data.locationName) {
      setLocationName(data.locationName);
    }
    if (data.roadName) {
      setRoadName(data.roadName);
    }
    if (data.descriptionSnippet) {
      setDescription(prev => {
        if (!prev) return data.descriptionSnippet!;
        if (prev.toLowerCase().includes(data.descriptionSnippet!.toLowerCase())) {
          return prev;
        }
        return `${prev} ${data.descriptionSnippet!}`;
      });
    }
  };

  const handleVoiceSubmit = () => {
    const loc = locationName.trim() || 'NH-13 Mountain Sector';
    const road = roadName.trim() || 'NH-13 Trans-Arunachal Highway';
    const desc = description.trim() || 'Urgent mountain obstruction logged via Hands-Free Voice Dictation.';

    setIsSubmitting(true);
    setTimeout(() => {
      addFieldReport({
        reportType,
        locationName: loc,
        roadName: road,
        coords: { lat, lng },
        severity,
        description: desc,
        officerName,
        officerBadge,
        imageUrl: photoPreview || undefined,
      });

      localStorage.removeItem(FIELD_REPORT_DRAFT_KEY);
      setLastDraftSavedTime(null);
      setShowRestoredNotice(false);
      setIsSubmitting(false);
      setSubmissionSuccess(true);

      setReportType('Landslide');
      setLocationName('');
      setRoadName('');
      setDescription('');
      setPhotoPreview(null);
      showToast('Ground report dispatched via Hands-Free Voice Command!', 'success');

      setTimeout(() => {
        setSubmissionSuccess(false);
      }, 4000);
    }, 600);
  };

  const handleFetchCurrentGps = () => {
    // Generate realistic NER coordinates or use browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(parseFloat(pos.coords.latitude.toFixed(4)));
          setLng(parseFloat(pos.coords.longitude.toFixed(4)));
          showToast('GPS Coordinates acquired from device sensor!', 'info');
        },
        () => {
          // Fallback to Bomdila sector
          setLat(27.2840);
          setLng(92.3850);
          showToast('Acquired Himalayan Geo-Node GPS (Bomdila Pass Sector)', 'info');
        }
      );
    } else {
      setLat(27.2840);
      setLng(92.3850);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      addFieldReport({
        reportType,
        locationName,
        roadName,
        coords: { lat, lng },
        severity,
        description,
        officerName,
        officerBadge,
        imageUrl: photoPreview || undefined,
      });

      // Clear draft from local storage upon successful submission
      localStorage.removeItem(FIELD_REPORT_DRAFT_KEY);
      setLastDraftSavedTime(null);
      setShowRestoredNotice(false);

      setIsSubmitting(false);
      setSubmissionSuccess(true);

      // Reset form fields for subsequent reports
      setReportType('Landslide');
      setLocationName('');
      setRoadName('');
      setDescription('');
      setPhotoPreview(null);

      setTimeout(() => {
        setSubmissionSuccess(false);
      }, 4000);
    }, 600);
  };

  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setPhotoPreview(result);
          showToast('Damage inspection photo attached & saved to local draft.', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Field Officer Damage & Blockade Reporting
            </h1>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold uppercase border border-indigo-200">
              BRO / PWD / Police Rapid Ground Truth
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Enables mountain officers and border patrols to log geo-tagged landslides, washed bridges, and washouts even with zero cell coverage.
          </p>
        </div>

        {/* Hands-free Voice Mode & Viewport Simulator Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHandsFreeActive(!isHandsFreeActive)}
            className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs font-semibold ${
              isHandsFreeActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}
            title="Toggle Hands-Free Driving & Voice Dictation Mode"
          >
            {isHandsFreeActive ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                <span>Exit Hands-Free</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
                <span>Hands-Free Mic</span>
              </>
            )}
          </button>

          <button
            onClick={() => setMobileViewMode(!mobileViewMode)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            {mobileViewMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                <span>Switch to Split View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Preview Mobile Handheld View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* HANDS-FREE DRIVING & SPEECH RECOGNITION (Web Speech API) ASSISTANT */}
      <VoiceReportingAssistant
        isHandsFreeActive={isHandsFreeActive}
        onToggleHandsFree={() => setIsHandsFreeActive(!isHandsFreeActive)}
        onApplyParsedData={handleApplyVoiceParsedData}
        onSubmitReport={handleVoiceSubmit}
        onClearDraft={handleDiscardDraft}
        onFetchGps={handleFetchCurrentGps}
        currentValues={{
          reportType,
          severity,
          locationName,
          roadName,
          description,
        }}
      />

      {/* OFFLINE FIRST DEMONSTRATION CALLOUT BANNER (Requirement 13) */}
      <div className={`p-4 rounded-xl border transition-all ${
        isOffline 
          ? 'bg-amber-50 border-amber-200 text-amber-900 ring-1 ring-amber-300' 
          : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
              isOffline ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Offline-First Mountain Resilience: {isOffline ? 'OFFLINE SIMULATION ACTIVE' : 'ONLINE MODE'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  isOffline ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {isOffline ? 'Zero Cellular Signal' : 'Connected to Central Cloud'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                {isOffline
                  ? 'All submitted field reports are safely cached in local storage with cryptographic timestamps and GPS tags.'
                  : 'Central PostGIS cloud connected. Field reports synchronize instantly with logistics dashboard and route recalculators.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOffline && offlineQueue.length > 0 && (
              <button
                onClick={syncOfflineReports}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync {offlineQueue.length} Pending Now</span>
              </button>
            )}

            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer shadow-xs ${
                isOffline
                  ? 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                  : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
              }`}
            >
              {isOffline ? 'Toggle Network Reconnect' : 'Simulate Mountain Network Loss'}
            </button>
          </div>
        </div>

        {/* Sync Status Animation */}
        {syncStatus && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-2.5 rounded-lg flex items-center gap-2 animate-pulse">
            <Radio className="w-4 h-4 text-emerald-600 animate-spin" />
            <span className="font-medium">{syncStatus}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Form Container + Recent Field Reports Feed */}
      <div className={`grid ${mobileViewMode ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 lg:grid-cols-12'} gap-6`}>
        {/* Left/Center Form */}
        <div className={mobileViewMode ? 'w-full' : 'lg:col-span-6'}>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-sm text-slate-900">
                  New Incident Ground Report
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isAutoSaving ? (
                  <span className="text-[11px] text-indigo-600 flex items-center gap-1 font-mono font-medium">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Saving draft...</span>
                  </span>
                ) : lastDraftSavedTime ? (
                  <span 
                    className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 font-mono font-medium"
                    title="Draft auto-saved to local storage. You can safely resume typing if connectivity drops."
                  >
                    <Save className="w-3 h-3 text-emerald-600" />
                    <span>Draft Saved ({lastDraftSavedTime})</span>
                  </span>
                ) : null}
                <span className="text-[10px] text-slate-500 font-mono">
                  Officer: {officerBadge}
                </span>
              </div>
            </div>

            {/* Unsubmitted Draft Restored Callout */}
            {showRestoredNotice && lastDraftSavedTime && (
              <div className="bg-amber-50/90 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-900">Unsubmitted Draft Restored</span>
                    <span className="text-slate-600 text-[11px] block mt-0.5 leading-relaxed">
                      Resumed draft from local storage (Saved at {lastDraftSavedTime}). Field inputs are protected against unexpected connection drops.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowRestoredNotice(false)}
                    className="bg-white hover:bg-amber-100 text-slate-700 text-[11px] font-medium px-2 py-1 rounded border border-amber-200 cursor-pointer transition"
                  >
                    Keep
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    className="bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 text-[11px] font-medium px-2 py-1 rounded border border-rose-200 cursor-pointer transition"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            {submissionSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">Report received successfully!</div>
                  <div className="text-[11px] text-emerald-700">
                    {isOffline ? 'Saved locally in offline cache. Queued for auto-sync.' : 'Broadcast to central GIS map and all approaching vehicles.'}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Report Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disruption Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as DisruptionType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Landslide">Landslide / Debris Fall</option>
                  <option value="Flood">Flood / River Overflow</option>
                  <option value="Road Damage">Road Damage / Pavement Subsidence</option>
                  <option value="Bridge Damage">Bridge Damage / Scour</option>
                  <option value="Accident">Accident / Vehicle Overturn</option>
                  <option value="Road Blockage">Complete Road Blockage</option>
                  <option value="Other">Other Disruption</option>
                </select>
              </div>

              {/* Location & Road Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Specific Landmark / Kilometer
                    </label>
                    <button
                      type="button"
                      onClick={() => startFieldDictation('locationName')}
                      title="Dictate landmark"
                      className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded transition cursor-pointer font-medium ${
                        activeFieldDictating === 'locationName'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                          : 'text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      <Mic className={`w-2.5 h-2.5 ${activeFieldDictating === 'locationName' ? 'text-rose-600 animate-spin' : ''}`} />
                      <span>{activeFieldDictating === 'locationName' ? 'Listening...' : 'Voice'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    required
                    placeholder="e.g. NH-13 Km 112"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Highway / Corridor Name
                    </label>
                    <button
                      type="button"
                      onClick={() => startFieldDictation('roadName')}
                      title="Dictate highway name"
                      className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded transition cursor-pointer font-medium ${
                        activeFieldDictating === 'roadName'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                          : 'text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      <Mic className={`w-2.5 h-2.5 ${activeFieldDictating === 'roadName' ? 'text-rose-600 animate-spin' : ''}`} />
                      <span>{activeFieldDictating === 'roadName' ? 'Listening...' : 'Voice'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={roadName}
                    onChange={(e) => setRoadName(e.target.value)}
                    required
                    placeholder="e.g. NH-13 Trans-Arunachal"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* GPS Coordinates with Auto-Detect */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    GPS Coordinates (Latitude, Longitude)
                  </label>
                  <button
                    type="button"
                    onClick={handleFetchCurrentGps}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Fetch Current GPS</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Latitude"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Longitude"
                  />
                </div>
              </div>

              {/* Severity Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Severity Assessment
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSeverity(lvl)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold uppercase transition cursor-pointer text-center ${
                        severity === lvl
                          ? lvl === 'CRITICAL' ? 'bg-red-600 text-white shadow-xs' :
                            lvl === 'HIGH' ? 'bg-orange-600 text-white shadow-xs' :
                            lvl === 'MEDIUM' ? 'bg-amber-600 text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description with Dedicated Voice Dictation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Detailed Situation Description
                  </label>
                  <button
                    type="button"
                    onClick={() => startFieldDictation('description')}
                    className={`text-[11px] font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded transition cursor-pointer ${
                      activeFieldDictating === 'description'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                        : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    {activeFieldDictating === 'description' ? (
                      <>
                        <Mic className="w-3 h-3 text-rose-600 animate-spin" />
                        <span>Listening (Click to Stop)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3" />
                        <span>Dictate Description</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describe debris volume, lane impassability, estimated clearance time... (Or click 'Dictate Description' to speak hands-free)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Photo Upload Attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Incident Photo Verification (Optional)
                </label>
                <div className="flex items-center gap-3">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Incident proof"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                    />
                  )}
                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 rounded-lg p-3 text-center cursor-pointer transition">
                    <Camera className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                    <span className="text-xs text-indigo-600 font-semibold block">Click to attach camera photo</span>
                    <span className="text-[10px] text-slate-500">Supports JPG, PNG with EXIF tags</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSimulatePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Officer Details (Read-only / pre-filled) */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Reporting Officer</span>
                  <span className="font-semibold text-slate-800">{officerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Badge / Service ID</span>
                  <span className="font-mono text-indigo-600 font-semibold">{officerBadge}</span>
                </div>
              </div>

              {/* SUBMIT BUTTON & DRAFT CONTROLS */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Radio className="w-4 h-4 animate-spin" />
                      <span>Processing Report Cryptographic Hash...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>SUBMIT FIELD REPORT</span>
                    </>
                  )}
                </button>
                {(description || locationName || roadName) && (
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    title="Clear current draft and reset form"
                    className="px-3 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Discard</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: Existing Ground Reports Feed (Visible on split view) */}
        {!mobileViewMode && (
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Ground Reports Log ({fieldReports.length} Items)
              </span>
              <span className="text-[11px] text-emerald-700 font-mono font-medium">
                Auto-Synced to PostGIS Layer
              </span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {fieldReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm text-slate-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {report.reportType}: {report.roadName}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          report.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' :
                          report.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {report.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        📍 {report.locationName} ({report.coords.lat}°N, {report.coords.lng}°E)
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {report.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {report.description}
                  </p>

                  {report.imageUrl && (
                    <div className="pt-1">
                      <img
                        src={report.imageUrl}
                        alt="Site verification"
                        className="h-28 w-full object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-2">
                    <span>Officer: <b className="text-slate-800">{report.officerName}</b> ({report.officerBadge})</span>
                    <span className={`px-2 py-0.5 rounded font-mono font-medium ${
                      report.isSynced ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-amber-700 bg-amber-50 border border-amber-200'
                    }`}>
                      {report.isSynced ? '✓ Synced to GIS' : 'Pending Network'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
