import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import FilterBar from '../components/FilterBar';
import CommentList from '../components/CommentList';
import Toast from '../components/Toast';
import CreateTaskForm from '../components/CreateTaskForm';

// Define the Task type, assuming its structure
type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate?: string;
};

export default function TasksPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render
    setIsClient(true);
  }, []);

  // During SSR and initial client render, return null to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  // The rest of the component logic now runs only on the client
  return <TasksClientComponent />;
}

// We move the original component logic to a new component
// that is only ever rendered on the client.
function TasksClientComponent() {
  // Config: URL da API com fallback.
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

  // Client-side state management
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  // Estados principais
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [filters, setFilters] = useState({ q: '', status: '', me: false, dueFrom: '', dueTo: '' });
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Toast de feedback visual
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Headers com Authorization
  const headers = useMemo(
      () => (token ? { Authorization: `Bearer ${token}` } : {}),
      [token]
  );

  const router = useRouter();

  // Inicialização de filtros/página a partir da URL.
  useEffect(() => {
      const q = (router.query.q as string) || '';
      const status = (router.query.status as string) || '';
      const me = router.query.me === 'true';
      const dueFrom = (router.query.dueFrom as string) || '';
      const dueTo = (router.query.dueTo as string) || '';
      const p = parseInt((router.query.page as string) || '1', 10);
      const s = parseInt((router.query.size as string) || '10', 10);

      setFilters({ q, status, me, dueFrom, dueTo });
      setPage(Number.isNaN(p) ? 1 : Math.max(1, p));
      setSize(Number.isNaN(s) ? 10 : Math.min(Math.max(5, s), 50));
  }, [router.query]);

  // Busca de tarefas
  const fetchTasks = async () => {
    if (!token) return;
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', String(size));
      if (filters.q) params.set('q', filters.q);
      if (filters.status) params.set('status', filters.status);
      if (filters.me) params.set('me', 'true');
      if (filters.dueFrom) params.set('dueFrom', filters.dueFrom);
      if (filters.dueTo) params.set('dueTo', filters.dueTo);

      try {
          const res = await fetch(`${API_URL}/api/tasks?${params.toString()}`, { headers });
          if (!res.ok) {
              const msg = await safeErrorMessage(res);
              throw new Error(msg || `Erro ao listar tarefas (${res.status})`);
          }
          const data = await res.json();
          const items = Array.isArray(data) ? data : data?.items ?? data?.tasks ?? [];
          setTasks(items);
          setHasNext(items.length === size);
      } catch (err: any) {
          notify('error', err?.message || 'Falha ao listar tarefas.');
      }
  };

  // Sincroniza com a URL e busca dados
  useEffect(() => {
    if (!token) return;
      const activeFilters = Object.fromEntries(
        Object.entries(filters)
          .filter(([, value]) => value)
          .map(([key, value]) => [key, String(value)])
      );
      const params = new URLSearchParams(activeFilters);
      params.set('page', String(page));
      params.set('size', String(size));

      router.replace({ pathname: router.pathname, query: Object.fromEntries(params) }, undefined, {
          shallow: true,
      });

      fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, filters, token]);

  // WebSocket
  useEffect(() => {
    if (!token) return;
      try {
          const ws = new WebSocket(`${API_URL.replace('http', 'ws')}/ws?token=${token}`);
          ws.onmessage = () => fetchTasks();
          return () => ws.close();
      } catch {
          // ignore falhas de WS
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onPrev = () => setPage((p: number) => Math.max(1, p - 1));
  const onNext = () => setPage((p: number) => p + 1);

  const notify = (type: 'success' | 'error' | 'info', message: string) => {
      setToastType(type);
      setToastMessage(message);
  };

  const safeErrorMessage = async (res: Response) => {
      try {
          const data = await res.json();
          return data?.error || data?.message || '';
      } catch {
          try {
              return await res.text();
          } catch {
              return '';
          }
      }
  };

  if (!token) {
    // Client-side, no token found
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container py-10 text-center text-gray-700">
          <p>Você precisa estar logado para ver as tarefas.</p>
          <a className="text-blue-600 hover:underline" href="/login">
            Ir para a página de Login
          </a>
        </main>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-6">
              <h1 className="text-2xl font-bold mb-4">Tasks</h1>

              <CreateTaskForm
                  apiUrl={API_URL}
                  token={token}
                  onCreated={(task: Task) => {
                      setTasks((prev: Task[]) => [task, ...prev]);
                      notify('success', 'Tarefa criada e adicionada à lista.');
                  }}
                  onNotify={notify}
              />

              <FilterBar
                  initial={filters}
                  onChange={(f: any) => {
                      setFilters(f);
                      setPage(1);
                  }}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {tasks.map((t: Task) => (
                      <div
                          key={t.id}
                          className={`rounded border bg-white p-4 hover:ring cursor-pointer ${selectedTaskId === t.id ? 'ring-2 ring-blue-400' : ''}`}
                          onClick={() => setSelectedTaskId(t.id)}
                      >
                          <div className="flex items-center justify-between">
                              <h2 className="font-semibold">{t.title || `Task #${t.id}`}</h2>
                              <StatusBadge status={t.status} />
                          </div>
                          <p className="mt-2 text-sm text-gray-700">{t.description || ''}</p>
                          <div className="mt-2 text-xs text-gray-500">
                              {t.dueDate ? `Prazo: ${new Date(t.dueDate).toLocaleDateString()}` : ''}
                          </div>
                      </div>
                  ))}
              </div>

              <Pagination page={page} size={size} hasNext={hasNext} onPrev={onPrev} onNext={onNext} />
              <CommentList taskId={selectedTaskId} apiUrl={API_URL} token={token} />
          </main>

          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      </div>
  );
}
