import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Globe,
  Languages,
  Volume2,
  ArrowRightLeft,
  CheckCircle2,
  Copy,
  RefreshCw,
  Send,
  MessageSquare,
  ShieldCheck,
  User,
  Stethoscope
} from 'lucide-react';

export default function MultilingualCarePage() {
  const { user } = useAuth();
  const [languages, setLanguages] = useState([]);
  const [sourceLang, setSourceLang] = useState('Spanish (Español)');
  const [targetLang, setTargetLang] = useState('English');
  const [inputText, setInputText] = useState('Tengo un dolor muy fuerte en el pecho que me baja por el brazo izquierdo');
  const [history, setHistory] = useState([]);
  const [translating, setTranslating] = useState(false);
  const [latestTranslation, setLatestTranslation] = useState(null);
  const [speakerType, setSpeakerType] = useState('Patient');

  const loadData = async () => {
    try {
      const [langRes, histRes] = await Promise.all([
        api.getLanguages(),
        api.getTranslationHistory()
      ]);
      setLanguages(langRes.languages || []);
      const hist = histRes.history || [];
      setHistory(hist);
      if (hist.length > 0 && !latestTranslation) {
        setLatestTranslation(hist[0]);
      }
    } catch (err) {
      console.error('Failed to load multilingual data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTranslate = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    try {
      setTranslating(true);
      const res = await api.translateClinicalDialogue({
        sourceText: inputText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        speakerType
      });
      setLatestTranslation(res.translation);
      await loadData();
    } catch (err) {
      alert('Translation failed: ' + err.message);
    } finally {
      setTranslating(false);
    }
  };

  const handleSwap = () => {
    const prevSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(prevSource);
    setSpeakerType(speakerType === 'Patient' ? 'Doctor' : 'Patient');
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Globe className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800 font-outfit">
                Multilingual Healthcare Translation &amp; Cross-Cultural Care
              </h1>
              <p className="text-xs text-slate-500">
                Real-time clinical dialogue translation with precise SNOMED CT and medical terminology mapping.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200 font-bold">
            10 Healthcare Dialects Supported
          </span>
        </div>
      </div>

      {/* Main Translation Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Translation Input (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Source:</span>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800"
                >
                  <option value="Spanish (Español)">Spanish (Español)</option>
                  <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                  <option value="Mandarin (中文)">Mandarin (中文)</option>
                  <option value="French (Français)">French (Français)</option>
                  <option value="Arabic (العربية)">Arabic (العربية)</option>
                  <option value="English">English</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSwap}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition"
                title="Swap Languages"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Target:</span>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800"
                >
                  <option value="English">English</option>
                  <option value="Spanish (Español)">Spanish (Español)</option>
                  <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                  <option value="Mandarin (中文)">Mandarin (中文)</option>
                  <option value="French (Français)">French (Français)</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleTranslate} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    {speakerType === 'Patient' ? <User className="w-3.5 h-3.5 text-blue-600" /> : <Stethoscope className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{speakerType} Dialogue Speech / Text</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">SNOMED CT Concordance</span>
                </div>
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter medical dialogue in native language..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSpeakerType('Patient')}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                      speakerType === 'Patient'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    Patient Speaking
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeakerType('Doctor')}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                      speakerType === 'Doctor'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    Doctor Speaking
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={translating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  {translating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Translate Consultation</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Translation Output & Terminology (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {latestTranslation ? (
            <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Medical Translation Result ({latestTranslation.targetLanguage})
                </span>
                <button
                  onClick={() => speakText(latestTranslation.translatedText)}
                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Pronounce</span>
                </button>
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Accredited Translation</span>
                <p className="text-sm font-semibold text-blue-900 leading-relaxed">
                  {latestTranslation.translatedText}
                </p>
              </div>

              {/* Extracted Clinical Terminology */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Extracted Clinical Findings (Standardized Terminology):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(latestTranslation.clinicalTerminologyExtracted || []).map((term, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
              No active translation yet. Enter dialogue on the left to begin cross-language care.
            </div>
          )}
        </div>
      </div>

      {/* Translation Consultation History */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 font-outfit text-sm">
            Bilingual Consultation Dialogue History
          </h3>
          <span className="text-xs text-slate-500">{history.length} Dialogues</span>
        </div>

        <div className="divide-y divide-slate-100">
          {history.map((h) => (
            <div key={h.id} className="p-4 hover:bg-slate-50 transition space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-700">{h.speakerType || 'Patient'}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{h.sourceLanguage} → {h.targetLanguage}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(h.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-slate-700 italic font-serif">"{h.sourceText}"</div>
              <div className="text-blue-900 font-semibold">{h.translatedText}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
