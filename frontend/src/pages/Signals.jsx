import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import { Moon, MessageSquare, Loader2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

const Signals = () => {
  const [tab, setTab] = useState('sleep');
  const [loading, setLoading] = useState(false);
  const { updateRiskData } = useStore();

  // Sleep state
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [disruptions, setDisruptions] = useState(0);
  const [pickups, setPickups] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(7);

  // Behavior state
  const [socialTime, setSocialTime] = useState(60);
  const [screenTime, setScreenTime] = useState(240);
  const [sent, setSent] = useState(20);
  const [replied, setReplied] = useState(18);
  const [ctx, setCtx] = useState('');

  const submitSleep = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/api/user/sleep/log', {
        bedtime_input: bedtime, waketime_input: wakeTime,
        disruptions, night_pickups: pickups, sleep_quality: sleepQuality
      });
      toast.success('Sleep logged');
      updateRiskData();
    } catch (e) {
      toast.error('Failed to log');
    } finally {
      setLoading(false);
    }
  };

  const submitBehavior = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/api/user/behavior/log', {
        social_time_mins: socialTime, screen_time_mins: screenTime,
        messages_sent: sent, messages_replied: replied, mood_context: ctx
      });
      toast.success('Behavior logged');
      updateRiskData();
    } catch (e) {
      toast.error('Failed to log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="flex bg-bg min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 max-w-4xl">
        <header className="mb-8 border-b border-white/10 pb-4">
          <h1 className="text-3xl font-bold mb-6">Passive Signals</h1>
          <div className="flex gap-4">
            <button onClick={() => setTab('sleep')} className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-colors ${tab === 'sleep' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}>
              <Moon className="w-5 h-5" /> Sleep Data
            </button>
            <button onClick={() => setTab('behavior')} className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-colors ${tab === 'behavior' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}>
              <MessageSquare className="w-5 h-5" /> Digital Behavior
            </button>
          </div>
        </header>

        {tab === 'sleep' ? (
          <form onSubmit={submitSleep} className="glass p-8 rounded-3xl space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Bedtime</label>
                <input type="time" value={bedtime} onChange={e=>setBedtime(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Wake Time</label>
                <input type="time" value={wakeTime} onChange={e=>setWakeTime(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Night Wakes/Disruptions</label>
                <input type="number" value={disruptions} onChange={e=>setDisruptions(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Pickups during night</label>
                <input type="number" value={pickups} onChange={e=>setPickups(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 flex justify-between">
                <span>Sleep Quality Rating</span>
                <span className="text-primary font-bold">{sleepQuality}/10</span>
              </label>
              <input type="range" min="1" max="10" value={sleepQuality} onChange={e=>setSleepQuality(Number(e.target.value))} className="w-full" />
            </div>

            <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 glow disabled:opacity-70 mt-4">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Sleep Log"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitBehavior} className="glass p-8 rounded-3xl space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between"><span>Social App Usage</span> <span className="text-secondary">{socialTime} m</span></label>
                <input type="range" min="0" max="480" value={socialTime} onChange={e=>setSocialTime(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between"><span>Total Screen Time</span> <span className="text-secondary">{screenTime} m</span></label>
                <input type="range" min="0" max="600" value={screenTime} onChange={e=>setScreenTime(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Messages Sent</label>
                <input type="number" value={sent} onChange={e=>setSent(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Messages Replied To</label>
                <input type="number" value={replied} onChange={e=>setReplied(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Context Notes (Optional)</label>
              <textarea value={ctx} onChange={e=>setCtx(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 resize-none" rows="2" />
            </div>

            <button type="submit" disabled={loading} className="px-8 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 glow disabled:opacity-70 mt-4">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Behavior Log"}
            </button>
          </form>
        )}
      </main>
    </div>
    </PageTransition>
  );
};

export default Signals;
