import React, { useState, FormEvent } from 'react';

export default function CreateTaskForm({
  apiUrl,
  token,
  onCreated,
  onNotify,
}: {
  apiUrl: string;
  token: string | null;
  onCreated: () => void;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      onNotify?.('Título é obrigatório', 'error');
      return;
    }
    try {
      const body: any = {
        title,
        description,
        status,
      };
      if (dueDate) {
        // Envia em ISO, backend aceita `dueDate` como RFC/ISO
        body.dueDate = new Date(dueDate).toISOString();
      }
      const res = await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        onNotify?.('Falha ao criar tarefa', 'error');
        return;
      }
      onNotify?.('Tarefa criada com sucesso', 'success');
      // limpa formulário
      setTitle('');
      setDescription('');
      setStatus('todo');
      setDueDate('');
      // informa o pai para recarregar
      onCreated();
    } catch {
      onNotify?.('Erro de rede ao criar tarefa', 'error');
    }
  }

  return (
    <form onSubmit={handleCreate} className="rounded-lg border border-slate-200 bg-white shadow-sm p-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <input
            className="w-full rounded-md border-slate-300 focus:ring-green-500 focus:border-green-500 bg-gray-50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            className="w-full rounded-md border-slate-300 focus:ring-green-500 focus:border-green-500 bg-gray-50"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
        <textarea
          rows={4}
          className="w-full rounded-md border-slate-300 focus:ring-green-500 focus:border-green-500 bg-gray-50"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Prazo</label>
          <input
            type="date"
            className="w-full rounded-md border-slate-300 focus:ring-green-500 focus:border-green-500 bg-gray-50"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
          >
            Criar
          </button>
        </div>
      </div>
    </form>
  );
}