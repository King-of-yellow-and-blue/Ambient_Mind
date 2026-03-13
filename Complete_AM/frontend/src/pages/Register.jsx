import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../api/client';
import { useStore } from '../store/useStore';
import PageTransition from '../components/PageTransition';

const Register = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'user' }
  });
  const [loading, setLoading] = useState(false);
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const role = watch('role');

  const handleRegister = async (data) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/register', data);
      login(res.data.user, res.data.access_token);
      
      toast.success('Account created successfully!');
      if (res.data.user.role === 'clinician') {
        navigate('/clinician');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      // Handled by client.js error interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex items-center justify-center bg-bg p-6 relative w-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="glass w-full max-w-md p-8 rounded-3xl relative z-10 border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <BrainCircuit className="w-10 h-10 text-primary" />
            <span className="font-bold text-2xl">AmbientMind</span>
          </Link>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-text-secondary mt-2">Join AmbientMind to start tracking</p>
        </div>

        <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              onClick={() => setValue('role', 'user')}
              className={`py-3 rounded-xl border font-bold transition-all ${
                role === 'user' 
                  ? 'bg-primary/20 border-primary text-primary' 
                  : 'bg-black/20 border-white/10 text-text-secondary hover:bg-white/5'
              }`}
            >
              Patient/User
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'clinician')}
              className={`py-3 rounded-xl border font-bold transition-all ${
                role === 'clinician' 
                  ? 'bg-secondary/20 border-secondary text-secondary' 
                  : 'bg-black/20 border-white/10 text-text-secondary hover:bg-white/5'
              }`}
            >
              Clinician
            </button>
          </div>

          <input type="hidden" {...register('role')} />

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input 
              {...register('name', { required: 'Name is required' })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" 
            />
            {errors.name && <p className="text-alert text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              {...register('email', { required: 'Email is required' })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" 
            />
            {errors.email && <p className="text-alert text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              {...register('password', { required: 'Password is required' })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" 
            />
            {errors.password && <p className="text-alert text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-colors flex items-center justify-center disabled:opacity-70 mt-4 glow ${
              role === 'clinician' ? 'bg-secondary' : 'bg-primary'
            }`}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-6 text-text-secondary">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
    </PageTransition>
  );
};

export default Register;
