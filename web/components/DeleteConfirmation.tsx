type Props = {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmation({ open, title, onCancel, onConfirm }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Confirmar Exclusão</h2>
        <p className="text-gray-700 mb-6">
          Você tem certeza que deseja excluir a tarefa: <span className="font-bold">{title}</span>?
          <br />
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
