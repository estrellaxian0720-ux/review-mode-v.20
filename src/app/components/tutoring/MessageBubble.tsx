import React from 'react';
import { Message } from '../../types/tutoring';
import { MarkdownContent } from './MarkdownContent';
import { QuizBlock } from './QuizBlock';
import { FlashcardBlock } from './FlashcardBlock';
import { DiagramBlock } from './DiagramBlock';
import { ImageBlock } from './ImageBlock';
import { motion } from 'motion/react';

interface MessageBubbleProps {
  message: Message;
  isFloating?: boolean;
}

export function MessageBubble({ message, isFloating = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* AI 头像 */}
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
            <path 
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
              fill="currentColor" 
              opacity="0.3"
            />
            <circle cx="12" cy="12" r="6" fill="currentColor" />
            <circle cx="9" cy="11" r="1.5" fill="white" />
            <circle cx="15" cy="11" r="1.5" fill="white" />
            <path d="M12 15a3 3 0 0 0 2.5-1.34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* 消息气泡 */}
      <div className={`max-w-[85%] ${isUser ? 'max-w-[70%]' : ''}`}>
        <div
          className={`rounded-2xl px-5 py-4 space-y-4 ${
            isUser
              ? 'bg-[#2D8CFF] text-white ml-auto'
              : 'bg-white dark:bg-[#2A2A2A] border border-[#EFEFEF] dark:border-[#3A3A3A]'
          }`}
        >
          {message.blocks.map((block, index) => {
            // 浮窗模式下，quiz 降级为摘要卡
            if (isFloating && block.type === 'quiz') {
              return (
                <div 
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#1a2332] dark:to-[#1f2937] border border-[#2D8CFF]/30 rounded-lg p-3 flex items-center justify-between"
                >
                  <span className="text-sm text-[#333] dark:text-[#E8E8E8]">
                    为你准备了 1 道练习题
                  </span>
                  <button className="text-sm text-[#2D8CFF] font-medium hover:underline">
                    去练习 →
                  </button>
                </div>
              );
            }

            if (isFloating && block.type === 'flashcard') {
              return (
                <div 
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#1a2332] dark:to-[#1f2937] border border-[#2D8CFF]/30 rounded-lg p-3 flex items-center justify-between"
                >
                  <span className="text-sm text-[#333] dark:text-[#E8E8E8]">
                    为你准备了 1 张闪卡
                  </span>
                  <button className="text-sm text-[#2D8CFF] font-medium hover:underline">
                    去练习 →
                  </button>
                </div>
              );
            }

            switch (block.type) {
              case 'markdown':
                return (
                  <div key={index} className={isUser ? 'text-white' : ''}>
                    <MarkdownContent content={block.md} />
                  </div>
                );
              case 'quiz':
                return <QuizBlock key={index} quiz={block} />;
              case 'flashcard':
                return <FlashcardBlock key={index} flashcard={block} />;
              case 'diagram':
                return <DiagramBlock key={index} diagram={block} />;
              case 'image':
                return <ImageBlock key={index} image={block} />;
              case 'video':
                return (
                  <div key={index} className="bg-gray-100 dark:bg-[#333] rounded-lg p-4 text-center text-sm text-[#666] dark:text-[#999]">
                    视频加载中...
                  </div>
                );
              case 'traceback':
                return (
                  <button 
                    key={index}
                    className="text-sm text-[#2D8CFF] hover:underline"
                  >
                    {block.label} →
                  </button>
                );
              default:
                return null;
            }
          })}
        </div>

        {/* AI 生成免责声明 */}
        {!isUser && message.aiGenerated && (
          <div className="text-xs text-[#999] mt-2 ml-2">
            部分内容由 AI 生成
          </div>
        )}
      </div>
    </motion.div>
  );
}
