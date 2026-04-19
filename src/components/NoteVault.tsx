import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  FileText, 
  Check, 
  AlertCircle, 
  Zap, 
  Terminal,
  Activity,
  History
} from 'lucide-react';

export const NoteVault = ({ userId }: { userId: string }) => {
  const [docTitle, setDocTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  const isInitialMount = useRef(true);

  // Load and Real-time listener
  useEffect(() => {
    if (!supabase) return;

    const fetchDoc = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('docs')
        .select('title, content, updated_at')
        .eq('user_id', userId)
        .single();

      if (data) {
        setDocTitle(data.title || '');
        setContent(data.content || '');
        setLastSync(data.updated_at);
      }
      setLoading(false);
    };

    fetchDoc();

    // Real-time subscription for cross-app sync
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'docs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Update local state if the change came from another client
          setDocTitle(payload.new.title);
          setContent(payload.new.content);
          setLastSync(payload.new.updated_at);
          setStatus('success');
          setTimeout(() => setStatus('idle'), 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setStatus('idle');

    const timestamp = new Date().toISOString();
    const { error } = await supabase
      .from('docs')
      .upsert({ 
        user_id: userId, 
        title: docTitle,
        content: content,
        updated_at: timestamp
      }, { onConflict: 'user_id' });

    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      setStatus('success');
      setLastSync(timestamp);
      setTimeout(() => setStatus('idle'), 2000);
    }
    setSaving(false);
  };

  // Auto-save logic (optional, but good for "Note App" feel)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (content || docTitle) handleSave();
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [content, docTitle]);

  return (
    <div className="glass-panel p-8 rounded-3xl space-y-6 max-w-2xl mx-auto border-cyber-purple/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 flex gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'success' ? 'bg-emerald-500 animate-ping' : 'bg-cyber-purple/30'}`} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyber-purple/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyber-purple/10 flex items-center justify-center border border-cyber-purple/20">
            <Terminal className="w-6 h-6 text-cyber-purple" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Note Vault</h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <Activity className="w-3 h-3 text-cyber-purple/50" />
              STATUS: {loading ? 'RECOVERING_DATA...' : 'SYNC_STABLE'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Global Sequence ID</p>
          <p className="text-[10px] font-bold text-cyber-purple/60">{userId.slice(0, 18).toUpperCase()}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] pl-1">Encryption Label (Title)</label>
          <input 
            type="text" 
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="w-full bg-cyber-black/40 border border-cyber-purple/10 rounded-xl py-4 px-5 text-sm focus:border-cyber-purple focus:neon-glow transition-all outline-none font-bold text-white placeholder:text-slate-700"
            placeholder="SECURE_IDENTIFIER"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] pl-1">Matrix Payload (Content)</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full bg-cyber-black/40 border border-cyber-purple/10 rounded-2xl py-4 px-5 text-sm focus:border-cyber-purple focus:neon-glow transition-all outline-none font-mono text-slate-300 resize-none placeholder:text-slate-700 leading-relaxed"
            placeholder="// BEGIN ENCRYPTED MESSAGE..."
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
            <History className="w-3.5 h-3.5" />
            <span>LAST_SYNC: {lastSync ? new Date(lastSync).toLocaleTimeString() : 'NEVER'}</span>
          </div>

          <button 
            onClick={() => handleSave()}
            disabled={saving || loading}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all min-w-[160px] ${
              status === 'success' 
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-500' 
                : 'bg-cyber-purple text-white neon-glow'
            }`}
          >
            {saving ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : status === 'success' ? (
              <Check className="w-3 h-3" />
            ) : (
              <Zap className="w-3 h-3" />
            )}
            {saving ? 'LINKING...' : status === 'success' ? 'PERSISTED' : 'FORGET_NOT'}
          </button>
        </div>
      </div>
    </div>
  );
};
