import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, OrbitControls } from '@react-three/drei';
import { useNavigate, Link } from 'react-router-dom';
import {
  BrainCircuit, LineChart as LineChartIcon, Activity, Mic, ShieldCheck, HeartPulse, Keyboard, Clock, MessageSquare, Headphones,
  Smartphone, PhoneCall, Stethoscope, BarChart3, Bell, Lock, Eye, ChevronRight, Users, ClipboardList, Zap, Shield, Smile, CheckCircle, Moon, X
} from 'lucide-react';
import PageTransition from '../components/PageTransition';

const useCountUp = (end, duration = 2000, inView) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return count;
};

const TiltCard = ({ children, className }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 15, y: x * -15 });
  };
  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className={className}
      style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform 0.1s ease-out' }}
    >
      {children}
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const navBackground = useTransform(scrollY, [0, 50], ["rgba(13, 13, 26, 0)", "rgba(13, 13, 26, 0.8)"]);
  const navBorder = useTransform(scrollY, [0, 50], ["1px solid rgba(255,255,255,0)", "1px solid rgba(108, 99, 255, 0.2)"]);
  
  const [isMobile, setIsMobile] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const count970 = useCountUp(970, 2000, statsInView);
  const count1 = useCountUp(1, 2000, statsInView);
  const count11 = useCountUp(11, 2500, statsInView);
  const count6 = useCountUp(6, 2500, statsInView);

  const storyRef = useRef(null);
  const storyInView = useInView(storyRef, { once: true, margin: "-20%" });

  const howRef = useRef(null);
  const howInView = useInView(howRef, { once: true, margin: "-100px" });

  const clinicalRef = useRef(null);
  const clinicalInView = useInView(clinicalRef, { once: true, margin: "-100px" });

  const howSteps = [
    {
      icon: Smartphone,
      step: '01',
      title: 'Install AmbientMind',
      desc: 'Download the app on Android. Grant microphone, keyboard, and media permissions — the AI passively reads behavioral signals without recording or storing raw data.',
      color: '#6C63FF',
    },
    {
      icon: PhoneCall,
      step: '02',
      title: 'AI Monitors Passively',
      desc: 'AmbientMind analyses your call speech and vocal jitter, typing speed and chat rhythms, and music genre shifts — all in real-time. Zero manual input required.',
      color: '#00D4AA',
    },
    {
      icon: BarChart3,
      step: '03',
      title: 'Receive Insights & Alerts',
      desc: 'All signals aggregate into a 0-100 risk score. When you drop below your baseline, AmbientMind intervenes and your clinician gets a clinical data packet automatically.',
      color: '#FFB347',
    },
  ];

  const clinicianFeatures = [
    {
      icon: Eye,
      title: 'Real-Time Patient Dashboard',
      desc: 'Monitor all linked patients in one place. Track voice biomarkers, sleep trends, and behavioral signals with timeline views.',
      color: '#6C63FF',
    },
    {
      icon: ClipboardList,
      title: 'AI Clinical Data Packets',
      desc: 'When a patient\'s risk score crosses threshold, receive an auto-generated clinical briefing — pitch, pace, sentiment, and trend analysis.',
      color: '#00D4AA',
    },
    {
      icon: Bell,
      title: 'Early Warning Alerts',
      desc: 'Get notified weeks before a mental health crisis. Passive monitoring means continuous data, not just appointment snapshots.',
      color: '#FF4D6D',
    },
    {
      icon: Lock,
      title: 'HIPAA-Aware & Secure',
      desc: 'On-device AI processing. No raw audio stored. Patients control consent. Clinical data shared only with explicit opt-in.',
      color: '#FFB347',
    },
  ];

  return (
    <PageTransition>
      <div className="w-full text-white overflow-hidden noise bg-bg">
        
        {/* SECTION 1: NAVBAR */}
        <motion.nav 
          initial={{ y: -100 }} animate={{ y: 0 }}
          style={{ background: navBackground, borderBottom: navBorder, backdropFilter: 'blur(10px)' }}
          className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
            <span className="font-bold text-xl gradient-text">AmbientMind</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#features" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Features</a>
            <a href="#how" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">How It Works</a>
            <a href="#clinical" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">For Clinicians</a>
            <a href="#pricing" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Pricing</a>
          </div>
          <div className="flex items-center space-x-4">
            {/* Mobile hamburger */}
            <button className="md:hidden p-2" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
            </button>
            <button onClick={() => navigate('/register')} className="bg-gradient-to-r from-primary to-secondary px-5 py-2 rounded-full font-bold text-sm hover:animate-pulse-glow transition-all glow-primary">
              Get Started
            </button>
          </div>
        </motion.nav>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="md:hidden fixed top-16 left-0 right-0 z-50 glass bg-bg/95 backdrop-blur-xl border-b border-white/10 p-6"
            >
              <div className="flex flex-col space-y-4 text-lg font-medium">
                <a href="#features" onClick={() => setMobileNavOpen(false)} className="hover:text-primary transition-colors">Features</a>
                <a href="#how" onClick={() => setMobileNavOpen(false)} className="hover:text-primary transition-colors">How It Works</a>
                <a href="#clinical" onClick={() => setMobileNavOpen(false)} className="hover:text-primary transition-colors">For Clinicians</a>
                <a href="#pricing" onClick={() => setMobileNavOpen(false)} className="hover:text-primary transition-colors">Pricing</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 2: HERO */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 max-w-7xl mx-auto">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen" />
          
          {/* Animated CSS Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-white/40 rounded-full blur-[1px] animate-pulse" />
            <div className="absolute top-[60%] left-[80%] w-3 h-3 bg-primary/40 rounded-full blur-[2px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-[40%] left-[60%] w-1.5 h-1.5 bg-secondary/40 rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-[80%] left-[30%] w-2.5 h-2.5 bg-white/30 rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-[10%] left-[50%] w-2 h-2 bg-primary/50 rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute top-[70%] left-[15%] w-3 h-3 bg-secondary/30 rounded-full blur-[2px] animate-pulse" style={{ animationDelay: '0.8s' }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full z-10 relative">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold shadow-[0_0_10px_rgba(108,99,255,0.2)]">
                  <BrainCircuit className="w-3 h-3" />
                  <span>Proactive Mental Health</span>
                </span>
              </motion.div>
              
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-4 leading-tight tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-safe">AmbientMind</span>
              </h1>

              <p className="text-lg sm:text-2xl md:text-3xl font-semibold text-white mb-3">
                Your personal, no-effort{' '}
                <span className="text-secondary">"Mental Health Tracking Helper"</span>.
              </p>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }} className="text-lg text-text-secondary max-w-xl leading-relaxed mb-4">
                Identifies problems before they become dangerous.
              </motion.p>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/register')} className="bg-gradient-to-r from-primary to-secondary px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform glow-primary">
                  Start Free Monitoring
                </button>
              </motion.div>
              
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="flex flex-wrap gap-4 mt-4 opacity-80">
                <div className="flex items-center space-x-1"><ShieldCheck className="w-4 h-4 text-secondary"/> <span className="text-xs font-medium">On-device privacy</span></div>
                <div className="flex items-center space-x-1"><Activity className="w-4 h-4 text-primary"/> <span className="text-xs font-medium">77% accuracy</span></div>
                <div className="flex items-center space-x-1"><HeartPulse className="w-4 h-4 text-warning"/> <span className="text-xs font-medium">Early detection</span></div>
              </motion.div>
            </div>
            
            <div className="lg:col-span-5 relative h-[250px] sm:h-[400px] lg:h-[600px] w-full mt-8 lg:mt-0">
              {!isMobile ? (
                <Canvas camera={{ position: [0, 0, 5] }} className="w-full h-full">
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10,10,10]} color="#6C63FF" />
                  <pointLight position={[-10,-10,-10]} color="#00D4AA" />
                  <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Sphere args={[1.5, 64, 64]}>
                      <MeshDistortMaterial color="#6C63FF" distort={0.4} speed={2} roughness={0.1} metalness={0.8} transparent opacity={0.85} />
                    </Sphere>
                  </Float>
                  <Float speed={3} rotationIntensity={1}>
                    <Sphere args={[0.2, 32, 32]} position={[2.5, 1, 0]}>
                      <MeshDistortMaterial color="#00D4AA" distort={0.3} />
                    </Sphere>
                  </Float>
                  <Float speed={2.5} rotationIntensity={0.8}>
                    <Sphere args={[0.15, 32, 32]} position={[-2, -1, 1]}>
                      <MeshDistortMaterial color="#FF4D6D" distort={0.3} />
                    </Sphere>
                  </Float>
                  <Float speed={4} rotationIntensity={1.2}>
                    <Sphere args={[0.1, 32, 32]} position={[1.5, -2, -1]}>
                      <MeshDistortMaterial color="#FFB347" distort={0.3} />
                    </Sphere>
                  </Float>
                  <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                  <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
                </Canvas>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-r from-primary to-secondary blur-[50px] animate-pulse-glow" />
                </div>
              )}
              
              {/* Floating UI Overlays */}
              {/* Floating UI overlays — hidden on small screens */}
              <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="hidden sm:block absolute top-[10%] right-[0%] glass p-3 rounded-xl border-t border-primary/50 shadow-lg">
                <div className="text-xs text-text-secondary font-bold mb-1">Risk Score</div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-warning border-t-transparent animate-spin-slow" />
                  <span className="font-extrabold text-warning">38/100 Amber</span>
                </div>
              </motion.div>

              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, delay: 1, repeat: Infinity, ease: 'easeInOut' }} className="hidden sm:block absolute bottom-[20%] left-[0%] glass p-3 rounded-xl border-l border-alert/50 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-alert" />
                  <span className="text-xs font-bold text-alert">Voice slowdown detected</span>
                </div>
                <div className="flex space-x-1 mt-2 h-3 items-end">
                  {[40, 70, 30, 90, 50].map((h, i) => (
                    <div key={i} className="w-1 bg-alert/80 rounded-t-sm" style={{ height: `${h}%`, animation: `pulse ${1+h/100}s infinite alternate` }} />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS */}
        <section id="how" ref={howRef} className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={howInView ? { opacity: 1, y: 0 } : {}}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 text-secondary text-xs font-bold mb-4"
            >
              <Zap className="w-3 h-3" /> Passive Intelligence
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} animate={howInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold mb-4"
            >
              How It <span className="gradient-text">Works</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }} animate={howInView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}
              className="text-xl text-text-secondary max-w-2xl mx-auto"
            >
              You don't tell us how you feel. We figure it out — from signals already present in your daily life.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-[2px] bg-gradient-to-r from-primary via-secondary to-warning opacity-30" />

            {howSteps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                animate={howInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.15 }}
                className="relative group"
              >
                <div className="glass rounded-3xl p-8 h-full hover:scale-[1.02] transition-transform border border-white/5 hover:border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: step.color }} />
                  
                  {/* Step number */}
                  <div className="text-6xl font-black opacity-10 absolute top-4 right-6" style={{ color: step.color }}>{step.step}</div>
                  
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative" style={{ backgroundColor: `${step.color}20`, border: `1px solid ${step.color}30` }}>
                    <step.icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>

                  <div className="flex items-center gap-2 mt-6 text-xs font-semibold" style={{ color: step.color }}>
                    <span>Step {parseInt(step.step)}</span>
                    {idx < howSteps.length - 1 && <ChevronRight className="w-3 h-3" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Privacy callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={howInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.7 }}
            className="mt-12 max-w-3xl mx-auto glass p-6 rounded-2xl border border-secondary/20 bg-secondary/5 flex flex-col md:flex-row items-center gap-4 text-center md:text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Your Privacy, By Design</p>
              <p className="text-text-secondary text-sm">AmbientMind processes all analysis on-device. Raw audio, keystrokes, and media data are <strong className="text-white">never uploaded or stored</strong>. Only numeric biomarker scores leave your device, encrypted end-to-end.</p>
            </div>
          </motion.div>
        </section>

        {/* SECTION 4: 5 SIGNALS BENTO GRID (New content) */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text pb-2">Five Signals. One Picture.</h2>
            <p className="text-xl text-text-secondary">Like a clinician who never looks away.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
            <TiltCard className="md:col-span-2 lg:col-span-2 glass rounded-3xl p-8 relative overflow-hidden group cursor-pointer border-l-4 border-l-primary hover:border-l-8 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-colors" />
              <Mic className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Voice Biomarkers</h3>
              <p className="text-text-secondary max-w-sm">Detects micro-changes in pitch, pace, and vocal jitter linked to depressive and manic episodes — analysed passively from everyday calls.</p>
              <div className="absolute bottom-6 right-6 flex items-end space-x-2 h-16 opacity-50 group-hover:opacity-100 transition-opacity">
                 {[4,8,5,2,9,6,3,7].map((h,i) => <div key={i} className="w-2 bg-primary rounded-t-sm" style={{height: `${h*10}%`, animation: `pulse ${0.5 + h/10}s infinite alternate`}}/>)}
              </div>
            </TiltCard>

            <TiltCard className="glass rounded-3xl p-6 relative overflow-hidden group cursor-pointer border-l-4 border-l-warning hover:border-l-8 transition-all">
              <MessageSquare className="w-10 h-10 text-warning mb-4" />
              <h3 className="text-xl font-bold mb-2">Chat Telemetry</h3>
              <p className="text-text-secondary text-sm">Typing speed, backspace frequency, and communication rhythms.</p>
            </TiltCard>

            <TiltCard className="glass rounded-3xl p-6 relative overflow-hidden group cursor-pointer border-l-4 border-l-secondary hover:border-l-8 transition-all">
              <Moon className="w-10 h-10 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Sleep Architecture</h3>
              <p className="text-text-secondary text-sm">Fragmentation and circadian rhythm drift monitoring.</p>
            </TiltCard>

            <TiltCard className="glass rounded-3xl p-6 relative overflow-hidden group cursor-pointer border-l-4 border-l-alert hover:border-l-8 transition-all">
              <Headphones className="w-10 h-10 text-[#FFB347] mb-4" />
              <h3 className="text-xl font-bold mb-2">Audio Habits</h3>
              <p className="text-text-secondary text-sm">Genre shifts, listening duration, and mood correlations.</p>
            </TiltCard>

            <TiltCard className="glass rounded-3xl p-6 relative overflow-hidden group cursor-pointer border-l-4 border-l-[#2ECC71] hover:border-l-8 transition-all">
              <Smile className="w-10 h-10 text-[#2ECC71] mb-4" />
              <h3 className="text-xl font-bold mb-2">Micro Check-ins</h3>
              <p className="text-text-secondary text-sm">Low-friction mood logging with empathetic AI response.</p>
            </TiltCard>
          </div>
        </section>

        {/* SECTION 6: FOR CLINICIANS */}
        <section id="clinical" ref={clinicalRef} className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={clinicalInView ? { opacity: 1, y: 0 } : {}}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold mb-4"
            >
              <Stethoscope className="w-3 h-3" /> Clinical Intelligence
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} animate={clinicalInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold mb-4"
            >
              Built for <span className="gradient-text">Clinicians</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }} animate={clinicalInView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}
              className="text-xl text-text-secondary max-w-2xl mx-auto"
            >
              Stop waiting for patients to self-report. Get objective, continuous biomarker data that no appointment can capture.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {clinicianFeatures.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                animate={clinicalInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 * idx }}
                className="glass p-8 rounded-3xl border border-white/5 hover:border-white/10 group hover:scale-[1.02] transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-5 group-hover:opacity-15 transition-opacity" style={{ backgroundColor: feat.color }} />
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: `${feat.color}20`, border: `1px solid ${feat.color}30` }}>
                  <feat.icon className="w-6 h-6" style={{ color: feat.color }} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA for clinicians */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={clinicalInView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.6 }}
            className="max-w-4xl mx-auto glass p-10 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-3xl font-extrabold mb-3">Join Our Clinical Early Access</h3>
            <p className="text-text-secondary mb-8 max-w-xl mx-auto">
              Psychiatrists and therapists are using AmbientMind to catch crises earlier. Get access to the Clinician Portal, unlimited patient links, and AI briefing reports.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/register')} className="bg-gradient-to-r from-primary to-secondary px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform glow-primary">
                Apply for Clinical Access
              </button>
              <button className="px-8 py-4 rounded-xl font-bold border border-white/20 hover:bg-white/5 transition-colors">
                View Sample Report
              </button>
            </div>
          </motion.div>
        </section>

        {/* SECTION 7: LIVE STATS COUNTER */}
        <section ref={statsRef} className="py-24 border-y border-white/5 relative bg-gradient-to-b from-surface to-bg">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-extrabold mb-2 text-white">{count970}M<span className="text-primary">+</span></div>
              <div className="text-text-secondary text-sm font-medium">Mental Health Disorders</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-extrabold mb-2 text-white"><span className="text-secondary">$</span>{count1}T</div>
              <div className="text-text-secondary text-sm font-medium">Annual Economic Loss</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-extrabold mb-2 text-white">{count11} <span className="text-alert">Yrs</span></div>
              <div className="text-text-secondary text-sm font-medium">Avg Delay in Treatment</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-extrabold mb-2 text-white">{count6}.8B</div>
              <div className="text-text-secondary text-sm font-medium">Smartphones Worldwide</div>
            </div>
          </div>
        </section>

        {/* SECTION 8: PRICING */}
        <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">Simple, Transparent Pricing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            <div className="glass p-8 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold text-text-secondary mb-2">Basic</h3>
              <div className="text-4xl font-extrabold mb-6">Free</div>
              <ul className="space-y-4 mb-8 text-sm">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-safe mr-2"/> 1 Core Signal (Checkins)</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-safe mr-2"/> Basic Risk Score</li>
                <li className="flex items-center text-white/30"><X className="w-4 h-4 mr-2"/> No Clinician Link</li>
              </ul>
              <button onClick={() => navigate('/register')} className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 font-bold transition-all">Start Free</button>
            </div>
            
            <div className="glass p-8 rounded-3xl border-2 border-primary relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(108,99,255,0.2)]">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-secondary px-4 py-1 rounded-full text-xs font-bold">MOST POPULAR</div>
              <h3 className="text-xl font-bold text-primary mb-2">Pro</h3>
              <div className="text-4xl font-extrabold mb-6">$9.99<span className="text-lg text-text-secondary font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 text-sm">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-safe mr-2"/> All 5 Biomarker Signals</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-safe mr-2"/> 30-Day Predictive History</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-safe mr-2"/> 1 Clinician Link</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-safe mr-2"/> Priority LLM Engine</li>
              </ul>
              <button onClick={() => navigate('/register')} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary font-bold text-white hover:opacity-90 transition-all glow-primary">Get Pro</button>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold text-text-secondary mb-2">Clinical</h3>
              <div className="text-4xl font-extrabold mb-6">$49<span className="text-lg text-text-secondary font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 text-sm">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-safe mr-2"/> Unlimited Patient Links</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-safe mr-2"/> AI Clinical Reports</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-safe mr-2"/> API Access</li>
              </ul>
              <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 font-bold transition-all">Contact Sales</button>
            </div>
          </div>
        </section>

        {/* SECTION 9: FINAL CTA */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-primary/20 blur-[100px] rounded-full -z-10" />
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">What if the 11-year delay<br/><span className="gradient-text pb-2">became 11 days?</span></h2>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">Join 10,000+ users proactively monitoring their mental wellness with AmbientMind.</p>
          <button onClick={() => navigate('/register')} className="bg-gradient-to-r from-primary to-secondary px-10 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-transform glow-primary shadow-[0_0_40px_rgba(108,99,255,0.4)]">
            Begin Your Assessment
          </button>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/5 bg-surface pt-16 pb-8 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <BrainCircuit className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg">AmbientMind</span>
              </div>
              <p className="text-text-secondary text-sm">Empathetic intelligence for early detection.</p>
            </div>
            <div><h4 className="font-bold mb-4">Product</h4><ul className="space-y-2 text-sm text-text-secondary"><li>Signals</li><li>Clinician Portal</li><li>Pricing</li></ul></div>
            <div><h4 className="font-bold mb-4">Company</h4><ul className="space-y-2 text-sm text-text-secondary"><li>About Us</li><li>Research</li><li>Careers</li></ul></div>
            <div><h4 className="font-bold mb-4">Legal</h4><ul className="space-y-2 text-sm text-text-secondary"><li>Privacy &amp; Security</li><li>Terms of Service</li><li>HIPAA Compliance</li></ul></div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-text-secondary">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1"/> On-Device AI</span>
              <span className="flex items-center"><Shield className="w-3 h-3 mr-1"/> HIPAA Aware</span>
            </div>
            <div>&copy; 2026 AmbientMind. Made with <span className="text-primary">💜</span> for mental wellness.</div>
          </div>
        </footer>

      </div>
    </PageTransition>
  );
}
