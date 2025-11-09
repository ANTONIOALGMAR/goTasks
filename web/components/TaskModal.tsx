import { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge';

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate?: string;
};

type Props = {
  open: boolean;
  mode: 'view' | 'edit';
  task: Task | null;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
};

export default function TaskModal({ open, mode, task, onClose, onSave }: Props) {
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    }
  }, [task]);

  if (!open || !task) return null;

  const handleSave = () => {
    onSave(editedTask);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{mode === 'edit' ? 'Editar Tarefa' : 'Detalhes da Tarefa'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>

        {mode === 'view' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p className="text-gray-700">{task.description}</p>
            <div>
              <span className="font-semibold">Status: </span>
              <StatusBadge status={task.status} />
            </div>
            {task.dueDate && (
              <div>
                <span className="font-semibold">Prazo: </span>
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                value={editedTask.title || ''}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={editedTask.status || 'todo'}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              >
                <option value="todo">A Fazer</option>
                <option value="doing">Em Progresso</option>
                <option value="done">Concluída</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prazo</label>
              <input
                type="date"
                value={editedTask.dueDate || ''}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300">
            Fechar
          </button>
          {mode === 'edit' && (
            <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
              Salvar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
