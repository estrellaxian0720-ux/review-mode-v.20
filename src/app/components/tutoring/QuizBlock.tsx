import React, { useState } from 'react';
import { QuizBlock as QuizBlockType } from '../../types/tutoring';
import { Button } from '../ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizBlockProps {
  quiz: QuizBlockType;
}

export function QuizBlock({ quiz }: QuizBlockProps) {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(quiz.userAnswer);
  const [showExplanation, setShowExplanation] = useState(!!quiz.userAnswer);

  const handleOptionClick = (optionKey: string) => {
    setSelectedOption(optionKey);
    setShowExplanation(true);
  };

  const isCorrect = selectedOption === quiz.answer;
  const isJudgment = quiz.kind === 'judgment';

  return (
    <div className="bg-white dark:bg-[#2A2A2A] border border-[#EFEFEF] dark:border-[#3A3A3A] rounded-xl p-4 space-y-4">
      {/* 题干 */}
      <div className="text-[#333] dark:text-[#E8E8E8]">
        {quiz.stem}
      </div>

      {/* 选项 */}
      {isJudgment ? (
        // 判断题：大按钮样式
        <div className="flex gap-3">
          {quiz.options.map((option) => {
            const isSelected = selectedOption === option.key;
            const isCorrectOption = option.key === quiz.answer;
            let buttonClass = 'flex-1 h-14 border-2 rounded-lg font-medium transition-all';
            
            if (showExplanation) {
              if (isCorrectOption) {
                buttonClass += ' border-[#00A63E] bg-[#00A63E]/10 text-[#00A63E]';
              } else if (isSelected && !isCorrectOption) {
                buttonClass += ' border-[#FF6252] bg-[#FF6252]/10 text-[#FF6252]';
              } else {
                buttonClass += ' border-[#EFEFEF] dark:border-[#3A3A3A] text-[#666] dark:text-[#999]';
              }
            } else {
              buttonClass += isSelected 
                ? ' border-[#2D8CFF] bg-[#2D8CFF]/10 text-[#2D8CFF]'
                : ' border-[#EFEFEF] dark:border-[#3A3A3A] text-[#333] dark:text-[#E8E8E8] hover:border-[#2D8CFF]/50';
            }

            return (
              <button
                key={option.key}
                onClick={() => handleOptionClick(option.key)}
                disabled={showExplanation}
                className={buttonClass}
              >
                {option.key === 'T' ? '✓ 正确' : '✗ 错误'}
              </button>
            );
          })}
        </div>
      ) : (
        // 选择题：列表样式
        <div className="space-y-2">
          {quiz.options.map((option) => {
            const isSelected = selectedOption === option.key;
            const isCorrectOption = option.key === quiz.answer;
            let optionClass = 'w-full text-left px-4 py-3 rounded-lg border-2 transition-all';
            
            if (showExplanation) {
              if (isCorrectOption) {
                optionClass += ' border-[#00A63E] bg-[#00A63E]/10 text-[#00A63E]';
              } else if (isSelected && !isCorrectOption) {
                optionClass += ' border-[#FF6252] bg-[#FF6252]/10 text-[#FF6252]';
              } else {
                optionClass += ' border-[#EFEFEF] dark:border-[#3A3A3A] text-[#666] dark:text-[#999]';
              }
            } else {
              optionClass += isSelected 
                ? ' border-[#2D8CFF] bg-[#2D8CFF]/10 text-[#2D8CFF]'
                : ' border-[#EFEFEF] dark:border-[#3A3A3A] text-[#333] dark:text-[#E8E8E8] hover:border-[#2D8CFF]/50';
            }

            return (
              <button
                key={option.key}
                onClick={() => handleOptionClick(option.key)}
                disabled={showExplanation}
                className={optionClass}
              >
                <span className="font-medium mr-2">{option.key}.</span>
                {option.text}
              </button>
            );
          })}
        </div>
      )}

      {/* 解析卡 */}
      {showExplanation && (
        <div className={`rounded-lg p-4 space-y-3 ${isCorrect ? 'bg-[#00A63E]/5' : 'bg-[#FF6252]/5'}`}>
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#00A63E]" />
                <span className="font-medium text-[#00A63E]">✓ 正确！</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-[#FF6252]" />
                <span className="font-medium text-[#FF6252]">✗ 再想想</span>
              </>
            )}
          </div>
          <div className="text-[#333] dark:text-[#E8E8E8] text-sm">
            {quiz.explanation}
          </div>
          {quiz.traceback && (
            <Button variant="outline" size="sm" className="text-xs">
              {quiz.traceback.label}
            </Button>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" size="sm" className="text-xs text-[#666]">
              换个讲法
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-[#666]">
              再来一道
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
