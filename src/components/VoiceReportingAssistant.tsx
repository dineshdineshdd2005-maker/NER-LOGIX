import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DisruptionType, SeverityLevel } from '../types';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  Wand2, 
  RotateCcw,
  Send,
  MapPin,
  HelpCircle,
  Play,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: {
      isFinal: boolean;
      length: number;
      item(index: number): SpeechRecognitionAlternative;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new (): ISpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): ISpeechRecognition;
    };
  }
}

export interface VoiceParsedData {
  reportType?: DisruptionType;
  severity?: SeverityLevel;
  locationName?: string;
  roadName?: string;
  descriptionSnippet?: string;
  command?: 'SUBMIT' | 'CLEAR' | 'GPS' | 'STOP';
}

interface VoiceReportingAssistantProps {
  isHandsFreeActive: boolean;
  onToggleHandsFree: () => void;
  onApplyParsedData: (data: VoiceParsedData) => void;
  onSubmitReport: () => void;
  onClearDraft: () => void;
  onFetchGps: () => void;
  currentValues: {
    reportType: DisruptionType;
    severity: SeverityLevel;
    locationName: string;
    roadName: string;
    description: string;
  };
}

export const VoiceReportingAssistant: React.FC<VoiceReportingAssistantProps> = ({
  isHandsFreeActive,
  onToggleHandsFree,
  onApplyParsedData,
  onSubmitReport,
  onClearDraft,
  onFetchGps,
  currentValues,
}) => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [lastDetectedIntent, setLastDetectedIntent] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>('en-IN');
  const [ttsFeedbackEnabled, setTtsFeedbackEnabled] = useState<boolean>(true);
  const [showCommandsGuide, setShowCommandsGuide] = useState<boolean>(false);
  const [recentDetections, setRecentDetections] = useState<Array<{ text: string; time: string }>>([]);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const shouldRestartRef = useRef<boolean>(false);

  // Audio Text-to-Speech Confirmation
  const speakFeedback = useCallback((text: string) => {
    if (!ttsFeedbackEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = selectedLang;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }, [ttsFeedbackEnabled, selectedLang]);

  // NLP Voice Parsing Engine for Emergency Mountain Field Reports
  const parseSpeechInput = useCallback((phrase: string) => {
    const text = phrase.toLowerCase().trim();
    if (!text) return;

    const detected: VoiceParsedData = {};
    const actions: string[] = [];

    // 1. Direct Voice Commands
    if (text.includes('submit report') || text.includes('send report') || text.includes('dispatch report') || text.includes('submit ground report')) {
      detected.command = 'SUBMIT';
      actions.push('Triggered Submit');
      speakFeedback('Submitting field report to central command network');
      onSubmitReport();
      setLastDetectedIntent('Command: SUBMIT REPORT');
      return;
    }

    if (text.includes('clear form') || text.includes('clear draft') || text.includes('reset draft') || text.includes('discard draft')) {
      detected.command = 'CLEAR';
      actions.push('Cleared Form Draft');
      speakFeedback('Form draft cleared');
      onClearDraft();
      setLastDetectedIntent('Command: CLEAR DRAFT');
      return;
    }

    if (text.includes('fetch gps') || text.includes('get location') || text.includes('current coordinates') || text.includes('acquire gps')) {
      detected.command = 'GPS';
      actions.push('Acquiring GPS');
      speakFeedback('Acquiring current GPS coordinates from sensor');
      onFetchGps();
      setLastDetectedIntent('Command: ACQUIRE GPS');
      return;
    }

    if (text.includes('stop listening') || text.includes('pause voice') || text.includes('stop dictation')) {
      detected.command = 'STOP';
      actions.push('Stopping Dictation');
      speakFeedback('Voice dictation paused');
      onToggleHandsFree();
      setLastDetectedIntent('Command: STOPPED');
      return;
    }

    // 2. Incident Disruption Type Detection
    if (text.includes('landslide') || text.includes('rockfall') || text.includes('mudslide') || text.includes('debris fall') || text.includes('slope failure')) {
      detected.reportType = 'Landslide';
      actions.push('Type: Landslide');
    } else if (text.includes('flood') || text.includes('waterlogging') || text.includes('water logging') || text.includes('river overflow') || text.includes('submerged')) {
      detected.reportType = 'Flood';
      actions.push('Type: Flood');
    } else if (text.includes('bridge damage') || text.includes('bridge washed') || text.includes('bridge scour') || text.includes('culvert damage') || text.includes('bridge crack')) {
      detected.reportType = 'Bridge Damage';
      actions.push('Type: Bridge Damage');
    } else if (text.includes('road damage') || text.includes('pothole') || text.includes('subsidence') || text.includes('pavement collapse') || text.includes('road cave')) {
      detected.reportType = 'Road Damage';
      actions.push('Type: Road Damage');
    } else if (text.includes('accident') || text.includes('crash') || text.includes('overturn') || text.includes('collision')) {
      detected.reportType = 'Accident';
      actions.push('Type: Accident');
    } else if (text.includes('blockage') || text.includes('road block') || text.includes('blocked') || text.includes('jammed') || text.includes('impassable road')) {
      detected.reportType = 'Road Blockage';
      actions.push('Type: Road Blockage');
    }

    // 3. Severity Level Detection
    if (text.includes('critical') || text.includes('code red') || text.includes('emergency') || text.includes('total cutoff') || text.includes('both lanes blocked')) {
      detected.severity = 'CRITICAL';
      actions.push('Severity: CRITICAL');
    } else if (text.includes('high severity') || text.includes('severe') || text.includes('dangerous') || text.includes('heavy damage') || text.includes('priority high')) {
      detected.severity = 'HIGH';
      actions.push('Severity: HIGH');
    } else if (text.includes('medium severity') || text.includes('moderate') || text.includes('partial lane') || text.includes('single lane')) {
      detected.severity = 'MEDIUM';
      actions.push('Severity: MEDIUM');
    } else if (text.includes('low severity') || text.includes('minor') || text.includes('passable')) {
      detected.severity = 'LOW';
      actions.push('Severity: LOW');
    }

    // 4. Location / Highway Extraction
    // Look for phrases like "at NH-13", "on NH 10", "near Bomdila", "kilometer 120"
    const nhMatch = text.match(/(?:on|at|along|near)?\s*(nh[- ]?\d+[a-z]?|trans[- ]arunachal|gs road|assam trunk road)/i);
    if (nhMatch && nhMatch[1]) {
      detected.roadName = nhMatch[1].toUpperCase().replace(/\s+/, '-');
      actions.push(`Road: ${detected.roadName}`);
    }

    const kmMatch = text.match(/(?:at|near|around|kilometer|km)\s*(\d+|bomdila|dirang|tawang|tezu|itanagar|pasighat|ziro|kohima|gangtok|siliguri|dimapur)[^,.]*/i);
    if (kmMatch && kmMatch[0]) {
      const loc = kmMatch[0].trim();
      detected.locationName = loc.charAt(0).toUpperCase() + loc.slice(1);
      actions.push(`Location: ${detected.locationName}`);
    }

    // 5. Append Description Content (filter out strict command words)
    let cleanedDesc = phrase
      .replace(/\b(submit report|send report|clear draft|fetch gps|stop listening|set severity to|severity|report type)\b/gi, '')
      .trim();

    if (cleanedDesc.length > 8) {
      detected.descriptionSnippet = cleanedDesc;
      actions.push('Description updated');
    }

    if (actions.length > 0) {
      onApplyParsedData(detected);
      const actionSummary = actions.join(' · ');
      setLastDetectedIntent(actionSummary);
      setRecentDetections(prev => [
        { text: actionSummary, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
        ...prev.slice(0, 4)
      ]);

      if (detected.severity) {
        speakFeedback(`Severity set to ${detected.severity.toLowerCase()}`);
      } else if (detected.reportType) {
        speakFeedback(`Incident classified as ${detected.reportType}`);
      }
    }
  }, [onApplyParsedData, onSubmitReport, onClearDraft, onFetchGps, onToggleHandsFree, speakFeedback]);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const transcript = res[0].transcript;
          if (res.isFinal) {
            currentFinal += transcript + ' ';
            parseSpeechInput(transcript);
          } else {
            currentInterim += transcript;
          }
        }

        if (currentFinal) {
          setFinalTranscript(prev => (prev + ' ' + currentFinal).trim());
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'no-speech') {
          // Normal when silent in vehicle
          return;
        }
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission blocked. Please allow mic access in browser settings.');
          shouldRestartRef.current = false;
        } else if (event.error === 'network') {
          setSpeechError('Speech recognition service unreachable. Offline dictation engine fallback active.');
        } else {
          setSpeechError(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // If continuous hands-free driving mode is still enabled by user, safely restart
        if (shouldRestartRef.current && isHandsFreeActive) {
          try {
            recognition.start();
          } catch (e) {
            // ignore rapid restart error
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('Failed to init speech recognition:', err);
      setIsSupported(false);
    }

    return () => {
      shouldRestartRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [selectedLang, parseSpeechInput, isHandsFreeActive]);

  // Handle active toggling of hands-free mode
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isHandsFreeActive) {
      shouldRestartRef.current = true;
      try {
        recognitionRef.current.lang = selectedLang;
        recognitionRef.current.start();
        speakFeedback('Hands-free driving dictation mode engaged. Listening for ground reports and voice commands.');
      } catch (e) {
        // Recognition might already be running
      }
    } else {
      shouldRestartRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
      setInterimTranscript('');
    }
  }, [isHandsFreeActive, selectedLang, speakFeedback]);

  // Simulated Voice Samples for Testing (especially if microphone permissions or hardware are absent in sandbox)
  const handleSimulateVoicePhrase = (phrase: string) => {
    setInterimTranscript('');
    setFinalTranscript(prev => (prev ? prev + ' ' + phrase : phrase));
    parseSpeechInput(phrase);
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      isHandsFreeActive 
        ? 'bg-slate-900 border-indigo-500 text-white shadow-lg ring-2 ring-indigo-500/30' 
        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    }`}>
      {/* Top Banner & Mode Toggle */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0 transition-all ${
              isHandsFreeActive
                ? isListening
                  ? 'bg-red-600 shadow-md shadow-red-500/40 animate-pulse'
                  : 'bg-indigo-600'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
            }`}>
              {isHandsFreeActive ? (
                isListening ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-indigo-600" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-bold text-sm sm:text-base ${isHandsFreeActive ? 'text-white' : 'text-slate-900'}`}>
                  Hands-Free Driving & Voice Dictation Mode
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                  isHandsFreeActive
                    ? isListening
                      ? 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {isHandsFreeActive ? (isListening ? '🔴 LIVE STREAMING MIC' : 'PAUSED') : 'WEB SPEECH API'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 leading-relaxed ${isHandsFreeActive ? 'text-slate-300' : 'text-slate-500'}`}>
                Designed for mountain drivers steering heavy 4WD convoys and officers wearing tactical gloves. Speak naturally to auto-fill location, severity, and description hands-free.
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* Audio Feedback TTS Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !ttsFeedbackEnabled;
                setTtsFeedbackEnabled(next);
                if (next) speakFeedback('Audio confirmations enabled');
              }}
              title={ttsFeedbackEnabled ? 'Audio confirmation feedback ON' : 'Audio confirmation feedback MUTED'}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isHandsFreeActive
                  ? ttsFeedbackEnabled
                    ? 'bg-slate-800 border-slate-700 text-indigo-400 hover:bg-slate-700'
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
                  : ttsFeedbackEnabled
                    ? 'bg-slate-50 border-slate-200 text-indigo-600 hover:bg-slate-100'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {ttsFeedbackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline text-[11px]">{ttsFeedbackEnabled ? 'Voice Feedback' : 'Muted'}</span>
            </button>

            {/* Language Selector */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className={`text-xs rounded-lg px-2.5 py-1.5 font-medium border focus:outline-none ${
                isHandsFreeActive 
                  ? 'bg-slate-800 border-slate-700 text-slate-200' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="en-IN">English (India - en-IN)</option>
              <option value="hi-IN">Hindi (hi-IN)</option>
              <option value="en-US">English (US)</option>
            </select>

            {/* Primary Big Toggle */}
            <button
              type="button"
              onClick={onToggleHandsFree}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                isHandsFreeActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
              }`}
            >
              {isHandsFreeActive ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Exit Hands-Free</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 animate-pulse" />
                  <span>Start Voice Dictation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error notification if mic fails */}
        {speechError && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{speechError}</span>
            </div>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="text-red-700 hover:text-red-900 font-bold text-[11px] underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ACTIVE HANDS-FREE HUD EXPANSION */}
        {isHandsFreeActive && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Audio Waveform Animation & Live Listening Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 h-6 px-2">
                  <span className={`w-1 bg-indigo-500 rounded-full transition-all duration-150 ${isListening ? 'h-5 animate-pulse' : 'h-1.5'}`} />
                  <span className={`w-1 bg-indigo-400 rounded-full transition-all duration-150 delay-75 ${isListening ? 'h-6 animate-pulse' : 'h-2'}`} />
                  <span className={`w-1 bg-indigo-300 rounded-full transition-all duration-150 delay-150 ${isListening ? 'h-4 animate-pulse' : 'h-1'}`} />
                  <span className={`w-1 bg-indigo-500 rounded-full transition-all duration-150 delay-100 ${isListening ? 'h-6 animate-pulse' : 'h-2'}`} />
                  <span className={`w-1 bg-indigo-400 rounded-full transition-all duration-150 delay-200 ${isListening ? 'h-3 animate-pulse' : 'h-1.5'}`} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span>{isListening ? 'Active Microphone Stream' : 'Microphone Paused'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Say "Submit Report" or "Set Severity Critical")
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-400 truncate max-w-md">
                    {interimTranscript ? (
                      <span className="italic font-medium">"{interimTranscript}..."</span>
                    ) : (
                      <span className="text-slate-400">Listening for incident descriptions, landmarks, or commands...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status summary pill */}
              {lastDetectedIntent && (
                <div className="flex items-center gap-1.5 bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{lastDetectedIntent}</span>
                </div>
              )}
            </div>

            {/* Live Transcript Stream Box */}
            <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1.5">
                <span className="font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                  <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  Live Voice Transcript Buffer
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFinalTranscript('');
                      setInterimTranscript('');
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                  >
                    Clear Transcript
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCommandsGuide(!showCommandsGuide)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Voice Commands Guide</span>
                  </button>
                </div>
              </div>

              <div className="min-h-[48px] max-h-[90px] overflow-y-auto font-mono text-slate-200 leading-relaxed text-xs">
                {finalTranscript ? (
                  <span>{finalTranscript} <span className="text-indigo-400 italic">{interimTranscript}</span></span>
                ) : interimTranscript ? (
                  <span className="text-indigo-400 italic">{interimTranscript}</span>
                ) : (
                  <span className="text-slate-500 italic">"Report Landslide at NH-13 kilometer 112, severity critical, carriageway completely blocked by mud..."</span>
                )}
              </div>
            </div>

            {/* Voice Command Reference Helper Drawer */}
            {showCommandsGuide && (
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-xs space-y-2">
                <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Hands-Free Mountain Voice Grammar</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-700/60">
                    <span className="text-indigo-300 font-bold block">Incident Classification</span>
                    <span className="text-slate-300">"Landslide", "Flood", "Bridge Damage", "Road Collapse", "Overturned Truck"</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-700/60">
                    <span className="text-amber-300 font-bold block">Severity Rating</span>
                    <span className="text-slate-300">"Severity Critical", "Code Red", "High Severity", "Single Lane Passable"</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-700/60">
                    <span className="text-emerald-300 font-bold block">Voice Commands</span>
                    <span className="text-slate-300">"Submit Report", "Acquire GPS", "Clear Form", "Stop Listening"</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tactical Field Presets / Microphone Simulator (Ideal for test drives or zero-mic environments) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-indigo-400" />
                  Quick Mountain Convoy Voice Simulations (Click to test NLP parser hands-free)
                </span>
                <span className="text-[10px] text-slate-500">Simulates real radio voice input</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateVoicePhrase('Landslide at NH-13 kilometer 112 between Bomdila and Dirang, severity critical, 80 tons of mud blocking both lanes')}
                  className="p-2 text-left bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-indigo-500 rounded-lg text-xs transition cursor-pointer"
                >
                  <span className="text-rose-400 font-bold text-[10px] block">CRITICAL LANDSLIDE</span>
                  <span className="text-[11px] text-slate-300 line-clamp-1">NH-13 Km 112 Bomdila pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateVoicePhrase('Flash flood near Tezu Lohit River crossing, severity high, single bridge pier under heavy scour')}
                  className="p-2 text-left bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-indigo-500 rounded-lg text-xs transition cursor-pointer"
                >
                  <span className="text-amber-400 font-bold text-[10px] block">HIGH FLOOD / BRIDGE</span>
                  <span className="text-[11px] text-slate-300 line-clamp-1">Tezu Lohit River crossing</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateVoicePhrase('Road damage along NH-29 near Kohima sector, severity medium, right lane subsided')}
                  className="p-2 text-left bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-indigo-500 rounded-lg text-xs transition cursor-pointer"
                >
                  <span className="text-indigo-300 font-bold text-[10px] block">ROAD SUBSIDENCE</span>
                  <span className="text-[11px] text-slate-300 line-clamp-1">NH-29 Kohima single lane</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateVoicePhrase('Submit report to command')}
                  className="p-2 text-left bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 rounded-lg text-xs transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-emerald-400 font-bold text-[10px] block">VOICE COMMAND</span>
                    <span className="text-[11px] text-emerald-200">"Submit Report"</span>
                  </div>
                  <Send className="w-4 h-4 text-emerald-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
