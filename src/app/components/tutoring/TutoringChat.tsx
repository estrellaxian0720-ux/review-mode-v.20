import React, { useState, useRef, useEffect } from 'react';
import { TutoringSession } from '../../types/tutoring';
import { MessageBubble } from './MessageBubble';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Send, Sparkles } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface TutoringChatProps {
  session: TutoringSession;
  onClose?: () => void;
  onAction?: (actionId: string) => void;
}

export function TutoringChat({ session, onClose, onAction }: TutoringChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState(session.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isFullscreen = session.surface === 'fullscreen';
  const isFloating = session.surface === 'floating';
  const isPanel = session.surface === 'panel';
  const showForcedActions = session.trigger === 'daily_20_wrong' && session.forcedEntryActions;

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      role: 'user' as const,
      blocks: [{ type: 'markdown' as const, md: inputValue }],
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate AI response (in real app, this would call an API)
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant' as const,
        blocks: [
          { 
            type: 'markdown' as const, 
            md: '好的，让我来帮你解答这个问题...' 
          }
        ],
        aiGenerated: true,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const quickPrompts = [
    '解释步骤',
    '这考什么概念',
    '出一道类似题',
  ];

  // 全屏模式
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-[#1E1E1E] z-50 flex flex-col">
        {/* 顶部栏 */}
        <div className="border-b border-[#EFEFEF] dark:border-[#3A3A3A] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-medium text-[#333] dark:text-[#E8E8E8]">
              {session.conceptName}
              {session.trigger === 'daily_20_wrong' && ' · 强化学习'}
              {session.trigger === 'flashcard_deep_learning' && ' · 深度学习'}
            </h2>
            {session.trigger === 'daily_20_wrong' && (
              <p className="text-sm text-[#666] dark:text-[#999] mt-1">
                这个知识点已经反复出错
              </p>
            )}
          </div>
          {session.trigger !== 'daily_20_wrong' && onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#666]" />
            </button>
          )}
        </div>

        {/* 强制选择（仅20错触发） */}
        {showForcedActions && messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#FF6252]/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-[#FF6252]" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#333] dark:text-[#E8E8E8] mb-2">
                  需要加强这个知识点
                </h3>
                <p className="text-sm text-[#666] dark:text-[#999]">
                  今天这个知识点已经错了 {session.dailyTotalWrongCount} 次，建议进行强化学习
                </p>
              </div>
              <div className="flex gap-3">
                {session.forcedEntryActions?.map(action => (
                  <Button
                    key={action.id}
                    variant={action.id === 'learn' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => {
                      if (action.id === 'skip') {
                        onAction?.(action.id);
                        onClose?.();
                      } else {
                        setMessages(session.messages);
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 对话区域 */}
        {(!showForcedActions || messages.length > 0) && (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} isFloating={isFloating} />
                ))}
              </div>
            </div>

            {/* 输入区域 */}
            <div className="border-t border-[#EFEFEF] dark:border-[#3A3A3A] px-6 py-4">
              <div className="max-w-3xl mx-auto space-y-3">
                <div className="flex gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(prompt)}
                      className="px-3 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-[#333] text-[#666] dark:text-[#999] hover:bg-gray-200 dark:hover:bg-[#3A3A3A] transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="输入你的问题..."
                    className="flex-1"
                  />
                  <Button onClick={handleSend} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // 面板模式
  if (isPanel) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-[#1E1E1E]">
        {/* 顶部 */}
        <div className="border-b border-[#EFEFEF] dark:border-[#3A3A3A] px-4 py-3">
          <h3 className="font-medium text-[#333] dark:text-[#E8E8E8]">AI Tutor</h3>
        </div>

        {/* 消息列表 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
        </div>

        {/* 输入区域 */}
        <div className="border-t border-[#EFEFEF] dark:border-[#3A3A3A] p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInputValue(prompt)}
                className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-[#333] text-[#666] dark:text-[#999] hover:bg-gray-200 dark:hover:bg-[#3A3A3A] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="问我任何问题..."
              className="flex-1 text-sm"
            />
            <Button onClick={handleSend} size="icon" className="h-9 w-9">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 浮窗模式
  return (
    <div className="w-96 h-[500px] bg-white dark:bg-[#1E1E1E] rounded-lg shadow-2xl border border-[#EFEFEF] dark:border-[#3A3A3A] flex flex-col">
      {/* 顶部可拖动栏 */}
      <div className="border-b border-[#EFEFEF] dark:border-[#3A3A3A] px-4 py-3 flex items-center justify-between cursor-move">
        <h3 className="font-medium text-[#333] dark:text-[#E8E8E8]">AI Tutor</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#666]" />
          </button>
        )}
      </div>

      {/* 消息列表 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} isFloating={true} />
        ))}
      </div>

      {/* 输入区域 */}
      <div className="border-t border-[#EFEFEF] dark:border-[#3A3A3A] p-3">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="问我任何问题..."
            className="flex-1 text-sm h-8"
          />
          <Button onClick={handleSend} size="icon" className="h-8 w-8">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
