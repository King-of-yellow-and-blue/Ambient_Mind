import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Sidebar from '../components/Sidebar';
import RiskGauge from '../components/RiskGauge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Mic, Moon, MessageSquare, Activity, SmilePlus, Sparkles, Settings, X, BrainCircuit, Keyboard, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TiltCard = ({ children, className, onClick }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 15, y: x * -15 });
  };
  return (
    <div 
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className={className}
      style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform 0.1s ease-out' }}
    >
      {children}
    </div>
  );
};

const Dashboard = () => {
  const { user, riskData, updateRiskData, isLoading } = useStore();
  const navigate = useNavigate();
  const [insightOpen, setInsightOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Auto-show a fake notification on load for demonstration (just once)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickCheckin = async (score) => {
    setShowNotification(false);
    toast.success('Mood logged via notification!');
    try {
      await apiClient.post('/api/user/checkin', {
        mood_score: score,
        mood_emoji: ['😞','😟','😐','🙂','😊'][(score/20)-1] || '😐',
        energy_level: score,
        anxiety_level: 100 - score,
        notes: "Quick check-in via push notification"
      });
      updateRiskData();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    updateRiskData();
    const interval = setInterval(updateRiskData, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  // Mock timeline data since backend returns raw array of numbers
  // Real implementation maps `get_risk_history` dates
  const mockHistoryData = (riskData?.last_7_days || []).map((score, i) => ({
    name: `Day ${i+1}`, risk: score
  }));

  const getTrendIcon = (trend) => {
    if (trend === 'rising') return <span className="text-alert">↑ Rising</span>;
    if (trend === 'falling') return <span className="text-safe">↓ Falling</span>;
    return <span className="text-warning">→ Stable</span>;
  };

  const signalsList = [
    { label: 'Voice Health', score: riskData?.signal_breakdown?.voice || 50, icon: Mic, path: '/dashboard/voice', color: '#6C63FF' },
    { label: 'Chat Analysis', score: riskData?.signal_breakdown?.typing || 50, icon: MessageSquare, path: '/dashboard/typing', color: '#6C63FF' },
    { label: 'Music Mood', score: riskData?.signal_breakdown?.music || 50, icon: Headphones, path: '/dashboard/music', color: '#FFB347' },
    { label: 'Sleep Quality', score: riskData?.signal_breakdown?.sleep || 50, icon: Moon, path: '/dashboard/signals', color: '#00D4AA' },
    { label: 'Behavior', score: riskData?.signal_breakdown?.behavior || 50, icon: Activity, path: '/dashboard/signals', color: '#FFB347' },
    { label: 'Check-in Mood', score: riskData?.signal_breakdown?.checkin || 50, icon: SmilePlus, path: '/dashboard/checkin', color: '#FF4D6D' }
  ];

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, {user.name.split(' ')[0]}</h1>
            <p className="text-text-secondary">Here's a snapshot of your mental health today.</p>
          </div>
          <button onClick={() => setInsightOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 transition-colors hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" /> Quick Insight
          </button>
        </header>

        {/* Fake OS Push Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-6 right-6 z-[100] w-[340px] bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 cursor-default overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-secondary flex items-center justify-center">
                    <BrainCircuit className="w-3.5 h-3.5 text-black" />
                  </div>
                  <span className="text-xs font-semibold text-white/80">AmbientMind</span>
                </div>
                <span className="text-[10px] text-white/40">NOW</span>
              </div>
              <h4 className="font-semibold text-sm mb-1">Time for a quick check-in</h4>
              <p className="text-xs text-text-secondary mb-3">How are you feeling right now?</p>
              
              <div className="flex justify-between bg-black/40 p-2 rounded-xl border border-white/5">
                {[
                  { emoji: '😞', val: 20 },
                  { emoji: '😟', val: 40 },
                  { emoji: '😐', val: 60 },
                  { emoji: '🙂', val: 80 },
                  { emoji: '😊', val: 100 }
                ].map((m, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleQuickCheckin(m.val)}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowNotification(false)} className="absolute top-4 right-4 text-white/30 hover:text-white/80 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Insight Modal */}
        <AnimatePresence>
          {insightOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInsightOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-md bg-[#13132a] border border-primary/30 rounded-3xl p-8 shadow-[0_0_60px_rgba(108,99,255,0.25)]"
              >
                <button onClick={() => setInsightOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-text-secondary" />
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Quick Insight</h3>
                    <p className="text-xs text-text-secondary">via {user?.preferred_llm || 'Gemini'}</p>
                  </div>
                </div>
                {isLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-primary/20 rounded w-full" />
                    <div className="h-4 bg-primary/20 rounded w-5/6" />
                    <div className="h-4 bg-primary/20 rounded w-4/6" />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {riskData?.today_insight || 'Your signals look stable today. Keep up your current routine — consistency is a key protective factor against mood fluctuations.'}
                  </p>
                )}
                <div className="mt-6 p-3 bg-black/30 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Current Risk Score</span>
                  <span className="font-bold text-white">{riskData?.current_score ?? 0} / 100</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Risk Gauge */}
          <div className="glass p-6 rounded-3xl flex flex-col relative overflow-hidden">
            <h3 className="text-lg font-semibold mb-2">Current Risk Score</h3>
            <div className="flex-1">
              <RiskGauge score={riskData?.current_score || 0} />
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
              <span className="text-text-secondary">7-Day Trend</span>
              <span className="font-bold">{getTrendIcon(riskData?.trend)}</span>
            </div>
          </div>

          {/* Mini Trend Chart */}
          <div className="glass p-6 rounded-3xl flex flex-col">
            <h3 className="text-lg font-semibold mb-4">7-Day Trajectory</h3>
            <div className="flex-1 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockHistoryData.length > 0 ? mockHistoryData : [{name:'-', risk:0}]}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#13132A', border: 'none', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="risk" stroke="#6C63FF" fillOpacity={1} fill="url(#colorRisk)" />
                  <ReferenceLine y={user.alert_threshold} stroke="#FF4D6D" strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Check-in CTA */}
          <div className="glass p-6 rounded-3xl flex flex-col justify-between bg-gradient-to-br from-primary/20 to-transparent">
            <div>
              <h3 className="text-lg font-semibold mb-2">How are you right now?</h3>
              <p className="text-sm text-text-secondary mb-6">Log your mood to keep your insights accurate.</p>
            </div>
            <div className="flex justify-between bg-black/40 p-2 rounded-2xl border border-white/5">
              {['😞','😟','😐','🙂','😊'].map((emoji, i) => (
                <button key={i} onClick={() => navigate('/dashboard/checkin')} className="text-3xl hover:scale-125 transition-transform">
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Signal Modalities</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {signalsList.map((sig, i) => (
            <TiltCard key={i} onClick={() => navigate(sig.path)} className="glass p-6 rounded-3xl cursor-pointer hover:bg-white/5 transition-all border-white/5 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: sig.color }} />
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/40 group-hover:scale-110 transition-transform shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] border border-white/5" style={{ color: sig.color }}>
                  <sig.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-black/20" style={{ color: sig.score >= 70 ? '#FF4D6D' : sig.color }}>
                  {sig.score >= 70 ? 'Alert' : 'Stable'}
                </span>
              </div>
              <h4 className="text-text-secondary text-sm font-medium mb-1">{sig.label}</h4>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-extrabold tracking-tight">{Math.round(sig.score)}</p>
                <span className="text-xs text-text-secondary font-medium">/100</span>
              </div>
            </TiltCard>
          ))}
        </div>
      </main>

      <aside className="w-80 border-l border-white/10 bg-surface p-6 h-screen sticky top-0 overflow-y-auto">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="text-primary w-5 h-5" /> Today's Insight
        </h3>
        
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 mb-8 relative">
          <div className="absolute top-0 right-0 p-2 text-xs font-semibold text-primary bg-primary/10 rounded-bl-xl rounded-tr-2xl">
            via {user.preferred_llm}
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-2 mt-4">
              <div className="h-4 bg-primary/20 rounded w-full"></div>
              <div className="h-4 bg-primary/20 rounded w-5/6"></div>
              <div className="h-4 bg-primary/20 rounded w-4/6"></div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed mt-2 text-text-secondary">
              {riskData?.today_insight || "Analyzing your recent signals..."}
            </p>
          )}
        </div>

        <h3 className="font-bold text-lg mb-4">Suggested Actions</h3>
        <ul className="space-y-3 mb-8">
          {(riskData?.suggested_actions || ["Take a 5 minute breathing break", "Log today's sleep data"]).map((act, i) => (
            <li key={i} className="flex gap-3 text-sm bg-black/20 p-3 rounded-xl border border-white/5">
              <div className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0">✓</div>
              <span className="text-text-secondary">{act}</span>
            </li>
          ))}
        </ul>

        <div className="p-4 bg-black/40 rounded-xl border border-white/5 border-dashed">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Alert Level</span>
            <span className="text-xs px-2 py-1 bg-white/10 rounded-full">{user.alert_threshold}</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${user.alert_threshold}%` }}></div>
          </div>
          <button onClick={() => navigate('/dashboard/settings')} className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1">
            <Settings className="w-3 h-3" /> Configure Limits
          </button>
        </div>
      </aside>

    </div>
  );
};

export default Dashboard;
