import { useEffect, useMemo, useState, type FormEvent } from 'react';

type Task = { id:number; title:string; description:string; status:string; dueDate?:string; ownerId:number };
type Comment = { id:number; taskId:number; userId:number; content:string; createdAt:string };

const statusBadge = (s?:string) => {
  const map: Record<string, string> = {
    todo: 'bg-gray-100 text-gray-700',
    doing: 'bg-yellow-100 text-yellow-700',
    done: 'bg-green-100 text-green-700'
  };
  return map[s ?? 'todo'] ?? 'bg-gray-100 text-gray-700';
};

function useAuth() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  return { token, refreshToken };
}

export default function TasksPage() {
  const { token, refreshToken } = useAuth();
  const [items, setItems] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set('page', String(page));
    sp.set('size', String(size));
    if (status) sp.set('status', status);
    if (q) sp.set('q', q);
    sp.set('me', 'true');
    return sp.toString();
  }, [page, size, status, q]);

  async function apiFetch(path: string, init?: RequestInit) {
    const res = await fetch(`http://localhost:8080${path}`, {
      ...(init ?? {}),
      headers: {
        ...(init?.headers ?? {}),
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 401 && refreshToken) {
      const rf = await fetch('http://localhost:8080/api/auth/refresh', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ refreshToken })
      }).then(r => r.json());
      if (rf.token) {
        localStorage.setItem('token', rf.token);
        return apiFetch(path, init);
      }
    }
    return res;
  }

  async function load() {
    if (!token) return;
    setLoading(true);
    const res = await apiFetch(`/api/tasks?${query}`);
    const data = await res.json();
    setLoading(false);
    setItems(data.items ?? data);
  }

  async function createTask(e: FormEvent) {
    e.preventDefault();
    const titleInput = (document.getElementById('title') as HTMLInputElement).value;
    const descInput = (document.getElementById('description') as HTMLTextAreaElement).value;
    const res = await apiFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: titleInput, description: descInput }),
    });
    const t = await res.json();
    (document.getElementById('title') as HTMLInputElement).value = '';
    (document.getElementById('description') as HTMLTextAreaElement).value = '';
    setItems(prev => [t, ...prev]);
  }

  async function loadComments(taskId: number) {
    const res = await apiFetch(`/api/tasks/${taskId}/comments`);
    const data = await res.json();
    setComments(data);
  }

  async function addComment(e: FormEvent) {
    e.preventDefault();
    if (!selected || !newComment.trim()) return;
    const res = await apiFetch(`/api/tasks/${selected.id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content: newComment }),
    });
    const c = await res.json();
    setNewComment('');
    setComments(prev => [...prev, c]);
  }

  useEffect(() => {
    load();
    // ws
    if (!token) return;
    const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'task.created') {
          setItems(prev => [msg.payload, ...prev]);
        } else if (msg.type === 'task.updated') {
          setItems(prev => prev.map(t => t.id === msg.payload.id ? msg.payload : t));
        } else if (msg.type === 'task.deleted') {
          setItems(prev => prev.filter(t => t.id !== Number(msg.payload.id)));
        } else if (msg.type === 'comment.created' && selected && msg.payload.taskId === selected.id) {
          setComments(prev => [...prev, msg.payload]);
        }
      } catch {}
    };
    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, query, selected?.id]);

  useEffect(() => { if (selected) loadComments(selected.id); }, [selected]);

  if (!token) {
    return <div className="container py-10 text-gray-700">Sem token. <a className="text-blue-600" href="/login">Login</a></div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-4">Tasks</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4 md:col-span-2">
          <form onSubmit={createTask} className="space-y-3">
            <input id="title" className="w-full border rounded px-3 py-2" placeholder="Título" />
            <textarea id="description" className="w-full border rounded px-3 py-2" placeholder="Descrição"></textarea>
            <button className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700">Criar</button>
          </form>
        </div>
        <div className="bg-white rounded shadow p-4 space-y-3">
          <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="">Status: Todos</option>
            <option value="todo">A Fazer</option>
            <option value="doing">Em Progresso</option>
            <option value="done">Concluída</option>
          </select>
          <input value={q} onChange={e=>setQ(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Buscar por título/descrição" />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Tamanho</label>
            <input type="number" min={5} max={100} value={size} onChange={e=>setSize(Number(e.target.value))} className="border rounded px-2 py-1 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setPage(p=>Math.max(1, p-1))} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Anterior</button>
            <span className="text-sm">Página {page}</span>
            <button onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Próxima</button>
          </div>
          <button onClick={load} className="w-full bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700">
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          {items.map(t => (
            <div key={t.id} className="bg-white rounded shadow p-4 cursor-pointer" onClick={()=>setSelected(t)}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t.title}</h3>
                <span className={`text-xs px-2 py-1 rounded ${statusBadge(t.status)}`}>{t.status}</span>
              </div>
              <p className="text-gray-700 mt-2">{t.description}</p>
              {t.dueDate && <p className="text-xs text-gray-500 mt-1">Prazo: {new Date(t.dueDate).toLocaleString()}</p>}
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-gray-600">Sem tarefas.</div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold">Comentários</h2>
            {!selected ? (
              <p className="text-gray-600">Selecione uma tarefa para ver os comentários.</p>
            ) : (
              <>
                <ul className="space-y-2 mt-2">
                  {comments.map(c => (
                    <li key={c.id} className="border rounded px-3 py-2">
                      <p className="text-sm">{c.content}</p>
                      <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
                <form onSubmit={addComment} className="mt-3 flex gap-2">
                  <input value={newComment} onChange={e=>setNewComment(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Novo comentário" />
                  <button className="bg-blue-600 text-white rounded px-4 hover:bg-blue-700">Enviar</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}