import React from 'react';
import { useStore } from '../store/useStore';
import { ShieldAlert, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertModal = () => {
  const alerts = useStore((state) => state.alerts) || [];
  const acknowledgeAlert = useStore((state) => state.acknowledgeAlert);

  const currentAlert = alerts[0];
  const score = currentAlert?.score_at_trigger || 75;
  const isHighRisk = score >= 85;

  return (
    <AnimatePresence>
      {alerts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-surface border-2 border-primary rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-3xl rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {isHighRisk ? (
              <div className="w-16 h-16 rounded-full bg-alert/20 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-alert" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-warning" />
              </div>
            )}
            
            <h2 className="text-2xl font-bold mb-2">
              {isHighRisk ? "We're here with you 💙" : "MindPulse noticed some changes 💙"}
            </h2>
            <p className="text-text-secondary mb-6">
              Your calculated risk score reached <span className={isHighRisk ? "text-alert font-bold" : "text-warning font-bold"}>{Math.round(score)}</span>. 
              {isHighRisk 
                ? " This is higher than usual. Please reach out to someone who can help."
                : " We want to make sure you're doing okay."}
            </p>

            <div className="w-full space-y-3">
              {isHighRisk && (
                <>
                  <a href="tel:988" className="block w-full py-3 bg-alert hover:bg-alert/90 text-white rounded-lg font-bold text-lg transition-colors">
                    Call 988 Crisis Lifeline
                  </a>
                  <a href="sms:741741&body=HOME" className="block w-full py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-bold text-lg transition-colors">
                    Text HOME to 741741
                  </a>
                </>
              )}
              
              <button 
                onClick={() => acknowledgeAlert(currentAlert.id)}
                className="w-full py-3 border border-text-secondary text-text-secondary hover:bg-white/5 rounded-lg font-medium transition-colors"
              >
                I'm okay, thanks
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;
