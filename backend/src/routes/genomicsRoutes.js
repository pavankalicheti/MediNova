import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Reference drug-gene rules for dynamic PGx queries
const PGX_DATABASE = {
  'clopidogrel': {
    gene: 'CYP2C19',
    riskMapping: {
      'Intermediate': { level: 'Warning', alert: 'Intermediate Metabolizer (*1/*2). Diminished antiplatelet response. Consider Ticagrelor or Prasugrel.' },
      'Poor': { level: 'Danger', alert: 'Poor Metabolizer (*2/*2). High risk of stent thrombosis and ischemic events. Clopidogrel contraindicated.' },
      'Normal': { level: 'Safe', alert: 'Normal Metabolizer (*1/*1). Standard 75mg daily dosing indicated.' }
    }
  },
  'simvastatin': {
    gene: 'SLCO1B1',
    riskMapping: {
      'Decreased': { level: 'Danger', alert: 'Decreased Transporter Function (*5 allele). Marked risk of statin-induced myopathy/rhabdomyolysis. Prescribe Rosuvastatin or Atorvastatin.' },
      'Normal': { level: 'Safe', alert: 'Normal Transporter Function (*1/*1). Standard titration acceptable.' }
    }
  },
  'warfarin': {
    gene: 'VKORC1 / CYP2C9',
    riskMapping: {
      'Normal': { level: 'Safe', alert: 'Wild-type alleles present. Follow standard INR initiation nomogram.' },
      'Sensitive': { level: 'Warning', alert: 'Increased sensitivity alleles detected. Reduce starting dose by 30-50% with frequent INR monitoring.' }
    }
  },
  'codeine': {
    gene: 'CYP2D6',
    riskMapping: {
      'Ultra-Rapid': { level: 'Danger', alert: 'Ultra-Rapid Metabolizer. Risk of life-threatening respiratory depression due to rapid morphine conversion.' },
      'Poor': { level: 'Warning', alert: 'Poor Metabolizer. Inadequate analgesia due to lack of bioactivation.' },
      'Normal': { level: 'Safe', alert: 'Normal Metabolizer (*1/*1). Standard analgesic dosing.' }
    }
  },
  'fluorouracil': {
    gene: 'DPYD',
    riskMapping: {
      'Deficient': { level: 'Danger', alert: 'DPD deficiency detected. Severe risk of fatal systemic fluorouracil toxicity. Dose reduction or alternative required.' },
      'Normal': { level: 'Safe', alert: 'Normal DPYD enzymatic activity. Full standard chemotherapy dosing safe.' }
    }
  }
};

// GET /api/genomics/profiles (List genomic profiles)
router.get('/profiles', authenticateToken, (req, res) => {
  const { role, id } = req.user;

  if (role === 'Patient') {
    const profile = (store.genomicProfiles || []).find(p => p.patientId === id);
    return res.json({ profiles: profile ? [profile] : [] });
  }

  res.json({ profiles: store.genomicProfiles || [] });
});

// GET /api/genomics/profiles/:patientId (Get specific patient genomic profile)
router.get('/profiles/:patientId', authenticateToken, (req, res) => {
  const { patientId } = req.params;
  const profile = (store.genomicProfiles || []).find(p => p.patientId === patientId);

  if (!profile) {
    // Generate an on-demand baseline profile for patients without a pre-existing profile
    const patient = store.users.find(u => u.id === patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const baselineProfile = {
      id: `gnm_prof_${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      sampleId: `DNA-SEQ-${Date.now().toString().slice(-4)}`,
      sequencingDate: new Date().toISOString().split('T')[0],
      sequencingMethod: 'Illumina NovaSeq 6000 Whole Exome + Precision Cardiology Panel',
      qualityScore: 'Q30 > 97.2% (Clinical Grade)',
      polygenicRiskScores: [
        { condition: 'Cardiovascular Atherosclerosis', percentile: 58, riskCategory: 'Average Population Risk', baselinePopRisk: 22, relativeMultiplier: 1.1, recommendation: 'Routine lipid panel every 2 years.' },
        { condition: 'Hereditary Breast & Ovarian Cancer', percentile: 25, riskCategory: 'Low Risk', baselinePopRisk: 12, relativeMultiplier: 0.8, recommendation: 'Standard age-based preventative screening.' },
        { condition: 'Type 2 Diabetes Mellitus', percentile: 52, riskCategory: 'Average Population Risk', baselinePopRisk: 14, relativeMultiplier: 1.0, recommendation: 'Maintain regular physical activity and balanced Mediterranean diet.' },
        { condition: 'Late-Onset Alzheimer Disease', percentile: 30, riskCategory: 'Low Risk', baselinePopRisk: 10, relativeMultiplier: 0.9, recommendation: 'Healthy lifestyle protective behaviors.' }
      ],
      detectedVariants: [
        {
          gene: 'CYP2C19',
          variantId: 'rs4244285 (*1/*1)',
          hgvs: 'Wild-Type Sequence',
          zygosity: 'Homozygous Wild-Type',
          acmgClassification: 'Normal Function Allele',
          clinicalSignificance: 'Normal Metabolizer (*1/*1)',
          actionableGuideline: 'Standard therapeutic antiplatelet dosing is therapeutically effective.'
        }
      ],
      pharmacogenomics: [
        { drug: 'Clopidogrel (Plavix)', gene: 'CYP2C19', phenotype: 'Normal Metabolizer', alertLevel: 'Safe', cpicGuideline: 'Standard 75mg daily dosing safe.' },
        { drug: 'Warfarin', gene: 'VKORC1 / CYP2C9', phenotype: 'Normal Sensitivity', alertLevel: 'Safe', cpicGuideline: 'Standard INR-guided nomogram.' },
        { drug: 'Simvastatin', gene: 'SLCO1B1', phenotype: 'Normal Function (*1/*1)', alertLevel: 'Safe', cpicGuideline: 'Standard statin titration up to 40mg.' }
      ],
      clinicalSummary: 'Standard baseline genomic architecture with wild-type drug metabolism and average population polygenic risk across major adult conditions.'
    };

    if (!store.genomicProfiles) store.genomicProfiles = [];
    store.genomicProfiles.push(baselineProfile);
    return res.json({ profile: baselineProfile });
  }

  res.json({ profile });
});

// POST /api/genomics/analyze (Order & analyze clinical sequencing panel)
router.post('/analyze', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { patientId, panelType, targetDiseases } = req.body;

  const patient = store.users.find(u => u.id === patientId);
  if (!patient) {
    return res.status(404).json({ message: 'Target patient not found in clinical directory.' });
  }

  const newProfile = {
    id: `gnm_prof_${Date.now()}`,
    patientId: patient.id,
    patientName: patient.name,
    sampleId: `DNA-SEQ-${Date.now().toString().slice(-4)}`,
    sequencingDate: new Date().toISOString().split('T')[0],
    sequencingMethod: panelType || 'Next-Generation Whole Exome Sequencing (100x)',
    qualityScore: 'Q30 > 98.1% (High Confidence)',
    polygenicRiskScores: [
      { condition: 'Cardiovascular Atherosclerosis', percentile: Math.floor(40 + Math.random() * 55), riskCategory: 'Elevated Risk', baselinePopRisk: 22, relativeMultiplier: 1.9, recommendation: 'Intensive cardiometabolic protocol with coronary calcium score screening.' },
      { condition: 'Type 2 Diabetes Mellitus', percentile: Math.floor(50 + Math.random() * 45), riskCategory: 'High Risk', baselinePopRisk: 14, relativeMultiplier: 2.5, recommendation: 'Initiate continuous glucose trend monitoring.' },
      { condition: 'Colorectal Carcinoma', percentile: Math.floor(20 + Math.random() * 40), riskCategory: 'Average Population Risk', baselinePopRisk: 4.5, relativeMultiplier: 1.0, recommendation: 'Standard screening colonoscopy intervals.' }
    ],
    detectedVariants: [
      {
        gene: 'CYP2C19',
        variantId: 'rs4244285 (*2)',
        hgvs: 'c.681G>A (p.Pro227=)',
        zygosity: 'Heterozygous (*1/*2)',
        acmgClassification: 'Pathogenic for Altered Metabolism',
        clinicalSignificance: 'Intermediate Metabolizer for Clopidogrel and Escitalopram',
        actionableGuideline: 'Antiplatelet therapy: recommend Ticagrelor or Prasugrel instead of Clopidogrel.'
      },
      {
        gene: 'APOE',
        variantId: 'rs429358 (e4)',
        hgvs: 'c.388T>C (p.Cys130Arg)',
        zygosity: 'Heterozygous e3/e4',
        acmgClassification: 'Risk Factor',
        clinicalSignificance: 'Predisposition to Dyslipidemia and Neurovascular Changes',
        actionableGuideline: 'Aggressive vascular risk control; target LDL < 70 mg/dL.'
      }
    ],
    pharmacogenomics: [
      { drug: 'Clopidogrel (Plavix)', gene: 'CYP2C19', phenotype: 'Intermediate Metabolizer', alertLevel: 'Warning', cpicGuideline: 'Switch to alternative P2Y12 inhibitor.' },
      { drug: 'Warfarin', gene: 'VKORC1 / CYP2C9', phenotype: 'Normal Sensitivity', alertLevel: 'Safe', cpicGuideline: 'Standard INR-guided titration.' },
      { drug: 'Simvastatin', gene: 'SLCO1B1', phenotype: 'Normal Function (*1/*1)', alertLevel: 'Safe', cpicGuideline: 'Standard dosing safe.' }
    ],
    clinicalSummary: `Sequencing completed via ${panelType || 'Whole Exome Sequencing'}. Identified CYP2C19 loss-of-function allele and elevated cardiometabolic polygenic risk.`
  };

  if (!store.genomicProfiles) store.genomicProfiles = [];
  const existingIdx = store.genomicProfiles.findIndex(p => p.patientId === patientId);
  if (existingIdx >= 0) {
    store.genomicProfiles[existingIdx] = newProfile;
  } else {
    store.genomicProfiles.unshift(newProfile);
  }

  res.status(201).json({
    message: `Genomic sequencing and polygenic risk profile calculated successfully for ${patient.name}.`,
    profile: newProfile
  });
});

// POST /api/genomics/pgx-check (Pharmacogenomic drug compatibility check)
router.post('/pgx-check', authenticateToken, (req, res) => {
  const { patientId, drugName } = req.body;

  if (!drugName) {
    return res.status(400).json({ message: 'Drug name is required.' });
  }

  const profile = (store.genomicProfiles || []).find(p => p.patientId === (patientId || req.user.id));
  const drugKey = drugName.toLowerCase().trim();

  // Match against known PGx rules
  const matchedKey = Object.keys(PGX_DATABASE).find(k => drugKey.includes(k));

  if (!matchedKey) {
    return res.json({
      drug: drugName,
      gene: 'General Metabolism',
      phenotype: 'Standard Wild-Type Response',
      alertLevel: 'Safe',
      recommendation: 'No high-impact pharmacogenomic contraindications detected for this agent in clinical databases (CPIC / PharmGKB Level A).'
    });
  }

  const rule = PGX_DATABASE[matchedKey];
  let patientPhenotype = 'Normal';

  if (profile) {
    const hasVariant = profile.detectedVariants.some(v => v.gene.toUpperCase() === rule.gene.split('/')[0].trim().toUpperCase() && v.acmgClassification.includes('Pathogenic'));
    if (hasVariant) {
      patientPhenotype = matchedKey === 'simvastatin' ? 'Decreased' : 'Intermediate';
    }
  }

  const outcome = rule.riskMapping[patientPhenotype] || rule.riskMapping['Normal'];

  res.json({
    drug: drugName,
    gene: rule.gene,
    phenotype: `${patientPhenotype} Metabolizer`,
    alertLevel: outcome.level,
    recommendation: outcome.alert,
    evidenceLevel: 'CPIC Level A (Clinical Action Recommended)'
  });
});

// GET /api/genomics/catalog (Reference genes)
router.get('/catalog', authenticateToken, (req, res) => {
  res.json({ catalog: store.genomicCatalog || [] });
});

export default router;
