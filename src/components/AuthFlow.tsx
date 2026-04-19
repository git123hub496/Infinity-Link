import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  linkWithPopup, 
  User,
  GoogleAuthProvider,
  unlink
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Mail, User as UserIcon, LogOut, Link as LinkIcon, AlertCircle, CheckCircle2, Globe } from 'lucide-react';

export const AuthFlow = ({ onAuthenticated }: { onAuthenticated: (user: User | null) => void }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      onAuthenticated(u);
      setLoading(u ? false : false); // Keep loading state until we decide
      setLoading(false);
    });
    return unsubscribe;
  }, [onAuthenticated]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Create profile in Firestore
        await setDoc(doc(db, 'users', cred.user.uid), {
          userId: cred.user.uid,
          displayName: email.split('@')[0],
          email: email,
          provider: 'password',
          createdAt: serverTimestamp()
        });
        setSuccess("Infinity Account created successfully.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLinkGoogle = async () => {
    if (!user) return;
    setError(null);
    try {
      await linkWithPopup(user, googleProvider);
      // Update firestore
      await setDoc(doc(db, 'users', user.uid), { provider: 'password+google' }, { merge: true });
      setSuccess("Account linked to Google successfully.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignOut = () => signOut(auth);

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-cyber-purple border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (user) {
    const isGoogleLinked = user.providerData.some(p => p.providerId === GoogleAuthProvider.PROVIDER_ID);
    
    return (
      <div className="glass-panel p-6 rounded-2xl space-y-6 max-w-md mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Shield className="w-12 h-12 text-cyber-purple" />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-cyber-purple/20 flex items-center justify-center border border-cyber-purple/30">
            <UserIcon className="w-6 h-6 text-cyber-purple" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Console Session</h3>
            <p className="text-xs text-slate-400 font-mono">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-cyber-purple/5 border border-cyber-purple/10">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-cyber-purple" />
              <span className="text-xs font-semibold text-slate-300">Infinity Identity</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-cyber-purple/5 border border-cyber-purple/10">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-cyber-purple" />
              <span className="text-xs font-semibold text-slate-300">Google Link</span>
            </div>
            {isGoogleLinked ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <button 
                onClick={handleLinkGoogle}
                className="text-[10px] uppercase font-black text-cyber-purple hover:neon-text-glow transition-all flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" />
                Link Account
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-[10px] font-mono bg-red-500/10 p-2 rounded">{error}</p>}
        {success && <p className="text-emerald-500 text-[10px] font-mono bg-emerald-500/10 p-2 rounded">{success}</p>}

        <button 
          onClick={handleSignOut}
          className="w-full py-3 rounded-xl cyber-glass border-red-900/30 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-8 rounded-2xl max-w-md mx-auto space-y-8 relative overflow-hidden">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-display font-bold text-white tracking-tight">
          {mode === 'login' ? 'IDENTITY_LOGIN' : 'ENROLL_IDENTITY'}
        </h3>
        <p className="text-slate-400 text-xs font-light">Access restricted to authorized Infinity personnel.</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1">Grid Identifier</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-cyber-black border border-cyber-purple/20 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-cyber-purple focus:neon-glow outline-none transition-all"
              placeholder="e.g. agent.0@infinity.net"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1">Secure Key</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cyber-black border border-cyber-purple/20 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-cyber-purple focus:neon-glow outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[10px] font-mono leading-relaxed uppercase">{error}</p>
          </div>
        )}

        <button 
          type="submit"
          className="w-full py-4 bg-cyber-purple rounded-xl text-white text-xs font-black uppercase tracking-[0.2em] neon-glow hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
        >
          {mode === 'login' ? 'Authenticate' : 'Establish Identity'}
        </button>
      </form>

      <div className="text-center">
        <button 
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
          className="text-[10px] uppercase font-black text-slate-500 hover:text-cyber-purple transition-all tracking-widest"
        >
          {mode === 'login' ? 'No account? Create Infinity Identity' : 'Already enrolled? Secure Login'}
        </button>
      </div>
    </div>
  );
};
