interface Props {
  status: 'active' | 'readonly';
  size?: 'sm' | 'md';
}

export default function SpaceStatusBadge({ status, size = 'md' }: Props) {
  const isActive = status === 'active';
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-[12px]';
  const px = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 ${px} rounded-full font-semibold ${textSize} ${
      isActive
        ? 'bg-[#F0FDF4] text-[#15803D]'
        : 'bg-[#F3F4F6] text-[#6B7280]'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#22C55E]' : 'bg-[#9CA3AF]'}`} />
      {isActive ? 'Active' : 'Read Only'}
    </span>
  );
}
