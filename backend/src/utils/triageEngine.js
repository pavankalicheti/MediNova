/**
 * MediNova AI Emergency Triage Scoring Engine
 * 
 * Isolated rule-based expert triage system that analyzes patient vitals, age,
 * and presenting symptoms to output a clinical priority rating.
 * 
 * This module is purposefully isolated so it can be seamlessly replaced
 * by a trained machine learning classification model (e.g. PyTorch/TensorFlow ONNX or API endpoint)
 * in future iterations.
 */

export function calculateTriagePriority({ age, symptoms = [], heartRate, bpSys, bpDia, spo2, temperature }) {
  let score = 0;
  const flags = [];

  // Parse numerical inputs safely
  const hr = parseFloat(heartRate) || 75;
  const sys = parseFloat(bpSys) || 120;
  const dia = parseFloat(bpDia) || 80;
  const o2 = parseFloat(spo2) || 98;
  const temp = parseFloat(temperature) || 37.0;
  const patientAge = parseInt(age) || 30;

  // 1. Oxygen Saturation (SpO2) Scoring
  if (o2 < 90) {
    score += 45;
    flags.push('Severe Hypoxia (SpO2 < 90%)');
  } else if (o2 < 94) {
    score += 25;
    flags.push('Moderate Hypoxia (SpO2 < 94%)');
  }

  // 2. Heart Rate (HR) Scoring
  if (hr > 140 || hr < 40) {
    score += 35;
    flags.push(`Extreme Heart Rate (${hr} bpm)`);
  } else if (hr > 110 || hr < 50) {
    score += 20;
    flags.push(`Abnormal Heart Rate (${hr} bpm)`);
  }

  // 3. Blood Pressure Scoring
  if (sys >= 180 || sys <= 80 || dia >= 110) {
    score += 30;
    flags.push(`Hypertensive Crisis or Shock (BP ${sys}/${dia})`);
  } else if (sys >= 140 || sys <= 90) {
    score += 15;
    flags.push(`Abnormal Blood Pressure (BP ${sys}/${dia})`);
  }

  // 4. Body Temperature Scoring
  if (temp >= 40.0 || temp <= 35.0) {
    score += 25;
    flags.push(`Severe Hyperthermia / Hypothermia (${temp}°C)`);
  } else if (temp >= 38.5) {
    score += 10;
    flags.push(`High Fever (${temp}°C)`);
  }

  // 5. Age Vulnerability Adjustment
  if (patientAge <= 2 || patientAge >= 70) {
    score += 10;
    flags.push('High-risk age bracket');
  }

  // 6. Symptom Analysis (Keyword Matching)
  const symptomText = (Array.isArray(symptoms) ? symptoms.join(' ') : symptoms).toLowerCase();
  
  const criticalKeywords = ['chest pain', 'unconscious', 'cardiac', 'severe bleeding', 'seizure', 'cannot breathe', 'stroke', 'anaphylaxis'];
  const urgentKeywords = ['shortness of breath', 'fracture', 'fainting', 'head injury', 'severe pain', 'blood in stool', 'persistent vomiting'];
  const moderateKeywords = ['fever', 'abdominal pain', 'dizziness', 'moderate pain', 'deep cut', 'coughing'];

  let matchedCritical = criticalKeywords.filter(k => symptomText.includes(k));
  let matchedUrgent = urgentKeywords.filter(k => symptomText.includes(k));
  let matchedModerate = moderateKeywords.filter(k => symptomText.includes(k));

  if (matchedCritical.length > 0) {
    score += 40 * matchedCritical.length;
    flags.push(`High-risk symptom: ${matchedCritical.join(', ')}`);
  }
  if (matchedUrgent.length > 0) {
    score += 20 * matchedUrgent.length;
    flags.push(`Urgent symptom: ${matchedUrgent.join(', ')}`);
  }
  if (matchedModerate.length > 0) {
    score += 10 * matchedModerate.length;
  }

  // Determine Final Priority Rating
  let priority = 'Low';
  let color = 'emerald';
  let recommendedAction = 'Routine consultation in Outpatient Clinic.';
  let department = 'General Medicine';

  if (score >= 65) {
    priority = 'Critical';
    color = 'red';
    recommendedAction = 'IMMEDIATE Resuscitation / ER Trauma Bay Admission.';
    department = 'Emergency Department (Resuscitation)';
  } else if (score >= 45) {
    priority = 'Urgent';
    color = 'amber';
    recommendedAction = 'Urgent Medical Assessment within 15-30 minutes.';
    department = 'Urgent Care / Cardiology / Pulmonology';
  } else if (score >= 25) {
    priority = 'Moderate';
    color = 'yellow';
    recommendedAction = 'Standard Medical Evaluation within 60 minutes.';
    department = 'General Outpatient Care';
  }

  return {
    score: Math.min(score, 100),
    priority,
    color,
    flags,
    recommendedAction,
    department,
    evaluatedAt: new Date().toISOString()
  };
}
