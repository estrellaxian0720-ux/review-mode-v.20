import { useState } from 'react';
import { X, Edit2 } from 'lucide-react';

interface RenameNoteModalProps {
  currentName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}

export function RenameNoteModal({ currentName, onConfirm, onCancel }: RenameNoteModalProps) {
  const [noteName, setNoteName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteName.trim() && noteName.trim() !== currentName) {
      onConfirm(noteName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-[400px] p-6 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#111827]">Rename Note</h2>
              <p className="text-[13px] text-[#6B7280]">Update note title</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-[#9CA3AF] hover:text-[#111827] hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-[13px] font-semibold text-[#374151] mb-2">
              Note Title
            </label>
            <input
              type="text"
              value={noteName}
              onChange={(e) => setNoteName(e.target.value)}
              placeholder="e.g., Definition and Properties"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-[#2D8CFF] transition-colors text-[14px] text-[#111827] placeholder:text-[#9CA3AF]"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-[14px] font-semibold text-[#374151] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!noteName.trim() || noteName.trim() === currentName}
              className="flex-1 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-[14px] font-semibold text-[#111827] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-400"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}