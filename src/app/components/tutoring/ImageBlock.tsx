import React from 'react';
import { ImageBlock as ImageBlockType } from '../../types/tutoring';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { BookOpen, Globe, Sparkles } from 'lucide-react';

interface ImageBlockProps {
  image: ImageBlockType;
}

export function ImageBlock({ image }: ImageBlockProps) {
  const getSourceBadge = () => {
    switch (image.source) {
      case 'asset':
        return {
          icon: <BookOpen className="w-3 h-3" />,
          label: '教材原图',
          color: '#00A63E',
        };
      case 'web':
        return {
          icon: <Globe className="w-3 h-3" />,
          label: `网络 · ${image.ref?.site || '出处'}`,
          color: '#2D8CFF',
        };
      case 'ai_gen':
        return {
          icon: <Sparkles className="w-3 h-3" />,
          label: 'AI 生成',
          color: '#8E99B0',
        };
    }
  };

  const badge = getSourceBadge();

  return (
    <div className="bg-white dark:bg-[#2A2A2A] border border-[#EFEFEF] dark:border-[#3A3A3A] rounded-xl overflow-hidden">
      <div className="relative">
        <ImageWithFallback
          src={image.src}
          alt={image.caption}
          className="w-full h-auto"
        />
        {/* 来源徽标 */}
        <div 
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm"
          style={{ backgroundColor: `${badge.color}DD` }}
        >
          {badge.icon}
          <span>{badge.label}</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="text-sm text-[#666] dark:text-[#999]">
          {image.caption}
        </div>
        {image.ref?.book && image.ref?.page && (
          <div className="text-xs text-[#999]">
            {image.ref.book} · 第 {image.ref.page} 页
          </div>
        )}
        {image.ref?.url && (
          <a 
            href={image.ref.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-[#2D8CFF] hover:underline inline-block"
          >
            查看来源 →
          </a>
        )}
        {image.disclaimer && (
          <div className="text-xs text-[#999] italic">
            {image.disclaimer}
          </div>
        )}
      </div>
    </div>
  );
}
