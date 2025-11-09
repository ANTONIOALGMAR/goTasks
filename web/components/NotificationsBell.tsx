import { useEffect, useMemo, useState } from 'react';

type Notification = {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

type Props = {
  apiUrl: string;
  token: string | null;
};

export default function NotificationsBell({ apiUrl, token }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const unreadCount = useMemo(() => items.filter(i => !i.read).length, [items]);

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const fetchNotifications = async (unreadOnly = false) => {
    if (!token) return;
    const url = `${apiUrl}/api/notifications${unreadOnly ? '?unread=true' : ''}`;
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    }
  };

  const markRead = async (id: number) => {
    if (!token) return;
    const res = await fetch(`${apiUrl}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      setItems(prev => prev.map(i => (i.id === id ? { ...i, read: true } : i)));
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    const id = setInterval(() => fetchNotifications(true), 30000);
    return () => clearInterval(id);
  }, [token]);

  return (
    <div className="relative">
      <button
        className="relative rounded px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700"
        onClick={() => {
          setOpen((o) => !o);
          fetchNotifications();
        }}
      >
        Notificações
        {unreadCount > 0 && (
          <span className="ml-2 inline-block rounded bg-red-600 px-2 py-0.5 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded border bg-white shadow-lg">
          <div className="max-h-80 overflow-auto">
            {items.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-600">Sem notificações.</div>
            ) : (
              <ul>
                {items.map((n) => (
                  <li key={n.id} className="px-3 py-2 border-b last:border-b-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm">{n.message}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {!n.read && (
                        <button
                          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                          onClick={() => markRead(n.id)}
                        >
                          Marcar lida
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}