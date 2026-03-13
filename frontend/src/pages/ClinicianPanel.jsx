import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import { Users, Link as LinkIcon, AlertTriangle, FileText, Loader2, LogOut } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const ClinicianPanel = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkEmail, setLinkEmail] = useState('');
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [report, setReport] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await apiClient.get('/api/clinician/patients');
      setPatients(res.data.patients);
    } catch (e) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/clinician/link-patient', { patient_email: linkEmail });
      toast.success('Patient linked successfully');
      setLinkEmail('');
      fetchPatients();
    } catch (e) {
      toast.error('Could not find patient with that email');
    }
  };

  const loadPatientData = async (pid) => {
    try {
      const res = await apiClient.get(`/api/clinician/patient/${pid}`);
      setSelectedPatient(res.data);
      setReport('');
    } catch (e) {
      toast.error('Failed to load patient history');
    }
  };

  const generateReport = async () => {
    if (!selectedPatient) return;
    setLoadingReport(true);
    try {
      const res = await apiClient.get(`/api/clinician/report/${selectedPatient.patient.id}`);
      setReport(res.data.clinical_report);
    } catch (e) {
      toast.error('Failed to generate report');
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="bg-bg min-h-screen flex flex-col">
      <header className="h-16 glass px-6 flex items-center justify-between border-b border-primary/20 sticky top-0 z-10 w-full">
        <div className="flex items-center gap-2">
          <Users className="text-secondary w-6 h-6" />
          <span className="font-bold text-xl">Clinician Portal</span>
          <span className="text-xs bg-white/10 px-2 rounded-full py-0.5 ml-2 text-text-secondary">Dr. {user?.name} (ID: {user?.id})</span>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-text-secondary hover:text-alert hover:bg-alert/10 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Patient List Sidebar */}
        <aside className="w-80 border-r border-white/10 bg-surface/50 h-[calc(100vh-64px)] overflow-y-auto p-4">
          <form onSubmit={handleLink} className="mb-6 bg-black/40 p-3 rounded-xl border border-white/5">
            <label className="block text-xs font-semibold mb-2 uppercase text-text-secondary tracking-wider">Link New Patient</label>
            <div className="flex gap-2">
              <input 
                type="email" required value={linkEmail} onChange={e=>setLinkEmail(e.target.value)}
                placeholder="patient@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-secondary"
              />
              <button type="submit" className="bg-secondary/20 hover:bg-secondary/30 text-secondary p-1.5 rounded-lg transition-colors">
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
          </form>

          <h3 className="text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">Active Patients ({(patients || []).length})</h3>
          
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl"></div>)}
            </div>
          ) : (
            <div className="space-y-2">
              {(patients || []).map(p => (
                <button 
                  key={p.id} onClick={() => loadPatientData(p.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    selectedPatient?.patient?.id === p.id 
                      ? 'bg-secondary/10 border-secondary border-l-4 glow' 
                      : 'bg-black/20 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm">{p.name}</div>
                    <div className="text-xs text-text-secondary truncate w-32">{p.email}</div>
                  </div>
                  {p.current_risk > 75 && <AlertTriangle className="w-4 h-4 text-alert" />}
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Selected Patient Viewer */}
        <main className="flex-1 h-[calc(100vh-64px)] overflow-y-auto p-8 relative">
          {!selectedPatient ? (
            <div className="h-full flex flex-col items-center justify-center text-text-secondary">
              <Users className="w-16 h-16 opacity-20 mb-4" />
              <p>Select a patient from the sidebar to view their clinical data.</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <div>
                  <h1 className="text-3xl font-bold">{selectedPatient?.patient?.name || 'Unknown Patient'}</h1>
                  <p className="text-text-secondary">{selectedPatient?.patient?.email || 'No email provided'} • ID: {selectedPatient?.patient?.id}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-text-secondary">Current Risk Score</div>
                  <div className="text-4xl font-bold" style={{ color: selectedPatient?.current_risk >= 75 ? '#FF4D6D' : selectedPatient?.current_risk >= 40 ? '#FFB347' : '#2ECC71' }}>
                    {Math.round(selectedPatient?.current_risk || 0)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="glass p-6 rounded-3xl h-64">
                  <h3 className="font-bold mb-4">Risk Trajectory (Last 30 Logs)</h3>
                  <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    {selectedPatient?.history && selectedPatient.history.length > 0 ? (
                      <AreaChart data={selectedPatient.history.map((h,i)=>({name:`Day ${i}`, risk: h?.overall_score || 0})).reverse()}>
                        <defs>
                          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#00D4AA" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <RechartsTooltip contentStyle={{ backgroundColor: '#13132A', border: 'none', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="risk" stroke="#00D4AA" fillOpacity={1} fill="url(#colorRisk)" />
                        <ReferenceLine y={selectedPatient.patient?.alert_threshold || 75} stroke="#FF4D6D" strokeDasharray="3 3" />
                      </AreaChart>
                    ) : (
                      <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                        No historical risk data available yet.
                      </div>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="glass p-6 rounded-3xl">
                  <h3 className="font-bold mb-4">Recent Alerts</h3>
                  {(!selectedPatient.alerts || !Array.isArray(selectedPatient.alerts) || selectedPatient.alerts.length === 0) ? (
                    <p className="text-text-secondary text-sm">No recent alerts triggered.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedPatient.alerts.slice(0,3).map((a,i) => (
                        <div key={i} className="bg-alert/10 border border-alert/30 p-3 rounded-lg flex justify-between">
                          <span className="text-sm text-alert font-medium">{a?.alert_type || 'Unknown Alert'}</span>
                          <span className="text-xs text-text-secondary">{a?.triggered_at ? new Date(a.triggered_at).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border border-secondary/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2"><FileText className="text-secondary w-5 h-5"/> AI Clinical Summary</h3>
                  <button onClick={generateReport} disabled={loadingReport} className="px-4 py-2 bg-secondary text-black rounded-lg font-bold hover:bg-white transition-colors flex items-center gap-2">
                    {loadingReport ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Generate New Report'}
                  </button>
                </div>
                
                {report ? (
                  <div className="prose prose-invert max-w-none text-white/90">
                    {/* Simplified markdown rendering */}
                    {report.split('\n').map((line, i) => {
                      if (line.startsWith('##')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-secondary">{line.replace('##','')}</h3>;
                      if (line.startsWith('-')) return <li key={i} className="ml-4 mb-1">{line.substring(1)}</li>;
                      return <p key={i} className="mb-2">{line}</p>;
                    })}
                  </div>
                ) : (
                  <div className="text-center text-text-secondary py-12">
                    Click generate to request a comprehensive clinical analysis using the linked LLM.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClinicianPanel;
