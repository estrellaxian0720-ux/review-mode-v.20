import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, Play } from 'lucide-react';

interface KnowledgePointRowProps {
  title: string;
  status: 'Mastered' | 'Practicing' | 'Not started';
  answer: string;
  importance: 1 | 2 | 3;
  masteryPercentage?: number; // 0-100, from server
  onStatusChange?: (newStatus: 'Mastered' | 'Practicing' | 'Not started') => void;
  onStartPractice?: () => void;
}

interface ConfirmDialogProps {
  type: 'unmaster' | 'master' | 'reset-mastery';
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ type, onConfirm, onCancel }: ConfirmDialogProps) {
  const getDialogContent = () => {
    switch (type) {
      case 'unmaster':
        return {
          title: 'Mark as Unmastered?',
          message: 'Warning: Unmastering this point will reset all your learning progress. It will be treated as a new, unlearned point.',
          confirmText: 'Reset Progress',
          buttonColor: 'bg-red-500 hover:bg-red-600',
        };
      case 'reset-mastery':
        return {
          title: '已掌握的知识点',
          message: '你已经掌握了这个知识点。如果想要重新练习,需要重置知识点掌握程度。是否重置?',
          confirmText: '重置',
          buttonColor: 'bg-blue-500 hover:bg-blue-600',
        };
      case 'master':
      default:
        return {
          title: 'Mark as Mastered?',
          message: 'Once marked as mastered, this point will no longer appear in your practice list.',
          confirmText: 'Mark Mastered',
          buttonColor: 'bg-emerald-500 hover:bg-emerald-600',
        };
    }
  };

  const content = getDialogContent();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {content.title}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {content.message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            关闭
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg font-bold transition-colors ${content.buttonColor}`}
          >
            {content.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function KnowledgePointRow({
  title,
  status: initialStatus,
  answer,
  importance,
  masteryPercentage,
  onStatusChange,
  onStartPractice
}: KnowledgePointRowProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState<'unmaster' | 'master' | null>(null);

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card toggle when clicking status
    if (status === 'Mastered') {
      setShowConfirm('unmaster');
    } else {
      setShowConfirm('master');
    }
  };

  const handleConfirmStatusChange = () => {
    if (showConfirm === 'unmaster') {
      setStatus('Not started');
      onStatusChange?.('Not started');
    } else if (showConfirm === 'master') {
      setStatus('Mastered');
      onStatusChange?.('Mastered');
    } else if (showConfirm === 'reset-mastery') {
      setStatus('Not started');
      onStatusChange?.('Not started');
    }
    setShowConfirm(null);
  };

  const handleStartPractice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === 'Mastered') {
      setShowConfirm('reset-mastery');
    } else {
      onStartPractice?.();
    }
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleShowAnswerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Redundant but clear intent
    setIsExpanded(!isExpanded);
  };

  const getStatusColor = (st: 'Mastered' | 'Practicing' | 'Not started') => {
    if (st === 'Mastered') return 'bg-gray-300';
    if (st === 'Practicing') return 'bg-blue-500';
    return 'bg-[#FDEA3B]';
  };

  const getStatusText = (st: 'Mastered' | 'Practicing' | 'Not started') => {
    if (st === 'Mastered') return 'MASTERED';
    if (st === 'Practicing') return 'PRACTICING';
    return 'NOT STARTED';
  };

  const getStatusTextColor = (st: 'Mastered' | 'Practicing' | 'Not started') => {
    if (st === 'Mastered') return 'text-gray-500';
    if (st === 'Practicing') return 'text-blue-600';
    return 'text-[#111827]';
  };

  // Calculate progress percentage
  const progressPercentage = masteryPercentage ?? (
    status === 'Mastered' ? 100 : 
    status === 'Practicing' ? 60 : 
    0
  );

  return (
    <>
      <div 
        className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Main Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              {/* Importance Stars */}
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-3.5 h-3.5 ${
                      star <= importance 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'fill-gray-200 text-gray-200'
                    }`} 
                  />
                ))}
              </div>
              {/* Title */}
              <h4 className="text-base font-bold text-gray-900 leading-snug flex-1">
                {title}
              </h4>
            </div>
            {/* Show/Hide Answer Button */}
            <button
              onClick={handleShowAnswerClick}
              className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors flex items-center gap-1 shrink-0"
            >
              {isExpanded ? 'Hide Answer' : 'Show Answer'}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStatusColor(status)} transition-all duration-300`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleStatusClick}
              className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
            >
              <span className={`text-xs font-bold uppercase tracking-wide ${getStatusTextColor(status)}`}>
                {getStatusText(status)}
              </span>
            </button>
          </div>
        </div>

        {/* Expanded Answer Section */}
        {isExpanded && (
          <div className="px-5 pb-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-3">
              <div className="flex items-start gap-3">
                <span className="text-emerald-600 font-black text-lg flex-shrink-0">A:</span>
                <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
              </div>
            </div>

            {/* Start Practice Button - Always show */}
            <button
              onClick={handleStartPractice}
              disabled={status === 'Mastered'}
              className={`w-full px-4 py-3 text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 ${
                status === 'Mastered'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#2D8CFF] hover:bg-[#1e7ae8] text-white'
              }`}
            >
              <Play className={`w-4 h-4 ${status === 'Mastered' ? 'fill-gray-500' : 'fill-white'}`} />
              Start Practice
            </button>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <ConfirmDialog
          type={showConfirm}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
}