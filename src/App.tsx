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
  User as UserIcon,
  Mail,
  Settings as SettingsIcon
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

import { supabase } from './supabase';
import { SupabaseAuth } from './components/SupabaseAuth';
import { DocManager } from './components/DocManager';
import TodoList from './components/TodoList';

const MainContent = ({ services, session }: { services: Service[]; session: any }) => {
  const [epoch, setEpoch] = useState(Math.floor(Date.now() / 1000));
  const [showAuth, setShowAuth] = useState(false);
  const user = session?.user || null;

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
              {user ? 'Grid authenticated via Supabase.' : 'Security protocol active. Authentication required for module access.'}
            </p>
          </div>
        </div>
        <div className="text-left md:text-right font-mono text-xs text-cyber-purple/50 space-y-2">
          <p>EPOCH: {epoch}</p>
          <div className="pt-2 flex items-center md:justify-end gap-4">
            <button 
              onClick={() => setShowAuth(!showAuth)}
              className="px-4 py-1.5 rounded-lg cyber-glass border-cyber-purple/40 text-[10px] uppercase font-black text-cyber-purple hover:neon-glow transition-all flex items-center gap-2"
            >
              <UserIcon className="w-3 h-3" />
              {user ? 'Management' : 'Authorize'}
            </button>
            {user && (
              <button 
                onClick={() => supabase?.auth.signOut()}
                className="px-4 py-1.5 rounded-lg cyber-glass border-red-500/20 text-[10px] uppercase font-black text-red-500 hover:bg-red-500/10 transition-all"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {showAuth || !user ? (
          <div className="space-y-8">
            <SupabaseAuth />
            {!user && (
              <p className="text-[10px] text-center text-slate-500 font-mono">STANDBY_FOR_HANDSHAKE</p>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            <DocManager userId={user.id} />
            <TodoList />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, idx) => (
                <ServiceCard key={service.id} service={service} index={idx} />
              ))}
            </div>
          </div>
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


export default function App() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="h-screen bg-cyber-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8305ec] border-t-transparent rounded-full animate-spin" />
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
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#8305ec]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#8305ec]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="flex justify-center h-full">
        <MainContent services={services} session={session} />
      </div>
    </div>
  );
}
