import { useEffect, useMemo, useState } from 'react';
import { Flag, Keyboard, PenLine, Eraser, Trash2, ChevronDown } from 'lucide-react';
import { TestConfig, QuestionType } from './MockTestSetupScreen';

/**
 * 模考答题页 — Prompt 2
 * 皮肤：暗色沉浸（考试专注态）背景 #1B1B1B，卡片 #262626，正文 #EDEDED，分隔线 #333
 * 状态色与主色沿用全产品同一套（主黄 #FDEA3B / 主蓝 #2D8CFF / 薄弱红 #FF6252）
 * 骨架：左题右总览（横屏），无 AI Tutor。
 * 题库主题：法考·刑法。
 */

type ExamAnswer = number | number[] | boolean | string | string[] | undefined;

interface ExamQuestion {
  id: number;
  moduleId: string;
  knowledgePointTitle: string;
  text: string;
  type: QuestionType;
  points: number;
  options?: string[];
  blanks?: number; // 填空空数
}

interface MockExamScreenProps {
  onSubmit: (results: ExamResults) => void;
  onExit?: () => void;
  config?: TestConfig;
  /** 是否以「恢复未完成模考」态进入 */
  resumeMode?: boolean;
}

interface ExamResults {
  examId: string;
  answers: Map<number, number | string>;
  flaggedQuestions: Set<number>;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  accuracy: number;
  completedAt: string;
}

// ── 法考·刑法 题库假数据（覆盖五种题型） ──
const QUESTION_BANK: ExamQuestion[] = [
  {
    id: 1,
    moduleId: 'ch1s3',
    knowledgePointTitle: '斡旋受贿罪的行为主体',
    text: '关于斡旋受贿罪的行为主体，下列说法正确的是？',
    type: 'single',
    points: 1,
    options: [
      '仅限于国家机关工作人员',
      '必须是国家工作人员本人',
      '包括国家工作人员的近亲属',
      '任何公民均可构成',
    ],
  },
  {
    id: 2,
    moduleId: 'ch1s3',
    knowledgePointTitle: '斡旋受贿罪的成立条件',
    text: '斡旋受贿罪的成立要求国家工作人员实际实施了斡旋行为。',
    type: 'truefalse',
    points: 1,
  },
  {
    id: 3,
    moduleId: 'ch1s1',
    knowledgePointTitle: '变相受贿的认定',
    text: '请填空：以明显低于市场价格向请托人购买房屋的，属于以__________形式变相收受贿赂。',
    type: 'fill',
    points: 2,
    blanks: 1,
  },
  {
    id: 4,
    moduleId: 'ch1s4',
    knowledgePointTitle: '受贿罪与渎职罪的罪数',
    text: '国家工作人员收受贿赂并因此实施渎职行为，触犯受贿罪与渎职罪的，下列处理正确的有？（多选）',
    type: 'multiple',
    points: 2,
    options: [
      '原则上数罪并罚',
      '一律择一重罪处罚',
      '刑法或司法解释另有规定的从其规定',
      '仅认定受贿罪一罪',
    ],
  },
  {
    id: 5,
    moduleId: 'ch1s7',
    knowledgePointTitle: '受贿罪的既遂标准',
    text: '简答：请说明受贿罪既遂的判断标准，并结合"收受"与"为他人谋取利益"两个要素展开。',
    type: 'shortanswer',
    points: 3,
  },
  {
    id: 6,
    moduleId: 'ch1s3',
    knowledgePointTitle: '利用影响力受贿罪主体',
    text: '下列哪一项不属于利用影响力受贿罪的行为主体？',
    type: 'single',
    points: 1,
    options: [
      '国家工作人员的近亲属',
      '与国家工作人员关系密切的人',
      '离职的国家工作人员',
      '在职国家工作人员本人',
    ],
  },
  {
    id: 7,
    moduleId: 'ch1s1',
    knowledgePointTitle: '及时退还的认定',
    text: '国家工作人员收受财物后及时退还的，不影响受贿罪的成立。',
    type: 'truefalse',
    points: 1,
  },
  {
    id: 8,
    moduleId: 'ch1s2',
    knowledgePointTitle: '中间人模型的数额划分',
    text: '在中间人模型中，乙收受100万元后转交丙50万元，关于受贿数额认定正确的是？',
    type: 'single',
    points: 1,
    options: ['乙认定为100万元', '乙认定为50万元', '乙不构成受贿', '丙认定为100万元'],
  },
  {
    id: 9,
    moduleId: 'ch2s3',
    knowledgePointTitle: '因果关系中断',
    text: '介入因素异常且独立导致结果发生时，先前行为与结果之间的因果关系__________。',
    type: 'fill',
    points: 2,
    blanks: 1,
  },
  {
    id: 10,
    moduleId: 'ch2s4',
    knowledgePointTitle: '认识错误',
    text: '关于事实认识错误，下列哪些情形阻却故意的成立？（多选）',
    type: 'multiple',
    points: 2,
    options: ['具体的打击错误', '抽象的对象错误', '因果关系认识错误(法定符合说)', '手段不能犯的错误认识'],
  },
  {
    id: 11,
    moduleId: 'ch1s6',
    knowledgePointTitle: '行贿罪构成',
    text: '行贿罪以"为谋取不正当利益"为主观要件。',
    type: 'truefalse',
    points: 1,
  },
  {
    id: 12,
    moduleId: 'ch2s2',
    knowledgePointTitle: '单位犯罪',
    text: '下列关于单位犯罪成立条件的表述，正确的是？',
    type: 'single',
    points: 1,
    options: [
      '必须以单位名义并为单位谋取利益',
      '只要以单位名义即可',
      '个人盗用单位名义也构成单位犯罪',
      '单位犯罪一律双罚',
    ],
  },
  {
    id: 13,
    moduleId: 'ch1s5',
    knowledgePointTitle: '受贿与其他犯罪',
    text: '受贿罪与徇私枉法罪竞合时应择一重罪处罚。',
    type: 'truefalse',
    points: 1,
  },
  {
    id: 14,
    moduleId: 'ch2s7',
    knowledgePointTitle: '罪刑法定原则',
    text: '简答：请简述罪刑法定原则的基本内涵及其派生的具体要求。',
    type: 'shortanswer',
    points: 3,
  },
  {
    id: 15,
    moduleId: 'ch2s6',
    knowledgePointTitle: '犯罪构成',
    text: '犯罪构成的四要件说中，下列哪一项属于犯罪客观方面？',
    type: 'single',
    points: 1,
    options: ['危害行为', '刑事责任年龄', '犯罪故意', '犯罪客体'],
  },
  {
    id: 16,
    moduleId: 'ch1s3',
    knowledgePointTitle: '斡旋与普通受贿的区分',
    text: '斡旋受贿与普通受贿的主要区分在于是否利用了本人职权范围内的便利。',
    type: 'truefalse',
    points: 1,
  },
  {
    id: 17,
    moduleId: 'ch1s7',
    knowledgePointTitle: '受贿罪的行为对象',
    text: '请填空：受贿罪的行为对象是财物，包括货币、物品和__________。',
    type: 'fill',
    points: 2,
    blanks: 1,
  },
  {
    id: 18,
    moduleId: 'ch2s1',
    knowledgePointTitle: '犯罪客体',
    text: '下列哪些说法正确地描述了犯罪客体？（多选）',
    type: 'multiple',
    points: 2,
    options: ['是刑法所保护的社会关系', '等同于犯罪对象', '分为一般客体、同类客体和直接客体', '是任何犯罪的必备要件'],
  },
  {
    id: 19,
    moduleId: 'ch1s4',
    knowledgePointTitle: '一般渎职罪名',
    text: '私放在押人员罪的主体是司法工作人员。',
    type: 'truefalse',
    points: 1,
  },
  {
    id: 20,
    moduleId: 'ch1s2',
    knowledgePointTitle: '共犯认定',
    text: '在中间人模型三的共犯认定中，甲对乙、丙的行为是否成立共犯，取决于？',
    type: 'single',
    points: 1,
    options: ['是否有共同故意与共同行为', '甲是否亲自收钱', '数额是否达到较大', '是否为国家工作人员'],
  },
];

export function MockExamScreen({ onSubmit, onExit, config, resumeMode = false }: MockExamScreenProps) {
  const examQuestions = useMemo(() => {
    const count = config?.numberOfQuestions
      ? Math.min(config.numberOfQuestions, QUESTION_BANK.length)
      : QUESTION_BANK.length;
    return QUESTION_BANK.slice(0, count);
  }, [config]);

  const totalQuestions = examQuestions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, ExamAnswer>>(new Map());
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showResume, setShowResume] = useState(resumeMode);
  const [showMobileOverview, setShowMobileOverview] = useState(false);
  const [saveState, setSaveState] = useState<'saving' | 'saved' | 'error'>('saved');
  // 每空的输入模式（key: `${qid}-${blankIndex}`）
  const [inputModes, setInputModes] = useState<Map<string, 'keyboard' | 'handwriting'>>(new Map());

  const totalSeconds = (config?.estimatedMinutes || 25) * 60;
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          doSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 倒计时颜色：最后5分钟橙 #E17100，最后1分钟红 #FF6252
  const timerColor =
    timeRemaining <= 60 ? '#FF6252' : timeRemaining <= 300 ? '#E17100' : '#EDEDED';

  const currentQuestion = examQuestions[currentIndex];

  const markSaving = () => {
    setSaveState('saving');
    setTimeout(() => setSaveState('saved'), 400);
  };

  const setAnswer = (value: ExamAnswer) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(currentQuestion.id, value);
      return next;
    });
    markSaving();
  };

  const isAnswered = (q: ExamQuestion): boolean => {
    const a = answers.get(q.id);
    if (a === undefined || a === null) return false;
    if (Array.isArray(a)) return a.length > 0 && a.some((x) => x !== '' && x !== undefined);
    if (typeof a === 'string') return a.trim() !== '';
    return true;
  };

  const answeredCount = examQuestions.filter(isAnswered).length;

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  };

  const getInputMode = (qid: number, blank: number): 'keyboard' | 'handwriting' =>
    inputModes.get(`${qid}-${blank}`) || 'keyboard';

  const setInputMode = (qid: number, blank: number, mode: 'keyboard' | 'handwriting') => {
    setInputModes((prev) => {
      const next = new Map(prev);
      next.set(`${qid}-${blank}`, mode);
      return next;
    });
  };

  const doSubmit = () => {
    // 序列化答案为 Map<number, number|string>（与 ExamResults 类型对齐）
    const serialized = new Map<number, number | string>();
    answers.forEach((v, k) => {
      if (typeof v === 'number' || typeof v === 'string') serialized.set(k, v);
      else if (typeof v === 'boolean') serialized.set(k, v ? 1 : 0);
      else if (Array.isArray(v)) serialized.set(k, v.join(','));
    });
    const results: ExamResults = {
      examId: `mock-${Date.now()}`,
      answers: serialized,
      flaggedQuestions: flagged,
      score: 0,
      totalQuestions,
      timeSpent: totalSeconds - timeRemaining,
      accuracy: 0,
      completedAt: new Date().toISOString(),
    };
    onSubmit(results);
  };

  // ── 作答区渲染 ──
  const renderAnswerArea = (q: ExamQuestion) => {
    switch (q.type) {
      case 'single':
        return (
          <div className="flex flex-col gap-3">
            {q.options!.map((opt, i) => {
              const selected = answers.get(q.id) === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswer(i)}
                  className={`w-full text-left rounded-[14px] px-5 py-4 border transition-all flex items-start gap-3 ${
                    selected
                      ? 'bg-[#2D8CFF]/15 border-[#2D8CFF]'
                      : 'bg-[#262626] border-[#333333] hover:border-[#4A4A4A]'
                  }`}
                >
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-semibold ${
                      selected ? 'bg-[#2D8CFF] text-white' : 'bg-[#333333] text-[#A0A0A0]'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={`text-[15px] leading-relaxed ${selected ? 'text-white' : 'text-[#EDEDED]'}`}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case 'truefalse':
        return (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '正确', value: true },
              { label: '错误', value: false },
            ].map((opt) => {
              const selected = answers.get(q.id) === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() => setAnswer(opt.value)}
                  className={`rounded-[14px] py-8 border text-[18px] font-semibold transition-all ${
                    selected
                      ? 'bg-[#2D8CFF]/15 border-[#2D8CFF] text-white'
                      : 'bg-[#262626] border-[#333333] text-[#EDEDED] hover:border-[#4A4A4A]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      case 'multiple': {
        const current = (answers.get(q.id) as number[] | undefined) || [];
        return (
          <div>
            <div className="flex flex-col gap-3">
              {q.options!.map((opt, i) => {
                const checked = current.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const next = checked ? current.filter((x) => x !== i) : [...current, i].sort((a, b) => a - b);
                      setAnswer(next);
                    }}
                    className={`w-full text-left rounded-[14px] px-5 py-4 border transition-all flex items-start gap-3 ${
                      checked
                        ? 'bg-[#2D8CFF]/15 border-[#2D8CFF]'
                        : 'bg-[#262626] border-[#333333] hover:border-[#4A4A4A]'
                    }`}
                  >
                    <span
                      className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[13px] font-semibold ${
                        checked ? 'bg-[#2D8CFF] text-white' : 'bg-[#333333] text-[#A0A0A0]'
                      }`}
                    >
                      {checked ? '✓' : String.fromCharCode(65 + i)}
                    </span>
                    <span className={`text-[15px] leading-relaxed ${checked ? 'text-white' : 'text-[#EDEDED]'}`}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[12px] text-[#8E99B0] mt-3">本题多选，全部选对才得分</p>
          </div>
        );
      }

      case 'fill': {
        const blanks = q.blanks || 1;
        const current = (answers.get(q.id) as string[] | undefined) || Array(blanks).fill('');
        return (
          <div className="flex flex-col gap-4">
            {Array.from({ length: blanks }).map((_, bi) => {
              const mode = getInputMode(q.id, bi);
              return (
                <div key={bi} className="rounded-[14px] bg-[#262626] border border-[#333333] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] text-[#A0A0A0]">第 {bi + 1} 空</span>
                    <div className="flex bg-[#1B1B1B] rounded-full p-0.5">
                      <button
                        onClick={() => setInputMode(q.id, bi, 'keyboard')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] ${
                          mode === 'keyboard' ? 'bg-[#333333] text-white' : 'text-[#8E99B0]'
                        }`}
                      >
                        <Keyboard className="w-3.5 h-3.5" /> 键盘
                      </button>
                      <button
                        onClick={() => setInputMode(q.id, bi, 'handwriting')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] ${
                          mode === 'handwriting' ? 'bg-[#333333] text-white' : 'text-[#8E99B0]'
                        }`}
                      >
                        <PenLine className="w-3.5 h-3.5" /> 手写
                      </button>
                    </div>
                  </div>
                  {mode === 'keyboard' ? (
                    <input
                      value={current[bi] || ''}
                      onChange={(e) => {
                        const next = [...current];
                        next[bi] = e.target.value;
                        setAnswer(next);
                      }}
                      placeholder="在此输入答案…"
                      className="w-full bg-[#1B1B1B] border border-[#333333] rounded-[10px] px-4 py-3 text-[15px] text-[#EDEDED] placeholder-[#666666] focus:outline-none focus:border-[#2D8CFF]"
                    />
                  ) : (
                    <div className="rounded-[10px] border border-dashed border-[#4A4A4A] bg-[#1B1B1B] h-[120px] flex flex-col">
                      <div className="flex-1 flex items-center justify-center text-[12px] text-[#666666]">
                        手写画布区域{current[bi] ? `（已保留：${current[bi]}）` : ''}
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 border-t border-[#333333]">
                        <PenLine className="w-4 h-4 text-[#A0A0A0]" />
                        <Eraser className="w-4 h-4 text-[#A0A0A0]" />
                        <Trash2 className="w-4 h-4 text-[#A0A0A0]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case 'shortanswer': {
        const mode = getInputMode(q.id, 0);
        const value = (answers.get(q.id) as string | undefined) || '';
        return (
          <div className="rounded-[14px] bg-[#262626] border border-[#333333] p-4">
            <div className="flex items-center justify-end mb-3">
              <div className="flex bg-[#1B1B1B] rounded-full p-0.5">
                <button
                  onClick={() => setInputMode(q.id, 0, 'keyboard')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] ${
                    mode === 'keyboard' ? 'bg-[#333333] text-white' : 'text-[#8E99B0]'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" /> 键盘
                </button>
                <button
                  onClick={() => setInputMode(q.id, 0, 'handwriting')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] ${
                    mode === 'handwriting' ? 'bg-[#333333] text-white' : 'text-[#8E99B0]'
                  }`}
                >
                  <PenLine className="w-3.5 h-3.5" /> 手写
                </button>
              </div>
            </div>
            {mode === 'keyboard' ? (
              <textarea
                value={value}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="在此作答…"
                className="w-full h-[180px] bg-[#1B1B1B] border border-[#333333] rounded-[10px] px-4 py-3 text-[15px] text-[#EDEDED] placeholder-[#666666] resize-none focus:outline-none focus:border-[#2D8CFF]"
              />
            ) : (
              <div className="rounded-[10px] border border-dashed border-[#4A4A4A] bg-[#1B1B1B] h-[180px] flex flex-col">
                <div className="flex-1 flex items-center justify-center text-[12px] text-[#666666]">
                  手写画布区域{value ? '（已保留输入内容）' : ''}
                </div>
                <div className="flex items-center gap-3 px-3 py-2 border-t border-[#333333]">
                  <PenLine className="w-4 h-4 text-[#A0A0A0]" />
                  <Eraser className="w-4 h-4 text-[#A0A0A0]" />
                  <Trash2 className="w-4 h-4 text-[#A0A0A0]" />
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ── 题目总览网格（可复用于右侧面板与竖屏抽屉） ──
  const renderOverviewGrid = (onPick?: () => void) => (
    <div className="grid grid-cols-5 gap-2.5">
      {examQuestions.map((q, index) => {
        const answered = isAnswered(q);
        const current = index === currentIndex;
        const flag = flagged.has(q.id);
        return (
          <button
            key={q.id}
            onClick={() => {
              setCurrentIndex(index);
              onPick?.();
            }}
            className={`relative aspect-square rounded-[10px] flex items-center justify-center text-[14px] font-semibold border transition-all ${
              current
                ? 'bg-[#2D8CFF] text-white border-[#2D8CFF] shadow-[0_0_0_2px_rgba(45,140,255,0.4)]'
                : answered
                ? 'bg-[#EAF3FF] text-[#2D8CFF] border-transparent'
                : 'bg-transparent text-[#8E99B0] border-[#3A3A3A]'
            }`}
          >
            {index + 1}
            {flag && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FDEA3B] flex items-center justify-center">
                <Flag className="w-2.5 h-2.5 text-[#1B1B1B] fill-[#1B1B1B]" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const legend = (
    <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[12px] text-[#A0A0A0]">
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded bg-[#EAF3FF]" /> 已答
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded bg-[#2D8CFF]" /> 当前
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded border border-[#3A3A3A]" /> 未答
      </div>
      <div className="flex items-center gap-2">
        <Flag className="w-3.5 h-3.5 text-[#FDEA3B] fill-[#FDEA3B]" /> 已标记
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#1B1B1B] text-[#EDEDED] relative">
      {/* 顶部条 */}
      <div className="border-b border-[#333333] px-8 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="text-[13px] text-[#A0A0A0] hover:text-white"
          >
            退出模考
          </button>
          <div className="text-center">
            <span
              className="font-bold text-[28px] tracking-wide tabular-nums"
              style={{ color: timerColor }}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="px-5 py-2 rounded-[10px] bg-[#FDEA3B] text-[#1B1B1B] text-[13px] font-bold hover:brightness-95"
          >
            交卷
          </button>
        </div>
        <p className="text-[12px] text-[#8E99B0] mt-1">
          第 {currentIndex + 1} / {totalQuestions} 题 · 本题 {currentQuestion.points} 分
        </p>
      </div>

      {/* 竖屏抽屉：题目总览（收起时一行，展开覆盖网格） */}
      <div className="lg:hidden border-b border-[#333333]">
        <button
          onClick={() => setShowMobileOverview((v) => !v)}
          className="w-full flex items-center justify-between px-8 py-2.5 text-[13px] text-[#A0A0A0]"
        >
          <span>已答 {answeredCount} / {totalQuestions}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showMobileOverview ? 'rotate-180' : ''}`} />
        </button>
        {showMobileOverview && (
          <div className="px-8 pb-4">
            {renderOverviewGrid(() => setShowMobileOverview(false))}
            <div className="mt-3">{legend}</div>
          </div>
        )}
      </div>

      {/* 主体：左题右总览 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左主区 ~62% */}
        <div className="flex-1 lg:w-[62%] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-6">
            {/* 题干 + 标记 */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[12px] text-[#8E99B0] mb-1">{currentQuestion.knowledgePointTitle}</p>
                <p className="text-[19px] font-bold leading-relaxed text-white">{currentQuestion.text}</p>
              </div>
              <button
                onClick={toggleFlag}
                className="shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-[#262626]"
                title="标记本题，稍后回看"
              >
                <Flag
                  className={`w-5 h-5 ${
                    flagged.has(currentQuestion.id)
                      ? 'text-[#FDEA3B] fill-[#FDEA3B]'
                      : 'text-[#666666]'
                  }`}
                />
              </button>
            </div>

            {renderAnswerArea(currentQuestion)}
          </div>

          {/* 底部导航 + 保存状态 */}
          <div className="border-t border-[#333333] px-8 lg:px-12 py-3 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-[10px] bg-[#262626] text-[14px] text-[#EDEDED] disabled:opacity-40"
            >
              ← 上一题
            </button>

            <span className="text-[12px] text-[#8E99B0]">
              {saveState === 'saving' ? '保存中…' : saveState === 'error' ? '保存失败，点击重试' : '已保存'}
            </span>

            {currentIndex === totalQuestions - 1 ? (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-6 py-2.5 rounded-[10px] bg-[#FDEA3B] text-[#1B1B1B] text-[14px] font-bold hover:brightness-95"
              >
                交卷
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                className="px-4 py-2.5 rounded-[10px] bg-[#262626] text-[14px] text-[#EDEDED]"
              >
                下一题 →
              </button>
            )}
          </div>
        </div>

        {/* 右侧面板 ~38%：题目总览网格（仅横屏） */}
        <div className="hidden lg:flex lg:w-[38%] border-l border-[#333333] flex-col">
          <div className="px-6 py-4 border-b border-[#333333]">
            <h3 className="text-[15px] font-bold text-white">题目总览</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {renderOverviewGrid()}
            <div className="mt-5 pt-4 border-t border-[#333333]">{legend}</div>
          </div>
          <div className="px-6 py-3 border-t border-[#333333] text-[12px] text-[#A0A0A0]">
            已答 {answeredCount} · 已标记 {flagged.size} · 未答 {totalQuestions - answeredCount}
          </div>
        </div>
      </div>

      {/* 交卷确认弹窗 */}
      {showSubmitConfirm && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-2xl p-7 w-[440px] mx-4">
            <h3 className="text-[18px] font-bold text-white mb-2">确认交卷？</h3>
            <p className="text-[14px] text-[#A0A0A0] mb-6">
              你已作答 {answeredCount} / {totalQuestions} 题；
              {flagged.size > 0 && `有 ${flagged.size} 题已标记待回看。`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-3 rounded-[10px] bg-[#333333] text-[#EDEDED] font-medium hover:bg-[#3A3A3A]"
              >
                再检查一下
              </button>
              <button
                onClick={doSubmit}
                className="flex-1 px-4 py-3 rounded-[10px] bg-[#FDEA3B] text-[#1B1B1B] font-bold hover:brightness-95"
              >
                确认交卷
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 退出模考确认弹窗 */}
      {showExitConfirm && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-2xl p-7 w-[440px] mx-4">
            <h3 className="text-[18px] font-bold text-white mb-2">退出模考</h3>
            <p className="text-[14px] text-[#A0A0A0] mb-6">本次进度已保存，可稍后继续。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-3 rounded-[10px] bg-[#333333] text-[#EDEDED] font-medium hover:bg-[#3A3A3A]"
              >
                继续作答
              </button>
              <button
                onClick={() => onExit?.()}
                className="flex-1 px-4 py-3 rounded-[10px] bg-[#FDEA3B] text-[#1B1B1B] font-bold hover:brightness-95"
              >
                退出并稍后继续
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 恢复未完成模考弹窗 */}
      {showResume && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-2xl p-7 w-[440px] mx-4">
            <h3 className="text-[18px] font-bold text-white mb-2">你有一场未完成的模考</h3>
            <p className="text-[14px] text-[#A0A0A0] mb-6">可以立刻继续之前的进度，或稍后再回来。</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResume(false);
                  onExit?.();
                }}
                className="flex-1 px-4 py-3 rounded-[10px] bg-[#333333] text-[#EDEDED] font-medium hover:bg-[#3A3A3A]"
              >
                稍后继续
              </button>
              <button
                onClick={() => setShowResume(false)}
                className="flex-1 px-4 py-3 rounded-[10px] bg-[#FDEA3B] text-[#1B1B1B] font-bold hover:brightness-95"
              >
                立刻继续
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockExamScreen;
