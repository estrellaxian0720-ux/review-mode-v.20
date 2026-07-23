import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ChangeIconPopupProps {
  currentIcon: string;
  onConfirm: (newIcon: string) => void;
  onCancel: () => void;
}

const iconOptions = [
  // Academic
  '📐', '📏', '📊', '📈', '📉', '🎓', '📚', '📖', '📝', '✏️',
  // Science
  '🧪', '🔬', '🧬', '⚗️', '🌡️', '⚛️', '🔭', '🌌',
  // Math & Logic
  '∫', '∑', 'π', '∞', '≈', '≠', '±', '√',
  // Languages
  '🗣️', '💬', '🌍', '🌎', '🌏', '📰', '📄', '📃',
  // Arts & Humanities
  '🎨', '🎭', '🎪', '🎬', '🎵', '🎼', '🎹', '🎸',
  // Technology
  '💻', '🖥️', '⌨️', '🖱️', '💾', '📱', '🔌', '⚡',
  // Nature
  '🌱', '🌿', '🌳', '🌲', '🌵', '🌾', '🍀', '🌺',
  // Objects
  '⚙️', '🔧', '🔨', '🛠️', '📦', '📮', '📬', '🔖',
  // Shapes & Symbols
  '⭐', '🌟', '✨', '💫', '🔥', '💧', '☀️', '🌙',
  // Flags & Targets
  '🎯', '🏁', '🚩', '🔔', '📢', '📣', '🎪', '🎨',
];

export function ChangeIconPopup({ currentIcon, onConfirm, onCancel }: ChangeIconPopupProps) {
  const [selectedIcon, setSelectedIcon] = useState(currentIcon);

  useEffect(() => {
    setSelectedIcon(currentIcon);
  }, [currentIcon]);

  const handleConfirm = () => {
    if (selectedIcon !== currentIcon) {
      onConfirm(selectedIcon);
    } else {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-[560px] w-full mx-4">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-bold text-[#333]">
                Change Study Space Icon
              </h2>
              <p className="text-[13px] text-[#666] mt-1">
                Select an icon to represent your study space
              </p>
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
          {/* Selected Icon Preview */}
          <div className="mb-6 flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#FFF566] to-[#FDEA3B] rounded-xl flex items-center justify-center text-[40px]">
              {selectedIcon}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#333]">
                Selected Icon
              </p>
              <p className="text-[13px] text-[#666]">
                This will appear on your study space card
              </p>
            </div>
          </div>

          {/* Icon Grid */}
          <div className="max-h-[320px] overflow-y-auto border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-8 gap-2">
              {iconOptions.map((icon, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-12 h-12 rounded-lg text-[24px] transition-all flex items-center justify-center ${
                    selectedIcon === icon
                      ? 'bg-[#FDEA3B] ring-2 ring-[#2D8CFF] scale-110'
                      : 'bg-gray-50 hover:bg-gray-100 hover:scale-105'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
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
            onClick={handleConfirm}
            disabled={selectedIcon === currentIcon}
            className="flex-1 px-6 py-3 bg-[#2D8CFF] text-white rounded-lg text-[14px] font-bold hover:bg-[#1D7CEF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Icon
          </button>
        </div>
      </div>
    </div>
  );
}