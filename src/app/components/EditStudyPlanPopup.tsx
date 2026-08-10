import { X, Target, BookOpen, Languages, CalendarClock, CalendarDays, Zap, Bell, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import type { PlanMethod } from '../types/study';

interface EditStudyPlanPopupProps {
  currentName?: string;
  currentTargetScore: number;
  currentTotalScore: number;
  currentExamDate: string;
  currentWeeklyStudyDays: number[];
  currentPlanMethod: PlanMethod;
  currentReminderTime?: string;
  currentOutputLanguage?: string;
  onConfirm: (settings: StudyPlanSettings, rescheduleStrategy?: RescheduleStrategy) => void;
  onCancel: () => void;
}

export interface StudyPlanSettings {
  name: string;
  targetScore: number;
  totalScore: number;
  examDate: string;
  weeklyStudyDays: number[];
  planMethod: PlanMethod;
  reminderTime: string;
  outputLanguage: string;
}

/**
 * 重排字段（examDate / weeklyStudyDays / planMethod）发生变化时，用户需选择
 * 未来任务的处理策略。与源文档 Prompt 7「修改触发」一致。
 */
export type RescheduleStrategy = 'PRESERVE_MANUAL' | 'FULL_RESCHEDULE';

/** 会触发重排的字段集合，用于判断是否进入重排预览。 */
const RESCHEDULE_FIELDS = ['examDate', 'weeklyStudyDays', 'planMethod'] as const;

const LANGUAGES = [
  'English', 'Chinese (Simplified)', 'Chinese (Traditional)',
  'Spanish', 'French', 'German', 'Japanese', 'Korean',
  'Arabic', 'Portuguese', 'Russian', 'Hindi', 'Italian', 'Turkish',
];

const WEEK_DAYS: { value: number; label: string }[] = [
  { value: 1, label: '一' }, { value: 2, label: '二' }, { value: 3, label: '三' },
  { value: 4, label: '四' }, { value: 5, label: '五' }, { value: 6, label: '六' }, { value: 7, label: '日' },
];

const sameDays = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);

/** 左文案 / 右控件的单行字段容器，压缩弹窗纵向高度。 */
function Row({
  icon,
  iconBg,
  label,
  hint,
  reschedule,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  hint?: string;
  reschedule?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`w-6 h-6 rounded-md ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[#374151] whitespace-nowrap">{label}</span>
          {reschedule && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">重排</span>
          )}
        </div>
        {hint && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{hint}</p>}
      </div>
      <div className="ml-auto flex-shrink-0">{children}</div>
    </div>
  );
}

export function EditStudyPlanPopup({
  currentName = '法考 · 刑法',
  currentTargetScore,
  currentTotalScore,
  currentExamDate,
  currentWeeklyStudyDays,
  currentPlanMethod,
  currentReminderTime = '',
  currentOutputLanguage = 'Chinese (Simplified)',
  onConfirm,
  onCancel,
}: EditStudyPlanPopupProps) {
  const [name, setName] = useState(currentName);
  const [targetScore, setTargetScore] = useState(currentTargetScore);
  const [totalScore, setTotalScore] = useState(currentTotalScore);
  const [examDate, setExamDate] = useState(currentExamDate);
  const [weeklyStudyDays, setWeeklyStudyDays] = useState<number[]>(currentWeeklyStudyDays);
  const [planMethod, setPlanMethod] = useState<PlanMethod>(currentPlanMethod);
  const [reminderTime, setReminderTime] = useState(currentReminderTime);
  // 复习提醒开关：与 setup 流程一致（switch + 时间），关闭时保存空串。
  const [reminderEnabled, setReminderEnabled] = useState(!!currentReminderTime);
  const [outputLanguage, setOutputLanguage] = useState(currentOutputLanguage);
  // 重排字段有变更且用户点保存时，进入预览步骤而非直接提交。
  const [showReschedulePreview, setShowReschedulePreview] = useState(false);
  // 轻改字段的保存确认弹层（无重排时）。
  const [showConfirm, setShowConfirm] = useState(false);
  // 保存时统一校验的错误提示。
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(currentName);
    setTargetScore(currentTargetScore);
    setTotalScore(currentTotalScore);
    setExamDate(currentExamDate);
    setWeeklyStudyDays(currentWeeklyStudyDays);
    setPlanMethod(currentPlanMethod);
    setReminderTime(currentReminderTime);
    setReminderEnabled(!!currentReminderTime);
    setOutputLanguage(currentOutputLanguage);
    setShowReschedulePreview(false);
    setShowConfirm(false);
    setError(null);
  }, [currentName, currentTargetScore, currentTotalScore, currentExamDate, currentWeeklyStudyDays, currentPlanMethod, currentReminderTime, currentOutputLanguage]);

  // 判断重排字段是否发生变化，决定保存路径。
  const rescheduleChanges = useMemo(() => {
    const changes: Record<(typeof RESCHEDULE_FIELDS)[number], boolean> = {
      examDate: examDate !== currentExamDate,
      weeklyStudyDays: !sameDays(weeklyStudyDays, currentWeeklyStudyDays),
      planMethod: planMethod !== currentPlanMethod,
    };
    return changes;
  }, [examDate, weeklyStudyDays, planMethod, currentExamDate, currentWeeklyStudyDays, currentPlanMethod]);

  const needsReschedule = Object.values(rescheduleChanges).some(Boolean);

  const settings: StudyPlanSettings = {
    name, targetScore, totalScore, examDate, weeklyStudyDays, planMethod,
    reminderTime: reminderEnabled ? reminderTime : '',
    outputLanguage,
  };

  const toggleDay = (day: number) => {
    setWeeklyStudyDays((prev) => {
      if (prev.includes(day)) {
        // 至少保留一天
        return prev.length > 1 ? prev.filter((d) => d !== day) : prev;
      }
      return [...prev, day].sort((a, b) => a - b);
    });
  };

  // 保存时统一校验，返回错误文案或 null。
  const validate = (): string | null => {
    if (!name.trim()) return '请填写计划名称';
    if (!examDate) return '请选择考试日期';
    // 考试日期需晚于今天。
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(examDate) <= today) return '考试日期需晚于今天';
    if (weeklyStudyDays.length === 0) return '请至少选择一个学习日';
    // 目标分 / 总分校验，与 setup 流程一致。
    if (!totalScore || totalScore <= 0) return '请填写总分';
    if (!targetScore || targetScore <= 0) return '请填写目标分数';
    if (targetScore > totalScore) return '目标分数不能超过总分';
    if (targetScore < totalScore * 0.6) return '目标分数需 ≥ 总分的 60%';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 所有校验都在点击保存时进行。
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    // 重排字段有变更则进入重排预览确认；否则进入普通保存确认。
    if (needsReschedule) {
      setShowReschedulePreview(true);
    } else {
      setShowConfirm(true);
    }
  };

  const handleRescheduleConfirm = (strategy: RescheduleStrategy) => {
    onConfirm(settings, strategy);
  };

  // ── 普通保存确认（无重排字段变更） ──────────────────────────
  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[380px] flex flex-col overflow-hidden">
          <div className="px-6 pt-6 pb-2 flex flex-col items-center text-center">
            <h2 className="text-[17px] font-bold text-[#111827]">保存修改</h2>
            <p className="text-[12.5px] text-[#6B7280] mt-1.5 leading-relaxed">
              确认保存对学习计划设置的修改？
            </p>
          </div>
          <div className="flex gap-3 px-6 py-4">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2.5 text-[13px] font-medium text-[#6B7280] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              返回修改
            </button>
            <button
              type="button"
              onClick={() => onConfirm(settings)}
              className="flex-1 px-4 py-2.5 text-[13px] font-bold text-[#111827] bg-[#FDEA3B] hover:bg-[#f5e035] rounded-xl transition-colors shadow-sm"
            >
              确认保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 重排预览步骤 ──────────────────────────────────────────
  // 重排字段有变更时，先让用户选择「保留手动安排」或「按新设置重排」，
  // 明确告知历史学习记录（mastery / 行为日志）保留、仅重排未来任务。
  if (showReschedulePreview) {
    const changed: string[] = [];
    if (rescheduleChanges.examDate) changed.push('考试日期');
    if (rescheduleChanges.weeklyStudyDays) changed.push('每周学习日');
    if (rescheduleChanges.planMethod) changed.push('复习方式');
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] flex flex-col overflow-hidden">
          <div className="px-6 pt-6 pb-2 flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-[17px] font-bold text-[#111827]">调整将重新安排学习计划</h2>
            <p className="text-[12.5px] text-[#6B7280] mt-1.5 leading-relaxed">
              你修改了 <span className="font-semibold text-[#374151]">{changed.join('、')}</span>。
              历史学习记录（掌握度、练习记录）会完整保留，仅重新安排未来的任务。
            </p>
          </div>
          <div className="px-6 py-4 space-y-2.5">
            <button
              type="button"
              onClick={() => handleRescheduleConfirm('PRESERVE_MANUAL')}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#FDEA3B] bg-[#FDEA3B]/10 text-left hover:bg-[#FDEA3B]/20 transition-colors"
            >
              <div className="text-[13.5px] font-bold text-[#111827]">尽量保留我的手动安排（推荐）</div>
              <div className="text-[11.5px] text-[#6B7280] mt-0.5">只在必要处调整，已手动排好的任务尽量不动</div>
            </button>
            <button
              type="button"
              onClick={() => handleRescheduleConfirm('FULL_RESCHEDULE')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="text-[13.5px] font-bold text-[#111827]">按新设置重新安排全部未来任务</div>
              <div className="text-[11.5px] text-[#6B7280] mt-0.5">丢弃手动安排，按新参数完整重排</div>
            </button>
          </div>
          <div className="px-6 py-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowReschedulePreview(false)}
              className="w-full px-4 py-2.5 text-[13px] font-medium text-[#6B7280] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              返回修改
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[calc(100vh-32px)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-[18px] font-bold text-[#111827]">学习计划设置</h2>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">标注「重排」的项修改后将重新安排未来任务</p>
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
          <div className="px-5 py-1 overflow-y-auto flex-1 divide-y divide-gray-100">

            {/* 计划名称 */}
            <Row icon={<BookOpen className="w-3.5 h-3.5 text-gray-500" />} iconBg="bg-gray-100" label="计划名称">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：法考 · 刑法"
                className="w-44 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] text-right text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#2D8CFF] focus:ring-2 focus:ring-[#2D8CFF]/15 transition-all"
              />
            </Row>

            {/* 考试日期 — 重排字段 */}
            <Row icon={<CalendarClock className="w-3.5 h-3.5 text-red-500" />} iconBg="bg-red-50" label="考试日期" reschedule>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2D8CFF] focus:ring-2 focus:ring-[#2D8CFF]/15 transition-all"
              />
            </Row>

            {/* 每周学习日 — 重排字段 */}
            <Row icon={<CalendarDays className="w-3.5 h-3.5 text-orange-500" />} iconBg="bg-orange-50" label="每周学习日" hint={`每周 ${weeklyStudyDays.length} 天`} reschedule>
              <div className="flex gap-1">
                {WEEK_DAYS.map((d) => {
                  const active = weeklyStudyDays.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={`w-7 h-7 rounded-md text-[12px] font-semibold transition-all ${
                        active
                          ? 'bg-[#FDEA3B] text-[#111827] shadow-sm'
                          : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </Row>

            {/* 复习方式 — 重排字段 */}
            <Row icon={<Zap className="w-3.5 h-3.5 text-amber-500" />} iconBg="bg-amber-50" label="复习方式" reschedule>
              <div className="flex gap-1.5">
                {([
                  { value: 'SYSTEM_PLANNED', title: '常规' },
                  { value: 'SPRINT_ONLY', title: '冲刺' },
                ] as { value: PlanMethod; title: string }[]).map((opt) => {
                  const active = planMethod === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPlanMethod(opt.value)}
                      className={`px-3.5 h-8 rounded-lg text-[13px] font-semibold transition-all ${
                        active
                          ? 'border-2 border-[#FDEA3B] bg-[#FDEA3B]/10 text-[#111827]'
                          : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {opt.title}
                    </button>
                  );
                })}
              </div>
            </Row>

            {/* 目标分数 / 总分 */}
            <Row icon={<Target className="w-3.5 h-3.5 text-blue-500" />} iconBg="bg-blue-50" label="目标 / 总分">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  placeholder="目标"
                  className="w-16 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] text-right text-[#111827] focus:outline-none focus:border-[#2D8CFF] focus:ring-2 focus:ring-[#2D8CFF]/15 transition-all"
                />
                <span className="text-[13px] text-gray-400">/</span>
                <input
                  type="number"
                  value={totalScore}
                  onChange={(e) => setTotalScore(Number(e.target.value))}
                  placeholder="总分"
                  className="w-16 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] text-right text-[#111827] focus:outline-none focus:border-[#2D8CFF] focus:ring-2 focus:ring-[#2D8CFF]/15 transition-all"
                />
              </div>
            </Row>

            {/* 复习提醒 — 即时保存（switch + 时间） */}
            <Row icon={<Bell className="w-3.5 h-3.5 text-green-500" />} iconBg="bg-green-50" label="复习提醒" hint="按你的节奏提醒当天任务">
              <div className="flex items-center gap-2.5">
                {reminderEnabled && (
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2D8CFF] focus:ring-2 focus:ring-[#2D8CFF]/15 transition-all"
                  />
                )}
                <button
                  type="button"
                  role="switch"
                  aria-checked={reminderEnabled}
                  onClick={() => setReminderEnabled((v) => !v)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ${
                    reminderEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className="block w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ transform: reminderEnabled ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            </Row>

            {/* 输出语种 — 即时保存 */}
            <Row icon={<Languages className="w-3.5 h-3.5 text-teal-500" />} iconBg="bg-teal-50" label="输出语种" hint="AI 生成内容">
              <select
                value={outputLanguage}
                onChange={(e) => setOutputLanguage(e.target.value)}
                className="w-44 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2D8CFF] focus:ring-2 focus:ring-[#2D8CFF]/15 transition-all appearance-none cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </Row>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
            {error && (
              <p className="text-[12px] text-red-500 mb-2 text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-[13px] font-bold text-[#111827] bg-[#FDEA3B] hover:bg-[#f5e035] rounded-xl transition-colors shadow-sm"
            >
              {needsReschedule ? '预览并保存' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
