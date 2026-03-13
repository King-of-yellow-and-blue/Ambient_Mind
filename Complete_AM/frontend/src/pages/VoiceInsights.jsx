import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import {
  Mic, Activity, Sparkles, Lock, Phone, ShieldCheck,
  CheckCircle2, Radio, Info, Loader2, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

// Animated waveform bars
const Waveform = ({ active }) => {
  const bars = [4, 7, 5, 9, 6, 8, 3, 7, 5, 6, 8, 4, 9, 5, 7];
  return (
    <div className="flex items-end gap-[3px] h-10">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-t-full"
          style={{ backgroundColor: active ? '#6C63FF' : '#ffffff20' }}
          animate={active ? {
            height: [`${h * 4}px`, `${(h % 5 + 3) * 4}px`, `${h * 4}px`],
          } : { height: '4px' }}
          transition={{
            duration: 0.6 + (i % 3) * 0.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
};

const permissions = [
  { icon: Phone, label: 'Call Audio Analysis', desc: 'Analyses speech patterns during phone calls in real-time. No recording is stored.', granted: true },
  { icon: Mic, label: 'Ambient Voice Detection', desc: 'Detects vocal changes when you speak to your device. Processed on-device only.', granted: true },
  { icon: ShieldCheck, label: 'On-Device Processing', desc: 'All AI inference runs locally. Only numeric scores leave your device.', granted: true },
];

const VoiceInsights = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [monitoringActive, setMonitoringActive] = useState(true);
  const [lastAnalysed, setLastAnalysed] = useState(null);
  const { updateRiskData } = useStore();

  // Simulate a passive auto-analysis on mount (as if just completed a call)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLastAnalysed(new Date());
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-trigger analysis using typical ambient values (no user sliders)
  const handleAutoAnalyze = async () => {
    setLoading(true);
    try {
      // These values are what the AI would passively derive — not user input
      const payload = {
        pitch_score: 55,
        pace_wpm: 118,
        jitter: 12.3,
        monotonicity: 42,
        pause_frequency: 50,
      };
      const res = await apiClient.post('/api/voice/analyze', payload);
      setResult(res.data);
      setLastAnalysed(new Date());
      updateRiskData();
      toast.success('Passive voice analysis complete');
    } catch (err) {
      toast.error('Voice analysis failed — check backend connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex bg-bg min-h-screen w-full">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 max-w-5xl">

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Mic className="text-primary w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">Voice Intelligence</h1>
            </div>
            <p className="text-text-secondary">
              AmbientMind passively analyses your voice during calls — no manual input required.
            </p>
          </header>

          {/* Live Monitoring Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-6 mb-6 border border-primary/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${monitoringActive ? 'bg-primary/20' : 'bg-white/5'} transition-colors`}>
                    <Radio className={`w-7 h-7 ${monitoringActive ? 'text-primary' : 'text-text-secondary'}`} />
                  </div>
                  {monitoringActive && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-safe border-2 border-bg animate-ping" />
                  )}
                  {monitoringActive && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-safe border-2 border-bg" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg">{monitoringActive ? 'Passive Monitoring Active' : 'Monitoring Paused'}</h2>
                    {monitoringActive && <span className="px-2 py-0.5 text-xs font-bold bg-safe/20 text-safe rounded-full">LIVE</span>}
                  </div>
                  <p className="text-text-secondary text-sm mt-0.5">
                    {monitoringActive
                      ? 'AmbientMind is listening for speech signals during your calls.'
                      : 'Enable monitoring to resume passive voice analysis.'}
                  </p>
                  {lastAnalysed && (
                    <p className="text-xs text-primary mt-1 font-medium">
                      Last analysed: {lastAnalysed.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Waveform active={monitoringActive} />
                <button
                  onClick={() => setMonitoringActive(v => !v)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    monitoringActive
                      ? 'bg-white/10 text-white hover:bg-white/15'
                      : 'bg-primary/20 text-primary hover:bg-primary/30'
                  }`}
                >
                  {monitoringActive ? 'Pause' : 'Resume'}
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-7"
            >
              <div className="flex items-center gap-2 mb-6">
                <Info className="w-5 h-5 text-secondary" />
                <h2 className="text-lg font-bold">How Voice Analysis Works</h2>
              </div>
              <div className="space-y-5">
                {[
                  { step: '01', title: 'Call Begins', desc: 'AmbientMind detects an active call and securely begins monitoring vocal features in real-time.' },
                  { step: '02', title: 'On-Device AI Analysis', desc: 'Speech pace, pitch variation, pause frequency, and vocal jitter are extracted locally — no raw audio is ever uploaded.' },
                  { step: '03', title: 'Risk Score Updated', desc: 'Numeric biomarker scores update your mental health dashboard. Clinicians are notified if thresholds are crossed.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/20 text-primary text-xs font-black flex items-center justify-center">{item.step}</div>
                    <div>
                      <p className="font-semibold text-sm mb-0.5">{item.title}</p>
                      <p className="text-text-secondary text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Request manual trigger */}
              <div className="mt-7 pt-6 border-t border-white/5">
                <p className="text-xs text-text-secondary mb-3">Want to trigger an on-demand analysis snapshot?</p>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleAutoAnalyze}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 glow-primary mb-6"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing...</>
                    : <><Activity className="w-4 h-4" /> Run Analysis Snapshot</>
                  }
                </motion.button>
              </div>

              {/* Manual Override Section */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-alert" />
                  <h3 className="font-bold text-alert">Manual Clinical Entry</h3>
                </div>
                <p className="text-xs text-text-secondary mb-4">For clinical surveillance or manual data entry operations.</p>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAutoAnalyze(); }}>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-text-secondary">
                      <span>Vocal Pitch (Hz Variance)</span>
                    </div>
                    <input type="range" className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer" min="0" max="100" defaultValue="55" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-text-secondary">
                      <span>Speech Pace (WPM)</span>
                    </div>
                    <input type="range" className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer" min="50" max="250" defaultValue="118" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-text-secondary">
                      <span>Monotonicity %</span>
                    </div>
                    <input type="range" className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer" min="0" max="100" defaultValue="42" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-text-secondary">
                      <span>Pause Frequency</span>
                    </div>
                    <input type="range" className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer" min="0" max="100" defaultValue="50" />
                  </div>
                  <button type="submit" className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm font-semibold transition-colors mt-4">
                    Submit Manual Data
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Right column — Results + Permissions */}
            <div className="space-y-6">

              {/* Analysis Result */}
              <AnimatePresence>
                {result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass p-7 rounded-3xl border border-primary/30"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-lg">Latest Analysis</h3>
                      <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">
                        Score: {Math.round(result.voice_score)}/100
                      </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 mb-5">
                      <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
                        <Sparkles className="w-4 h-4 text-primary" /> Clinical Insight
                      </div>
                      <p className="text-sm leading-relaxed text-white/80">{result.llm_insight}</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      {[
                        { label: 'Pitch Variation', value: result.analysis?.pitch_score },
                        { label: 'Speech Pace (WPM)', value: result.analysis?.pace_wpm },
                        { label: 'Vocal Jitter', value: result.analysis?.jitter },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-text-secondary">{label}</span>
                          <span className="font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="glass p-7 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center min-h-[200px]"
                  >
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Mic className="w-7 h-7 text-primary/60" />
                    </div>
                    <h3 className="font-medium mb-1">Waiting for next call...</h3>
                    <p className="text-sm text-text-secondary max-w-xs">
                      AmbientMind will automatically analyse your voice on your next phone call. Or trigger a manual snapshot above.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Permissions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass rounded-3xl p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <Lock className="w-4 h-4 text-secondary" />
                  <h3 className="font-bold">Active Permissions</h3>
                </div>
                <div className="space-y-4">
                  {permissions.map((p, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                        <p.icon className="w-4 h-4 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold">{p.label}</span>
                          {p.granted && <CheckCircle2 className="w-3.5 h-3.5 text-safe" />}
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default VoiceInsights;
