import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { CheckCircle2, Circle } from 'lucide-react'

export default function TodoList() {
  const [todos, setTodos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTodos = async () => {
      if (!supabase) return;
      const { data, error } = await supabase.from('todos').select()
      if (data) setTodos(data)
      setLoading(false)
    }

    fetchTodos()
  }, [])

  if (loading) return <div className="text-[10px] animate-pulse text-slate-500">INIT_TODO_MATRIX...</div>

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="text-sm font-black text-white uppercase tracking-widest">Active Operations (Todos)</h3>
        <span className="text-[10px] font-mono text-[#8305ec]">{todos.length} NODES</span>
      </div>
      
      <ul className="space-y-3">
        {todos.length === 0 ? (
          <li className="text-[10px] text-slate-500 italic">No operations detected.</li>
        ) : (
          todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#8305ec]/30 transition-all">
              {todo.is_complete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Circle className="w-4 h-4 text-slate-600" />
              )}
              <span className="text-xs text-slate-300">{todo.name}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
