// Componente de Toast com mensagens temporárias de sucesso/erro.
// Mantém visual simples com Tailwind e permite fechar manualmente.

import { useEffect } from 'react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  durationMs?: number;
};

export default function Toast({ message, type = 'info', onClose, durationMs = 3000 }: ToastProps) {
  // Fecha automaticamente após 'durationMs' milissegundos.
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onClose, durationMs);
    return () => clearTimeout(id);
  }, [message, durationMs, onClose]);

  // Estilos por tipo de mensagem (cores intuitivas).
  const styles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-gray-800 text-white',
  }[type];

  // Estrutura visual do toast com botão de fechar.
  return message ? (
    <div className={`fixed bottom-4 right-4 rounded shadow-lg px-4 py-3 ${styles}`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30"
        >
          Fechar
        </button>
      </div>
    </div>
  ) : null;
}