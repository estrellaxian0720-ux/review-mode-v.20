import { Clock3, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export interface MockExamReportSnapshot {
  accuracy: number;
  fullCorrect: number;
  partialCorrect: number;
  wrong: number;
  unanswered: number;
  totalQuestions: number;
  durationMinutes: number;
  estimatedMinutes: number;
  coverageCount: number;
  scopeLabel: string;
  scaleLabel: string;
}

const DIAGNOSIS = [
  { id: 'stable', title: '稳定表现', color: '#00A63E', bg: '#F2FBF5', summary: '本次表现正确，且已有跨天留存验证。', items: [
    { name: '受贿罪既遂的判断标准', evidence: '2题正确 · D+7 已验证' },
    { name: '单位犯罪的成立条件', evidence: '2题正确 · 历史表现稳定' },
    { name: '罪刑法定原则的基本内涵', evidence: '1题正确 · D+14 已验证' },
    { name: '斡旋受贿罪的行为主体', evidence: '2题正确 · 无连续错误' },
    { name: '及时退还财物对受贿罪的影响', evidence: '1题正确 · 历史表现稳定' },
  ] },
  { id: 'verify', title: '仍需验证', color: '#2D8CFF', bg: '#EEF6FF', summary: '已有掌握迹象，但历史证据或本场题量不足。', items: [
    { name: '斡旋受贿与普通受贿的区分', evidence: '1题正确 · 样本较少' },
    { name: '认识错误对故意成立的影响', evidence: '1题正确 · 待间隔验证' },
    { name: '共同犯罪中实行过限的判断', evidence: '1题部分正确 · 待验证' },
  ] },
  { id: 'weak', title: '重点薄弱', color: '#E5483D', bg: '#FFF1EF', summary: '本次错误与历史负面证据重复，应优先补强。', items: [
    { name: '因果关系中断的判断方法', evidence: '本次2题均错 · 跨场重复错误' },
    { name: '利用影响力受贿罪的主体范围', evidence: '本次错误 · 历史已有1次错误' },
    { name: '渎职罪与受贿罪的罪数关系', evidence: '正确率40% · 连续2题错误' },
  ] },
  { id: 'insufficient', title: '证据不足', color: '#7C879C', bg: '#F3F4F7', summary: '本次覆盖较少，暂不足以判断掌握情况。', items: [
    { name: '结果加重犯的成立条件', evidence: '仅覆盖1题 · 无历史证据' },
    { name: '不作为犯罪的义务来源', evidence: '仅部分正确 · 判定置信度低' },
  ] },
];

interface Props {
  snapshot: MockExamReportSnapshot;
  onViewQuestions?: () => void;
  onViewPlan?: () => void;
  onAddPlan?: () => void;
}

export default function MockExamReportContent({ snapshot, onViewQuestions, onViewPlan, onAddPlan }: Props) {
  const [openDiagnosis, setOpenDiagnosis] = useState<Set<string>>(new Set(['weak']));
  return <div className="space-y-5">
    <section className="rounded-xl border border-[#E8E8E8] bg-white p-6">
      <div className="flex items-start gap-8">
        <div className="min-w-[132px]"><p className="text-[11px] font-semibold text-[#999]">本次正确率</p><p className="mt-2 text-[52px] font-bold leading-none">{snapshot.accuracy}<span className="text-[22px] text-[#999]">%</span></p></div>
        <div className="flex-1 border-l border-[#EEE] pl-7">
          <h2 className="text-[15px] font-bold">本次模考结果</h2>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12px]"><span><b>{snapshot.fullCorrect}</b> 题正确</span><span className="text-[#B46A00]"><b>{snapshot.partialCorrect}</b> 题部分正确</span><span className="text-[#D83D32]"><b>{snapshot.wrong}</b> 题错误</span><span className="text-[#7C879C]"><b>{snapshot.unanswered}</b> 题未答</span></div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#F0F0F0] pt-3 text-[11px] text-[#888]"><span>{snapshot.totalQuestions - snapshot.unanswered}/{snapshot.totalQuestions} 完成</span><span>完成度 {Math.round((snapshot.totalQuestions - snapshot.unanswered) / snapshot.totalQuestions * 100)}%</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />用时 {snapshot.durationMinutes} 分钟</span><span>预计 {snapshot.estimatedMinutes} 分钟</span><span>覆盖 {snapshot.coverageCount} 个知识点</span></div>
          <p className="mt-2 text-[11px] text-[#AAA]">{snapshot.scopeLabel} · {snapshot.scaleLabel}</p>
        </div>
      </div>
    </section>

    <section className="rounded-xl border border-[#E8E8E8] bg-white p-6">
      <h2 className="text-[15px] font-bold">知识点诊断</h2>
      <div className="mt-3 rounded-lg bg-[#F7F8FA] p-4"><p className="text-[13px] font-semibold">基础知识整体稳定，但模块间表现差异明显</p><p className="mt-1 text-[12px] leading-relaxed text-[#666]">刑法总论表现较好；因果关系与渎职罪相关知识是本次主要失分来源，应优先补强后再做间隔验证。</p></div>
      <div className="mt-4 space-y-2">{DIAGNOSIS.map((item) => { const open = openDiagnosis.has(item.id); return <div key={item.id} className="overflow-hidden rounded-lg border border-[#EBEBEB]"><button onClick={() => setOpenDiagnosis((prev) => { const next = new Set(prev); next.has(item.id) ? next.delete(item.id) : next.add(item.id); return next; })} className="flex w-full items-center gap-3 px-4 py-3 text-left" style={{ background: item.bg }}><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} /><b className="text-[13px]">{item.title}</b><span className="text-[11px] text-[#888]">{item.items.length} 个知识点</span><span className="ml-auto">{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span></button>{open && <div><p className="border-b border-[#F0F0F0] px-9 py-3 text-[12px] leading-relaxed text-[#666]">{item.summary}</p><div className="divide-y divide-[#F2F2F2]">{item.items.map((kp) => <div key={kp.name} className="flex items-center justify-between gap-4 px-9 py-3"><span className="text-[12px] text-[#333]">{kp.name}</span><span className="shrink-0 text-[10px] text-[#888]">{kp.evidence}</span></div>)}</div></div>}</div>; })}</div>
    </section>

    <section className="rounded-xl border-2 border-[#FDEA3B] bg-[#FFFBEA] p-6">
      <h2 className="text-[15px] font-bold">下一步建议</h2><p className="mt-2 text-[13px] font-semibold">优先补强 2 个模块 · 预计 65 分钟</p>
      <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-lg bg-white p-4"><span className="text-[10px] text-[#999]">优先 1 · 约30分钟</span><p className="mt-1 text-[13px] font-semibold">因果关系与客观归责</p><p className="mt-1 text-[11px] text-[#777]">复习概念 + 3题强化</p></div><div className="rounded-lg bg-white p-4"><span className="text-[10px] text-[#999]">优先 2 · 约35分钟</span><p className="mt-1 text-[13px] font-semibold">渎职罪与受贿罪关系</p><p className="mt-1 text-[11px] text-[#777]">对比辨析 + 2题验证</p></div></div>
      <p className="mt-3 text-[11px] text-[#777]">完成补强后，建议在 D+7 进行一次间隔验证。方案不会自动修改原学习计划。</p>
      <div className="mt-4 flex gap-3"><button onClick={onViewPlan} className="rounded-lg border border-[#E0D16A] bg-white px-4 py-2.5 text-[12px] font-semibold">查看复习方案</button><button onClick={onAddPlan} className="rounded-lg bg-[#FDEA3B] px-4 py-2.5 text-[12px] font-bold">加入学习计划</button>{onViewQuestions && <button onClick={onViewQuestions} className="ml-auto px-3 py-2.5 text-[12px] font-semibold text-[#2D8CFF]">查看错题 →</button>}</div>
    </section>
  </div>;
}
