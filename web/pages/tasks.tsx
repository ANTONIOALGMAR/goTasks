import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import FilterBar from '../components/FilterBar';
import Toast from '../components/Toast';
import CreateTaskForm from '../components/CreateTaskForm';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import DeleteConfirmation from '../components/DeleteConfirmation';

// Define the Task type
type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate?: string;
};

// This parent component ensures that the main logic only runs on the client, preventing hydration errors.
export default function TasksPage() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Render nothing on the server and initial client render
  }

  return <TasksClientComponent />;
}

// This component contains the actual page logic and is only rendered on the client.
function TasksClientComponent() {
  // CONFIG & AUTH
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, []);



  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });
  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }

  async function runAISummary(task: any) {
    try {
      const res = await fetch(`${API_URL}/api/ai/tasks/${task.id}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        showToast('Falha ao gerar resumo por IA', 'error');
        return;
      }
      const data = await res.json();
      setSelectedTask({ ...task, aiSummary: data.summary });
      setModalMode('view');
      setModalOpen(true);
    } catch {
      showToast('Erro de rede ao chamar IA', 'error');
    }
  }

  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);
  const router = useRouter();

  // PAGE STATE
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [filters, setFilters] = useState({ q: '', status: '', me: false, dueFrom: '', dueTo: '' });

  // MODAL & UI STATE
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // DATA FETCHING
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
      if (!res.ok) throw new Error(await safeErrorMessage(res, 'Erro ao listar tarefas'));
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : data?.items ?? []);
      setHasNext((Array.isArray(data) ? data : data?.items ?? []).length === size);
    } catch (err: any) {
      notify('error', err?.message);
    }
  };

  // SYNC & REAL-TIME
  useEffect(() => {
    if (token) fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, filters, token]);

  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket(`${API_URL.replace('http', 'ws')}/ws?token=${token}`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type?.startsWith('task.')) {
        fetchTasks(); // Refetch on any task update
      }
    };
    return () => ws.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // EVENT HANDLERS
  const openView = (task: Task) => {
    setSelectedTask(task);
    setModalMode('view');
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setSelectedTask(task);
    setModalMode('edit');
    setModalOpen(true);
  };
  const openDelete = (task: Task) => {
    setDeleteTarget(task);
    setDeleteOpen(true);
  };

  async function saveTask(partialTask: Partial<Task>) {
      if (!selectedTask) return;
      try {
          const body = { ...selectedTask, ...partialTask };
          // Ajustar dueDate para null se for string vazia, como fizemos antes
          if (body.dueDate === '') {
            body.dueDate = null;
          }

          const res = await fetch(`${API_URL}/api/tasks/${selectedTask.id}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(body),
          });
          if (!res.ok) {
              throw new Error(await safeErrorMessage(res, 'Falha ao atualizar tarefa'));
          }
          notify('success', 'Tarefa atualizada com sucesso');
          fetchTasks();
      } catch (err: any) {
          notify('error', err.message);
      }
  }

  const handleDeleteTask = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${deleteTarget.id}`, { method: 'DELETE', headers });
      if (res.status !== 204) throw new Error(await safeErrorMessage(res, 'Falha ao excluir tarefa'));
      notify('success', 'Tarefa excluída com sucesso');
      setDeleteOpen(false);
      fetchTasks();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  // HELPERS
  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    setToastType(type);
    setToastMessage(message);
  };

  const safeErrorMessage = async (res: Response, defaultMsg: string) => {
    try {
      const data = await res.json();
      return data?.error || data?.message || defaultMsg;
    } catch {
      return defaultMsg;
    }
  };

  // RENDER LOGIC
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container py-10 text-center text-gray-700">
          <p>Você precisa estar logado para ver as tarefas.</p>
          <a className="text-blue-600 hover:underline" href="/login">Ir para a página de Login</a>
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
          onCreated={() => {
            notify('success', 'Tarefa criada com sucesso!');
            fetchTasks();
          }}
          onNotify={notify}
        />

        <FilterBar
          initial={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onView={openView}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>

        <Pagination page={page} size={size} hasNext={hasNext} onPrev={() => setPage(p => Math.max(1, p - 1))} onNext={() => setPage(p => p + 1)} />
        
        {modalOpen && selectedTask && (
          // Adicionar log para depuração
          console.log('TaskModal props - modalMode:', modalMode, 'selectedTask:', selectedTask),
          <TaskModal
            open={modalOpen}
            mode={modalMode}
            task={selectedTask}
            onClose={() => setModalOpen(false)}
            onSave={async (partialTask) => {
              await saveTask(partialTask);
              setModalOpen(false);
            }}
            onGenerateAISummary={runAISummary} // <-- Adicionar esta prop
          />
        )}

        <DeleteConfirmation
          open={deleteOpen}
          title={deleteTarget?.title ?? ''}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDeleteTask}
        />
      </main>

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </div>
  );
}
