import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  itemType: 'folder' | 'note';
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ itemType, itemName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-[400px] p-6 shadow-xl">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-[#111827] mb-1">
              Delete {itemType === 'folder' ? 'Folder' : 'Note'}?
            </h2>
            <p className="text-[13px] text-[#6B7280]">
              Are you sure you want to delete <span className="font-semibold">"{itemName}"</span>?
              {itemType === 'folder' && ' All notes in this folder will also be deleted.'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-[14px] font-semibold text-[#374151] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-[14px] font-semibold text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}