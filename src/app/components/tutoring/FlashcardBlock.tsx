import React, { useState } from 'react';
import { FlashcardBlock as FlashcardBlockType } from '../../types/tutoring';
import { motion } from 'motion/react';

interface FlashcardBlockProps {
  flashcard: FlashcardBlockType;
}

export function FlashcardBlock({ flashcard }: FlashcardBlockProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="bg-white dark:bg-[#2A2A2A] border border-[#EFEFEF] dark:border-[#3A3A3A] rounded-xl overflow-hidden">
      <button
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
      >
        <div className="space-y-3">
          <div className="text-xs text-[#666] dark:text-[#999] uppercase tracking-wide">
            {isFlipped ? '背面' : '正面'} · 点击翻面
          </div>
          <motion.div
            key={isFlipped ? 'back' : 'front'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[#333] dark:text-[#E8E8E8]"
          >
            {isFlipped ? flashcard.back : flashcard.front}
          </motion.div>
        </div>
      </button>
    </div>
  );
}
