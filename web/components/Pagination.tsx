type Props = {
  page: number;
  size: number;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({ page, size, hasNext, onPrev, onNext }: Props) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-sm text-gray-600">{`Página ${page} · ${size}/página`}</span>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
  );
}