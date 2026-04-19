import React, { useState } from 'react';
import { supabase } from '../supabase';
import { motion } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Mail, 
  Zap, 
  AlertCircle,
  LogIn,
  UserPlus
} from 'lucide-react';

export const SupabaseAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!supabase) return (
    <div className="glass-panel p-6 rounded-2xl border-amber-500/20 text-amber-500 text-xs font-mono">
      SUPABASE_KEY_MISSING: Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in settings.
    </div>
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const { data, error } = mode === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else if (mode === 'signup') {
      if (data.session) {
        setSuccessMsg("Account linked successfully. Accessing grid...");
      } else {
        setSuccessMsg("Enrollment request received. Check your email for a verification link to activate your node.");
      }
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 rounded-2xl max-w-md mx-auto space-y-8"
    >
      <div className="text-center space-y-1">
        <h3 className="text-xl font-display font-black text-white tracking-widest uppercase">
          {mode === 'login' ? 'Nexus Authentication' : 'Establish Grid Identity'}
        </h3>
        <p className="text-[10px] text-slate-500 font-mono tracking-tighter">PROVIDER: SUPABASE_CORE_V1</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {/* ... existing email and password fields ... */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1">Identifier (Email)</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-[#8305ec]/20 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#8305ec] transition-all outline-none"
              placeholder="agent@infinity.net"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1">Passkey</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="password" 
              required
              min={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-[#8305ec]/20 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#8305ec] transition-all outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[9px] font-mono leading-relaxed uppercase">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-start gap-3">
            <Zap className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
            <p className="text-[9px] font-mono leading-relaxed uppercase">{successMsg}</p>
          </div>
        )}

        <button 
          disabled={loading}
          className="w-full py-4 bg-[#8305ec] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {mode === 'login' ? 'Initiate Link' : 'Secure Enrollment'}
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <button 
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-[10px] uppercase font-black text-slate-500 hover:text-[#8305ec] transition-all"
        >
          {mode === 'login' ? 'New Agent? Create Account' : 'Existing Node? Back to Login'}
        </button>
      </div>
    </motion.div>
  );
};
