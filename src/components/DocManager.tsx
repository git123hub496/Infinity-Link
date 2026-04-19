import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { motion } from 'motion/react';
import { Save, FileText, Check, AlertCircle } from 'lucide-react';

export const DocManager = ({ userId }: { userId: string }) => {
  const [docTitle, setDocTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load existing doc title on refresh
  useEffect(() => {
    const fetchDoc = async () => {
      if (!supabase) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('docs')
        .select('title')
        .eq('user_id', userId)
        .single();

      if (data) setDocTitle(data.title);
      setLoading(false);
    };

    fetchDoc();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setStatus('idle');

    // Upsert logic: Update if exists, or insert if not
    const { error } = await supabase
      .from('docs')
      .upsert({ 
        user_id: userId, 
        title: docTitle,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    }
    setSaving(false);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4 max-w-md mx-auto">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <FileText className="w-5 h-5 text-[#8305ec]" />
        <h3 className="text-sm font-black text-white uppercase tracking-widest">Document Storage</h3>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Global Doc Title</label>
          <input 
            type="text" 
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            disabled={loading}
            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm focus:border-[#8305ec] outline-none transition-all"
            placeholder={loading ? 'Decrypting...' : 'Enter title...'}
          />
        </div>

        <button 
          disabled={saving || loading}
          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#8305ec]/10 hover:border-[#8305ec]/40 transition-all text-white disabled:opacity-50"
        >
          {saving ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : status === 'success' ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Save className="w-3 h-3" />
          )}
          {saving ? 'Encrypting...' : status === 'success' ? 'Persisted' : 'Sync to Grid'}
        </button>

        {status === 'error' && (
          <p className="text-[9px] text-red-500 font-mono uppercase text-center mt-2">
            Persistence failed. Ensure 'docs' table exists.
          </p>
        )}
      </form>
    </div>
  );
};
