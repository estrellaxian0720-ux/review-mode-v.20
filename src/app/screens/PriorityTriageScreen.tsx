import { ChevronLeft, FileText, AlertCircle, TrendingUp, FileCheck, Folder, X, GripVertical, FileSpreadsheet, BookOpen, Link as LinkIcon, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LanguageMismatchModal } from '../components/LanguageMismatchModal';
import { SetupStepIndicator } from '../components/SetupStepIndicator';
import { TopNavigation } from '../components/TopNavigation';

interface Resource {
  id: number;
  name: string;
  type: 'pdf' | 'ppt' | 'doc' | 'link' | 'audio';
  priority: 'exam-leak' | 'high-yield' | 'past-paper' | 'routine';
  meta?: string; // Single metadata: either source or date
}

interface PriorityTriageScreenProps {
  onNext?: () => void;
  onBack?: () => void;
  onNavigateHome?: () => void;
}

interface OverflowMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  currentPriority: string;
  priorityConfig: any;
  onChangePriority: (priority: string) => void;
  onRemove: () => void;
}

function OverflowMenu({ isOpen, onClose, triggerRef, currentPriority, priorityConfig, onChangePriority, onRemove }: OverflowMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect();
      const menuWidth = 192; // w-48
      const menuHeight = 240; // approximate height
      
      let top = trigger.bottom + 4; // 4px gap below trigger
      let left = trigger.right - menuWidth; // align right edge with trigger
      
      // Ensure menu stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Adjust horizontal position if menu would overflow right edge
      if (left + menuWidth > viewportWidth - 8) {
        left = viewportWidth - menuWidth - 8;
      }
      
      // Adjust horizontal position if menu would overflow left edge
      if (left < 8) {
        left = 8;
      }
      
      // Flip to top if would overflow bottom
      if (top + menuHeight > viewportHeight - 8) {
        top = trigger.top - menuHeight - 4;
      }
      
      // Ensure doesn't overflow top
      if (top < 8) {
        top = 8;
      }
      
      setPosition({ top, left });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-48"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
    >
      <div className="px-3 py-1.5 text-[10px] text-[#999] font-semibold uppercase">
        Change Priority
      </div>
      {Object.entries(priorityConfig).map(([key, conf]: [string, any]) => (
        <button
          key={key}
          onClick={() => onChangePriority(key)}
          className={`w-full text-left px-3 py-2 text-[12px] hover:bg-gray-50 transition-colors flex items-center gap-2 ${
            currentPriority === key ? 'bg-gray-50 font-medium' : ''
          }`}
        >
          <span>{conf.emoji}</span>
          <span>{conf.label}</span>
          {currentPriority === key && (
            <span className="ml-auto text-[#FDEA3B]">✓</span>
          )}
        </button>
      ))}
      <div className="h-px bg-gray-200 my-1"></div>
      <button
        onClick={onRemove}
        className="w-full text-left px-3 py-2 text-[12px] text-red-600 hover:bg-red-50 transition-colors"
      >
        Remove Resource
      </button>
    </div>,
    document.body
  );
}

export function PriorityTriageScreen({ onNext, onBack, onNavigateHome }: PriorityTriageScreenProps) {
  const [resources, setResources] = useState<Resource[]>([
    { id: 1, name: 'Linear Algebra Lecture Notes.pdf', type: 'pdf', priority: 'high-yield', meta: 'Internal' },
    { id: 2, name: 'Chapter 5 - Eigenvalues.pptx', type: 'ppt', priority: 'exam-leak', meta: 'Updated 2d ago' },
    { id: 3, name: 'Practice Problems Set.pdf', type: 'pdf', priority: 'high-yield' },
    { id: 4, name: 'Past Exam 2023.pdf', type: 'pdf', priority: 'past-paper' },
    { id: 5, name: 'Formula Sheet.pdf', type: 'pdf', priority: 'exam-leak', meta: 'Updated 1w ago' },
    { id: 6, name: 'Supplementary Reading.pdf', type: 'pdf', priority: 'routine', meta: 'External' },
    { id: 7, name: 'Video Lecture Recording.mp4', type: 'audio', priority: 'high-yield' },
    { id: 8, name: 'MIT OCW - Linear Algebra', type: 'link', priority: 'routine', meta: 'External' },
    { id: 9, name: 'Professor Notes Q&A.pdf', type: 'pdf', priority: 'past-paper' },
  ]);

  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showNudge, setShowNudge] = useState(true);
  const [showLanguageMismatch, setShowLanguageMismatch] = useState(false);
  const menuTriggerRefs = useRef<{ [key: number]: React.RefObject<HTMLButtonElement> }>({});

  useEffect(() => {
    // Hide nudge animation after 3 seconds
    const timer = setTimeout(() => setShowNudge(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const priorityConfig = {
    'exam-leak': { 
      icon: AlertCircle, 
      color: 'red', 
      label: 'Exam Leak', 
      emoji: '🔴',
      description: 'Final review & recent materials',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      dragHighlight: 'bg-red-100 border-red-300'
    },
    'high-yield': { 
      icon: TrendingUp, 
      color: 'orange', 
      label: 'High Yield', 
      emoji: '🟠',
      description: 'Core concepts and key topics',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      dragHighlight: 'bg-orange-100 border-orange-300'
    },
    'past-paper': { 
      icon: FileCheck, 
      color: 'yellow', 
      label: 'Past Papers', 
      emoji: '🟡',
      description: 'Previous exams and practice tests',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      dragHighlight: 'bg-yellow-100 border-yellow-300'
    },
    'routine': { 
      icon: Folder, 
      color: 'gray', 
      label: 'Routine', 
      emoji: '⚪',
      description: 'Supplementary and reference materials',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      dragHighlight: 'bg-gray-100 border-gray-300'
    },
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-[#666]" />;
      case 'ppt':
        return <FileSpreadsheet className="w-4 h-4 text-[#666]" />;
      case 'doc':
        return <BookOpen className="w-4 h-4 text-[#666]" />;
      case 'link':
        return <LinkIcon className="w-4 h-4 text-[#666]" />;
      case 'audio':
        return (
          <svg className="w-4 h-4 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        );
      default:
        return <FileText className="w-4 h-4 text-[#666]" />;
    }
  };

  const removeResource = (id: number) => {
    setResources(resources.filter(r => r.id !== id));
    setOpenMenuId(null);
  };

  const changePriority = (id: number, newPriority: keyof typeof priorityConfig) => {
    setResources(resources.map(r => 
      r.id === id ? { ...r, priority: newPriority } : r
    ));
    setOpenMenuId(null);
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverGroup(null);
  };

  const handleDragOver = (e: React.DragEvent, priority: keyof typeof priorityConfig) => {
    e.preventDefault();
    setDragOverGroup(priority);
  };

  const handleDragLeave = () => {
    setDragOverGroup(null);
  };

  const handleDrop = (e: React.DragEvent, targetPriority: keyof typeof priorityConfig) => {
    e.preventDefault();
    if (draggedItem !== null) {
      changePriority(draggedItem, targetPriority);
    }
    setDraggedItem(null);
    setDragOverGroup(null);
  };

  const getGroupResources = (priority: keyof typeof priorityConfig) => {
    return resources.filter(r => r.priority === priority);
  };

  // Create ref for each resource's menu trigger
  const getMenuTriggerRef = (id: number) => {
    if (!menuTriggerRefs.current[id]) {
      menuTriggerRefs.current[id] = { current: null };
    }
    return menuTriggerRefs.current[id];
  };

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB]">
      <TopNavigation activeMode="review-mode" />

      {/* Header row: title left, stepper right */}
      <div className="px-8 pt-6 pb-4 border-b border-gray-100 bg-[#F9FAFB]">
        <div className="max-w-[860px] mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-[#111827] leading-tight font-['Inter']">Prioritize</h1>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5 font-['Inter']">Step 3 of 3</p>
            <p className="text-[12px] text-[#6B7280] mt-1 font-['Inter']">
              The AI has pre-sorted your materials by importance. Drag to reclassify before generating your plan.
            </p>
          </div>
          <div className="pt-1">
            <SetupStepIndicator currentStep={3} />
          </div>
        </div>
      </div>

      {/* Main Content - Vertical Priority Groups */}
      <div className="flex-1 overflow-auto px-8 py-4">
        <div className="max-w-[860px] mx-auto space-y-2.5">
          {(Object.keys(priorityConfig) as Array<keyof typeof priorityConfig>).map((priorityKey) => {
            const config = priorityConfig[priorityKey];
            const groupResources = getGroupResources(priorityKey);
            const isDraggedOver = dragOverGroup === priorityKey;
            
            return (
              <div 
                key={priorityKey} 
                className={`rounded-lg border-2 transition-all ${
                  isDraggedOver ? config.dragHighlight : `${config.borderColor}`
                } overflow-hidden`}
                onDragOver={(e) => handleDragOver(e, priorityKey)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, priorityKey)}
              >
                {/* Group Header */}
                <div className={`${config.bgColor} px-4 py-2 border-b ${config.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px]">{config.emoji}</span>
                      <h3 className="text-[14px] font-semibold text-[#333]">{config.label}</h3>
                      <span className="text-[11px] text-[#666]">• {config.description}</span>
                    </div>
                    <span className="text-[12px] font-medium text-[#666]">
                      {groupResources.length} {groupResources.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                {/* Resource List */}
                <div className="bg-white">
                  {groupResources.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-[12px] text-[#999]">Drag resources here to change priority</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {groupResources.map((resource, index) => {
                        const isFirstResource = index === 0 && priorityKey === 'high-yield';
                        const isDragging = draggedItem === resource.id;
                        const triggerRef = getMenuTriggerRef(resource.id);
                        
                        return (
                          <div
                            key={resource.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, resource.id)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-all group cursor-move relative ${
                              isDragging ? 'opacity-40' : ''
                            } ${
                              isFirstResource && showNudge ? 'animate-pulse' : ''
                            }`}
                          >
                            {/* Drag Handle - Always Visible */}
                            <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4 text-[#999]" />
                            </div>

                            {/* File Icon */}
                            <div className="flex-shrink-0">
                              {getFileIcon(resource.type)}
                            </div>

                            {/* Filename */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-[#333] truncate font-medium">{resource.name}</p>
                            </div>

                            {/* Optional Single Meta */}
                            {resource.meta && (
                              <div className="flex-shrink-0 text-[11px] text-[#999] px-2 py-0.5 bg-gray-100 rounded-md">
                                {resource.meta}
                              </div>
                            )}

                            {/* Overflow Menu Trigger */}
                            <div className="flex-shrink-0">
                              <button
                                ref={triggerRef as React.RefObject<HTMLButtonElement>}
                                onClick={() => setOpenMenuId(openMenuId === resource.id ? null : resource.id)}
                                className="p-1.5 text-[#999] hover:text-[#333] hover:bg-gray-100 rounded-md transition-all"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Portal-based Overflow Menu */}
                              <OverflowMenu
                                isOpen={openMenuId === resource.id}
                                onClose={() => setOpenMenuId(null)}
                                triggerRef={triggerRef as React.RefObject<HTMLButtonElement>}
                                currentPriority={resource.priority}
                                priorityConfig={priorityConfig}
                                onChangePriority={(priority) => changePriority(resource.id, priority as keyof typeof priorityConfig)}
                                onRemove={() => removeResource(resource.id)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="border-t border-gray-200 px-8 py-4 bg-white">
        <div className="max-w-[860px] mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-5 py-2.5 text-[13px] font-medium text-[#666] hover:text-[#333] transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => resources.length > 0 && setShowLanguageMismatch(true)}
            disabled={resources.length === 0}
            className={`px-8 py-3 rounded-full text-[14px] font-semibold transition-all ${
              resources.length > 0
                ? 'bg-[#FDEA3B] text-[#333] hover:shadow-md hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Analyze & Generate Study Plan
          </button>
        </div>
      </div>

      {/* Language Mismatch Modal */}
      {showLanguageMismatch && (
        <LanguageMismatchModal
          onConfirm={() => {
            setShowLanguageMismatch(false);
            onNext?.();
          }}
          onClose={() => setShowLanguageMismatch(false)}
        />
      )}
    </div>
  );
}

export default PriorityTriageScreen;