import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      riskData: null,
      checkins: [],
      alerts: [],
      isLoading: false,

      login: (userData, tokenStr) => {
        localStorage.setItem('token', tokenStr);
        set({ user: userData, token: tokenStr });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, riskData: null, checkins: [], alerts: [] });
        window.location.href = '/';
      },

      updateRiskData: async () => {
        if (!get().token) return;
        set({ isLoading: true });
        try {
          const res = await apiClient.get('/api/risk/dashboard');
          set({ riskData: res.data, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
        }
      },

      addCheckin: async (data) => {
        try {
          const res = await apiClient.post('/api/checkin/submit', data);
          get().updateRiskData();
          return res.data;
        } catch (e) {
          throw e;
        }
      },

      acknowledgeAlert: async (alertId) => {
        // Mock acknowledge local state update
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== alertId),
          riskData: {
            ...state.riskData,
            active_alerts: (state.riskData?.active_alerts || []).filter((a) => a.id !== alertId)
          }
        }));
      },

      setPreferredLLM: async (llm) => {
        try {
          await apiClient.put('/api/user/settings', { preferred_llm: llm });
          set((state) => ({ user: { ...state.user, preferred_llm: llm } }));
        } catch (e) {
          throw e;
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
