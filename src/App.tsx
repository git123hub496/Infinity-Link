/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Lock, 
  Activity, 
  Headphones, 
  Terminal, 
  Globe, 
  Shield,
  Layers,
  Cpu,
  Zap,
  Info,
  User as UserIcon
} from 'lucide-react';
import { services, Service } from './services';
import { useState, useEffect } from 'react';

const icons = {
  ShieldAlert,
  Lock,
  Activity,
  Headphones,
  Terminal,
  Globe,
};

const ServiceCard = ({ service, index }: { service: Service; index: number; key?: string }) => {
  const IconComponent = icons[service.icon as keyof typeof icons] || Info;

  return (
    <motion.a
      href={service.url}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      whileHover={{ y: -4 }}
      className="service-card glass-panel rounded-2xl p-6 flex flex-col justify-between group h-full relative overflow-hidden"
    >
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-lg bg-cyber-purple/10 flex items-center justify-center border border-cyber-purple/20 group-hover:neon-glow transition-all">
          <IconComponent className="w-6 h-6 text-cyber-purple" />
        </div>
        <h3 className="text-xl font-bold text-white group-hover:accent-text transition-colors">
          {service.name}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-light">
          {service.description}
        </p>
      </div>
      
      <div className="pt-4 mt-6 border-t border-cyber-purple/10 flex justify-between items-center">
        <span className="text-[10px] font-mono text-cyber-purple/60 font-bold uppercase tracking-widest group-hover:text-cyber-purple transition-colors">
          {service.category}
        </span>
        <Zap className="w-3 h-3 text-cyber-purple/40 group-hover:text-cyber-purple transition-all" />
      </div>

      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1.5 h-1.5 bg-cyber-purple rounded-full animate-pulse" />
      </div>
    </motion.a>
  );
};

import { auth } from './firebase';
import { User } from 'firebase/auth';
import { AuthFlow } from './components/AuthFlow';

const MainContent = ({ services, user }: { services: Service[]; user: User | null }) => {
  const [epoch, setEpoch] = useState(Math.floor(Date.now() / 1000));
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="flex-1 p-8 md:p-12 lg:p-20 z-10 flex flex-col h-screen overflow-y-auto relative max-w-7xl mx-auto w-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-purple/20 border border-cyber-purple/30">
              <Shield className="w-6 h-6 text-cyber-purple" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter accent-text">INFINITY LINK</h1>
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-light text-white tracking-tight">
              {user ? (
                <>Welcome, <span className="font-bold italic accent-text">{user.email?.split('@')[0].toUpperCase()}</span></>
              ) : (
                <>HUB_<span className="font-bold italic accent-text">OFFLINE</span></>
              )}
            </h2>
            <p className="text-slate-400 text-sm">
              {user ? 'System initialized. Authenticated secure session active.' : 'Security protocol active. Authentication required for module access.'}
            </p>
          </div>
        </div>
        <div className="text-left md:text-right font-mono text-xs text-cyber-purple/50 space-y-2">
          <p>EPOCH: {epoch}</p>
          <p className="flex items-center md:justify-end gap-2 text-cyber-purple/30">
            SECURE CHANNEL: TLS_AES_256
            <Lock className="w-3 h-3" />
          </p>
          <div className="pt-2 flex items-center md:justify-end gap-4">
            <button 
              onClick={() => setShowAuth(!showAuth)}
              className="px-4 py-1.5 rounded-lg cyber-glass border-cyber-purple/40 text-[10px] uppercase font-black text-cyber-purple hover:neon-glow transition-all flex items-center gap-2"
            >
              <UserIcon className="w-3 h-3" />
              {user ? 'Identity Manager' : 'Authorize Access'}
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></div>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${user ? 'text-emerald-500' : 'text-red-500'}`}>
                {user ? 'Nodes: Active' : 'Access: Denied'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {showAuth ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-12"
          >
            <AuthFlow onAuthenticated={() => {}} />
          </motion.div>
        ) : user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <AnimatePresence mode="popLayout">
              {services.map((service, idx) => (
                <ServiceCard key={service.id} service={service} index={idx} />
              ))}
            </AnimatePresence>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="service-card border-dashed border-2 border-cyber-purple/20 rounded-2xl p-12 flex flex-col items-center justify-center group cursor-pointer hover:border-cyber-purple/40 hover:bg-cyber-purple/5 transition-all min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-full border-2 border-cyber-purple/20 flex items-center justify-center mb-6 group-hover:border-cyber-purple group-hover:neon-glow transition-all">
                <span className="text-3xl text-cyber-purple/30 group-hover:text-cyber-purple">+</span>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-white font-bold uppercase tracking-widest group-hover:accent-text transition-colors">Add Module</p>
                <p className="text-[10px] text-cyber-purple/40 font-mono">ENCRYPTED_DEPLOY_READY</p>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-20"
          >
            <div className="w-24 h-24 rounded-full border-4 border-cyber-purple/10 flex items-center justify-center relative">
              <Lock className="w-10 h-10 text-cyber-purple/20" />
              <div className="absolute inset-0 border-4 border-cyber-purple/20 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold text-white/40 uppercase tracking-tighter">Encrypted Protocol Active</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Please enroll or authenticate your Infinity Identity to access the service matrix.</p>
            </div>
            <button 
              onClick={() => setShowAuth(true)}
              className="px-10 py-4 bg-cyber-purple rounded-xl text-white text-xs font-black uppercase tracking-[0.2em] neon-glow hover:translate-y-[-2px] transition-all"
            >
              Initialize Authorization
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-auto pt-10 border-t border-cyber-purple/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-slate-500 font-bold tracking-widest">
        <p>© 2026 INFINITY CYBERSECURITY. ALL SYSTEMS SECURED.</p>
        <div className="flex space-x-8">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyber-purple/40" />
            V.2.0.4-STABLE
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyber-purple/40" />
            REGION: EARTH-CORE-1
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyber-purple/40" />
            LATENCY: 14MS
          </span>
        </div>
      </footer>
    </main>
  );
};

import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  if (authLoading) {
    return (
      <div className="h-screen bg-cyber-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyber-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden bg-cyber-black">
      {/* Background patterns */}
      <div className="cyber-grid" />
      <div className="hex-bg" />
      <div className="scanline" />

      {/* Atmospheric glow blobs */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-cyber-purple/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-cyber-purple/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="flex justify-center h-full">
        <MainContent services={services} user={user} />
      </div>
    </div>
  );
}
