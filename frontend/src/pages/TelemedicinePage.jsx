import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  MessageSquare,
  Clock,
  Calendar,
  User,
  Shield,
  Send,
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  ExternalLink,
  Stethoscope,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function TelemedicinePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All', 'Scheduled', 'In-Progress', 'Completed'

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookData, setBookData] = useState({
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '02:00 PM',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Active Call Room State
  const [activeSession, setActiveSession] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(145); // simulated starting at 2m 25s
  const [chatMessages, setChatMessages] = useState([
    { sender: 'System', text: 'Encrypted virtual room initialized. Audio and video connected via TLS 1.3.', time: '02:00 PM' },
    { sender: 'Dr. Marcus Vance', text: 'Hello! I can see and hear you clearly. How are your symptoms progressing today?', time: '02:01 PM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Doctor Consultation Workspace inside active call
  const [consultNotes, setConsultNotes] = useState('');
  const [consultDiagnosis, setConsultDiagnosis] = useState('');
  const [prescriptions, setPrescriptions] = useState([
    { name: '', dosage: '', frequency: '', days: '' }
  ]);
  const [completing, setCompleting] = useState(false);
  const [completedSuccessMsg, setCompletedSuccessMsg] = useState('');

  // Selected session for viewing details
  const [viewDetailsSession, setViewDetailsSession] = useState(null);

  const isDoctor = user?.role === 'Doctor' || user?.role === 'Admin';

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessRes, docRes] = await Promise.all([
        api.getTelemedicineSessions(),
        api.getDoctors()
      ]);
      setSessions(sessRes.sessions || []);
      setDoctors(docRes.doctors || []);
      if (docRes.doctors?.length > 0 && !bookData.doctorId) {
        setBookData(prev => ({ ...prev, doctorId: docRes.doctors[0].id }));
      }
    } catch (err) {
      console.error('Failed to load telemedicine data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer for active call
  useEffect(() => {
    let timer;
    if (activeSession) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!bookData.doctorId || !bookData.date || !bookData.timeSlot) {
      alert('Please select a doctor, date, and time slot.');
      return;
    }
    try {
      setSubmitting(true);
      await api.bookTelemedicineSession(bookData);
      setIsBookModalOpen(false);
      setBookData({
        doctorId: doctors[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        timeSlot: '02:00 PM',
        reason: ''
      });
      await loadData();
    } catch (err) {
      alert('Failed to book session: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartCall = async (session) => {
    setActiveSession(session);
    setCallDuration(0);
    setConsultNotes(session.notes || '');
    setConsultDiagnosis(session.reason || '');
    setPrescriptions(session.prescription?.length ? session.prescription : [{ name: '', dosage: '', frequency: '', days: '' }]);
    if (session.status === 'Scheduled') {
      try {
        await api.updateTelemedicineStatus(session.id, 'In-Progress');
        loadData();
      } catch (err) {
        console.error('Failed to update status', err);
      }
    }
  };

  const handleEndCall = () => {
    setActiveSession(null);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      sender: user.name || 'You',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  const handleAddRxRow = () => {
    setPrescriptions(prev => [...prev, { name: '', dosage: '', frequency: '', days: '' }]);
  };

  const handleRemoveRxRow = (index) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleRxChange = (index, field, value) => {
    setPrescriptions(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleCompleteConsultation = async () => {
    if (!activeSession) return;
    try {
      setCompleting(true);
      const validRx = prescriptions.filter(p => p.name.trim() !== '');
      await api.completeTelemedicineSession(activeSession.id, {
        notes: consultNotes,
        diagnosis: consultDiagnosis,
        prescriptions: validRx
      });
      setCompletedSuccessMsg('Consultation successfully finalized and recorded into Patient EMR records!');
      setTimeout(() => {
        setCompletedSuccessMsg('');
        setActiveSession(null);
        loadData();
      }, 2000);
    } catch (err) {
      alert('Failed to complete consultation: ' + err.message);
    } finally {
      setCompleting(false);
    }
  };

  const filteredSessions = sessions.filter(s => {
    if (filter === 'All') return true;
    return s.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Video className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold font-outfit text-slate-800">Telemedicine & Virtual Consultations</h1>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              Encrypted • WebRTC Ready
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Secure, end-to-end encrypted remote clinical consultations with digital prescriptions and automatic EMR synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Request Virtual Consultation</span>
          </button>
        </div>
      </div>

      {/* If Active Call is ongoing: Render Full Interactive Virtual Room */}
      {activeSession ? (
        <div className="bg-white border border-blue-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
          {/* Virtual Call Header Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-ping"></div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Room: {activeSession.roomId}</span>
                  <span className="text-xs font-mono bg-blue-600/30 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                    Encrypted TLS 1.3
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Patient: <strong className="text-white">{activeSession.patientName}</strong> • Doctor: <strong className="text-white">{activeSession.doctorName}</strong> ({activeSession.specialty})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-sm text-blue-300">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{formatTimer(callDuration)}</span>
              </div>
              <button
                onClick={handleEndCall}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Leave Call</span>
              </button>
            </div>
          </div>

          {completedSuccessMsg && (
            <div className="p-4 bg-blue-50 border-b border-blue-200 text-blue-700 flex items-center gap-2 text-sm font-semibold">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span>{completedSuccessMsg}</span>
            </div>
          )}

          {/* Main Call Stage: Video Feeds + Side Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* Video Streams Container (7 or 8 cols) */}
            <div className="lg:col-span-7 bg-slate-950 p-4 flex flex-col justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* Doctor Feed */}
                <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
                  {isVideoOn ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 p-6 text-center">
                      <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-400/40 flex items-center justify-center text-blue-300 mb-3 relative">
                        <Stethoscope className="w-10 h-10" />
                        <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
                      </div>
                      <div className="text-sm font-bold text-white">{activeSession.doctorName}</div>
                      <div className="text-xs text-blue-300 font-medium">{activeSession.specialty} Specialist</div>
                      <div className="flex items-center gap-1 mt-3">
                        <span className="w-1.5 h-4 bg-blue-400 rounded-full animate-pulse"></span>
                        <span className="w-1.5 h-6 bg-blue-400 rounded-full animate-pulse"></span>
                        <span className="w-1.5 h-3 bg-blue-400 rounded-full animate-pulse"></span>
                        <span className="w-1.5 h-5 bg-blue-400 rounded-full animate-pulse"></span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-500">
                      <VideoOff className="w-10 h-10 mb-2" />
                      <span className="text-xs">Camera Feed Paused</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] text-white font-medium border border-slate-700">
                    {activeSession.doctorName} (Doctor)
                  </div>
                </div>

                {/* Patient Feed */}
                <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-400/30 flex items-center justify-center text-blue-200 mb-3 relative">
                      <User className="w-10 h-10" />
                      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
                    </div>
                    <div className="text-sm font-bold text-white">{activeSession.patientName}</div>
                    <div className="text-xs text-slate-400">Patient • Age: {activeSession.patientAge || 34}</div>
                    <div className="mt-3 text-[11px] bg-slate-800/90 text-blue-300 px-3 py-1 rounded-full border border-slate-700">
                      Reason: {activeSession.reason}
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] text-white font-medium border border-slate-700">
                    {activeSession.patientName} (Patient)
                  </div>
                </div>
              </div>

              {/* Call Control Strip */}
              <div className="mt-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-3 rounded-full transition ${isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600/20 text-red-400 border border-red-500/30'}`}
                  title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-full transition ${isVideoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600/20 text-red-400 border border-red-500/30'}`}
                  title={isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
                >
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`p-3 rounded-full transition ${isScreenSharing ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                  title="Toggle Screen Sharing"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                <button
                  onClick={handleEndCall}
                  className="px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 transition shadow-lg"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Consultation</span>
                </button>
              </div>
            </div>

            {/* In-Call Workspace & Chat (5 cols) */}
            <div className="lg:col-span-5 bg-white border-l border-slate-200 flex flex-col justify-between">
              {/* Doctor Clinical Documentation Tab or In-call Chat */}
              <div className="p-4 overflow-y-auto max-h-[500px] space-y-4">
                {/* Consultation Details Card */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs">
                  <div className="font-semibold text-blue-900 mb-1 flex items-center justify-between">
                    <span>Clinical Case Assessment</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">EMR Synced</span>
                  </div>
                  <div className="text-slate-600"><strong>Chief Complaint:</strong> {activeSession.reason}</div>
                  <div className="text-slate-600"><strong>Patient Contact:</strong> {activeSession.patientContact}</div>
                </div>

                {/* Doctor Note Writer */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Doctor Clinical Notes & Findings</span>
                  </label>
                  <textarea
                    rows={3}
                    value={consultNotes}
                    onChange={(e) => setConsultNotes(e.target.value)}
                    placeholder="Enter patient observations, clinical findings, examination notes..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Digital Prescription Builder */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Digital Prescription (Rx)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddRxRow}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Medicine</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {prescriptions.map((rx, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Medicine Name (e.g. Metoprolol 25mg)"
                            value={rx.name}
                            onChange={(e) => handleRxChange(idx, 'name', e.target.value)}
                            className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          {prescriptions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRxRow(idx)}
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Dosage (e.g. 1 tab)"
                            value={rx.dosage}
                            onChange={(e) => handleRxChange(idx, 'dosage', e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700"
                          />
                          <input
                            type="text"
                            placeholder="Frequency (Daily)"
                            value={rx.frequency}
                            onChange={(e) => handleRxChange(idx, 'frequency', e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700"
                          />
                          <input
                            type="text"
                            placeholder="Days (e.g. 7 days)"
                            value={rx.days}
                            onChange={(e) => handleRxChange(idx, 'days', e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Finalize Consultation Button (Doctor/Admin) */}
                <button
                  type="button"
                  onClick={handleCompleteConsultation}
                  disabled={completing}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{completing ? 'Saving to EMR...' : 'Complete Consultation & Sync EMR'}</span>
                </button>

                {/* In-Call Encrypted Chat Log */}
                <div className="border-t border-slate-200 pt-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    <span>In-Call Encrypted Messages</span>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className="leading-tight">
                        <span className="font-semibold text-blue-800">{msg.sender}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">{msg.time}</span>
                        <p className="text-slate-600 mt-0.5">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Type secure in-call message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          {['All', 'Scheduled', 'In-Progress', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab} ({sessions.filter(s => tab === 'All' ? true : s.status === tab).length})
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Showing {filteredSessions.length} consultations
        </span>
      </div>

      {/* Consultations List Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Loading virtual consultations...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <Video className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-700">No consultations found</h4>
          <p className="text-xs text-slate-400 mt-1 mb-4">Book a virtual session to connect with specialist doctors.</p>
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
          >
            Book Virtual Consultation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => {
            const isCompleted = session.status === 'Completed';
            const isInProgress = session.status === 'In-Progress';
            return (
              <div
                key={session.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : isInProgress
                          ? 'bg-blue-100 text-blue-700 border border-blue-300 animate-pulse'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {session.status}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{session.timeSlot}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 font-outfit mb-1">{session.reason}</h3>
                  <div className="text-xs text-slate-500 mb-3">
                    Specialist: <strong className="text-blue-700">{session.doctorName}</strong> ({session.specialty})
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Patient: <strong>{session.patientName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Date: {session.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-mono text-[11px] text-blue-700">Room: {session.roomId}</span>
                    </div>
                  </div>

                  {/* If completed, display notes preview */}
                  {isCompleted && session.notes && (
                    <div className="text-xs text-slate-500 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 mb-4">
                      <strong>Clinical Notes:</strong> {session.notes.slice(0, 80)}...
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isCompleted ? (
                    <button
                      onClick={() => setViewDetailsSession(session)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Rx & Clinical Report</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartCall(session)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{isInProgress ? 'Resume Video Call' : 'Join Virtual Room'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Telemedicine Session Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 font-outfit mb-1 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              <span>Book Virtual Telemedicine Consultation</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Schedule an end-to-end encrypted video consultation with a certified hospital specialist.
            </p>

            <form onSubmit={handleBookSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Doctor / Specialty</label>
                <select
                  value={bookData.doctorId}
                  onChange={(e) => setBookData({ ...bookData, doctorId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty || d.department} ({d.contact})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={bookData.date}
                    onChange={(e) => setBookData({ ...bookData, date: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={bookData.timeSlot}
                    onChange={(e) => setBookData({ ...bookData, timeSlot: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Symptoms / Consultation Reason</label>
                <textarea
                  rows={3}
                  value={bookData.reason}
                  onChange={(e) => setBookData({ ...bookData, reason: e.target.value })}
                  placeholder="Describe your current symptoms, duration, and concerns for the doctor..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  {submitting ? 'Confirming...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completed Session Details & Digital Rx Modal */}
      {viewDetailsSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-800 font-outfit">Consultation Record & Rx</h3>
              </div>
              <button
                onClick={() => setViewDetailsSession(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                <div className="font-semibold text-blue-900">Consultation Summary</div>
                <div className="text-slate-600 mt-1">
                  <strong>Patient:</strong> {viewDetailsSession.patientName} • <strong>Doctor:</strong> {viewDetailsSession.doctorName}
                </div>
                <div className="text-slate-600">
                  <strong>Date:</strong> {viewDetailsSession.date} • <strong>Room:</strong> {viewDetailsSession.roomId}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Clinical Findings & Doctor Notes</label>
                <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-600">
                  {viewDetailsSession.notes || 'Routine consultation concluded.'}
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Prescribed Medications</label>
                {viewDetailsSession.prescription && viewDetailsSession.prescription.length > 0 ? (
                  <div className="space-y-1.5">
                    {viewDetailsSession.prescription.map((rx, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{rx.name}</span>
                          <span className="text-slate-400 text-[11px] ml-2">({rx.dosage})</span>
                        </div>
                        <span className="bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded text-[11px]">
                          {rx.frequency} {rx.days ? `• ${rx.days}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No prescription generated for this session.</p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewDetailsSession(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
