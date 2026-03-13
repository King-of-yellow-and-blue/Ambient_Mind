import React from 'react';

export const SkeletonCard = ({ height = 120 }) => (
  <div className="glass rounded-2xl overflow-hidden relative" style={{ height }}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
  </div>
);

export default SkeletonCard;
