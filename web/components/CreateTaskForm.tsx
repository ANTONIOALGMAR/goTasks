// Formulário de criação de tarefa com validação mínima.
// Envia título, descrição, status e prazo ao backend e retorna o item criado via 'onCreated'.

import { useState, type FormEvent } from 'react';

type Props = {
  apiUrl: string;
  token: string | null;
  onCreated: (task: any) => void;
  onNotify?: (type: 'success' | 'error' | 'info', message: string) => void;
};

export default function CreateTaskForm({ apiUrl, token, onCreated, onNotify }: Props) {
  // Estados controlados dos campos de formulário.
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Validação simples antes do envio.
  const validate = () => title.trim().length >= 3;

  // Envio ao backend com feedback visual e limpeza do formulário.
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      onNotify?.('error', 'Título deve ter pelo menos 3 caracteres.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          description,
          status,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      });
      if (!res.ok) {
        const msg = await safeErrorMessage(res);
        throw new Error(msg || `Erro ao criar tarefa (${res.status})`);
      }
      const created = await res.json();
      onCreated(created);
      onNotify?.('success', 'Tarefa criada com sucesso.');
      setTitle('');
      setDescription('');
      setStatus('todo');
      setDueDate('');
    } catch (err: any) {
      onNotify?.('error', err?.message || 'Falha ao criar tarefa.');
    } finally {
      setLoading(false);
    }
  };

  // Helper para extrair mensagem de erro de respostas JSON/text.
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

  // UI do formulário com Tailwind e estados controlados.
  return (
    <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título"
        className="rounded border px-3 py-2"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição"
        className="rounded border px-3 py-2"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded border px-3 py-2"
      >
        <option value="todo">Todo</option>
        <option value="in_progress">Em progresso</option>
        <option value="done">Concluído</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="rounded border px-3 py-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Criando...' : 'Criar'}
      </button>
    </form>
  );
}