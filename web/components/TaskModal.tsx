import React, { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge';

type Task = {
    id: number;
    title: string;
    description: string;
    status: string;
    dueDate?: string;
};

export default function TaskModal(props: {
    open?: boolean;
    mode: 'view' | 'edit';
    task?: Task;
    aiSummary?: string;
    onClose: () => void;
    onSave?: (t: Partial<Task>) => void;
}) {
    const { open, mode, task, aiSummary, onClose, onSave } = props;
    const isView = mode === 'view';

    const [editedTask, setEditedTask] = useState<Task>(
        task
            ? { ...task }
            : { id: 0, title: '', description: '', status: 'todo', dueDate: '' }
    );

    useEffect(() => {
        setEditedTask(
            task
                ? { ...task }
                : { id: 0, title: '', description: '', status: 'todo', dueDate: '' }
        );
    }, [task, mode]);

    const handleSave = () => {
        if (onSave) onSave(editedTask);
    };

    return (
        <div className={`fixed inset-0 ${open ? '' : 'hidden'} bg-black/30`}>
            <div className="bg-white rounded shadow p-4 max-w-2xl mx-auto mt-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        {isView ? 'Visualizar Tarefa' : 'Editar Tarefa'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        Fechar
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Título"
                        value={editedTask.title}
                        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                        disabled={isView}
                    />
                    <textarea
                        className="w-full border rounded px-3 py-2"
                        placeholder="Descrição"
                        value={editedTask.description}
                        onChange={(e) =>
                            setEditedTask({ ...editedTask, description: e.target.value })
                        }
                        disabled={isView}
                    />
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={editedTask.status}
                        onChange={(e) =>
                            setEditedTask({ ...editedTask, status: e.target.value })
                        }
                        disabled={isView}
                    >
                        <option value="todo">A fazer</option>
                        <option value="doing">Em progresso</option>
                        <option value="done">Concluída</option>
                    </select>
                    <input
                        type="date"
                        className="w-full border rounded px-3 py-2"
                        value={editedTask.dueDate || ''}
                        onChange={(e) =>
                            setEditedTask({ ...editedTask, dueDate: e.target.value })
                        }
                        disabled={isView}
                    />
                </div>

                {aiSummary && (
                    <div className="mt-4 bg-gray-50 border rounded p-3">
                        <div className="text-sm font-medium text-gray-700">Resumo (IA)</div>
                        <p className="text-sm text-gray-600 mt-1">{aiSummary}</p>
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-2 rounded bg-gray-200">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isView}
                        className={`px-3 py-2 rounded ${
                            isView ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white'
                        }`}
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}
