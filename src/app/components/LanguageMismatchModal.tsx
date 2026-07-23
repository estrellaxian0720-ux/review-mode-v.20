import { X } from 'lucide-react';
import { useState } from 'react';

const OTHER_LANGUAGES = [
  'Arabic', 'Chinese (Simplified)', 'Chinese (Traditional)', 'French',
  'German', 'Hindi', 'Italian', 'Japanese', 'Korean', 'Portuguese',
  'Russian', 'Turkish',
];

interface LanguageMismatchModalProps {
  onConfirm: (language: string) => void;
  onClose: () => void;
}

export function LanguageMismatchModal({ onConfirm, onClose }: LanguageMismatchModalProps) {
  const [selected, setSelected] = useState<'app' | 'material' | 'other'>('app');
  const [otherLang, setOtherLang] = useState('Arabic');

  const handleConfirm = () => {
    if (selected === 'app') onConfirm('English');
    else if (selected === 'material') onConfirm('Spanish');
    else onConfirm(otherLang);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] max-h-[calc(100vh-32px)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4">
          <div className="flex-1 pr-4">
            <h2 className="text-[16px] font-bold text-[#111827] leading-snug">
              Your study materials are in a different language from your app language.
            </h2>
            <p className="text-[13px] text-[#6B7280] mt-1.5 leading-relaxed">
              Choose the language you&apos;d like AI to use for generated study content.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9CA3AF] hover:text-[#374151] hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="px-6 pb-4 space-y-2">
          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 border-transparent has-[:checked]:border-[#2D8CFF] has-[:checked]:bg-blue-50">
            <input
              type="radio"
              name="lang"
              checked={selected === 'app'}
              onChange={() => setSelected('app')}
              className="accent-[#2D8CFF] w-4 h-4 flex-shrink-0"
            />
            <span className="text-[14px] font-medium text-[#111827]">English</span>
            <span className="ml-auto text-[11px] text-[#9CA3AF] font-medium">App language</span>
          </label>

          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 border-transparent has-[:checked]:border-[#2D8CFF] has-[:checked]:bg-blue-50">
            <input
              type="radio"
              name="lang"
              checked={selected === 'material'}
              onChange={() => setSelected('material')}
              className="accent-[#2D8CFF] w-4 h-4 flex-shrink-0"
            />
            <span className="text-[14px] font-medium text-[#111827]">Spanish</span>
            <span className="ml-auto text-[11px] text-[#9CA3AF] font-medium">Material language</span>
          </label>

          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 border-transparent has-[:checked]:border-[#2D8CFF] has-[:checked]:bg-blue-50">
            <input
              type="radio"
              name="lang"
              checked={selected === 'other'}
              onChange={() => setSelected('other')}
              className="accent-[#2D8CFF] w-4 h-4 flex-shrink-0"
            />
            <span className="text-[14px] font-medium text-[#111827]">Other...</span>
          </label>

          {selected === 'other' && (
            <div className="pl-7 pr-1">
              <select
                value={otherLang}
                onChange={(e) => setOtherLang(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D8CFF] bg-white text-[#111827] transition-colors"
              >
                {OTHER_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-[13px] font-medium text-[#6B7280] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 text-[13px] font-bold text-[#111827] bg-[#FDEA3B] hover:bg-[#f5e035] rounded-xl transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
