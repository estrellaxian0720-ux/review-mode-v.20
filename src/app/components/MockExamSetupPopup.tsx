import { X, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TestConfig, QuestionType, DifficultyMode } from '../screens/MockTestSetupScreen';

/**
 * 模考快捷设置弹窗
 * 从其他入口（如概览/资源页）快速发起一场模考。
 * ‼ 传出的 config 结构与答题页读取的 TestConfig 完全一致，避免运行时崩溃。
 * 皮肤：亮色；中文；题库主题=法考·刑法。
 */

interface MockExamSetupPopupProps {
  onStart: (config: TestConfig) => void;
  onCancel: () => void;
}

const SIZE_OPTIONS = [
  { count: 10, label: '快速' },
  { count: 20, label: '标准·推荐' },
  { count: 30, label: '完整' },
] as const;

const DIFFICULTY_OPTIONS: { id: DifficultyMode; label: string; desc: string }[] = [
  { id: 'auto', label: '自动均衡', desc: '难度自动搭配' },
  { id: 'basic', label: '基础为主', desc: '侧重基础巩固' },
  { id: 'advanced', label: '进阶为主', desc: '侧重难点突破' },
];

const ALL_TYPES: QuestionType[] = ['single', 'truefalse', 'fill', 'multiple', 'shortanswer'];

/** 预计时长估算：随题量/难度浮动，非固定每题时长 */
function estimateMinutes(count: number, difficulty: DifficultyMode): number {
  const perQ = 1.2; // 全题型均衡下的平均分钟
  const factor = difficulty === 'advanced' ? 1.2 : difficulty === 'basic' ? 0.85 : 1;
  return Math.max(1, Math.round(count * perQ * factor));
}

export function MockExamSetupPopup({ onStart, onCancel }: MockExamSetupPopupProps) {
  const [questionCount, setQuestionCount] = useState(20);
  const [difficulty, setDifficulty] = useState<DifficultyMode>('auto');

  const estimated = useMemo(() => estimateMinutes(questionCount, difficulty), [questionCount, difficulty]);

  const handleStart = () => {
    const config: TestConfig = {
      scope: { type: 'all', selectedIds: [] },
      numberOfQuestions: questionCount,
      questionTypes: ALL_TYPES,
      difficulty,
      preferNewQuestions: true,
      estimatedMinutes: estimated,
    };
    onStart(config);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[560px] overflow-hidden">
        {/* 页头 */}
        <div className="px-8 py-5 border-b border-[#EBEBEB] flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#333333]">快速开始模考</h2>
            <p className="text-[12px] text-[#999999] mt-0.5">刑法 · 选好规模即可开始</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-[#F3F4F6] rounded-lg text-[#999999] hover:text-[#666666]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-8 space-y-7">
          {/* 规模 */}
          <div>
            <p className="text-[13px] font-bold text-[#333333] mb-3">模考规模</p>
            <div className="grid grid-cols-3 gap-3">
              {SIZE_OPTIONS.map((opt) => {
                const active = questionCount === opt.count;
                const mins = estimateMinutes(opt.count, difficulty);
                return (
                  <button
                    key={opt.count}
                    onClick={() => setQuestionCount(opt.count)}
                    className={`rounded-xl border-2 py-3 text-center transition-all ${
                      active ? 'border-[#FDEA3B] bg-[#FFFBEA]' : 'border-[#EBEBEB] hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div className="text-[20px] font-bold text-[#333333]">
                      {opt.count}
                      <span className="text-[12px] font-medium text-[#666666] ml-0.5">题</span>
                    </div>
                    <div className="text-[11px] text-[#999999] mt-0.5">{opt.label}</div>
                    <div className="text-[11px] text-[#999999]">预计 {mins} 分钟</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 难度 */}
          <div>
            <p className="text-[13px] font-bold text-[#333333] mb-3">难度</p>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_OPTIONS.map((d) => {
                const active = difficulty === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      active ? 'border-[#FDEA3B] bg-[#FFFBEA]' : 'border-[#EBEBEB] hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div className="text-[13px] font-bold text-[#333333] mb-0.5">{d.label}</div>
                    <div className="text-[11px] text-[#999999]">{d.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 提示 */}
          <div className="bg-[#F3F4F6] rounded-xl p-4 flex gap-3">
            <Info className="w-4 h-4 text-[#8E99B0] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#666666] leading-relaxed">
              模考模拟真实考试：作答中不显示答案与解析，到时自动交卷；答案自动保存，退出后可继续。
            </p>
          </div>
        </div>

        {/* 底部 */}
        <div className="px-8 py-5 border-t border-[#EBEBEB] bg-[#FAFAFA] flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-[13px] font-medium text-[#666666] hover:text-[#333333]"
          >
            取消
          </button>
          <button
            onClick={handleStart}
            className="px-7 py-2.5 bg-[#FDEA3B] text-[#333333] text-[13px] font-bold rounded-lg hover:brightness-95"
          >
            开始模考（约 {estimated} 分钟）
          </button>
        </div>
      </div>
    </div>
  );
}

export default MockExamSetupPopup;
