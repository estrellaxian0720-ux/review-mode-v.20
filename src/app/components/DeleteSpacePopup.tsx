import { AlertTriangle, X } from 'lucide-react';

interface DeleteSpacePopupProps {
  spaceName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteSpacePopup({ spaceName, onConfirm, onCancel }: DeleteSpacePopupProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-[480px] w-full mx-4">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-[20px] font-bold text-[#333]">
                Delete Study Space?
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-[#666] hover:text-[#333] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <p className="text-[15px] text-[#666] leading-relaxed mb-4">
            Are you sure you want to delete <strong className="text-[#333]">"{spaceName}"</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-[14px] text-red-800 font-medium">
              This action cannot be undone. All resources, knowledge points, and progress will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-[#666] rounded-lg text-[14px] font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg text-[14px] font-bold hover:bg-red-700 transition-all"
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}