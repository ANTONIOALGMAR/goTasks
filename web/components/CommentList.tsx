import { useEffect, useState, type FormEvent } from 'react';

type Comment = {
  id: number;
  body: string;
  userId?: number;
  createdAt?: string;
};

type Props = {
  taskId: number | null;
  apiUrl: string;
  token: string | null;
};

export default function CommentList({ taskId, apiUrl, token }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!taskId) return;
    const fetchComments = async () => {
      const res = await fetch(`${apiUrl}/api/tasks/${taskId}/comments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : data?.comments ?? []);
      }
    };
    fetchComments();
  }, [taskId, apiUrl, token]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskId || !body.trim()) return;
    const res = await fetch(`${apiUrl}/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      setBody('');
      const created = await res.json();
      setComments((prev) => [created, ...prev]);
    }
  };

  if (!taskId) {
    return <div className="text-gray-500">Selecione uma tarefa para ver os comentários.</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Comentários</h3>
      <form onSubmit={submit} className="mb-3 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Adicionar comentário..."
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        >
          Enviar
        </button>
      </form>
      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="rounded border px-3 py-2 bg-white">
            <div className="text-sm text-gray-600">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</div>
            <div>{c.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}