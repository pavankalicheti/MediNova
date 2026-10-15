import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Terminal,
  Activity,
  Send,
  MessageSquare,
  RefreshCw,
  Cpu,
  FileText
} from 'lucide-react';

export default function VoiceAssistantPage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('Triage patient with acute chest tightness and shortness of breath');
  const [history, setHistory] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [latestResponse, setLatestResponse] = useState(null);
  const [audioFeedback, setAudioFeedback] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.getVoiceHistory();
      setHistory(res.history || []);
      if (res.history?.length > 0 && !latestResponse) {
        setLatestResponse(res.history[0]);
      }
    } catch (err) {
      console.error('Failed to load voice history:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const speakText = (text) => {
    if (!audioFeedback || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendPrompt = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    try {
      setProcessing(true);
      const res = await api.processVoiceCommand(prompt);
      setLatestResponse(res.commandLog);
      await loadData();
      if (audioFeedback) {
        speakText(res.commandLog.aiSystemResponse);
      }
    } catch (err) {
      alert('Failed to process command: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const toggleMic = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulated mic capture fallback
      setTimeout(() => {
        setIsListening(false);
        setPrompt('Check ICU bed availability and emergency queue status');
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Mic className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800 font-outfit">
                Voice-Enabled Healthcare Assistant &amp; Dictation
              </h1>
              <p className="text-xs text-slate-500">
                Hands-free clinical voice triage, real-time SOAP note dictation, and speech-to-text EHR navigation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioFeedback(!audioFeedback)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 shadow-sm ${
              audioFeedback
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {audioFeedback ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioFeedback ? 'Voice Audio Active' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Mic & Prompt Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="text-center space-y-3 py-4">
              <button
                onClick={toggleMic}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all duration-300 shadow-md ${
                  isListening
                    ? 'bg-blue-600 text-white animate-pulse ring-8 ring-blue-100'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {isListening ? <Mic className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {isListening ? 'Listening to Clinical Dictation...' : 'Tap Microphone or Type Below'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Natural clinical speech processing calibrated for medical terminology
                </span>
              </div>
            </div>

            <form onSubmit={handleSendPrompt} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Spoken or Typed Clinical Command</label>
                <div className="relative">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Triage patient with acute symptoms or check ICU bed availability"
                    className="w-full text-xs p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={processing}
                    className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quick Clinical Voice Commands:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Triage patient with acute chest tightness and diaphoresis',
                    'Check pharmacy inventory for Metoprolol Tartrate',
                    'Dictate clinical SOAP notes for admitted patient',
                    'Query hospital bed occupancy in Cardiac ICU'
                  ].map((cmd, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPrompt(cmd)}
                      className="text-[11px] px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 rounded-lg transition text-left"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Execution & Entity Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {latestResponse ? (
            <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  {latestResponse.detectedIntent}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(latestResponse.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Recognized Query</span>
                <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  "{latestResponse.spokenPrompt}"
                </p>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Clinical Response &amp; Action</span>
                <p className="text-blue-900 leading-relaxed bg-blue-50/70 p-3 rounded-xl border border-blue-100 font-medium">
                  {latestResponse.aiSystemResponse}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Action Result</span>
                <span className="font-bold text-slate-800">{latestResponse.executedAction}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
              No voice command issued yet. Tap the microphone or submit a clinical query.
            </div>
          )}
        </div>
      </div>

      {/* Voice Commands History */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 font-outfit text-sm">
            Clinical Voice Command Activity Log
          </h3>
          <span className="text-xs text-slate-500">{history.length} Commands</span>
        </div>

        <div className="divide-y divide-slate-100">
          {history.map((cmd) => (
            <div key={cmd.id} className="p-4 hover:bg-slate-50 transition space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">"{cmd.spokenPrompt}"</span>
                <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                  {cmd.detectedIntent}
                </span>
              </div>
              <p className="text-slate-500">{cmd.aiSystemResponse}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
