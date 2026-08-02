import { useState } from 'react';
import { TopNavigation } from '../components/TopNavigation';
import { SetupStepIndicator } from '../components/SetupStepIndicator';
import { useApp } from '../contexts/AppContext';

interface SetupScreenProps {
  onNext: () => void;
  onBack?: () => void;
  onNavigateHome?: () => void;
}

const LANGUAGE_OPTIONS = [
  { value: '', label: 'Select language' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文 (Chinese)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'pt', label: 'Português' },
  { value: 'ar', label: 'العربية' },
];

const WEEK_DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

export function SetupScreen({ onNext, onBack, onNavigateHome }: SetupScreenProps) {
  const { orientation, weeklyStudyDays, setWeeklyStudyDays } = useApp();
  const portrait = orientation === 'portrait';
  const gridCols = portrait ? 'grid-cols-1' : 'grid-cols-2';
  const [spaceName, setSpaceName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [targetScore, setTargetScore] = useState('80');
  const [totalScore, setTotalScore] = useState('100');
  const [familiarity, setFamiliarity] = useState(50);
  const [outputLanguage, setOutputLanguage] = useState('');
  const [nameError, setNameError] = useState('');
  const [rhythmMode, setRhythmMode] = useState<'weekdays' | 'everyday' | 'custom'>(() =>
    weeklyStudyDays.length === 7 ? 'everyday' : 'weekdays'
  );

  const isFormValid = spaceName.trim().length >= 3 && spaceName.trim().length <= 50;

  const handleNameBlur = () => {
    const trimmed = spaceName.trim();
    if (trimmed.length > 0 && trimmed.length < 3) {
      setNameError('At least 3 characters');
    } else if (trimmed.length > 50) {
      setNameError('Up to 50 characters');
    } else {
      setNameError('');
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSpaceName(value);
    if (nameError && value.trim().length >= 3 && value.trim().length <= 50) {
      setNameError('');
    }
  };

  const selectStudyRhythm = (mode: 'weekdays' | 'everyday', days: number[]) => {
    setRhythmMode(mode);
    setWeeklyStudyDays(days);
  };
  const toggleStudyDay = (day: number) => {
    const next = weeklyStudyDays.includes(day)
      ? weeklyStudyDays.filter(value => value !== day)
      : [...weeklyStudyDays, day].sort((a, b) => a - b);
    // 至少保留一个学习日，避免生成计划时出现除零或无可用日期。
    if (next.length > 0) {
      setRhythmMode('custom');
      setWeeklyStudyDays(next);
    }
  };
  const isWeekdays = rhythmMode === 'weekdays';
  const isEveryDay = rhythmMode === 'everyday';

  const inputBase =
    "w-full h-[38px] px-3 border border-[#D1D5DC] rounded-[8px] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#111827] transition-all font-['Inter'] bg-white";

  const labelBase = "block text-[12px] font-semibold text-[#374151] mb-1.5 font-['Inter']";

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB]">
      <TopNavigation activeMode="review-mode" />

      {/* Main scrollable area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[860px] mx-auto px-8 pt-8 pb-4">

          {/* Header row: title left, stepper right */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-[24px] font-bold text-[#111827] leading-tight font-['Inter']">Set Goal</h1>
              <p className="text-[12px] text-[#9CA3AF] mt-0.5 font-['Inter']">Step 1 of 3</p>
              <p className="text-[12px] text-[#6B7280] mt-1 font-['Inter']">Configure your exam schedule and learning preferences</p>
            </div>
            <div className="pt-1">
              <SetupStepIndicator currentStep={1} />
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-6 shadow-sm space-y-5">

            {/* Study Space Name */}
            <div>
              <label className={labelBase}>
                Study Space Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. CFA Level 1, IELTS Writing, AWS SAA"
                value={spaceName}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                className={`w-full h-[38px] px-3 border rounded-[8px] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none transition-all font-['Inter'] bg-white ${
                  nameError ? 'border-red-400 focus:border-red-400' : 'border-[#D1D5DC] focus:border-[#111827]'
                }`}
              />
              {nameError && (
                <p className="text-[11px] text-red-500 mt-1 font-['Inter']">{nameError}</p>
              )}
            </div>

            {/* Row: Exam Date | Output Language */}
            <div className={`grid ${gridCols} gap-5`}>
              <div>
                <label className={labelBase}>Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className={inputBase}
                />
                <p className="text-[11px] text-[#9CA3AF] mt-1 font-['Inter']">Your plan will be scheduled through the day before the exam.</p>
              </div>
              <div>
                <label className={labelBase}>Output Language</label>
                <div className="relative">
                  <select
                    value={outputLanguage}
                    onChange={(e) => setOutputLanguage(e.target.value)}
                    className={`${inputBase} appearance-none cursor-pointer pr-8`}
                  >
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                  {/* Chevron */}
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <p className="text-[11px] text-[#9CA3AF] mt-1 font-['Inter']">For practice questions and AI Tutor responses.</p>
              </div>
            </div>

            {/* Weekly study rhythm: recurring availability only, not a full calendar. */}
            <div className="pt-4 border-t border-[#E5E7EB]">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <label className={labelBase}>Weekly Study Rhythm</label>
                  <p className="text-[11px] text-[#9CA3AF] font-['Inter']">Which days are you usually available to study?</p>
                </div>
                <span className="text-[11px] font-semibold text-[#2563EB] whitespace-nowrap font-['Inter']">
                  {weeklyStudyDays.length} days / week
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <button type="button" onClick={() => selectStudyRhythm('weekdays', [1, 2, 3, 4, 5])}
                  className={`h-8 px-4 rounded-full text-[11px] font-semibold border transition-colors font-['Inter'] ${isWeekdays ? 'bg-[#FFF8CC] border-[#FDEA3B] text-[#705D00]' : 'bg-white border-[#D1D5DC] text-[#6B7280]'}`}>
                  Weekdays
                </button>
                <button type="button" onClick={() => selectStudyRhythm('everyday', [1, 2, 3, 4, 5, 6, 7])}
                  className={`h-8 px-4 rounded-full text-[11px] font-semibold border transition-colors font-['Inter'] ${isEveryDay ? 'bg-[#FFF8CC] border-[#FDEA3B] text-[#705D00]' : 'bg-white border-[#D1D5DC] text-[#6B7280]'}`}>
                  Every day
                </button>
                <button type="button" onClick={() => setRhythmMode('custom')} aria-pressed={rhythmMode === 'custom'}
                  className={`h-8 px-4 rounded-full text-[11px] font-semibold border font-['Inter'] ${rhythmMode === 'custom' ? 'bg-[#EEF6FF] border-[#93C5FD] text-[#2563EB]' : 'bg-white border-[#D1D5DC] text-[#6B7280]'}`}>
                  Custom
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {WEEK_DAYS.map(day => {
                  const selected = weeklyStudyDays.includes(day.value);
                  return (
                    <button key={day.value} type="button" onClick={() => toggleStudyDay(day.value)}
                      aria-pressed={selected}
                      className={`h-9 rounded-[8px] text-[11px] font-semibold border transition-all font-['Inter'] ${selected ? 'bg-[#FDEA3B] border-[#EBCB00] text-[#4D4200]' : 'bg-[#F7F8FA] border-[#E5E7EB] text-[#9CA3AF]'}`}>
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-2 font-['Inter']">
                {isWeekdays ? '5 days per week · weekends off by default' : `${weeklyStudyDays.length} recurring study days selected`}
              </p>
            </div>

            {/* Row: Target Score | Current Familiarity */}
            <div className={`grid ${gridCols} gap-5`}>

              {/* Target Score */}
              <div>
                <label className={labelBase}>Target Score</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={targetScore}
                      onChange={(e) => setTargetScore(e.target.value)}
                      className={inputBase}
                    />
                    <p className="text-[11px] text-[#9CA3AF] mt-1 font-['Inter'] text-center">Target</p>
                  </div>
                  <span className="text-[13px] text-[#9CA3AF] font-['Inter'] flex-shrink-0 mb-4">/</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={totalScore}
                      onChange={(e) => setTotalScore(e.target.value)}
                      className={inputBase}
                    />
                    <p className="text-[11px] text-[#9CA3AF] mt-1 font-['Inter'] text-center">Total</p>
                  </div>
                </div>
              </div>

              {/* Current Familiarity */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-semibold text-[#374151] font-['Inter']">Current Familiarity</label>
                  <span className="text-[12px] font-semibold text-[#FDCC00] font-['Inter']">{familiarity}%</span>
                </div>
                <div className="pt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={familiarity}
                    onChange={(e) => setFamiliarity(Number(e.target.value))}
                    className="w-full h-[3px] bg-[#E5E7EB] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FDEA3B] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm"
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-[#9CA3AF] font-['Inter']">New</span>
                    <span className="text-[10px] text-[#9CA3AF] font-['Inter']">Some Similarity</span>
                    <span className="text-[10px] text-[#9CA3AF] font-['Inter']">Confident</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#E5E7EB] px-8 py-4">
        <div className="max-w-[860px] mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-[13px] font-medium text-[#6B7280] hover:text-[#374151] transition-colors flex items-center gap-1 font-['Inter']"
          >
            ← Back
          </button>

          <button
            onClick={onNext}
            disabled={!isFormValid}
            className={`h-[42px] px-7 rounded-full flex items-center gap-2 transition-all font-['Inter'] ${
              isFormValid
                ? 'bg-[#FDEA3B] text-[#111827] hover:bg-[#FDD835] shadow-sm'
                : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }`}
          >
            <span className="text-[13px] font-semibold">Next: Add Materials</span>
            <span className="text-[14px]">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetupScreen;
