import StatusBadge from './StatusBadge';

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate?: string;
};

type Props = {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export default function TaskCard({
  task,
  onView,
  onEdit,
  onDelete,
  onAI,
}: {
  task: Task;
  onView: (t: Task) => void;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onAI?: (action: 'summary', t: Task) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold truncate" title={task.title}>{task.title || `Task #${task.id}`}</h2>
        <StatusBadge status={task.status} />
      </div>
      <p className="mt-2 text-sm text-gray-700 line-clamp-2">{task.description || 'Sem descrição.'}</p>
      <div className="mt-3 text-xs text-gray-500">
        {task.dueDate ? `Prazo: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={() => onView(task)} className="px-3 py-1 text-sm rounded-md bg-gray-500 text-white hover:bg-gray-600">Ver</button>
        <button onClick={() => onEdit(task)} className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Editar</button>
        <button onClick={() => onDelete(task)} className="px-3 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700">Excluir</button>
        <button
          className="px-3 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => onAI?.('summary', task)}
        >
          IA: Resumo
        </button>
      </div>
    </div>
  );
}
