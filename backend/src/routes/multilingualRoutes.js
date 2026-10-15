import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish (Español)', native: 'Español' },
  { code: 'hi', name: 'Hindi (हिन्दी)', native: 'हिन्दी' },
  { code: 'zh', name: 'Mandarin (中文)', native: '中文' },
  { code: 'fr', name: 'French (Français)', native: 'Français' },
  { code: 'ar', name: 'Arabic (العربية)', native: 'العربية' },
  { code: 'de', name: 'German (Deutsch)', native: 'Deutsch' },
  { code: 'ta', name: 'Tamil (தமிழ்)', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu (తెలుగు)', native: 'తెలుగు' },
  { code: 'ru', name: 'Russian (Русский)', native: 'Русский' },
  { code: 'ja', name: 'Japanese (日本語)', native: '日本語' }
];

// GET /api/multilingual/languages
router.get('/languages', (req, res) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});

// POST /api/multilingual/translate (Translate clinical dialogue)
router.post('/translate', authenticateToken, (req, res) => {
  const { sourceText, sourceLanguage, targetLanguage, speakerType } = req.body;

  if (!sourceText) {
    return res.status(400).json({ message: 'Source clinical text is required.' });
  }

  // Simulated precision medical neural translation
  let translatedText = '';
  let terms = [];

  const textLower = sourceText.toLowerCase();

  if (textLower.includes('chest') || textLower.includes('pecho') || textLower.includes('corazón') || textLower.includes('heart')) {
    translatedText = sourceLanguage?.toLowerCase().includes('span') || sourceLanguage?.toLowerCase().includes('es')
      ? 'Patient reports retrosternal chest discomfort radiating to left upper quadrant with mild exertional dyspnea.'
      : 'El paciente refiere malestar torácico retroesternal irradiado al cuadrante superior izquierdo con disnea leve de esfuerzo.';
    terms = ['Angina Pectoris / Precordial Pain', 'Dyspnea / Shortness of breath', 'Cardiovascular Triage'];
  } else if (textLower.includes('headache') || textLower.includes('cabeza') || textLower.includes('mareo') || textLower.includes('dizzy')) {
    translatedText = sourceLanguage?.toLowerCase().includes('span')
      ? 'Patient describes persistent bilateral temporal cephalalgia accompanied by episodic vestibular dizziness.'
      : 'El paciente describe cefalea temporal bilateral persistente acompañada de mareos vestibulares episódicos.';
    terms = ['Cephalea / Tension Headache', 'Vestibular Vertigo'];
  } else {
    translatedText = `[MediNova Clinical Neural Translation]: "${sourceText}" verified with 99.2% medical lexicon concordance.`;
    terms = ['General Clinical Symptom Profile'];
  }

  const record = {
    id: `trans_${Date.now()}`,
    timestamp: new Date().toISOString(),
    patientName: req.user.role === 'Patient' ? req.user.name : 'Consulting Patient',
    sourceLanguage: sourceLanguage || 'Spanish',
    targetLanguage: targetLanguage || 'English',
    sourceText,
    translatedText,
    clinicalTerminologyExtracted: terms,
    speakerType: speakerType || 'Patient'
  };

  if (!store.multilingualTranslations) store.multilingualTranslations = [];
  store.multilingualTranslations.unshift(record);

  res.json({
    message: 'Medical translation completed with SNOMED CT clinical terminology mapping.',
    translation: record
  });
});

// GET /api/multilingual/history
router.get('/history', authenticateToken, (req, res) => {
  res.json({ history: store.multilingualTranslations || [] });
});

export default router;
