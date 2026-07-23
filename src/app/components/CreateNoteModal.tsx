import { useState } from 'react';
import { X, FileText } from 'lucide-react';

interface CreateNoteModalProps {
  folderName: string;
  onConfirm: (title: string) => void;
  onCancel: () => void;
}

export function CreateNoteModal({ folderName, onConfirm, onCancel }: CreateNoteModalProps) {
  const [noteTitle, setNoteTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteTitle.trim()) {
      onConfirm(noteTitle.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-[400px] p-6 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#111827]">Create New Note</h2>
              <p className="text-[13px] text-[#6B7280]">in {folderName}</p>
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
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g., Chapter 1 Summary"
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
              disabled={!noteTitle.trim()}
              className="flex-1 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-[14px] font-semibold text-[#111827] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-400"
            >
              Create Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}