import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [follower, setFollower] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    const click = () => { setClicked(true); setTimeout(() => setClicked(false), 300); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', click);
    
    let rafId;
    const followMouse = () => {
      setFollower(prev => ({
        x: prev.x + (pos.x - prev.x) * 0.15,
        y: prev.y + (pos.y - prev.y) * 0.15
      }));
      rafId = requestAnimationFrame(followMouse);
    };
    rafId = requestAnimationFrame(followMouse);
    
    const els = document.querySelectorAll('button,a,[role="button"],input,select,textarea');
    const handleEnter = () => setHovered(true);
    const handleLeave = () => setHovered(false);
    els.forEach(el => {
      el.addEventListener('mouseenter', handleEnter);
      el.addEventListener('mouseleave', handleLeave);
    });
    
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', click);
      cancelAnimationFrame(rafId);
      els.forEach(el => {
        el.removeEventListener('mouseenter', handleEnter);
        el.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, [pos.x, pos.y]);
  
  return (
    <>
      <div id="custom-cursor" style={{
        left: pos.x - 6, top: pos.y - 6,
        transform: `scale(${clicked ? 2 : hovered ? 1.5 : 1})`,
        background: hovered ? '#00D4AA' : '#6C63FF'
      }} />
      <div id="cursor-follower" style={{
        left: follower.x - 18, top: follower.y - 18,
        transform: `scale(${hovered ? 1.8 : 1})`
      }} />
    </>
  );
}
