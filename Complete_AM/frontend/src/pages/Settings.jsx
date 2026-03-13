import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Shield, Key } from 'lucide-react';

const Settings = () => {
  const { user, login } = useStore();
  const [provider, setProvider] = useState(user?.preferred_llm || 'gemini');
  const [apiKey, setApiKey] = useState('');
  const [threshold, setThreshold] = useState(user?.alert_threshold || 75);
  const [clinicianId, setClinicianId] = useState(user?.clinician_id || '');
  const [loading, setLoading] = useState(false);

  const saveSettings = async () => {
    setLoading(true);
    try {
      if (apiKey) {
        await apiClient.put('/api/user/llm-keys', { provider, api_key: apiKey });
      }
      
      const payload = {
        preferred_llm: provider,
        alert_threshold: threshold
      };
      
      const res = await apiClient.put('/api/user/settings', payload);
      // Update local storage
      login(res.data.user, useStore.getState().token);
      
      if (clinicianId && clinicianId !== user?.clinician_id) {
        // Mocking linking logic from user side since we built it from clinical side usually
      }
      toast.success('Settings saved successfully');
      setApiKey(''); // Clear security
    } catch (e) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-xl">
              <SettingsIcon className="text-primary w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">Preferences</h1>
          </div>
          <p className="text-text-secondary">Manage your MindPulse configuration.</p>
        </header>

        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Key className="w-5 h-5"/> AI Engine Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Preferred AI Provider</label>
                <select value={provider} onChange={e=>setProvider(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                  <option value="gemini">Gemini (Recommended)</option>
                  <option value="claude">Claude</option>
                  <option value="gpt">ChatGPT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Update API Key (Optional)</label>
                <input 
                  type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} 
                  placeholder="Enter new key to update, leave blank to keep current"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" 
                />
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield className="w-5 h-5"/> Alerts & Privacy</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex justify-between">
                  <span>Emergency Alert Threshold</span>
                  <span className="text-alert font-bold">{threshold}</span>
                </label>
                <input type="range" min="50" max="95" value={threshold} onChange={e=>setThreshold(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-text-secondary mt-1">If your risk score crosses this value, an active intervention popup will show.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Clinician Link ID</label>
                <input 
                  type="text" value={clinicianId} onChange={e=>setClinicianId(e.target.value)} 
                  placeholder="Enter Clinician ID to share data"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" 
                />
                <p className="text-xs text-text-secondary mt-1 text-safe">Linking allows your doctor to monitor your signals in real-time.</p>
              </div>
            </div>
          </div>

          <button onClick={saveSettings} disabled={loading} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all glow">
            {loading ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
