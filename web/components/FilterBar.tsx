import { useMemo, useState } from 'react';

type Filters = {
  q: string;
  status: string;
  me: boolean;
  dueFrom: string;
  dueTo: string;
};

type Props = {
  initial?: Partial<Filters>;
  onChange: (f: Filters) => void;
};

export default function FilterBar({ initial, onChange }: Props) {
  const [q, setQ] = useState(initial?.q ?? '');
  const [status, setStatus] = useState(initial?.status ?? '');
  const [me, setMe] = useState(initial?.me ?? false);
  const [dueFrom, setDueFrom] = useState(initial?.dueFrom ?? '');
  const [dueTo, setDueTo] = useState(initial?.dueTo ?? '');

  const filters = useMemo(
    () => ({ q, status, me, dueFrom, dueTo }),
    [q, status, me, dueFrom, dueTo]
  );

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar..."
        className="rounded border px-3 py-2"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded border px-3 py-2"
      >
        <option value="">Todos status</option>
        <option value="todo">Todo</option>
        <option value="in_progress">Em progresso</option>
        <option value="done">Concluído</option>
      </select>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={me}
          onChange={(e) => setMe(e.target.checked)}
          className="h-4 w-4"
        />
        Meus
      </label>
      <input
        type="date"
        value={dueFrom}
        onChange={(e) => setDueFrom(e.target.value)}
        className="rounded border px-3 py-2"
      />
      <input
        type="date"
        value={dueTo}
        onChange={(e) => setDueTo(e.target.value)}
        className="rounded border px-3 py-2"
      />
      <div className="lg:col-span-5 flex justify-end gap-2">
        <button
          onClick={() => onChange(filters)}
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        >
          Filtrar
        </button>
        <button
          onClick={() => {
            setQ('');
            setStatus('');
            setMe(false);
            setDueFrom('');
            setDueTo('');
            onChange({ q: '', status: '', me: false, dueFrom: '', dueTo: '' });
          }}
          className="rounded border px-3 py-2 hover:bg-gray-50"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}