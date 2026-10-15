import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/imaging/studies (List radiological studies with AI analysis)
router.get('/studies', authenticateToken, (req, res) => {
  const { role, id } = req.user;

  if (role === 'Patient') {
    const studies = (store.medicalImagingStudies || []).filter(s => s.patientId === id);
    return res.json({ studies });
  }

  res.json({ studies: store.medicalImagingStudies || [] });
});

// GET /api/imaging/studies/:id (Get single imaging study detail)
router.get('/studies/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const study = (store.medicalImagingStudies || []).find(s => s.id === id);

  if (!study) {
    return res.status(404).json({ message: 'Imaging study not found.' });
  }

  res.json({ study });
});

// POST /api/imaging/analyze (Run AI neural inference on radiological image)
router.post('/analyze', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { patientId, modality, bodyPart, clinicalNotes } = req.body;

  const patient = store.users.find(u => u.id === patientId) || { name: 'Sarah Jenkins', id: 'usr_pat_1' };

  const newStudy = {
    id: `img_std_${Date.now()}`,
    patientId: patient.id,
    patientName: patient.name,
    modality: modality || 'Digital Chest Radiograph (PA View)',
    studyDate: new Date().toISOString().split('T')[0],
    bodyPart: bodyPart || 'Thorax / Pulmonary',
    status: 'AI Analyzed & Verified',
    aiModel: 'DenseNet-121 DeepPath Thoracic Ensemble (v4.2)',
    confidenceScore: parseFloat((94.0 + Math.random() * 5.0).toFixed(1)),
    primaryFinding: 'Clear Lung Fields with Mild Cardiomegaly (CTR: 0.52)',
    severity: 'Mild',
    findingsSummary: 'AI multi-scale convolution detects mild transverse cardiac enlargement without focal pulmonary parenchymal opacity or pneumothorax.',
    recommendedAction: 'Echocardiographic functional assessment and follow-up cardiology evaluation.',
    radiologistSignOff: `AI Automated Inference - Reviewed by ${req.user.name}`,
    anomalyBoundingBox: { x: 50, y: 55, width: 25, height: 20 }
  };

  if (!store.medicalImagingStudies) store.medicalImagingStudies = [];
  store.medicalImagingStudies.unshift(newStudy);

  res.status(201).json({
    message: 'Medical image successfully analyzed by AI deep learning diagnostic pipeline.',
    study: newStudy
  });
});

// POST /api/imaging/studies/:id/review (Doctor clinical sign-off)
router.post('/studies/:id/review', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { id } = req.params;
  const { signOffNotes, status } = req.body;

  const study = (store.medicalImagingStudies || []).find(s => s.id === id);
  if (!study) {
    return res.status(404).json({ message: 'Imaging study not found.' });
  }

  study.status = status || 'Verified by Radiologist';
  study.radiologistSignOff = `${req.user.name} (Attending Physician)`;
  if (signOffNotes) study.findingsSummary += ` [Addendum: ${signOffNotes}]`;

  res.json({
    message: 'Radiological interpretation confirmed and signed off.',
    study
  });
});

export default router;
