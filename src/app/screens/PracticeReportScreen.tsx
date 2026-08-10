import { ArrowLeft, CheckCircle2, Clock3, Play, CalendarPlus } from 'lucide-react';

export type PracticeReportMode = 'DAILY_COMPLETED' | 'SECTION_EXITED';

interface Props { mode: PracticeReportMode; onBackToToday: () => void; onContinuePractice: () => void; }

const data = {
  DAILY_COMPLETED: { title: '今日计划已完成', sub: '今天的学习证据已经记录，接下来按计划复习即可。', processed: '6/6', minutes: 42, questions: 18, correct: 13, partial: 2, wrong: 3, progress: 100 },
  SECTION_EXITED: { title: '本节进度已保存', sub: '你可以稍后从“受贿罪既遂的判断标准”继续。', processed: '3/6', minutes: 18, questions: 8, correct: 5, partial: 1, wrong: 2, progress: 50 },
};

export default function PracticeReportScreen({ mode, onBackToToday, onContinuePractice }: Props) {
  const d = data[mode];
  const completed = mode === 'DAILY_COMPLETED';
  return <div className="h-full min-h-0 flex flex-col bg-[#F6F6F6] text-[#333]">
    <header className="shrink-0 border-b border-[#EBEBEB] bg-white px-8 py-4"><div className="mx-auto flex max-w-[760px] items-center gap-3"><button onClick={onBackToToday} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F3F4F6]"><ArrowLeft className="h-5 w-5" /></button><div><h1 className="text-[18px] font-bold">练习报告</h1><p className="text-[11px] text-[#999]">今日计划 · 刑法</p></div></div></header>
    <main className="min-h-0 flex-1 overflow-y-auto"><div className="mx-auto max-w-[760px] space-y-5 px-8 py-6">
      <section className="rounded-xl border border-[#E8E8E8] bg-white p-6">
        <div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-full ${completed ? 'bg-[#EAF9EF] text-[#00A63E]' : 'bg-[#EEF6FF] text-[#2D8CFF]'}`}><CheckCircle2 className="h-5 w-5" /></span><div><h2 className="text-[17px] font-bold">{d.title}</h2><p className="mt-1 text-[12px] text-[#666]">{d.sub}</p></div></div>
        <div className="mt-5 grid grid-cols-4 gap-3"><div className="rounded-lg bg-[#F7F8FA] p-3"><p className="text-[20px] font-bold">{d.processed}</p><p className="text-[10px] text-[#888]">已处理知识点</p></div><div className="rounded-lg bg-[#F7F8FA] p-3"><p className="text-[20px] font-bold">{d.progress}%</p><p className="text-[10px] text-[#888]">今日计划完成度</p></div><div className="rounded-lg bg-[#F7F8FA] p-3"><p className="text-[20px] font-bold">{d.questions}</p><p className="text-[10px] text-[#888]">完成练习题</p></div><div className="rounded-lg bg-[#F7F8FA] p-3"><p className="flex items-center gap-1 text-[20px] font-bold"><Clock3 className="h-4 w-4" />{d.minutes}</p><p className="text-[10px] text-[#888]">学习分钟</p></div></div>
        <div className="mt-4 flex gap-5 border-t border-[#EEE] pt-4 text-[12px]"><span><b>{d.correct}</b> 题正确</span><span className="text-[#B46A00]"><b>{d.partial}</b> 题部分正确</span><span className="text-[#D83D32]"><b>{d.wrong}</b> 题错误</span></div>
      </section>

      <section className="rounded-xl border border-[#E8E8E8] bg-white p-6"><h2 className="text-[15px] font-bold">本次表现</h2><p className="mt-2 text-[12px] leading-relaxed text-[#666]">{completed ? '今天完成的知识点中，受贿罪既遂与单位犯罪表现稳定；利用影响力受贿罪仍需后续验证。' : '本节已有初步表现，但尚未完成今日计划。以下仅总结当前练习事实，不作为完整的今日诊断。'}</p><div className="mt-4 space-y-2">{(completed ? [['表现稳定','受贿罪既遂的判断标准','3题正确 · 已完成本节'],['仍需验证','利用影响力受贿罪的主体范围','1题错误 · 稍后强化'],['本次新学','单位犯罪的成立条件','已完成闪卡与2题练习']] : [['当前表现较好','受贿罪既遂的判断标准','3题正确'],['需要回看','利用影响力受贿罪的主体范围','1题错误'],['尚未完成','单位犯罪的成立条件','未开始']]).map(([status,name,evidence]) => <div key={name} className="flex items-center justify-between rounded-lg bg-[#F7F8FA] px-4 py-3"><span><small className="block text-[10px] text-[#888]">{status}</small><b className="text-[12px]">{name}</b></span><span className="text-[10px] text-[#777]">{evidence}</span></div>)}</div></section>

      <section className="rounded-xl border-2 border-[#FDEA3B] bg-[#FFFBEA] p-6"><h2 className="text-[15px] font-bold">接下来</h2><p className="mt-2 text-[13px] font-semibold">{completed ? '明天复习 3 个到期知识点 · 预计 25 分钟' : '继续完成剩余 3 个知识点 · 预计 24 分钟'}</p><p className="mt-1 text-[11px] text-[#777]">{completed ? '今天的错题会进入后续间隔复习，不会自动增加额外计划。' : '答案、题号和学习记录均已保存，继续时会回到当前小节。'}</p><div className="mt-4 flex gap-3">{completed ? <button className="inline-flex items-center gap-2 rounded-lg bg-[#FDEA3B] px-4 py-2.5 text-[12px] font-bold"><CalendarPlus className="h-4 w-4" />查看明日计划</button> : <button onClick={onContinuePractice} className="inline-flex items-center gap-2 rounded-lg bg-[#FDEA3B] px-4 py-2.5 text-[12px] font-bold"><Play className="h-4 w-4" />继续本节</button>}<button onClick={onBackToToday} className="rounded-lg border border-[#DDD] bg-white px-4 py-2.5 text-[12px] font-semibold">返回 Today</button></div></section>
    </div></main>
  </div>;
}
