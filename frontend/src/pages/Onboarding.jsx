import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { CheckCircle2, ChevronRight, KeyRound } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const MOODS = [
  { val: 1, emoji: '😞', label: 'Very Poor' },
  { val: 2, emoji: '😟', label: 'Poor' },
  { val: 3, emoji: '😐', label: 'Okay' },
  { val: 4, emoji: '🙂', label: 'Good' },
  { val: 5, emoji: '😊', label: 'Excellent' }
];

const Providers = [
  { id: 'gemini', name: 'Gemini (Recommended)', subtitle: 'Get free key at aistudio.google.com' },
  { id: 'claude', name: 'Claude', subtitle: 'Get key at console.anthropic.com' },
  { id: 'gpt', name: 'ChatGPT', subtitle: 'Get key at platform.openai.com' }
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const user = useStore(state => state.user);
  const setPreferredLLM = useStore(state => state.setPreferredLLM);
  const navigate = useNavigate();

  // Data states
  const [baselineMood, setBaselineMood] = useState(3);
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [notes, setNotes] = useState('');
  
  const [alertThreshold, setAlertThreshold] = useState(70);
  
  const [showKey, setShowKey] = useState(false);
  const [activeTab, setActiveTab] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [keyTested, setKeyTested] = useState(false);
  const [loadingKey, setLoadingKey] = useState(false);

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  
  const testKey = async () => {
    if (!apiKey) return;
    setLoadingKey(true);
    try {
      await apiClient.put('/api/user/llm-keys', { provider: activeTab, api_key: apiKey });
      await setPreferredLLM(activeTab);
      setKeyTested(true);
      toast.success('Key verified and saved!');
    } catch (e) {
      toast.error('Failed to verify key.');
    } finally {
      setLoadingKey(false);
    }
  };

  const finishOnboarding = async () => {
    try {
      await apiClient.post('/api/user/onboarding', {
        baseline_mood: baselineMood,
        bedtime,
        wake_time: wakeTime,
        baseline_notes: notes
      });
      await apiClient.put('/api/user/settings', { alert_threshold: alertThreshold });
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (e) {
      toast.error('Failed to save profile setup.');
    }
  };

  const slideVars = {
    fixed: { x: 0, opacity: 1 },
    enter: { x: 50, opacity: 0 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 relative w-full">
      <div className="w-full max-w-2xl">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary glow' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="glass p-8 md:p-12 rounded-3xl relative overflow-hidden min-h-[450px] shadow-2xl">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div key="1" variants={slideVars} initial="enter" animate="fixed" exit="exit" className="flex flex-col items-center text-center h-full justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-50"></div>
                  <span className="text-4xl text-primary font-bold">{user?.name?.charAt(0)}</span>
                </div>
                <h1 className="text-4xl font-bold mb-4">Welcome, {user?.name.split(' ')[0]}</h1>
                <p className="text-text-secondary text-lg mb-8 max-w-sm">Let's set up your baseline so AmbientMind can understand what's normal for you.</p>
                <button onClick={nextStep} className="px-8 py-3 bg-primary rounded-xl font-bold glow flex items-center gap-2 hover:scale-105 transition-transform">
                  Let's Go <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="2" variants={slideVars} initial="enter" animate="fixed" exit="exit" className="flex flex-col h-full">
                <h2 className="text-2xl font-bold mb-6">About You</h2>
                
                <div className="mb-6">
                  <label className="block text-text-secondary mb-3">How has your mood been this past week?</label>
                  <div className="flex justify-between gap-2">
                    {MOODS.map(m => (
                      <button 
                        key={m.val} 
                        onClick={() => setBaselineMood(m.val)}
                        className={`text-4xl transition-all ${baselineMood === m.val ? 'scale-125 drop-shadow-[0_0_15px_rgba(108,99,255,0.8)]' : 'opacity-50 hover:opacity-100 hover:scale-110'}`}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-text-secondary text-sm mb-1">Usual Bedtime</label>
                    <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-text-secondary text-sm mb-1">Usual Wake Time</label>
                    <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2" />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-text-secondary text-sm mb-1">Anything on your mind lately? (Optional)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="2" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 resize-none" placeholder="Feeling stressed about work..."></textarea>
                </div>

                <button onClick={nextStep} className="mt-auto px-8 py-3 bg-primary rounded-xl font-bold glow flex items-center justify-center gap-2 w-full">
                  Continue Form
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="3" variants={slideVars} initial="enter" animate="fixed" exit="exit" className="flex flex-col h-full">
                <h2 className="text-2xl font-bold mb-2">Set Your Alert Level</h2>
                <p className="text-text-secondary mb-8">AmbientMind analyzes 5 modalities. At secured what score should we intervene?</p>

                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-8 text-center relative overflow-hidden">
                  <div className="text-5xl font-bold text-white mb-2" style={{ color: alertThreshold < 60 ? '#2ECC71' : alertThreshold < 80 ? '#FFB347' : '#FF4D6D' }}>
                    {alertThreshold}/100
                  </div>
                  <p className="text-sm text-text-secondary">Alert me when my risk exceeds {alertThreshold}</p>
                </div>

                <input 
                  type="range" min="50" max="95" value={alertThreshold} onChange={(e) => setAlertThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer mb-2"
                />
                <div className="flex justify-between text-xs text-text-secondary mb-8">
                  <span>More Sensitive (50)</span>
                  <span>Fewer Alerts (95)</span>
                </div>

                <button onClick={nextStep} className="mt-auto px-8 py-3 bg-primary rounded-xl font-bold glow flex items-center justify-center gap-2 w-full">
                  Next Step
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="4" variants={slideVars} initial="enter" animate="fixed" exit="exit" className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-2">
                  <KeyRound className="text-primary w-6 h-6" />
                  <h2 className="text-2xl font-bold">Power AmbientMind with AI</h2>
                </div>
                <p className="text-text-secondary text-sm mb-6">Enter your API key to enable empathetic responses and AI insights. Keys are stored securely and never shared.</p>

                <div className="flex bg-black/40 p-1 rounded-xl mb-4">
                  {Providers.map(p => (
                    <button 
                      key={p.id} onClick={() => { setActiveTab(p.id); setKeyTested(false); }}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === p.id ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
                    >
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <div className="bg-black/20 border border-white/5 p-4 rounded-xl mb-6">
                  <label className="block text-sm font-medium mb-1">Enter {Providers.find(p=>p.id === activeTab).name.split(' ')[0]} API Key</label>
                  <p className="text-xs text-text-secondary mb-3">{Providers.find(p=>p.id === activeTab).subtitle}</p>
                  
                  <div className="flex gap-2">
                    <input 
                      type={showKey ? "text" : "password"}
                      value={apiKey} onChange={e => { setApiKey(e.target.value); setKeyTested(false); }}
                      placeholder="sk-..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                    <button onClick={() => setShowKey(!showKey)} className="px-3 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10">
                      {showKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  
                  <button 
                    onClick={testKey} disabled={!apiKey || loadingKey}
                    className={`mt-4 w-full py-2 rounded-lg font-medium transition-all ${keyTested ? 'bg-safe/20 text-safe border border-safe/50' : apiKey ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                  >
                    {loadingKey ? 'Testing...' : keyTested ? 'Key Valid ✓' : 'Test Key'}
                  </button>
                </div>

                <div className="mt-auto flex gap-3">
                  <button onClick={nextStep} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-text-secondary">
                    Skip for now
                  </button>
                  <button onClick={nextStep} className="flex-1 py-3 bg-primary rounded-xl font-bold glow">
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="5" variants={slideVars} initial="enter" animate="fixed" exit="exit" className="flex flex-col items-center h-full justify-center text-center">
                <div className="w-20 h-20 bg-safe/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-safe" />
                </div>
                <h2 className="text-3xl font-bold mb-2">You're all set!</h2>
                <p className="text-text-secondary mb-6">Your preferred AI: <span className="text-white font-medium capitalize">{user?.preferred_llm || 'Gemini'}</span> ✓</p>
                
                <button onClick={finishOnboarding} className="px-8 py-3 bg-primary rounded-xl font-bold glow text-lg hover:scale-105 transition-transform">
                  Go to Dashboard
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Onboarding;
