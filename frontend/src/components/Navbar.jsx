import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import { useStore } from '../store/useStore';

const Navbar = () => {
  const user = useStore(state => state.user);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass z-40 flex items-center justify-between px-6">
      <Link to="/" className="flex items-center gap-2">
        <BrainCircuit className="w-8 h-8 text-primary" />
        <span className="font-bold text-xl tracking-tight">MindPulse <span className="text-primary text-sm bg-primary/20 px-2 py-0.5 rounded-full ml-1 truncate">AI</span></span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <Link to={user.role === 'clinician' ? '/clinician' : '/dashboard'} className="px-5 py-2 rounded-full bg-primary hover:bg-primary/90 font-medium transition-all hover:scale-105 active:scale-95">
            Dashboard
          </Link>
        ) : (
          <>
            <Link to="/login" className="text-text-secondary hover:text-white font-medium transition-colors">Log in</Link>
            <Link to="/register" className="px-5 py-2 rounded-full bg-primary hover:bg-primary/90 font-medium transition-all hover:scale-105 active:scale-95">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
