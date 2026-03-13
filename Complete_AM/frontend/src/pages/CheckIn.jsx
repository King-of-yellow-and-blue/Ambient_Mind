import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Sidebar from '../components/Sidebar';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

const MOODS = [
  { val: 1, emoji: '😞' },
  { val: 2, emoji: '😟' },
  { val: 3, emoji: '😐' },
  { val: 4, emoji: '🙂' },
  { val: 5, emoji: '😊' }
];

const CheckIn = () => {
  const { addCheckin, user } = useStore();
  
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(5);
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/api/checkin/history?limit=14');
      setHistory(res.data.data.reverse()); // old to new for chart
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const emoji = MOODS.find(m => m.val === mood)?.emoji || '😐';
      const res = await addCheckin({ mood_score: mood, mood_emoji: emoji, energy_level: energy, anxiety_level: anxiety, notes });
      setResult(res);
      toast.success("Check-in saved!");
      fetchHistory();
      // Reset form slightly
      setNotes('');
    } catch (err) {
      toast.error("Failed to submit check-in");
    } finally {
      setLoading(false);
    }
  };

  const chartData = history.map((h, i) => ({
    name: `Day ${i+1}`,
    score: h.checkin_score
  }));

  return (
    <PageTransition>
    <div className="flex bg-bg min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Check-in Companion</h1>
          <p className="text-text-secondary">Capture your current state. Our AI will analyze your language and signals.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-3xl h-fit">
            <h2 className="text-xl font-bold mb-6">How are you feeling right now?</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <div className="flex justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                  {MOODS.map(m => (
                    <button 
                      key={m.val} type="button" onClick={() => setMood(m.val)}
                      className={`text-4xl transition-all ${mood === m.val ? 'scale-125 drop-shadow-[0_0_15px_rgba(108,99,255,0.8)]' : 'opacity-50 hover:opacity-100 hover:scale-110'}`}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-sm">Energy Level</label>
                  <span className="text-primary font-bold">{energy}/10</span>
                </div>
                <input 
                  type="range" min="1" max="10" value={energy} onChange={e => setEnergy(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #FF4D6D, #2ECC71)` }}
                />
                <div className="flex justify-between text-xs text-text-secondary mt-2">
                  <span>Exhausted</span>
                  <span>Energized</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-sm">Anxiety Level</label>
                  <span className="text-alert font-bold">{anxiety}/10</span>
                </div>
                <input 
                  type="range" min="1" max="10" value={anxiety} onChange={e => setAnxiety(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #2ECC71, #FF4D6D)` }}
                />
                <div className="flex justify-between text-xs text-text-secondary mt-2">
                  <span>Calm</span>
                  <span>Very Anxious</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-sm mb-2">Anything you want to share?</label>
                <textarea 
                  value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 min-h-[100px] resize-none focus:border-primary transition-colors text-white"
                  placeholder="How has your day been? Any specific thoughts?"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 glow disabled:opacity-70 mt-8"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sharing with your AI companion...</>
                ) : (
                  <><Send className="w-5 h-5" /> Submit Check-in</>
                )}
              </motion.button>
            </form>
          </div>

          <div className="space-y-6">
            {result && (
              <div className="glass p-6 rounded-3xl border border-primary/30 relative overflow-hidden bg-primary/5">
                <div className="absolute top-0 right-0 p-2 text-xs font-semibold text-primary bg-primary/10 rounded-bl-xl">
                  via {result.provider_used}
                </div>
                <h3 className="flex items-center gap-2 font-bold mb-4 text-lg"><Sparkles className="w-5 h-5 text-primary"/> AI Companion</h3>
                
                <p className="text-white/90 leading-relaxed mb-4 text-sm">
                  {result.llm_response}
                </p>
                
                {result.checkin.absolutist_flag && (
                  <div className="bg-warning/20 border border-warning/50 rounded-xl p-3 flex gap-3 mt-4 text-sm">
                    <AlertCircle className="w-5 h-5 text-warning shrink-0" />
                    <p className="text-warning font-medium">Notice: We detected some "all-or-nothing" language (e.g. always, never). Remember, thoughts aren't always facts.</p>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                  <span className="text-text-secondary">Effect on risk score:</span>
                  <span className="font-bold">New Score: {result.new_risk_score}</span>
                </div>
              </div>
            )}

            <div className="glass p-6 rounded-3xl">
              <h3 className="font-bold mb-4">14-Day Check-in History</h3>
              <div className="h-[200px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorCheck" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ backgroundColor: '#13132A', border: 'none', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="score" stroke="#FF4D6D" fillOpacity={1} fill="url(#colorCheck)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-text-secondary">
                    No history yet. Start checking in!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </PageTransition>
  );
};

export default CheckIn;
