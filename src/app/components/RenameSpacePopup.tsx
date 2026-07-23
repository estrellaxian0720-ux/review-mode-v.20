import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RenameSpacePopupProps {
  currentName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}

export function RenameSpacePopup({ currentName, onConfirm, onCancel }: RenameSpacePopupProps) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name.trim() !== currentName) {
      onConfirm(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-[480px] w-full mx-4">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[#333]">
              Rename Study Space
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-[#666] hover:text-[#333] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6">
            <label className="block text-[14px] font-semibold text-[#333] mb-3">
              Study Space Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter study space name"
              autoFocus
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] focus:outline-none focus:border-[#2D8CFF] transition-colors"
              maxLength={50}
            />
            <p className="text-[12px] text-[#999] mt-2">
              {name.length}/50 characters
            </p>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-[#666] rounded-lg text-[14px] font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || name.trim() === currentName}
              className="flex-1 px-6 py-3 bg-[#2D8CFF] text-white rounded-lg text-[14px] font-bold hover:bg-[#1D7CEF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}