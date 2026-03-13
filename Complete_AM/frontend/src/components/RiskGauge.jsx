import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const RiskGauge = ({ score }) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  
  let color = '#2ECC71'; // Green
  let label = 'Stable';
  if (normalizedScore >= 70) {
    color = '#FF4D6D'; // Red
    label = 'Alert';
  } else if (normalizedScore >= 30) {
    color = '#FFB347'; // Amber
    label = 'Watch';
  }

  const data = [{ name: 'Risk', value: normalizedScore, fill: color }];

  return (
    <div className="relative w-full h-full min-h-[200px] flex items-center justify-center p-4">
      {/* Animated Glowing Ring */}
      <div className="absolute inset-4 rounded-full border border-white/5 shadow-[inset_0_0_50px_rgba(255,255,255,0.02)]" />
      <div 
        className="absolute inset-[15%] rounded-full opacity-20 animate-spin-slow blur-xl" 
        style={{ background: `conic-gradient(from 0deg, transparent, ${color}, transparent)` }} 
      />
      
      <ResponsiveContainer width="100%" height="100%" className="z-10">
        <RadialBarChart 
          cx="50%" cy="50%" 
          innerRadius="75%" outerRadius="100%" 
          barSize={12} data={data} 
          startAngle={225} endAngle={-45}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar minAngle={15} background={{ fill: 'rgba(255,255,255,0.05)' }} clockWise dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <span 
          className="text-5xl font-extrabold tracking-tighter" 
          style={{ color, textShadow: `0 0 20px ${color}80` }}
        >
          {Math.round(normalizedScore)}
        </span>
        <span className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mt-1">{label}</span>
      </div>
    </div>
  );
};

export default RiskGauge;
