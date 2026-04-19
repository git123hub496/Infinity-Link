import React, { useState, useEffect } from 'react';
import { 
  User, 
  updateProfile, 
  updateEmail, 
  sendEmailVerification 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Mail, 
  Palette, 
  Image as ImageIcon, 
  Save, 
  X, 
  Check, 
  AlertTriangle,
  Camera
} from 'lucide-react';

interface SettingsProps {
  user: User;
  onClose: () => void;
}

export const Settings = ({ user, onClose }: SettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [theme, setTheme] = useState('cyber-noir');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        setUsername(data.username || '');
        setEmail(data.email || '');
        setPhotoURL(data.photoURL || '');
        setTheme(data.theme || 'cyber-noir');
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Update Auth Profile (Display Name / Photo)
      await updateProfile(user, {
        displayName: username,
        photoURL: photoURL || null
      });

      // 2. Update Auth Email if changed
      if (email !== user.email) {
        try {
          await updateEmail(user, email);
          await sendEmailVerification(user);
          setSuccess("Profile updated. Verification email sent to new address.");
        } catch (e: any) {
          if (e.code === 'auth/requires-recent-login') {
            setError("Email change requires recent authentication. Please sign out and back in first.");
            setLoading(false);
            return;
          }
          throw e;
        }
      }

      // 3. Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        username: username,
        displayName: username, // Sync with display name
        email: email,
        photoURL: photoURL,
        theme: theme
      });

      setSuccess(prev => prev || "Identity parameters updated successfully.");
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const themes = [
    { id: 'cyber-noir', name: 'Cyber Noir', color: '#8305ec', bg: 'bg-cyber-black' },
    { id: 'matrix', name: 'Emerald Protocol', color: '#10b981', bg: 'bg-black' },
    { id: 'crimson', name: 'Blood Logic', color: '#ef4444', bg: 'bg-[#0a0000]' },
    { id: 'ocean', name: 'Deep Sea', color: '#0ea5e9', bg: 'bg-[#00080f]' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white/5 border-r border-white/10 p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-cyber-purple" />
            <h2 className="text-xl font-display font-black text-white tracking-widest uppercase">Settings</h2>
          </div>
          
          <nav className="flex flex-col gap-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20">
              <UserIcon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Identity</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:text-white transition-all cursor-not-allowed opacity-50">
              <Palette className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Aesthetics</span>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyber-purple/10 border border-cyber-purple/30 overflow-hidden">
                {photoURL ? (
                  <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-full h-full p-2 text-cyber-purple/50" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-white truncate">{username || 'Agent'}</p>
                <p className="text-[10px] font-mono text-slate-500 truncate">LVL 01_VERIFIED</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Profile Section */}
            <section className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Profile Configuration</h3>
                <p className="text-xs text-slate-500 font-light italic">Modify your public identifiers on the Infinity grid.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Grid Callsign</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-cyber-purple transition-all outline-none"
                      placeholder="Username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Avatar Reference (URL)</label>
                  <div className="relative">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-cyber-purple transition-all outline-none font-mono"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Communication Channel (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-cyber-purple transition-all outline-none"
                    placeholder="Email"
                  />
                </div>
                {email !== user.email && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase">RE-AUTHENTICATION & VERIFICATION REQUIRED</span>
                  </div>
                )}
              </div>
            </section>

            {/* Theme Section */}
            <section className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Aesthetic Protocol</h3>
                <p className="text-xs text-slate-500 font-light italic">Select your workspace personality.</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                      theme === t.id 
                        ? 'border-cyber-purple bg-cyber-purple/10' 
                        : 'border-white/5 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full shadow-lg" 
                      style={{ backgroundColor: t.color }}
                    />
                    <span className={`text-[10px] uppercase font-black tracking-widest ${theme === t.id ? 'text-white' : 'text-slate-500'}`}>
                      {t.name}
                    </span>
                    {theme === t.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-3 h-3 text-cyber-purple" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Notifications */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  key="error-msg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-mono leading-relaxed uppercase">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div 
                  key="success-msg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-start gap-3"
                >
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-mono leading-relaxed uppercase">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl hover:bg-white/5 text-slate-500 transition-all text-xs font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-cyber-purple rounded-xl text-white text-xs font-black uppercase tracking-widest neon-glow hover:translate-y-[-2px] transition-all flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Configuration
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
