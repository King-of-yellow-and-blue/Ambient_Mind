import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../api/client';
import { useStore } from '../store/useStore';
import PageTransition from '../components/PageTransition';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/login', data);
      login(res.data.user, res.data.access_token);
      
      toast.success('Welcome back!');
      if (res.data.user.role === 'clinician') {
        navigate('/clinician');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Errors handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex items-center justify-center bg-bg p-6 relative w-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="glass w-full max-w-md p-8 rounded-3xl relative z-10 border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <BrainCircuit className="w-10 h-10 text-primary" />
            <span className="font-bold text-2xl">AmbientMind</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-text-secondary mt-2">Log in to check your mental health</p>
        </div>

        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              {...register('email', { required: 'Email is required' })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" 
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-alert text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              {...register('password', { required: 'Password is required' })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" 
              placeholder="••••••••"
            />
            {errors.password && <p className="text-alert text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-70 mt-4 glow"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Log In"}
          </button>
        </form>

        <p className="text-center mt-6 text-text-secondary">
          Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
    </PageTransition>
  );
};

export default Login;
