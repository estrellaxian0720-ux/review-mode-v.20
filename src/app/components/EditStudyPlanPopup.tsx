import { X, Target, Clock, Brain, BookOpen, Languages } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EditStudyPlanPopupProps {
  currentName?: string;
  currentTargetScore: number;
  currentDailyHours: number;
  currentFamiliarity: number;
  currentOutputLanguage?: string;
  onConfirm: (settings: StudyPlanSettings) => void;
  onCancel: () => void;
}

export interface StudyPlanSettings {
  name: string;
  targetScore: number;
  dailyHours: number;
  familiarity: number;
  outputLanguage: string;
}

const LANGUAGES = [
  'English', 'Chinese (Simplified)', 'Chinese (Traditional)',
  'Spanish', 'French', 'German', 'Japanese', 'Korean',
  'Arabic', 'Portuguese', 'Russian', 'Hindi', 'Italian', 'Turkish',
];

export function EditStudyPlanPopup({
  currentName = 'AP Biology Plan',
  currentTargetScore,
  currentDailyHours,
  currentFamiliarity,
  currentOutputLanguage = 'English',
  onConfirm,
  onCancel,
}: EditStudyPlanPopupProps) {
  const [name, setName] = useState(currentName);
  const [targetScore, setTargetScore] = useState(currentTargetScore);
  const [dailyHours, setDailyHours] = useState(currentDailyHours);
  const [familiarity, setFamiliarity] = useState(currentFamiliarity);
  const [outputLanguage, setOutputLanguage] = useState(currentOutputLanguage);

  useEffect(() => {
    setName(currentName);
    setTargetScore(currentTargetScore);
    setDailyHours(currentDailyHours);
    setFamiliarity(currentFamiliarity);
    setOutputLanguage(currentOutputLanguage);
  }, [currentName, currentTargetScore, currentDailyHours, currentFamiliarity, currentOutputLanguage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ name, targetScore, dailyHours, familiarity, outputLanguage });
  };

  const familiarityLabel =
    familiarity < 34 ? 'New to this subject' : familiarity < 67 ? 'Somewhat familiar' : 'Confident';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[calc(100vh-32px)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-[18px] font-bold text-[#111827]">Study Space Settings</h2>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">Adjust your learning plan parameters</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-[#9CA3AF] hover:text-[#374151] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">

            {/* Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <label className="text-[13px] font-semibold text-[#374151]">Name</label>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AP Biology Plan"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#2D8CFF] focus:ring-2 focus:ring-[#2D8CFF]/15 transition-all"
              />
            </div>

            <div className="h-px bg-gray-100" />

            {/* Daily Study Time */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <label className="text-[13px] font-semibold text-[#374151]">Daily Study Time</label>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDailyHours(Math.max(0.5, dailyHours - 0.5))}
                  disabled={dailyHours <= 0.5}
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg font-bold transition-all ${
                    dailyHours <= 0.5
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'border-gray-300 text-gray-600 hover:border-[#FDEA3B] hover:bg-[#FDEA3B]/10 bg-white'
                  }`}
                >
                  −
                </button>
                <div className="flex-1 h-9 rounded-lg bg-[#FDEA3B] flex items-center justify-center">
                  <span className="text-[14px] font-bold text-[#111827]">{dailyHours}h / day</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDailyHours(Math.min(8, dailyHours + 0.5))}
                  disabled={dailyHours >= 8}
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg font-bold transition-all ${
                    dailyHours >= 8
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'border-gray-300 text-gray-600 hover:border-[#FDEA3B] hover:bg-[#FDEA3B]/10 bg-white'
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Target Score */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <label className="text-[13px] font-semibold text-[#374151]">Target Score</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2D8CFF] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                />
                <div className="w-14 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-[14px] font-bold text-blue-700">{targetScore}%</span>
                </div>
              </div>
              <div className="flex justify-between mt-1 px-0.5">
                <span className="text-[10px] text-gray-400">50%</span>
                <span className="text-[10px] text-gray-400">100%</span>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Familiarity */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <label className="text-[13px] font-semibold text-[#374151]">Familiarity</label>
                <span className="ml-auto text-[12px] font-medium text-purple-600">{familiarityLabel}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={familiarity}
                onChange={(e) => setFamiliarity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#A855F7] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
              />
              <div className="flex justify-between mt-1 px-0.5">
                <span className="text-[10px] text-gray-400">New</span>
                <span className="text-[10px] text-gray-400">Familiar</span>
                <span className="text-[10px] text-gray-400">Confident</span>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Output Language */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-teal-50 flex items-center justify-center">
                  <Languages className="w-3.5 h-3.5 text-teal-500" />
                </div>
                <label className="text-[13px] font-semibold text-[#374151]">Output Language</label>
                <span className="ml-auto text-[11px] text-gray-400">Language for AI-generated content</span>
              </div>
              <select
                value={outputLanguage}
                onChange={(e) => setOutputLanguage(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2D8CFF] focus:ring-2 focus:ring-[#2D8CFF]/15 transition-all appearance-none cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-[13px] font-medium text-[#6B7280] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-[13px] font-bold text-[#111827] bg-[#FDEA3B] hover:bg-[#f5e035] rounded-xl transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
