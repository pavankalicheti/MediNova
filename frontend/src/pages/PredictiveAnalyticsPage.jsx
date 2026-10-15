import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Activity,
  Layers,
  Sparkles,
  Users,
  Bed,
  HeartPulse,
  Pill,
  Droplet,
  ShieldAlert,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Zap,
  Info
} from 'lucide-react';

export default function PredictiveAnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scenario Simulation State
  const [selectedScenario, setSelectedScenario] = useState('Seasonal Viral Epidemic (+35% Patient Load)');
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.35);
  const [simDuration, setSimDuration] = useState(7);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Active view tab inside analytics
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'volume', 'resources', 'pharmacy_blood', 'simulator'

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalyticsOverview();
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to load predictive analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunSimulation = async (e) => {
    if (e) e.preventDefault();
    try {
      setSimulating(true);
      const result = await api.simulateScenario({
        scenarioType: selectedScenario,
        surgeMultiplier,
        durationDays: simDuration
      });
      setSimulationResult(result);
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
        <p className="font-mono uppercase tracking-wider text-slate-500">Synthesizing AI Predictive Model...</p>
      </div>
    );
  }

  const {
    advisoryDisclaimer,
    liveStats,
    historicalAdmissions,
    next7DaysForecast,
    resourceUtilization,
    medicineBurnProjections,
    bloodProjections,
    aiRecommendations
  } = analytics || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold font-outfit text-slate-800">AI-Based Predictive Healthcare Analytics</h1>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              Automated • Intelligence Engine
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Real-time machine intelligence analyzing admissions velocity, ER surge probabilities, bed bottleneck forecasting, and proactive pharmaceutical reordering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition"
          >
            <Sliders className="w-4 h-4" />
            <span>Launch Surge Simulator</span>
          </button>
        </div>
      </div>

      {/* Advisory Disclaimer Banner */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-900 shadow-sm">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Clinical Advisory Notice:</strong>
          <span className="text-blue-800 ml-1">
            {advisoryDisclaimer || 'Predictive analytics outputs are probabilistic statistical estimates generated for clinical workflow planning and resource management. They do not represent guaranteed clinical outcomes.'}
          </span>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Projected 7d Intake</div>
          <div className="text-2xl font-bold font-outfit text-slate-800 mt-1">1,337 Patients</div>
          <div className="text-[11px] text-blue-600 mt-0.5 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% vs Last Week</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">ICU Occupancy Saturation</div>
          <div className="text-2xl font-bold font-outfit text-blue-700 mt-1">{resourceUtilization?.icuBedRate}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-blue-500" />
            <span>{resourceUtilization?.occupiedIcuBeds}/{resourceUtilization?.totalIcuBeds} Beds Active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Weekend Surge Probability</div>
          <div className="text-2xl font-bold font-outfit text-slate-900 mt-1">88% (High)</div>
          <div className="text-[11px] text-blue-600 mt-0.5 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
            <span>ER Peak Friday &amp; Saturday</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Supply Depletion Risk</div>
          <div className="text-2xl font-bold font-outfit text-slate-800 mt-1">2 Medicines</div>
          <div className="text-[11px] text-blue-600 mt-0.5 flex items-center gap-1 font-medium">
            <Pill className="w-3.5 h-3.5" />
            <span>Stockout &lt; 5 Days</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'overview', label: 'Overview & Recommendations' },
            { id: 'volume', label: 'Patient Volume Forecast' },
            { id: 'resources', label: 'Bed & ICU Utilization' },
            { id: 'pharmacy_blood', label: 'Drug Burn & Blood Demand' },
            { id: 'simulator', label: 'AI Surge Simulator', badge: 'Interactive' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 1. OVERVIEW & PRESCRIPTIVE RECOMMENDATIONS TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Prescriptive Decision Support Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800 font-outfit text-base">
                    Actionable Prescriptive Insights
                  </h3>
                </div>
                <span className="text-xs font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                  Clinical Support
                </span>
              </div>

              <div className="space-y-3">
                {aiRecommendations?.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-slate-50 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-2xl transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>{rec.department}</span>
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                        {rec.priority} Priority
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rec.message}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">Suggested Protocol:</span>
                      <button
                        onClick={() => alert(`Action Dispatched: ${rec.action}`)}
                        className="px-3 py-1 bg-white hover:bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200 rounded-lg shadow-2xs transition"
                      >
                        {rec.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Real-Time Capacity Gauges (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 font-outfit text-base">Live Resource Saturation</h3>

              {/* General Beds */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>General Ward Beds</span>
                  <span className="font-mono font-bold text-slate-800">
                    {resourceUtilization?.occupiedGeneralBeds}/{resourceUtilization?.totalGeneralBeds} ({resourceUtilization?.generalBedRate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${resourceUtilization?.generalBedRate}%` }}
                  ></div>
                </div>
              </div>

              {/* ICU Beds */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Intensive Care Unit (ICU)</span>
                  <span className="font-mono font-bold text-blue-800">
                    {resourceUtilization?.occupiedIcuBeds}/{resourceUtilization?.totalIcuBeds} ({resourceUtilization?.icuBedRate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-700 h-2.5 rounded-full"
                    style={{ width: `${resourceUtilization?.icuBedRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Ventilators */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Mechanical Ventilators</span>
                  <span className="font-mono font-bold text-slate-800">
                    {resourceUtilization?.occupiedVentilators}/{resourceUtilization?.totalVentilators} ({resourceUtilization?.ventilatorRate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-sky-600 h-2.5 rounded-full"
                    style={{ width: `${resourceUtilization?.ventilatorRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 text-[10px]">On-Duty Staff</div>
                  <div className="text-base font-bold text-slate-800 font-mono mt-0.5">
                    {resourceUtilization?.activeDoctorsOnDuty} Doctors
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 text-[10px]">Ambulance Fleet</div>
                  <div className="text-base font-bold text-slate-800 font-mono mt-0.5">
                    {resourceUtilization?.ambulancesDispatched}/{resourceUtilization?.ambulancesOperational} Active
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link to Simulator */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl text-xs space-y-2">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Simulate Future Scenarios</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Test hospital resilience under epidemic surges, major traffic collisions, or severe weather anomalies before they occur.
              </p>
              <button
                onClick={() => setActiveTab('simulator')}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
              >
                Open Surge Simulation Tool
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PATIENT VOLUME FORECAST TAB */}
      {activeTab === 'volume' && (
        <div className="space-y-6">
          {/* 7-Day Forward Forecast Table & Bar Visualization */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 font-outfit text-base">
                  Forward 7-Day Predictive Patient Intake &amp; Surge Forecast
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated using autoregressive moving average weighted by historical OPD demand and emergency triage queue trends.
                </p>
              </div>
              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-bold">
                Confidence: 94.2%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {next7DaysForecast?.map((f, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between text-center space-y-2 hover:border-blue-300 transition"
                >
                  <div className="text-xs font-bold text-slate-700">{f.day}</div>
                  <div>
                    <div className="text-xl font-bold font-mono text-blue-800">
                      {f.expectedAdmissions}
                    </div>
                    <div className="text-[10px] text-slate-400">Patients</div>
                  </div>

                  {/* Surge Probability Meter */}
                  <div>
                    <div className="text-[10px] text-slate-500 flex justify-between mb-0.5">
                      <span>Surge</span>
                      <span className="font-mono font-bold text-blue-700">{f.surgeProbability}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${f.surgeProbability}%` }}
                      ></div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      f.riskLevel.includes('Critical')
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : f.riskLevel.includes('High')
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {f.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Baseline vs Actual Comparison */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 font-outfit text-base">
              Historical Operational Baseline Analysis (Past 7 Days)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Day</th>
                    <th className="p-3">Actual Intake</th>
                    <th className="p-3">AI Projected</th>
                    <th className="p-3">Variance</th>
                    <th className="p-3">ER Trauma Cases</th>
                    <th className="p-3">Urgent Care</th>
                    <th className="p-3">Routine OPD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {historicalAdmissions?.map((h, i) => {
                    const variance = h.actual - h.projected;
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition font-sans">
                        <td className="p-3 font-bold text-slate-800">{h.day}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{h.actual}</td>
                        <td className="p-3 font-mono text-slate-500">{h.projected}</td>
                        <td className="p-3 font-mono">
                          <span className={variance >= 0 ? 'text-blue-700 font-bold' : 'text-slate-500'}>
                            {variance >= 0 ? `+${variance}` : variance}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-700">{h.erCount}</td>
                        <td className="p-3 font-mono text-slate-700">{h.urgentCount}</td>
                        <td className="p-3 font-mono text-slate-700">{h.routineCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. BED & ICU UTILIZATION TAB */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* General Ward */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-sm">General Ward Beds</span>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                {resourceUtilization?.generalBedRate}%
              </span>
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-extrabold font-outfit text-slate-800">
                {resourceUtilization?.occupiedGeneralBeds}
                <span className="text-base text-slate-400 font-normal"> / {resourceUtilization?.totalGeneralBeds}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Available: {resourceUtilization?.totalGeneralBeds - resourceUtilization?.occupiedGeneralBeds} open beds</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <div><strong>Projected Saturation:</strong> In 42 Hours</div>
              <div><strong>Discharge Turnover Rate:</strong> 18 patients/day</div>
            </div>
          </div>

          {/* ICU Capacity */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-sm">ICU Critical Beds</span>
              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                {resourceUtilization?.icuBedRate}% (Bottleneck)
              </span>
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-extrabold font-outfit text-blue-800">
                {resourceUtilization?.occupiedIcuBeds}
                <span className="text-base text-slate-400 font-normal"> / {resourceUtilization?.totalIcuBeds}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Available: only {resourceUtilization?.totalIcuBeds - resourceUtilization?.occupiedIcuBeds} critical beds remaining</p>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
              <div><strong>Bottleneck Alarm:</strong> Saturation in 16h</div>
              <div><strong>Prescription:</strong> Transfer stabilized patients to HDU</div>
            </div>
          </div>

          {/* Ventilators */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-sm">Mechanical Ventilators</span>
              <span className="text-xs font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold">
                {resourceUtilization?.ventilatorRate}%
              </span>
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-extrabold font-outfit text-slate-800">
                {resourceUtilization?.occupiedVentilators}
                <span className="text-base text-slate-400 font-normal"> / {resourceUtilization?.totalVentilators}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Available: {resourceUtilization?.totalVentilators - resourceUtilization?.occupiedVentilators} units in sterile standby</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <div><strong>Maintenance Schedule:</strong> All certified</div>
              <div><strong>Auxiliary Supply:</strong> 4 portable units on call</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DRUG BURN RATE & BLOOD DEMAND TAB */}
      {activeTab === 'pharmacy_blood' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medicine Burn Rate Forecasting */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 font-outfit text-sm">
                  Pharmaceutical Burn-Rate &amp; Stockout Forecast
                </h3>
              </div>
              <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Days to Zero
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {medicineBurnProjections?.map((m) => (
                <div key={m.medicineId} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{m.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Current Stock: <strong>{m.currentStock}</strong> • Daily Burn: {m.dailyBurnRate}/day
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        m.urgency === 'High Urgency'
                          ? 'bg-blue-100 text-blue-900 border border-blue-400 font-bold'
                          : m.urgency === 'Moderate'
                          ? 'bg-sky-50 text-sky-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.daysUntilStockout} Days Left
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{m.urgency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blood Unit Depletion vs 7-Day Requirement */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 font-outfit text-sm">
                  Blood Group Inventory vs 7-Day Forward Demand
                </h3>
              </div>
              <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Deficit Risk
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {bloodProjections?.map((b) => (
                <div key={b.bloodGroup} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-700">
                      {b.bloodGroup}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">
                        {b.currentUnits} Units in Stock
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Projected 7-Day Demand: {b.projected7DayDemand} units
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        b.alertRequired
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {b.projectedStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE SURGE SIMULATION ENGINE TAB */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-blue-200 rounded-2xl p-5 shadow-md space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 font-outfit text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>Simulate Emergency Surge Scenario</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Model patient intake spikes to evaluate hospital resilience and discover critical resource bottlenecks.
              </p>
            </div>

            <form onSubmit={handleRunSimulation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preset Incident Scenario
                </label>
                <select
                  value={selectedScenario}
                  onChange={(e) => {
                    setSelectedScenario(e.target.value);
                    if (e.target.value.includes('35%')) setSurgeMultiplier(1.35);
                    else if (e.target.value.includes('50%')) setSurgeMultiplier(1.50);
                    else if (e.target.value.includes('20%')) setSurgeMultiplier(1.20);
                    else setSurgeMultiplier(1.65);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="Seasonal Viral Epidemic (+35% Patient Load)">
                    Seasonal Viral Epidemic (+35% Patient Load)
                  </option>
                  <option value="Multi-Vehicle Interstate Collision (+50% Trauma / ER)">
                    Multi-Vehicle Interstate Collision (+50% Trauma / ER)
                  </option>
                  <option value="Winter Cold Wave &amp; Respiratory Influx (+20%)">
                    Winter Cold Wave &amp; Respiratory Influx (+20%)
                  </option>
                  <option value="Major Mass-Casualty Disaster (+65% Surge)">
                    Major Mass-Casualty Disaster (+65% Surge)
                  </option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Surge Multiplier Factor</span>
                  <span className="font-mono text-blue-700">{surgeMultiplier}× (+{Math.round((surgeMultiplier - 1) * 100)}%)</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.05"
                  value={surgeMultiplier}
                  onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1.0× (Baseline)</span>
                  <span>1.5× (+50%)</span>
                  <span>2.0× (+100% Double)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Simulation Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={simDuration}
                  onChange={(e) => setSimDuration(parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={simulating}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{simulating ? 'Computing Tensor Models...' : 'Execute Surge Simulation'}</span>
              </button>
            </form>
          </div>

          {/* Results Display (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 font-outfit text-base">
                Simulation Projection Outcome
              </h3>

              {simulationResult ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-blue-900">{simulationResult.scenario}</div>
                    <div className="text-slate-600">
                      Multiplier: <strong>{simulationResult.surgeMultiplier}×</strong> • Duration: {simulationResult.durationDays || simDuration} days
                    </div>
                  </div>

                  {/* Projected Bed Saturation */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-700 mb-1">
                      <span>Simulated General Ward Load</span>
                      <span className="font-mono font-bold text-blue-900">
                        {simulationResult.impact.projectedBedDemand} / {simulationResult.impact.bedCapacity} ({simulationResult.impact.bedSaturationRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${simulationResult.impact.bedSaturationRate}%` }}
                      ></div>
                    </div>
                    {simulationResult.impact.bedDeficit > 0 && (
                      <div className="text-[11px] text-blue-700 font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Deficit Alert: {simulationResult.impact.bedDeficit} overflow patients without beds!</span>
                      </div>
                    )}
                  </div>

                  {/* Projected ICU Saturation */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-700 mb-1">
                      <span>Simulated ICU Saturation</span>
                      <span className="font-mono font-bold text-blue-900">
                        {simulationResult.impact.projectedIcuDemand} / {simulationResult.impact.icuCapacity} ({simulationResult.impact.icuSaturationRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-700 h-3 rounded-full"
                        style={{ width: `${simulationResult.impact.icuSaturationRate}%` }}
                      ></div>
                    </div>
                    {simulationResult.impact.icuDeficit > 0 && (
                      <div className="text-[11px] text-blue-800 font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Critical Deficit: {simulationResult.impact.icuDeficit} patients requiring critical care without ICU units!</span>
                      </div>
                    )}
                  </div>

                  {/* Recommendation Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <span className="font-bold uppercase tracking-wider text-slate-500">
                      Predictive Prescriptive Strategy
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {simulationResult.impact.recommendation}
                    </p>
                    <div className="text-[11px] text-slate-500">
                      Estimated auxiliary ambulances required for patient diversion: <strong>+{simulationResult.impact.estimatedAdditionalAmbulancesNeeded} units</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Adjust simulation parameters on the left and click "Execute Surge Simulation" to evaluate facility load.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
