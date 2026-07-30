import React from 'react';

/**
 * 云记历史聊天功能区的 AI 助教吉祥物：3D 云朵 + 眨眼笑脸 + 小爱心。
 * 这里用内联矢量还原截图形象（自包含、可缩放、无外部依赖）。
 * 如需替换为原始位图资源，把历史 SVG 存到 src/app/assets/cloud-mascot.svg，
 * 再把本组件内容换成 `import url from './cloud-mascot.svg'; <img src={url} .../>` 即可。
 */
export function CloudMascot({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="cm-body" x1="20" y1="16" x2="44" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EDF1F8" />
        </linearGradient>
      </defs>
      {/* 云朵主体：多个圆叠成蓬松轮廓 */}
      <g filter="url(#cm-shadow)">
        <circle cx="24" cy="34" r="13" fill="url(#cm-body)" />
        <circle cx="40" cy="34" r="15" fill="url(#cm-body)" />
        <circle cx="31" cy="26" r="12" fill="url(#cm-body)" />
        <rect x="18" y="34" width="30" height="14" rx="7" fill="url(#cm-body)" />
      </g>
      {/* 眨眼（左）+ 圆眼（右） */}
      <path d="M25 33.5c1.6-1.6 4.2-1.6 5.8 0" stroke="#3A3A3A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="39" cy="33.5" r="2" fill="#3A3A3A" />
      {/* 微笑 */}
      <path d="M31 39c1.4 1.6 4 1.6 5.4 0" stroke="#3A3A3A" strokeWidth="2" strokeLinecap="round" />
      {/* 腮红 */}
      <circle cx="25" cy="38" r="2.2" fill="#FFC7B0" opacity="0.8" />
      <circle cx="43" cy="38" r="2.2" fill="#FFC7B0" opacity="0.8" />
      {/* 两颗小爱心 */}
      <path d="M49 15c.9-1.4 3-1 3 .7 0 1.3-1.6 2.3-3 3.3-1.4-1-3-2-3-3.3 0-1.7 2.1-2.1 3-.7Z" fill="#FF7A59" />
      <path d="M55 22c.7-1.1 2.4-.8 2.4.6 0 1-1.3 1.8-2.4 2.6-1.1-.8-2.4-1.6-2.4-2.6 0-1.4 1.7-1.7 2.4-.6Z" fill="#FF9FB6" />
      <filter id="cm-shadow" x="10" y="12" width="44" height="44" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#8AA0C8" floodOpacity="0.35" />
      </filter>
    </svg>
  );
}
