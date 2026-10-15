import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Dna,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Activity,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Database,
  Pill,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function GenomicRiskPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('prs'); // 'prs', 'variants', 'pgx', 'catalog'
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [currentProfile, setCurrentProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [catalog, setCatalog] = useState([]);

  // PGx Interactive Checker State
  const [pgxDrugInput, setPgxDrugInput] = useState('Clopidogrel');
  const [pgxResult, setPgxResult] = useState(null);
  const [checkingPgx, setCheckingPgx] = useState(false);

  // New Genomic Sequencing Modal
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    patientId: '',
    panelType: 'Illumina NovaSeq 6000 Whole Exome + Precision Cardiology (120x)',
    targetDiseases: 'Cardiovascular, Pharmacogenomics, Type 2 Diabetes'
  });
  const [ordering, setOrdering] = useState(false);
  const [notification, setNotification] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [profRes, patRes, catRes] = await Promise.all([
        api.getGenomicProfiles(),
        api.getAllPatients(),
        api.getGenomicCatalog()
      ]);

      const profList = profRes.profiles || [];
      setProfiles(profList);
      setCatalog(catRes.catalog || []);

      const patList = patRes.patients || [];
      setPatients(patList);

      const targetId = user?.role === 'Patient' ? user.id : (profList[0]?.patientId || patList[0]?.id || 'usr_pat_1');
      setSelectedPatientId(targetId);

      const activeProf = profList.find(p => p.patientId === targetId) || profList[0] || null;
      setCurrentProfile(activeProf);

      if (targetId) {
        setOrderForm(prev => ({ ...prev, patientId: targetId }));
      }
    } catch (err) {
      console.error('Failed to load genomic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When patient selection changes
  const handlePatientChange = async (newPatientId) => {
    setSelectedPatientId(newPatientId);
    try {
      const res = await api.getPatientGenomicProfile(newPatientId);
      setCurrentProfile(res.profile);
    } catch (err) {
      console.error('Error fetching patient profile:', err);
    }
  };

  // Run Pharmacogenomic Compatibility Check
  const handleCheckPgx = async (e) => {
    if (e) e.preventDefault();
    if (!pgxDrugInput) return;
    try {
      setCheckingPgx(true);
      const res = await api.checkPharmacogenomics({
        patientId: selectedPatientId,
        drugName: pgxDrugInput
      });
      setPgxResult(res);
    } catch (err) {
      console.error('PGx check failed:', err);
    } finally {
      setCheckingPgx(false);
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      handleCheckPgx();
    }
  }, [selectedPatientId]);

  // Order New Sequencing Panel
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      setOrdering(true);
      const res = await api.analyzeGenomicPanel(orderForm);
      setNotification(`Genomic panel ordered and sequenced successfully for ${res.profile.patientName}.`);
      setIsOrderModalOpen(false);
      await loadData();
      setCurrentProfile(res.profile);
      setSelectedPatientId(res.profile.patientId);
      setTimeout(() => setNotification(''), 6000);
    } catch (err) {
      alert('Failed to order sequencing panel: ' + err.message);
    } finally {
      setOrdering(false);
    }
  };

  const isDoctorOrAdmin = user?.role === 'Doctor' || user?.role === 'Admin';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-blue-600">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Loading Genomic Sequencer & Polygenic Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {notification && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="text-blue-500 hover:text-blue-700">
            &times;
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Dna className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800 font-outfit">
                Genomic Risk Profiling &amp; Precision Medicine
              </h1>
              <p className="text-xs text-slate-500">
                Next-generation sequencing variant calling, polygenic risk scores (PRS), and pharmacogenomic drug compatibility engine.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Patient Selector for Doctors/Admins */}
          {isDoctorOrAdmin && patients.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-xs font-semibold text-slate-500">Patient:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-blue-900 focus:outline-none"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {isDoctorOrAdmin && (
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Order Sequencing Panel</span>
            </button>
          )}
        </div>
      </div>

      {/* Patient Profile Metadata Card */}
      {currentProfile && (
        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Patient Name</span>
              <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <span>{currentProfile.patientName}</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-mono font-semibold">
                  {currentProfile.sampleId}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Sequencing Methodology</span>
              <div className="font-semibold text-slate-700 truncate" title={currentProfile.sequencingMethod}>
                {currentProfile.sequencingMethod}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Quality Metric</span>
              <div className="font-bold text-blue-700 font-mono">
                {currentProfile.qualityScore}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Sequencing Date</span>
              <div className="font-semibold text-slate-700">
                {currentProfile.sequencingDate}
              </div>
            </div>
          </div>

          {currentProfile.clinicalSummary && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p>
                <strong className="text-slate-800 font-semibold">Clinical Interpretation: </strong>
                {currentProfile.clinicalSummary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('prs')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'prs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Polygenic Risk Scores (PRS)</span>
        </button>

        <button
          onClick={() => setActiveTab('variants')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'variants'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Dna className="w-4 h-4" />
          <span>High-Impact Variants ({currentProfile?.detectedVariants?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('pgx')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'pgx'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Pharmacogenomics (PGx)</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Gene Catalog</span>
        </button>
      </div>

      {/* TAB 1: POLYGENIC RISK SCORES */}
      {activeTab === 'prs' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-outfit">
                Polygenic Risk Percentiles &amp; Population Benchmarks
              </h3>
              <p className="text-xs text-slate-500">
                Calculated by aggregating hundreds of genome-wide single nucleotide polymorphisms (SNPs) weighted against reference biobanks.
              </p>
            </div>

            <div className="space-y-6">
              {(currentProfile?.polygenicRiskScores || []).map((prs, idx) => {
                const isHigh = prs.percentile >= 75;
                const isModerate = prs.percentile >= 50 && prs.percentile < 75;

                return (
                  <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{prs.condition}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            isHigh
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : isModerate
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {prs.riskCategory}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Relative Risk Multiplier: <strong className="text-slate-800 font-mono">{prs.relativeMultiplier}x</strong> vs average population
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-bold font-mono text-blue-700">{prs.percentile}th</span>
                        <span className="text-[10px] text-slate-400 block">Population Percentile</span>
                      </div>
                    </div>

                    {/* Visual Percentile Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isHigh ? 'bg-blue-600' : isModerate ? 'bg-blue-500' : 'bg-slate-400'
                          }`}
                          style={{ width: `${prs.percentile}%` }}
                        ></div>
                        {/* 50th percentile marker */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400/80" title="50th Percentile (Population Mean)"></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>0% (Lowest)</span>
                        <span>50% (Population Average)</span>
                        <span>100% (Highest)</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">Precision Clinical Protocol: </strong>
                        {prs.recommendation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETECTED GENETIC VARIANTS */}
      {activeTab === 'variants' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 font-outfit text-sm">
                  Annotated DNA Sequence Variants &amp; ACMG Classifications
                </h3>
                <p className="text-xs text-slate-500">
                  Clinically validated sequence alterations verified via whole exome depth and gnomAD population frequencies.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
                Clinical Grade
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {(currentProfile?.detectedVariants || []).map((v, idx) => (
                <div key={idx} className="p-5 hover:bg-slate-50/70 transition space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded-lg border border-blue-200">
                        {v.gene}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-800 font-mono">
                          {v.variantId} • {v.hgvs}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Zygosity: <strong className="text-slate-700 font-sans">{v.zygosity}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold border ${
                        v.acmgClassification.toLowerCase().includes('pathogenic')
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {v.acmgClassification}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phenotype Significance</span>
                      <p className="text-slate-700 font-medium mt-0.5">{v.clinicalSignificance}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Actionable Guideline</span>
                      <p className="text-blue-900 font-medium mt-0.5">{v.actionableGuideline}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PHARMACOGENOMICS (PGx) CHECKER */}
      {activeTab === 'pgx' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Drug query panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Pill className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 font-outfit text-sm">
                  Pharmacogenomic Compatibility Query
                </h3>
              </div>

              <p className="text-xs text-slate-500">
                Check any therapeutic compound against this patient's CYP450, SLCO1B1, and VKORC1 alleles for metabolic compatibility.
              </p>

              <form onSubmit={handleCheckPgx} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medication Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pgxDrugInput}
                      onChange={(e) => setPgxDrugInput(e.target.value)}
                      placeholder="e.g. Clopidogrel, Simvastatin, Warfarin, Codeine"
                      className="w-full text-xs p-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 w-full font-medium">Quick Select Drug:</span>
                  {['Clopidogrel', 'Simvastatin', 'Warfarin', 'Codeine', 'Fluorouracil'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setPgxDrugInput(d)}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border transition ${
                        pgxDrugInput === d
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={checkingPgx}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                >
                  {checkingPgx ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Run Gene-Drug Compatibility Analysis</span>
                </button>
              </form>
            </div>

            {/* Current Patient Verified PGx Matrix */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Profile PGx Summary ({currentProfile?.patientName})
              </h4>
              <div className="space-y-2">
                {(currentProfile?.pharmacogenomics || []).map((pgx, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{pgx.drug}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                        {pgx.gene}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Phenotype: <span className="font-semibold text-slate-800">{pgx.phenotype}</span>
                    </div>
                    <div className="text-[10px] text-blue-800 font-medium pt-1">
                      {pgx.cpicGuideline}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results panel (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {pgxResult ? (
              <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="text-base font-bold text-slate-800 font-outfit">
                        Clinical Pharmacogenomic Decision Support
                      </h4>
                      <span className="text-xs text-slate-500">Drug Evaluated: <strong>{pgxResult.drug}</strong></span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    pgxResult.alertLevel === 'Danger'
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : pgxResult.alertLevel === 'Warning'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {pgxResult.alertLevel} Alert Status
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Primary Mediating Gene</span>
                    <div className="text-sm font-bold text-blue-900 font-mono mt-0.5">{pgxResult.gene}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Patient Genotype Phenotype</span>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{pgxResult.phenotype}</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Clinical Evidence &amp; Dosing Action Recommendation
                  </span>
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    {pgxResult.recommendation}
                  </p>
                  <div className="pt-2 text-[10px] font-mono text-blue-600">
                    Standard Guideline: {pgxResult.evidenceLevel || 'CPIC Level A'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
                Select a pharmaceutical agent on the left to review tailored dosing guidance.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GENE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 font-outfit text-base">
                MediNova Precision Gene Reference Directory
              </h3>
              <p className="text-xs text-slate-500">
                Core high-penetrance genetic loci included in comprehensive exome sequencing panels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalog.map((gene, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:bg-slate-100/60 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold font-mono text-blue-700">{gene.gene}</span>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                      {gene.chromosome}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    Category: {gene.category}
                  </span>
                  <p className="text-xs text-slate-500">
                    {gene.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ORDER / RUN SEQUENCING PANEL */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 font-outfit mb-1 flex items-center gap-2">
              <Dna className="w-5 h-5 text-blue-600" />
              <span>Order Next-Gen Genomic Sequencing Panel</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Commission whole-exome next-generation sequencing with high-depth clinical variant filtering.
            </p>

            <form onSubmit={handleOrderSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Patient</label>
                <select
                  value={orderForm.patientId}
                  onChange={(e) => setOrderForm({ ...orderForm, patientId: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sequencing Assay &amp; Platform</label>
                <select
                  value={orderForm.panelType}
                  onChange={(e) => setOrderForm({ ...orderForm, panelType: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="Illumina NovaSeq 6000 Whole Exome + Precision Cardiology (120x)">
                    Illumina NovaSeq 6000 Whole Exome + Precision Cardiology (120x)
                  </option>
                  <option value="Targeted Oncology &amp; Hereditary Cancer Screen (150x)">
                    Targeted Oncology &amp; Hereditary Cancer Screen (150x)
                  </option>
                  <option value="Complete Pharmacogenomics CYP450 / SLCO1B1 Array">
                    Complete Pharmacogenomics CYP450 / SLCO1B1 Array
                  </option>
                  <option value="Full Genome Clinical Sequencing (30x Whole Genome)">
                    Full Genome Clinical Sequencing (30x Whole Genome)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Diagnostic Indication</label>
                <input
                  type="text"
                  value={orderForm.targetDiseases}
                  onChange={(e) => setOrderForm({ ...orderForm, targetDiseases: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-[11px] text-blue-800 space-y-1">
                <span className="font-bold">Automated Clinical Bio-Informatics Pipeline:</span>
                <p>Calculates polygenic risk scores across 5 major conditions and annotates ACMG actionable variants.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ordering}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  {ordering ? 'Sequencing...' : 'Initiate Sequencing Assay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
