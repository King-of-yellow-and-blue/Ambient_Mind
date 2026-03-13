import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Mic, Keyboard, SmilePlus, Activity, Settings, LogOut, BrainCircuit, MessageSquare, Headphones } from 'lucide-react';
import { useStore } from '../store/useStore';

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useStore();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Voice Assessment', path: '/dashboard/voice', icon: Mic },
    { name: 'Chat Analysis', path: '/dashboard/typing', icon: MessageSquare },
    { name: 'Music Mood', path: '/dashboard/music', icon: Headphones },
    { name: 'Quick Check-in', path: '/dashboard/checkin', icon: SmilePlus },
    { name: 'Behavior & Sleep', path: '/dashboard/signals', icon: Activity },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

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
              <span className="w-2 h-2 rounded-full bg-safe"></span>
              Active
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium relative hover:translate-x-1 ${
                isActive 
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/5 text-white shadow-[0_0_15px_rgba(108,99,255,0.15)] glow-primary' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
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

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-alert hover:bg-alert/10 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
