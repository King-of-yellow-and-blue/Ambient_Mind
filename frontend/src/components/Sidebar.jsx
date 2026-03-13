import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Mic, SmilePlus, Activity, Settings, LogOut, BrainCircuit, MessageSquare, Headphones, Menu, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Voice Assessment', path: '/dashboard/voice', icon: Mic },
    { name: 'Chat Analysis', path: '/dashboard/typing', icon: MessageSquare },
    { name: 'Music Mood', path: '/dashboard/music', icon: Headphones },
    { name: 'Quick Check-in', path: '/dashboard/checkin', icon: SmilePlus },
    { name: 'Behavior & Sleep', path: '/dashboard/signals', icon: Activity },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const tabLinks = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Voice', path: '/dashboard/voice', icon: Mic },
    { name: 'Chat', path: '/dashboard/typing', icon: MessageSquare },
    { name: 'Music', path: '/dashboard/music', icon: Headphones },
    { name: 'More', path: null, icon: Menu },
  ];

  // ─── MOBILE / ANDROID: Bottom Tab Bar + Slide-out Drawer ──────────
  if (isMobile) {
    return (
      <>
        {/* Bottom Tab Bar */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(13,13,26,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 4px' }}>
            {tabLinks.map((link) => {
              const Icon = link.icon;
              if (!link.path) {
                return (
                  <button key="more" onClick={() => setMenuOpen(true)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 8px', background: 'none', border: 'none', color: '#8B8BA7', cursor: 'pointer' }}>
                    <Icon style={{ width: 22, height: 22 }} />
                    <span style={{ fontSize: 10, fontWeight: 500 }}>{link.name}</span>
                  </button>
                );
              }
              const isActive = pathname === link.path;
              return (
                <Link key={link.path} to={link.path}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 8px', textDecoration: 'none', color: isActive ? '#6C63FF' : '#8B8BA7', minWidth: 52 }}>
                  <Icon style={{ width: 22, height: 22 }} />
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{link.name}</span>
                  {isActive && <div style={{ width: 16, height: 2, borderRadius: 4, background: '#6C63FF', marginTop: 2 }} />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Slide-out Drawer */}
        {menuOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60 }} onClick={() => setMenuOpen(false)}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <div
              style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 280, background: 'rgba(13,13,26,0.98)', borderLeft: '1px solid rgba(255,255,255,0.08)', padding: 24, overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BrainCircuit style={{ width: 28, height: 28, color: '#6C63FF' }} />
                  <span style={{ fontWeight: 700, fontSize: 18, color: 'white' }}>AmbientMind</span>
                </div>
                <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '0 4px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6C63FF' }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'white', margin: 0 }}>{user?.name || 'User'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8B8BA7' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D4AA' }}></span>Active
                  </div>
                </div>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.path;
                  return (
                    <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12,
                        textDecoration: 'none', fontWeight: 500, transition: 'all 0.2s',
                        background: isActive ? 'linear-gradient(90deg, rgba(108,99,255,0.2), rgba(0,212,170,0.05))' : 'transparent',
                        color: isActive ? 'white' : '#8B8BA7'
                      }}>
                      <Icon style={{ width: 20, height: 20, color: isActive ? '#6C63FF' : 'inherit' }} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, width: '100%', background: 'none', border: 'none', color: '#8B8BA7', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>
                  <LogOut style={{ width: 20, height: 20 }} />
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ─── DESKTOP: Original fixed left sidebar ─────────────────────────
  return (
    <div className="w-64 border-r border-white/5 glass flex flex-col h-screen fixed left-0 top-0 z-40 bg-surface/40">
      <div className="p-6 relative">
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-secondary to-transparent animate-[shimmer_3s_infinite]" />
        <Link to="/" className="flex items-center gap-2 text-white hover:text-primary transition-colors cursor-pointer mb-8 pl-2">
          <BrainCircuit className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">AmbientMind</span>
        </Link>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center font-bold text-primary">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-semibold">{user?.name || 'User'}</p>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-safe"></span>Active
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.path;
          return (
            <Link key={link.path} to={link.path}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium relative hover:translate-x-1 ${
                isActive
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/5 text-white shadow-[0_0_15px_rgba(108,99,255,0.15)] glow-primary'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}>
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-r-md" />}
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-white'}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="mb-4 flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/10 hover:border-primary/50 transition-colors cursor-default group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[0%] transition-transform duration-500" />
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary">⚡</div>
          <div className="flex flex-col relative">
            <span className="text-[10px] text-text-secondary uppercase font-extrabold tracking-wider">Powered by</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold capitalize text-white">{user?.preferred_llm || 'Gemini'}</span>
              <span className="w-2 h-2 rounded-full bg-safe animate-pulse" />
            </div>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-alert hover:bg-alert/10 transition-colors w-full">
          <LogOut className="w-5 h-5" />Log out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
