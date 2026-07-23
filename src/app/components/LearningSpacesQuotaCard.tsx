interface Props {
  activeSpaces: number;
  totalAllowed: number;
  userPlan: 'free' | 'paid' | 'expired';
}

export default function LearningSpacesQuotaCard({ activeSpaces, totalAllowed, userPlan }: Props) {
  const isOver = activeSpaces > totalAllowed;
  const pct = Math.min(activeSpaces / totalAllowed, 1);

  if (userPlan === 'paid') {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div className="h-full bg-[#2D8CFF] rounded-full" style={{ width: `${pct * 100}%` }} />
        </div>
        <span className="text-[12px] text-[#999] whitespace-nowrap">
          {activeSpaces} / {totalAllowed} active spaces
        </span>
      </div>
    );
  }

  const bgColor = isOver ? 'bg-[#FFF1F0]' : 'bg-[#FFFBDF]';
  const borderColor = isOver ? 'border-[#FFCCC7]' : 'border-[#FDEA3B]';
  const textColor = isOver ? 'text-[#CF1322]' : 'text-[#92680A]';
  const barColor = isOver ? 'bg-[#FF4D4F]' : 'bg-[#FDC700]';

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-[10px] border ${bgColor} ${borderColor}`}>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[12px] font-semibold ${textColor}`}>
            {isOver
              ? `超出限制：${activeSpaces}/${totalAllowed} 个空间`
              : `${activeSpaces}/${totalAllowed} 个学习空间`}
          </span>
          {userPlan === 'free' && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280]">
              免费版
            </span>
          )}
          {userPlan === 'expired' && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FFF1F0] text-[#CF1322]">
              已到期
            </span>
          )}
        </div>
        <div className="h-1 bg-white/60 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
      <button className="text-[12px] font-semibold text-[#2D8CFF] whitespace-nowrap hover:underline">
        升级
      </button>
    </div>
  );
}
